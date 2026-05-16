import { calculateWeightedOverallScore } from "@/lib/calculate-weighted-score";
import type { CheckinQuarter } from "@/lib/get-active-window";

export type EmployeeQoqPoint = {
  quarter: CheckinQuarter;
  label: string;
  score: number | null;
};

const CHECKIN_QUARTERS: CheckinQuarter[] = ["q1", "q2", "q3", "annual"];

const SHORT_LABELS: Record<CheckinQuarter, string> = {
  q1: "Q1",
  q2: "Q2",
  q3: "Q3",
  annual: "Annual",
};

type ScoreGoal = {
  id: string;
  weightage: number | null;
  status: string;
};

type ScoreUpdate = {
  goal_id: string;
  quarter: string;
  score: number | null;
  submitted_at: string | null;
};

/** Per-quarter weighted score for one employee (BRD formula). */
export function buildEmployeeQoqTrend(
  goals: ScoreGoal[],
  updates: ScoreUpdate[]
): EmployeeQoqPoint[] {
  const scoreGoals = goals.filter(
    (goal) => goal.status === "approved" || goal.status === "locked"
  );

  return CHECKIN_QUARTERS.map((quarter) => {
    const quarterUpdates = updates.filter((row) => row.quarter === quarter);
    const score =
      scoreGoals.length > 0
        ? calculateWeightedOverallScore(scoreGoals, quarterUpdates)
        : null;

    return {
      quarter,
      label: SHORT_LABELS[quarter],
      score,
    };
  });
}
