export type GoalValidationInput = {
  thrust_area: string;
  title: string;
  weightage: number | "";
  uom: string;
  target: number | "";
  target_date: string;
};

export function validateGoals(goals: GoalValidationInput[]) {
  if (goals.length === 0) {
    return "Add at least one goal";
  }

  if (goals.length > 8) {
    return "Maximum 8 goals allowed";
  }

  for (const goal of goals) {
    if (!goal.thrust_area) {
      return "Every goal needs a thrust area";
    }

    if (!goal.title.trim()) {
      return "Every goal needs a title";
    }

    if (!goal.uom) {
      return "Every goal needs a unit of measurement";
    }

    if (goal.uom === "timeline" && !goal.target_date) {
      return "Every timeline goal needs a deadline date";
    }

    if (goal.uom !== "timeline" && goal.target === "") {
      return "Every goal needs a target value";
    }

    if (goal.weightage === "" || goal.weightage < 10) {
      return `"${goal.title}" must be at least 10% weightage`;
    }
  }

  const totalWeightage = goals.reduce((sum, goal) => sum + (Number(goal.weightage) || 0), 0);

  if (totalWeightage !== 100) {
    return `Total weightage is ${totalWeightage}%. Must equal exactly 100%`;
  }

  return null;
}
