"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
import type { CheckinPipelineRow } from "@/lib/manager/team-chart-data";
import { QUARTER_LABELS } from "@/lib/quarter-labels";
import type { CheckinQuarter } from "@/lib/get-active-window";

type TeamCheckinPipelineChartProps = {
  data: CheckinPipelineRow[];
  quarter: CheckinQuarter;
};

function PipelineTooltip({ active, payload, label }: RechartsTooltipProps) {
  if (!active || !payload?.length) return null;
  const count = payload[0].value as number;

  return (
    <ChartTooltipBox active={active}>
      <p className="font-medium">{label}</p>
      <p className="text-muted-foreground">
        {count} team member{count === 1 ? "" : "s"}
      </p>
    </ChartTooltipBox>
  );
}

export function TeamCheckinPipelineChart({ data, quarter }: TeamCheckinPipelineChartProps) {
  const total = data.reduce((sum, row) => sum + row.count, 0);

  return (
    <Card className="border-primary/15">
      <CardHeader>
        <CardTitle className="text-base">Check-in pipeline</CardTitle>
        <CardDescription>{QUARTER_LABELS[quarter]} — who still needs action from you.</CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No team data for this quarter.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} width={28} />
              <Tooltip
                {...chartTooltipMotionProps}
                content={(props) => <PipelineTooltip {...(props as RechartsTooltipProps)} />}
              />
              <Bar dataKey="count" maxBarSize={60} radius={[4, 4, 0, 0]}>
                {data.map((row) => (
                  <Cell key={row.label} fill={row.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
