"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartTooltipBox,
  chartTooltipMotionProps,
  type RechartsTooltipProps,
} from "@/components/admin/analytics/chart-tooltip";
import type {
  ManagerEffectivenessResult,
  ManagerEffectivenessRow,
} from "@/lib/admin/manager-effectiveness-data";

import { COMPLETION_COLORS } from "@/lib/chart-colors";

const BAR_FILL = COMPLETION_COLORS.done;

type ManagerEffectivenessChartProps = ManagerEffectivenessResult;

function EffectivenessTooltip({
  active,
  payload,
  quarterLabel,
}: RechartsTooltipProps & { quarterLabel: string | null }) {
  if (!active || !payload?.length || !quarterLabel) return null;

  const row = payload[0].payload as ManagerEffectivenessRow;

  return (
    <ChartTooltipBox active={active}>
      <p className="font-medium">{row.name}</p>
      <p className="text-muted-foreground">
        {quarterLabel} check-ins: {row.completionRate}% ({row.completed}/{row.eligible}{" "}
        eligible reports)
      </p>
      <p className="text-xs text-muted-foreground">Team size: {row.teamSize}</p>
    </ChartTooltipBox>
  );
}

export function ManagerEffectivenessChart({
  quarterLabel,
  rows,
}: ManagerEffectivenessChartProps) {
  const chartHeight = Math.max(220, rows.length * 52);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Manager effectiveness</h2>
        <p className="text-sm text-muted-foreground">
          L1 managers compared by direct-report check-in completion for the active quarter.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Check-in completion by manager</CardTitle>
          <CardDescription>
            {quarterLabel
              ? `Share of eligible reports who submitted ${quarterLabel} (locked goals, full sheet approved).`
              : "Open a Q1–Annual window to measure manager team completion."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!quarterLabel ? (
            <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No active check-in window. Set quarter dates in Quarter Windows so today falls
              inside Q1, Q2, Q3, or Annual.
            </p>
          ) : rows.length === 0 ? (
            <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No L1 managers with direct reports found.
            </p>
          ) : rows.every((row) => row.eligible === 0) ? (
            <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No eligible employees yet for {quarterLabel} — teams need fully approved goal sheets.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={chartHeight}>
              <BarChart
                data={rows}
                layout="vertical"
                margin={{ top: 8, right: 24, left: 8, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                />
                <Tooltip
                  {...chartTooltipMotionProps}
                  content={(props) => (
                    <EffectivenessTooltip
                      {...(props as RechartsTooltipProps)}
                      quarterLabel={quarterLabel}
                    />
                  )}
                />
                <Bar
                  dataKey="completionRate"
                  name="Completion rate"
                  fill={BAR_FILL}
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
