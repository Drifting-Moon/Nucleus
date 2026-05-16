"use client";

import {
  Cell,
  Label,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartTooltipBox,
  chartTooltipMotionProps,
  type RechartsTooltipProps,
} from "@/components/admin/analytics/chart-tooltip";
import type { DistributionSlice } from "@/lib/admin/goal-distribution";
import {
  colorForDistribution,
  type DistributionColorMode,
} from "@/lib/chart-colors";

type GoalDistributionChartsProps = {
  byThrust: DistributionSlice[];
  byUom: DistributionSlice[];
  byStatus: DistributionSlice[];
  totalGoals: number;
};

type DonutCardProps = {
  title: string;
  description: string;
  data: DistributionSlice[];
  colorMode: DistributionColorMode;
  emptyMessage: string;
};

function DistributionTooltip({
  active,
  payload,
  chartTotal,
}: RechartsTooltipProps & { chartTotal: number }) {
  if (!active || !payload?.length) return null;

  const item = payload[0];
  const value = item.value as number;
  const pct = chartTotal > 0 ? Math.round((value / chartTotal) * 100) : 0;

  return (
    <ChartTooltipBox active={active}>
      <p className="font-medium">{item.name}</p>
      <p className="text-muted-foreground">
        {value} goal{value === 1 ? "" : "s"} ({pct}%)
      </p>
    </ChartTooltipBox>
  );
}

function DonutCenterLabel({
  viewBox,
  total,
  segmentName,
}: {
  viewBox?: { cx?: number; cy?: number } & Record<string, unknown>;
  total: number;
  segmentName: string;
}) {
  const box = viewBox as { cx?: number; cy?: number } | undefined;
  const cx = box?.cx ?? 0;
  const cy = box?.cy ?? 0;

  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
      <tspan x={cx} dy="-0.4em" fill="var(--foreground)" fontSize={14} fontWeight={600}>
        {total} goal{total === 1 ? "" : "s"}
      </tspan>
      <tspan x={cx} dy="1.4em" fill="var(--muted-foreground)" fontSize={11}>
        All {segmentName}
      </tspan>
    </text>
  );
}

function DonutCard({ title, description, data, colorMode, emptyMessage }: DonutCardProps) {
  const total = data.reduce((sum, slice) => sum + slice.value, 0);
  const singleSegment = data.length === 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={52}
                outerRadius={80}
                paddingAngle={singleSegment ? 0 : 2}
                stroke="var(--background)"
                strokeWidth={2}
              >
                {data.map((slice) => (
                  <Cell
                    key={slice.name}
                    fill={colorForDistribution(slice.name, colorMode)}
                  />
                ))}
                {singleSegment ? (
                  <Label
                    content={(props) => (
                      <DonutCenterLabel
                        viewBox={props.viewBox}
                        total={total}
                        segmentName={data[0].name}
                      />
                    )}
                    position="center"
                  />
                ) : null}
              </Pie>
              <Tooltip
                {...chartTooltipMotionProps}
                cursor={false}
                content={(props) => (
                  <DistributionTooltip {...(props as RechartsTooltipProps)} chartTotal={total} />
                )}
              />
              <Legend
                verticalAlign="bottom"
                formatter={(value) => (
                  <span className="text-xs text-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function GoalDistributionCharts({
  byThrust,
  byUom,
  byStatus,
  totalGoals,
}: GoalDistributionChartsProps) {
  const emptyMessage =
    totalGoals === 0
      ? "No goals in the system yet."
      : "No data for this breakdown.";

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Goal distribution</h2>
        <p className="text-sm text-muted-foreground">
          Organization-wide breakdown from {totalGoals} goal{totalGoals === 1 ? "" : "s"} across all
          employees.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <DonutCard
          title="By thrust area"
          description="Business, customer, operations, people, compliance"
          data={byThrust}
          colorMode="thrust"
          emptyMessage={emptyMessage}
        />
        <DonutCard
          title="By unit of measure"
          description="Number, percentage, timeline, zero-based"
          data={byUom}
          colorMode="uom"
          emptyMessage={emptyMessage}
        />
        <DonutCard
          title="By status"
          description="Draft through locked lifecycle"
          data={byStatus}
          colorMode="status"
          emptyMessage={emptyMessage}
        />
      </div>
    </div>
  );
}
