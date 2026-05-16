"use client";

import {
  Cell,
  Label,
  Legend,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
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

type RadarRow = {
  name: string;
  value: number;
  percent: number;
};

const THRUST_RADAR_ORDER = [
  "Business",
  "Customer",
  "Operations",
  "People",
  "Compliance",
] as const;

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

function ThrustRadarTooltip({
  active,
  payload,
  chartTotal,
}: RechartsTooltipProps & { chartTotal: number }) {
  if (!active || !payload?.length) return null;

  const row = payload[0].payload as RadarRow;

  return (
    <ChartTooltipBox active={active}>
      <p className="font-medium">{row.name}</p>
      <p className="text-muted-foreground">
        {row.value} goal{row.value === 1 ? "" : "s"} ({row.percent}% of {chartTotal})
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

function ThrustRadarCard({ data, totalGoals }: { data: DistributionSlice[]; totalGoals: number }) {
  const counts = new Map(data.map((slice) => [slice.name, slice.value]));
  const extraThrusts = data
    .map((slice) => slice.name)
    .filter((name) => !THRUST_RADAR_ORDER.includes(name as (typeof THRUST_RADAR_ORDER)[number]));
  const chartData: RadarRow[] = [...THRUST_RADAR_ORDER, ...extraThrusts].map((name) => {
    const value = counts.get(name) ?? 0;

    return {
      name,
      value,
      percent: totalGoals > 0 ? Math.round((value / totalGoals) * 100) : 0,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Strategic thrust coverage</CardTitle>
        <CardDescription>
          Radar view of where goals are concentrated across business priorities.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {totalGoals === 0 ? (
          <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No goals in the system yet.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={chartData} margin={{ top: 8, right: 48, bottom: 8, left: 48 }}>
              <PolarGrid className="stroke-border/70" />
              <PolarAngleAxis
                dataKey="name"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={90}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                tickCount={4}
              />
              <Tooltip
                {...chartTooltipMotionProps}
                cursor={false}
                content={(props) => (
                  <ThrustRadarTooltip
                    {...(props as RechartsTooltipProps)}
                    chartTotal={totalGoals}
                  />
                )}
              />
              <Radar
                dataKey="value"
                name="Goals"
                stroke="var(--analytics-blue)"
                fill="var(--analytics-blue)"
                fillOpacity={0.22}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
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
          <ResponsiveContainer width="100%" height={270}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={66}
                outerRadius={104}
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
      <ThrustRadarCard data={byThrust} totalGoals={totalGoals} />
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
