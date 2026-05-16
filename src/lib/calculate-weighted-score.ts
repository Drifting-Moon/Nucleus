export type WeightedScoreGoal = {
  id: string;
  weightage: number | null;
};

export type WeightedScoreUpdate = {
  goal_id: string;
  score: number | null;
  submitted_at: string | null;
};

/**
 * BRD-style overall score: Σ (avg submitted score per goal × weightage) ÷ 100.
 * Scores are stored as ratios (0–1.5). Returns 0–100 display percent or null.
 */
export function calculateWeightedOverallScore(
  goals: WeightedScoreGoal[],
  updates: WeightedScoreUpdate[]
): number | null {
  if (goals.length === 0) return null;

  let weightedSum = 0;
  let hasSubmitted = false;

  for (const goal of goals) {
    const weight = goal.weightage ?? 0;
    if (weight <= 0) continue;

    const submitted = updates.filter(
      (row) => row.goal_id === goal.id && row.submitted_at && row.score != null
    );

    if (submitted.length === 0) continue;

    hasSubmitted = true;
    const avgScore =
      submitted.reduce((sum, row) => sum + (row.score ?? 0), 0) / submitted.length;
    weightedSum += avgScore * weight;
  }

  if (!hasSubmitted) return null;

  return Math.round(weightedSum);
}
