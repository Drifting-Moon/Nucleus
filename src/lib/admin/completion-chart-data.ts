import type {
  CellStatus,
  EmployeeCompletionRow,
  ManagerCompletionRow,
} from "@/lib/admin/completion-data";
import { QUARTER_LABELS } from "@/lib/quarter-labels";
import type { CheckinQuarter } from "@/lib/get-active-window";

export type CompletionChartRow = {
  label: string;
  done: number;
  pending: number;
  na: number;
};

type CompletionField =
  | "goalsSubmitted"
  | "goalsApproved"
  | CheckinQuarter;

const CHART_FIELDS: { field: CompletionField; label: string }[] = [
  { field: "goalsSubmitted", label: "Goals submitted" },
  { field: "goalsApproved", label: "Goals approved" },
  { field: "q1", label: QUARTER_LABELS.q1 },
  { field: "q2", label: QUARTER_LABELS.q2 },
  { field: "q3", label: QUARTER_LABELS.q3 },
  { field: "annual", label: QUARTER_LABELS.annual },
];

function countStatus(rows: EmployeeCompletionRow[], field: CompletionField, status: CellStatus) {
  return rows.filter((row) => row[field] === status).length;
}

/** Stacked-bar series from the same logic as the Completion dashboard table. */
export function buildCompletionRatesChartData(
  employees: EmployeeCompletionRow[]
): CompletionChartRow[] {
  return CHART_FIELDS.map(({ field, label }) => ({
    label,
    done: countStatus(employees, field, "done"),
    pending: countStatus(employees, field, "pending"),
    na: countStatus(employees, field, "na"),
  }));
}

export type ManagerReviewChartRow = {
  name: string;
  cleared: number;
  pending: number;
  teamCount: number;
};

/** One horizontal bar per L1 manager — reviews cleared vs pending submissions. */
export function buildManagerReviewChartData(
  managers: ManagerCompletionRow[]
): ManagerReviewChartRow[] {
  return managers
    .filter((manager) => manager.teamCount > 0)
    .map((manager) => ({
      name: manager.name,
      cleared: manager.status === "done" ? 1 : 0,
      pending: manager.pendingReviews,
      teamCount: manager.teamCount,
    }))
    .sort((a, b) => b.pending - a.pending);
}

export function toCompletionPercentRows(
  rows: CompletionChartRow[],
  employeeCount: number
): CompletionChartRow[] {
  if (employeeCount <= 0) return rows;

  return rows.map((row) => ({
    label: row.label,
    done: Math.round((row.done / employeeCount) * 100),
    pending: Math.round((row.pending / employeeCount) * 100),
    na: Math.round((row.na / employeeCount) * 100),
  }));
}
