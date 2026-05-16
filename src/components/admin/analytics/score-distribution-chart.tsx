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
import type { ScoreBucket } from "@/lib/admin/score-distribution-data";
import { LINE_CHART_COLOR } from "@/lib/chart-colors";

type ScoreDistributionChartProps = {
  buckets: ScoreBucket[];
};

function ScoreTooltip({ active, payload, label }: RechartsTooltipProps) {
  if (!active || !payload?.length) return null;

  const count = payload[0].value as number;

  return (
    <ChartTooltipBox active={active}>
      <p className="font-medium">{label}</p>
      <p className="text-muted-foreground">
        {count} submitted goal update{count === 1 ? "" : "s"}
      </p>
    </ChartTooltipBox>
  );
}

export function ScoreDistributionChart({ buckets }: ScoreDistributionChartProps) {
  const total = buckets.reduce((sum, bucket) => sum + bucket.count, 0);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Score distribution</h2>
        <p className="text-sm text-muted-foreground">
          How submitted check-in scores are spread across achievement bands.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Achievement bands</CardTitle>
          <CardDescription>
            Based on {total} submitted quarterly update{total === 1 ? "" : "s"} org-wide.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {total === 0 ? (
            <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No submitted check-in scores yet.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={buckets} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <YAxis
                  allowDecimals={false}
                  domain={[0, "dataMax"]}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  width={32}
                />
                <Tooltip
                  {...chartTooltipMotionProps}
                  content={(props) => <ScoreTooltip {...(props as RechartsTooltipProps)} />}
                />
                <Bar dataKey="count" name="Updates" fill={LINE_CHART_COLOR} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
