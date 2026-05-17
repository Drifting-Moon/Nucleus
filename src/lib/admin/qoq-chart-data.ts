import { calculateWeightedOverallScore } from "@/lib/calculate-weighted-score";
import type { CheckinQuarter } from "@/lib/get-active-window";
import { QUARTER_LABELS } from "@/lib/quarter-labels";

export const QOQ_ALL_SCOPE = "__all__";

export type QoqPoint = {
  quarter: CheckinQuarter;
  label: string;
  score: number | null;
};

export type QoqTrendSeries = Record<string, QoqPoint[]>;

type EmployeeRow = {
  id: string;
  department: string | null;
};

type GoalRow = {
  id: string;
  user_id: string;
  weightage: number | null;
  status: string;
};

type UpdateRow = {
  goal_id: string;
  quarter: string;
  score: number | null;
  submitted_at: string | null;
};

const CHECKIN_QUARTERS: CheckinQuarter[] = ["q1", "q2", "q3", "annual"];

function lockedGoalsForUser(goals: GoalRow[], userId: string) {
  return goals.filter(
    (goal) =>
      goal.user_id === userId &&
      (goal.status === "approved" || goal.status === "locked")
  );
}

function weightedScoreForQuarter(
  goals: GoalRow[],
  updates: UpdateRow[],
  quarter: CheckinQuarter
): number | null {
  const quarterUpdates = updates.filter((row) => row.quarter === quarter);
  return calculateWeightedOverallScore(goals, quarterUpdates);
}

function buildScopeSeries(
  employees: EmployeeRow[],
  goals: GoalRow[],
  updates: UpdateRow[]
): QoqPoint[] {
  return CHECKIN_QUARTERS.map((quarter) => {
    const employeeScores: number[] = [];

    for (const employee of employees) {
      const memberGoals = lockedGoalsForUser(goals, employee.id);
      if (memberGoals.length === 0) continue;

      const memberUpdates = updates.filter((row) =>
        memberGoals.some((goal) => goal.id === row.goal_id)
      );
      const score = weightedScoreForQuarter(memberGoals, memberUpdates, quarter);
      if (score != null) employeeScores.push(score);
    }

    let avg =
      employeeScores.length > 0
        ? Math.round(
            employeeScores.reduce((sum, value) => sum + value, 0) / employeeScores.length
          )
        : null;



    return {
      quarter,
      label: QUARTER_LABELS[quarter],
      score: avg,
    };
  });
}

export function buildQoqTrendSeries(
  employees: EmployeeRow[],
  goals: GoalRow[],
  updates: UpdateRow[]
): { departments: string[]; series: QoqTrendSeries } {
  const departmentSet = new Set<string>();

  for (const employee of employees) {
    departmentSet.add(employee.department?.trim() || "Unassigned");
  }

  const departments = [...departmentSet].sort((a, b) => a.localeCompare(b));
  const series: QoqTrendSeries = {
    [QOQ_ALL_SCOPE]: buildScopeSeries(employees, goals, updates),
  };

  for (const department of departments) {
    const scoped =
      department === "Unassigned"
        ? employees.filter((employee) => !employee.department?.trim())
        : employees.filter((employee) => employee.department?.trim() === department);

    series[department] = buildScopeSeries(scoped, goals, updates);
  }

  return { departments, series };
}
