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
import type { StatusChartRow } from "@/lib/manager/team-chart-data";

type TeamGoalStatusChartProps = {
  data: StatusChartRow[];
};

function StatusTooltip({ active, payload, label }: RechartsTooltipProps) {
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

export function TeamGoalStatusChart({ data }: TeamGoalStatusChartProps) {
  const total = data.reduce((sum, row) => sum + row.count, 0);

  return (
    <Card className="border-primary/15">
      <CardHeader>
        <CardTitle className="text-base">Goal submission status</CardTitle>
        <CardDescription>How your direct reports are progressing on goal sheets.</CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No team members assigned yet.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} width={28} />
              <Tooltip
                {...chartTooltipMotionProps}
                content={(props) => <StatusTooltip {...(props as RechartsTooltipProps)} />}
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
