export type GoalDistributionRow = {
  thrust_area: string | null;
  uom: string;
  status: string;
};

export type DistributionSlice = {
  name: string;
  value: number;
};

const THRUST_LABELS: Record<string, string> = {
  business: "Business",
  customer: "Customer",
  operations: "Operations",
  people: "People",
  compliance: "Compliance",
};

const UOM_LABELS: Record<string, string> = {
  number: "Number",
  percentage: "Percentage",
  timeline: "Timeline",
  zero_based: "Zero-based",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  approved: "Approved",
  locked: "Locked",
  rejected: "Rejected",
};

function formatLabel(
  raw: string | null,
  labels: Record<string, string>,
  fallback: string
): string {
  if (!raw) return fallback;
  return labels[raw] ?? raw.charAt(0).toUpperCase() + raw.slice(1);
}

function countBy(
  goals: GoalDistributionRow[],
  pick: (goal: GoalDistributionRow) => string
): DistributionSlice[] {
  const counts = new Map<string, number>();

  for (const goal of goals) {
    const key = pick(goal);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function buildThrustDistribution(goals: GoalDistributionRow[]): DistributionSlice[] {
  return countBy(goals, (g) =>
    formatLabel(g.thrust_area, THRUST_LABELS, "Unset")
  );
}

export function buildUomDistribution(goals: GoalDistributionRow[]): DistributionSlice[] {
  return countBy(goals, (g) => formatLabel(g.uom, UOM_LABELS, "Unknown"));
}

export function buildStatusDistribution(goals: GoalDistributionRow[]): DistributionSlice[] {
  return countBy(goals, (g) => formatLabel(g.status, STATUS_LABELS, "Unknown"));
}
