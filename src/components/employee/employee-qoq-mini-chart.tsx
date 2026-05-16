"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
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
import type { EmployeeQoqPoint } from "@/lib/employee-qoq-trend";

import { LINE_CHART_COLOR } from "@/lib/chart-colors";

const LINE_STROKE = LINE_CHART_COLOR;

type ChartRow = EmployeeQoqPoint & { displayScore: number | null };

type EmployeeQoqMiniChartProps = {
  points: EmployeeQoqPoint[];
};

function MiniTooltip({ active, payload }: RechartsTooltipProps) {
  if (!active || !payload?.length) return null;

  const row = (payload[0].payload ?? {}) as ChartRow;
  const value = row.score != null ? `${row.score}%` : "Not submitted";

  return (
    <ChartTooltipBox
      active={active}
      className="rounded-md border bg-popover px-2.5 py-1.5 text-xs font-sans text-popover-foreground shadow-md"
    >
      <p className="font-medium">
        {row.label} score: {value}
      </p>
    </ChartTooltipBox>
  );
}

export function EmployeeQoqMiniChart({ points }: EmployeeQoqMiniChartProps) {
  const chartData: ChartRow[] = points.map((point) => ({
    ...point,
    displayScore: point.score,
  }));
  const hasAnyScore = chartData.some((row) => row.score != null);

  return (
    <Card size="sm" className="border-primary/20 bg-primary/[0.02]">
      <CardHeader>
        <CardTitle className="text-sm">Your achievement trend</CardTitle>
        <CardDescription className="text-xs">
          Weighted score by quarter when you submit check-ins
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasAnyScore ? (
          <p className="rounded-lg border border-dashed py-6 text-center text-xs text-muted-foreground">
            Submit a quarterly check-in to see your trend.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                tickFormatter={(v) => `${v}`}
                width={28}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip {...chartTooltipMotionProps} content={(props) => <MiniTooltip {...(props as RechartsTooltipProps)} />} />
              <Line
                type="monotone"
                dataKey="displayScore"
                stroke={LINE_STROKE}
                strokeWidth={3}
                dot={{ fill: LINE_STROKE, stroke: "var(--background)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
