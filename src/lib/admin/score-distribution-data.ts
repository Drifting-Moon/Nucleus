export type ScoreBucket = {
  label: string;
  count: number;
};

const BUCKETS = [
  { label: "0–25%", min: 0, max: 25 },
  { label: "26–50%", min: 26, max: 50 },
  { label: "51–75%", min: 51, max: 75 },
  { label: "76–99%", min: 76, max: 99 },
  { label: "100%+", min: 100, max: Infinity },
] as const;

/** Bucket submitted quarterly goal scores (ratio → display %). */
export function buildScoreDistribution(
  updates: { score: number | null; submitted_at: string | null }[]
): ScoreBucket[] {
  const submitted = updates.filter((row) => row.submitted_at != null && row.score != null);

  return BUCKETS.map((bucket) => {
    const count = submitted.filter((row) => {
      const pct = Math.round((row.score ?? 0) * 100);
      return pct >= bucket.min && pct <= bucket.max;
    }).length;

    return { label: bucket.label, count };
  });
}
