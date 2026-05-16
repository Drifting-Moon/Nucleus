import { isQuarterSubmitted } from "@/lib/employee-workflow";
import { areAllGoalsApproved } from "@/lib/goal-metrics";
import type { CheckinQuarter } from "@/lib/get-active-window";
import { formatDateOnly } from "@/lib/get-active-window";

export type CellStatus = "done" | "pending" | "na";

export type EmployeeCompletionRow = {
  id: string;
  name: string;
  department: string | null;
  goalsSubmitted: CellStatus;
  goalsApproved: CellStatus;
  q1: CellStatus;
  q2: CellStatus;
  q3: CellStatus;
  annual: CellStatus;
};

export type ManagerCompletionRow = {
  id: string;
  name: string;
  department: string | null;
  teamCount: number;
  pendingReviews: number;
  status: CellStatus;
};

type QuarterWindow = {
  quarter_name: string;
  start_date: string;
  end_date: string;
};

function quarterCellStatus(
  quarter: CheckinQuarter,
  windows: QuarterWindow[],
  memberGoals: { id: string; status: string }[],
  approvedGoalIds: string[],
  updates: { goal_id: string; quarter: string; submitted_at: string | null }[],
  todayStr: string
): CellStatus {
  const window = windows.find((w) => w.quarter_name === quarter);
  if (!window || todayStr < window.start_date) return "na";
  if (approvedGoalIds.length === 0) return "na";
  if (!areAllGoalsApproved(memberGoals)) return "pending";

  if (isQuarterSubmitted(quarter, approvedGoalIds, updates, memberGoals)) return "done";
  if (todayStr > window.end_date) return "pending";
  return "pending";
}

export function buildEmployeeCompletionRows(
  employees: {
    id: string;
    name: string | null;
    email: string | null;
    department: string | null;
  }[],
  goals: { id: string; user_id: string; status: string }[],
  updates: { goal_id: string; quarter: string; submitted_at: string | null }[],
  windows: QuarterWindow[],
  today: Date = new Date()
): EmployeeCompletionRow[] {
  const todayStr = formatDateOnly(today);

  return employees.map((employee) => {
    const memberGoals = goals.filter((goal) => goal.user_id === employee.id);
    const approvedGoalIds = memberGoals
      .filter((goal) => goal.status === "approved" || goal.status === "locked")
      .map((goal) => goal.id);

    const hasGoals = memberGoals.length > 0;
    const submitted = memberGoals.some((goal) =>
      ["submitted", "approved", "locked", "rejected"].includes(goal.status)
    );
    const approved =
      hasGoals &&
      memberGoals.every((goal) => goal.status === "approved" || goal.status === "locked");

    return {
      id: employee.id,
      name: employee.name || employee.email || "Unknown",
      department: employee.department,
      goalsSubmitted: !hasGoals ? "na" : submitted ? "done" : "pending",
      goalsApproved: !hasGoals ? "na" : approved ? "done" : submitted ? "pending" : "pending",
      q1: quarterCellStatus("q1", windows, memberGoals, approvedGoalIds, updates, todayStr),
      q2: quarterCellStatus("q2", windows, memberGoals, approvedGoalIds, updates, todayStr),
      q3: quarterCellStatus("q3", windows, memberGoals, approvedGoalIds, updates, todayStr),
      annual: quarterCellStatus("annual", windows, memberGoals, approvedGoalIds, updates, todayStr),
    };
  });
}

export function buildManagerCompletionRows(
  managers: {
    id: string;
    name: string | null;
    email: string | null;
    department: string | null;
  }[],
  employees: { id: string; manager_id: string | null }[],
  goals: { user_id: string; status: string }[]
): ManagerCompletionRow[] {
  return managers.map((manager) => {
    const teamIds = employees
      .filter((employee) => employee.manager_id === manager.id)
      .map((employee) => employee.id);

    const pendingReviews = teamIds.filter((employeeId) =>
      goals.some((goal) => goal.user_id === employeeId && goal.status === "submitted")
    ).length;

    return {
      id: manager.id,
      name: manager.name || manager.email || "Unknown",
      department: manager.department,
      teamCount: teamIds.length,
      pendingReviews,
      status: pendingReviews === 0 ? "done" : "pending",
    };
  });
}
