"use client";

import { useMemo, useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartTooltipBox,
  chartTooltipMotionProps,
  type RechartsTooltipProps,
} from "@/components/admin/analytics/chart-tooltip";
import { QOQ_ALL_SCOPE, type QoqPoint, type QoqTrendSeries } from "@/lib/admin/qoq-chart-data";

import { LINE_CHART_COLOR } from "@/lib/chart-colors";

const LINE_STROKE = LINE_CHART_COLOR;
const DOT_FILL = LINE_CHART_COLOR;

type QoqTrendChartProps = {
  departments: string[];
  series: QoqTrendSeries;
};

type ChartRow = QoqPoint & {
  displayScore: number | null;
};

function QoqTooltip({ active, payload }: RechartsTooltipProps) {
  if (!active || !payload?.length) return null;

  const row = (payload[0].payload ?? {}) as ChartRow;
  const value = row.score != null ? `${row.score}%` : "No submitted check-ins";

  return (
    <ChartTooltipBox active={active}>
      <p className="font-medium">
        {row.label} average score: {value}
      </p>
      <p className="text-xs text-muted-foreground">Weighted by goal weightage (BRD formula)</p>
    </ChartTooltipBox>
  );
}

export function QoqTrendChart({ departments, series }: QoqTrendChartProps) {
  const [scope, setScope] = useState(QOQ_ALL_SCOPE);

  const chartData = useMemo((): ChartRow[] => {
    const points = series[scope] ?? series[QOQ_ALL_SCOPE] ?? [];
    return points.map((point) => ({
      ...point,
      displayScore: point.score,
    }));
  }, [scope, series]);

  const hasAnyScore = chartData.some((row) => row.score != null);
  const scopeLabel =
    scope === QOQ_ALL_SCOPE ? "Organization" : scope;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Quarter-on-quarter achievement</h2>
          <p className="text-sm text-muted-foreground">
            Average weighted score per quarter — {scopeLabel.toLowerCase()} view.
          </p>
        </div>
        <div className="w-full min-w-[200px] sm:w-56">
          <label className="mb-1 block text-xs text-muted-foreground">Department</label>
          <Select value={scope} onValueChange={(value) => setScope(value ?? QOQ_ALL_SCOPE)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Organization-wide" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={QOQ_ALL_SCOPE}>Organization-wide</SelectItem>
              {departments.map((department) => (
                <SelectItem key={department} value={department}>
                  {department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Weighted score trend</CardTitle>
          <CardDescription>
            Mean of employee weighted scores for each quarter (only employees with submitted
            check-ins count).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasAnyScore ? (
            <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No check-in data yet for this view. Submit quarterly achievements to see trends.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  tickFormatter={(value) => `${value}%`}
                  width={40}
                />
                <Tooltip {...chartTooltipMotionProps} content={(props) => <QoqTooltip {...(props as RechartsTooltipProps)} />} />
                <Line
                  type="monotone"
                  dataKey="displayScore"
                  name="Average score"
                  stroke={LINE_STROKE}
                  strokeWidth={2}
                  dot={{ fill: DOT_FILL, r: 4 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
