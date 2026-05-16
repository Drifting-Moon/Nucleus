import type { CheckinGoal, CheckinRowState } from "@/components/checkins/checkin-row";

export function validateCheckinRows(goals: CheckinGoal[], rows: CheckinRowState[]) {
  for (const goal of goals) {
    const row = rows.find((item) => item.goalId === goal.id);
    if (!row) {
      return `Missing check-in for "${goal.title || "Untitled goal"}"`;
    }

    if (!row.status) {
      return `Select a status for "${goal.title || "Untitled goal"}"`;
    }

    if (goal.uom === "timeline") {
      if (!row.achievementDate) {
        return `Enter an achievement date for "${goal.title || "Untitled goal"}"`;
      }
      continue;
    }

    if (row.achievement === "") {
      return `Enter an achievement for "${goal.title || "Untitled goal"}"`;
    }
  }

  return null;
}
