import { isQuarterSubmitted } from "@/lib/employee-workflow";
import {
  getActiveWindow,
  type CheckinQuarter,
  type QuarterWindow,
} from "@/lib/get-active-window";
import { QUARTER_LABELS } from "@/lib/quarter-labels";

export type ManagerEffectivenessRow = {
  id: string;
  name: string;
  teamSize: number;
  eligible: number;
  completed: number;
  completionRate: number;
};

export type ManagerEffectivenessResult = {
  quarter: CheckinQuarter | null;
  quarterLabel: string | null;
  rows: ManagerEffectivenessRow[];
};

type ManagerInput = {
  id: string;
  name: string | null;
  email: string | null;
};

type EmployeeInput = {
  id: string;
  manager_id: string | null;
};

type GoalInput = {
  id: string;
  user_id: string;
  status: string;
};

type UpdateInput = {
  goal_id: string;
  quarter: string;
  submitted_at: string | null;
};

export function buildManagerEffectiveness(
  managers: ManagerInput[],
  employees: EmployeeInput[],
  goals: GoalInput[],
  updates: UpdateInput[],
  windows: QuarterWindow[]
): ManagerEffectivenessResult {
  const activeWindow = getActiveWindow(windows);
  const quarter = activeWindow?.quarter_name ?? null;

  if (!quarter) {
    return { quarter: null, quarterLabel: null, rows: [] };
  }

  const rows: ManagerEffectivenessRow[] = [];

  for (const manager of managers) {
    const team = employees.filter((employee) => employee.manager_id === manager.id);
    if (team.length === 0) continue;

    let eligible = 0;
    let completed = 0;

    for (const member of team) {
      const memberGoals = goals.filter((goal) => goal.user_id === member.id);
      const approvedGoalIds = memberGoals
        .filter((goal) => goal.status === "approved" || goal.status === "locked")
        .map((goal) => goal.id);

      if (approvedGoalIds.length === 0) continue;
      if (!memberGoals.every((goal) => goal.status === "approved" || goal.status === "locked")) {
        continue;
      }

      eligible += 1;
      if (isQuarterSubmitted(quarter, approvedGoalIds, updates, memberGoals)) {
        completed += 1;
      }
    }

    rows.push({
      id: manager.id,
      name: manager.name || manager.email || "Unknown",
      teamSize: team.length,
      eligible,
      completed,
      completionRate: eligible > 0 ? Math.round((completed / eligible) * 100) : 0,
    });
  }

  rows.sort((a, b) => a.completionRate - b.completionRate);

  return {
    quarter,
    quarterLabel: QUARTER_LABELS[quarter],
    rows,
  };
}
