/** Goals still in the goal-setting / approval pipeline (shown on employee goal sheet). */
export const ACTIVE_SHEET_STATUSES = ["draft", "rejected", "submitted"] as const;

export type GoalStatusRow = {
  status: string;
  weightage: number | null;
};

export function getActiveSheetGoals<T extends GoalStatusRow>(goals: T[]) {
  return goals.filter((goal) =>
    (ACTIVE_SHEET_STATUSES as readonly string[]).includes(goal.status)
  );
}

export function getLockedGoals<T extends GoalStatusRow>(goals: T[]) {
  return goals.filter((goal) => goal.status === "approved" || goal.status === "locked");
}

export function sumWeightage(goals: { weightage: number | null }[]) {
  return goals.reduce((sum, goal) => sum + (goal.weightage ?? 0), 0);
}

/** True when every goal is approved or locked and at least one goal exists. */
export function areAllGoalsApproved(goals: { status: string }[]) {
  return (
    goals.length > 0 &&
    goals.every((goal) => goal.status === "approved" || goal.status === "locked")
  );
}

export type SheetWeightageSummary = {
  total: number;
  label: string;
  isValid: boolean;
};

export function hasLockedGoals(goals: { status: string }[]) {
  return goals.some((goal) => goal.status === "approved" || goal.status === "locked");
}

/** Goals that drive workflow stepper and summary cards (locked sheet wins over stray drafts). */
export function getWorkflowGoals<T extends GoalStatusRow>(goals: T[]): T[] {
  const locked = getLockedGoals(goals);
  if (locked.length > 0) {
    return locked;
  }

  const active = getActiveSheetGoals(goals);
  if (active.length > 0) {
    return active;
  }

  return goals;
}

export function getSheetWeightageSummary(goals: GoalStatusRow[]): SheetWeightageSummary {
  const locked = getLockedGoals(goals);

  if (locked.length > 0) {
    const total = sumWeightage(locked);
    return {
      total,
      label: "Locked goals weightage",
      isValid: total === 100,
    };
  }

  const active = getActiveSheetGoals(goals);
  if (active.length > 0) {
    const total = sumWeightage(active);
    return {
      total,
      label: "Sheet weightage",
      isValid: total === 100,
    };
  }

  return {
    total: 0,
    label: "Sheet weightage",
    isValid: false,
  };
}
