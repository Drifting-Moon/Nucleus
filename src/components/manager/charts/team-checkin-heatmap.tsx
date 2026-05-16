"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  heatmapCellColor,
  type HeatmapCell,
  type HeatmapRow,
} from "@/lib/manager/team-chart-data";
import { QUARTER_LABELS } from "@/lib/quarter-labels";
import type { CheckinQuarter } from "@/lib/get-active-window";
import { cn } from "@/lib/utils";

type TeamCheckinHeatmapProps = {
  rows: HeatmapRow[];
  maxColumns: number;
  quarter: CheckinQuarter;
};

function cellLabel(cell: HeatmapCell) {
  if (!cell.submitted) return "—";
  if (cell.scorePercent == null) return "…";
  return `${cell.scorePercent}%`;
}

function cellTitle(cell: HeatmapCell) {
  if (!cell.submitted) return `${cell.goalTitle}: not submitted`;
  if (cell.scorePercent == null) return `${cell.goalTitle}: submitted`;
  return `${cell.goalTitle}: ${cell.scorePercent}% achievement`;
}

function cellClass(cell: HeatmapCell) {
  if (!cell.submitted || cell.scorePercent == null) {
    return "border-border/50 bg-muted/30 text-muted-foreground";
  }
  if (cell.scorePercent === 0) {
    return "border-border/50 bg-muted/40 text-muted-foreground";
  }
  if (cell.scorePercent < 50) {
    return "border-red-500/20 bg-red-500/15 text-red-600 dark:text-red-400";
  }
  if (cell.scorePercent < 100) {
    return "border-amber-500/25 bg-amber-500/15 text-amber-700 dark:text-amber-300";
  }
  return "border-emerald-500/25 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
}

export function TeamCheckinHeatmap({ rows, maxColumns, quarter }: TeamCheckinHeatmapProps) {
  if (rows.length === 0 || maxColumns === 0) {
    return (
      <Card className="border-primary/15">
        <CardHeader>
          <CardTitle className="text-base">Goal achievement heatmap</CardTitle>
          <CardDescription>
            Per-goal scores for {QUARTER_LABELS[quarter]} once your team has approved goals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No approved goals to display yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/15">
      <CardHeader>
        <CardTitle className="text-base">Goal achievement heatmap</CardTitle>
        <CardDescription>
          {QUARTER_LABELS[quarter]} — each cell is one locked goal. Green = higher achievement.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 overflow-x-auto">
        <div
          className="inline-grid min-w-full gap-1 text-xs"
          style={{
            gridTemplateColumns: `minmax(120px, 1.2fr) repeat(${maxColumns}, minmax(52px, 1fr))`,
          }}
        >
          <div className="px-2 py-1 font-medium text-muted-foreground">Team member</div>
          {Array.from({ length: maxColumns }, (_, index) => (
            <div
              key={`col-${index}`}
              className="px-1 py-1 text-center font-medium text-muted-foreground"
            >
              Goal {index + 1}
            </div>
          ))}

          {rows.map((row) => {
            const padded: (HeatmapCell | null)[] = [
              ...row.cells,
              ...Array.from({ length: maxColumns - row.cells.length }, () => null),
            ];

            return (
              <div key={row.employeeId} className="contents">
                <div className="truncate px-2 py-2 font-medium" title={row.employeeName}>
                  {row.employeeName}
                </div>
                {padded.map((cell, index) =>
                  cell ? (
                    <div
                      key={`${row.employeeId}-${cell.goalId}`}
                      title={cellTitle(cell)}
                      className={cn(
                        "flex min-h-10 items-center justify-center rounded-md border px-1 py-2 text-center font-semibold tabular-nums",
                        cellClass(cell)
                      )}
                    >
                      {cellLabel(cell)}
                    </div>
                  ) : (
                    <div
                      key={`${row.employeeId}-empty-${index}`}
                      className="min-h-10 rounded-md bg-muted/20"
                      aria-hidden
                    />
                  )
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <LegendSwatch
            label="Not submitted"
            cell={{ goalId: "", goalTitle: "", scorePercent: null, submitted: false }}
          />
          <LegendSwatch
            label="<50%"
            cell={{ goalId: "", goalTitle: "", scorePercent: 30, submitted: true }}
          />
          <LegendSwatch
            label="50–99%"
            cell={{ goalId: "", goalTitle: "", scorePercent: 75, submitted: true }}
          />
          <LegendSwatch
            label="100%+"
            cell={{ goalId: "", goalTitle: "", scorePercent: 110, submitted: true }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function LegendSwatch({ label, cell }: { label: string; cell: HeatmapCell }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="size-3 rounded-sm border"
        style={{ backgroundColor: heatmapCellColor(cell) }}
      />
      {label}
    </span>
  );
}
