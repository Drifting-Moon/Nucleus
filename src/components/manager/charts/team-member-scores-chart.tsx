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
import { LINE_CHART_COLOR } from "@/lib/chart-colors";
import type { MemberScoreChartRow } from "@/lib/manager/team-chart-data";
import { QUARTER_LABELS } from "@/lib/quarter-labels";
import type { CheckinQuarter } from "@/lib/get-active-window";

type TeamMemberScoresChartProps = {
  data: MemberScoreChartRow[];
  activeQuarter: CheckinQuarter | null;
};

function ScoreTooltip({ active, payload }: RechartsTooltipProps) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload as MemberScoreChartRow;

  return (
    <ChartTooltipBox active={active}>
      <p className="font-medium">{row.name}</p>
      <p className="text-muted-foreground">
        {row.hasScore ? `${row.score}% weighted score` : "No submitted check-in yet"}
      </p>
    </ChartTooltipBox>
  );
}

export function TeamMemberScoresChart({ data, activeQuarter }: TeamMemberScoresChartProps) {
  return (
    <Card className="border-primary/15">
      <CardHeader>
        <CardTitle className="text-base">Team scores this quarter</CardTitle>
        <CardDescription>
          {activeQuarter
            ? `Weighted achievement for ${QUARTER_LABELS[activeQuarter]} (approved goals only).`
            : "Open a check-in window to compare quarterly scores."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!activeQuarter ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No active check-in quarter. Scores appear when Q1, Q2, Q3, or Annual is open.
          </p>
        ) : data.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No approved goals on your team yet.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(180, data.length * 36)}>
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                width={88}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              />
              <Tooltip
                {...chartTooltipMotionProps}
                content={(props) => <ScoreTooltip {...(props as RechartsTooltipProps)} />}
              />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                {data.map((row) => (
                  <Cell
                    key={row.name}
                    fill={row.hasScore ? LINE_CHART_COLOR : "var(--analytics-grey)"}
                    fillOpacity={row.hasScore ? 1 : 0.35}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
