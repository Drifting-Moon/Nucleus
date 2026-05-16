/** Human-readable BRD formula for score tooltips. */
export function getScoreFormulaLabel(
  uom: string | null | undefined,
  scoreDirection?: string | null
): string {
  if (uom === "zero_based") {
    return "Zero-based: actual achievement = 0 → 100% score; any other value → 0%.";
  }

  if (uom === "timeline") {
    return "Timeline: achievement date on or before target date → 100%; otherwise 0%.";
  }

  if (scoreDirection === "lower") {
    return "Lower is better: score = target ÷ achievement (capped at 150%).";
  }

  return "Higher is better: score = achievement ÷ target (capped at 150%).";
}
