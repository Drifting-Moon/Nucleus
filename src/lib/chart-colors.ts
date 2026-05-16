/** Semantic analytics colors — defined in globals.css (:root / .dark). */

export const COMPLETION_COLORS = {
  done: "var(--analytics-green)",
  pending: "var(--analytics-amber)",
  na: "var(--analytics-grey)",
} as const;

export const LINE_CHART_COLOR = "var(--analytics-blue)";

const THRUST_COLORS: Record<string, string> = {
  Business: "var(--analytics-blue)",
  Customer: "var(--analytics-purple)",
  Operations: "var(--analytics-orange)",
  People: "var(--analytics-green)",
  Compliance: "var(--analytics-yellow)",
  Unset: "var(--analytics-grey)",
};

const UOM_COLORS: Record<string, string> = {
  Number: "var(--analytics-blue)",
  Percentage: "var(--analytics-green)",
  Timeline: "var(--analytics-orange)",
  "Zero-based": "var(--analytics-red)",
  Unknown: "var(--analytics-grey)",
};

const STATUS_COLORS: Record<string, string> = {
  Draft: "var(--analytics-grey)",
  Submitted: "var(--analytics-blue)",
  Approved: "var(--analytics-green)",
  Rejected: "var(--analytics-red)",
  Locked: "var(--analytics-purple)",
  Unknown: "var(--analytics-grey)",
};

export type DistributionColorMode = "thrust" | "uom" | "status";

export function colorForDistribution(name: string, mode: DistributionColorMode): string {
  if (mode === "thrust") return THRUST_COLORS[name] ?? "var(--analytics-blue)";
  if (mode === "uom") return UOM_COLORS[name] ?? "var(--analytics-blue)";
  return STATUS_COLORS[name] ?? "var(--analytics-grey)";
}

/** @deprecated Use colorForDistribution */
export function colorForStatus(statusLabel: string): string {
  return STATUS_COLORS[statusLabel] ?? "var(--analytics-grey)";
}

/** @deprecated Use colorForDistribution */
export function colorForIndex(): string {
  return "var(--analytics-blue)";
}
