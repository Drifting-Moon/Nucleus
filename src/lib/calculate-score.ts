/** Matches public.goals.uom check constraint */
export type GoalUom = "number" | "percentage" | "timeline" | "zero_based";

export type ScoreDirection = "higher" | "lower";

export type ScoreParams = {
  uom: GoalUom | string;
  target: number | null;
  achievement: number | null;
  targetDate?: string | null;
  achievementDate?: string | null;
  /** Default higher: achievement ÷ target. Lower: target ÷ achievement. */
  scoreDirection?: ScoreDirection | string | null;
};

export type ScoreTier = "green" | "yellow" | "red";

/** Normalize to YYYY-MM-DD for safe string comparison (no timezone math). */
export function toDateOnly(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, "0");
  const d = String(parsed.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Returns a ratio (0–1.5) or null when inputs are incomplete.
 * zero_based: BRD rule — achievement 0 → 1.0, else 0.0 (no division).
 */
export function calculateScore({
  uom,
  target,
  achievement,
  targetDate,
  achievementDate,
  scoreDirection = "higher",
}: ScoreParams): number | null {
  if (uom === "zero_based") {
    if (achievement === null || achievement === undefined || Number.isNaN(Number(achievement))) {
      return null;
    }
    return Number(achievement) === 0 ? 1 : 0;
  }

  if (uom === "timeline") {
    const targetDay = toDateOnly(targetDate);
    const achievedDay = toDateOnly(achievementDate);
    if (!targetDay || !achievedDay) return null;
    return achievedDay <= targetDay ? 1 : 0;
  }

  if (achievement === null || achievement === undefined) {
    return null;
  }

  const numTarget = Number(target);
  const numAchievement = Number(achievement);

  if (Number.isNaN(numAchievement)) return null;
  if (numTarget === 0) return 0;

  const direction = scoreDirection === "lower" ? "lower" : "higher";
  const raw =
    direction === "lower"
      ? numAchievement === 0
        ? 0
        : numTarget / numAchievement
      : numAchievement / numTarget;

  return Math.min(raw, 1.5);
}

export function getScoreTier(score: number): ScoreTier {
  if (score >= 1) return "green";
  if (score >= 0.5) return "yellow";
  return "red";
}

export function formatScorePercent(score: number): string {
  return `${Math.round(score * 100)}%`;
}
