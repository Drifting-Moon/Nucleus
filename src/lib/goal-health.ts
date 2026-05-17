/**
 * Goal Health Score — auto-computed indicator per goal.
 *
 * Combines:
 *  - Latest check-in score (if any)
 *  - Check-in status (not_started / on_track / completed)
 *  - Whether a check-in has been submitted at all
 *
 * Returns a health level: "excellent" | "good" | "at_risk" | "critical" | "pending"
 */

export type GoalHealthLevel = "excellent" | "good" | "at_risk" | "critical" | "pending";

export type GoalHealth = {
  level: GoalHealthLevel;
  label: string;
  color: string;     // Tailwind text class
  bgColor: string;   // Tailwind bg class
  dotColor: string;  // Tailwind bg class for the dot
  score: number | null;
};

type GoalHealthInput = {
  /** Latest score from quarterly_updates (0-100+), null if no check-in */
  latestScore: number | null;
  /** Latest status from quarterly_updates */
  latestStatus: string | null;
  /** Whether a check-in has been submitted for the active quarter */
  hasSubmitted: boolean;
};

export function computeGoalHealth(input: GoalHealthInput): GoalHealth {
  const { latestScore, latestStatus, hasSubmitted } = input;

  // No check-in at all
  if (!hasSubmitted || latestScore == null) {
    return {
      level: "pending",
      label: "Pending",
      color: "text-slate-500 dark:text-slate-400",
      bgColor: "bg-slate-500/10 border-slate-500/20",
      dotColor: "bg-slate-400",
      score: null,
    };
  }

  // Completed with great score
  if (latestStatus === "completed" && latestScore >= 100) {
    return {
      level: "excellent",
      label: "Excellent",
      color: "text-emerald-700 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10 border-emerald-500/25",
      dotColor: "bg-emerald-500",
      score: latestScore,
    };
  }

  // Good progress
  if (latestScore >= 80) {
    return {
      level: "good",
      label: "On Track",
      color: "text-sky-700 dark:text-sky-400",
      bgColor: "bg-sky-500/10 border-sky-500/25",
      dotColor: "bg-sky-500",
      score: latestScore,
    };
  }

  // At risk
  if (latestScore >= 50) {
    return {
      level: "at_risk",
      label: "At Risk",
      color: "text-amber-700 dark:text-amber-400",
      bgColor: "bg-amber-500/10 border-amber-500/25",
      dotColor: "bg-amber-500",
      score: latestScore,
    };
  }

  // Critical
  return {
    level: "critical",
    label: "Critical",
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-500/10 border-red-500/25",
    dotColor: "bg-red-500",
    score: latestScore,
  };
}
