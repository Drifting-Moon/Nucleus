"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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
  CompletionChartRow,
  ManagerReviewChartRow,
} from "@/lib/admin/completion-chart-data";
import { COMPLETION_COLORS } from "@/lib/chart-colors";

type CompletionRatesChartProps = {
  employeeData: CompletionChartRow[];
  managerReviewData: ManagerReviewChartRow[];
  employeeCount: number;
  managerCount: number;
};

function CompletionTooltip({ active, payload, label }: RechartsTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <ChartTooltipBox active={active}>
      <p className="font-medium">{label}</p>
      <ul className="mt-1 space-y-0.5 text-muted-foreground">
        {payload.map((entry) => (
          <li key={String(entry.name)}>
            {entry.name}: {entry.value}%
          </li>
        ))}
      </ul>
    </ChartTooltipBox>
  );
}

function ManagerReviewTooltip({ active, payload }: RechartsTooltipProps) {
  if (!active || !payload?.length) return null;

  const row = payload[0].payload as ManagerReviewChartRow;

  return (
    <ChartTooltipBox active={active}>
      <p className="font-medium">{row.name}</p>
      {row.cleared > 0 ? (
        <p className="text-muted-foreground">All submitted goals reviewed</p>
      ) : (
        <p className="text-muted-foreground">
          {row.pending} pending review{row.pending === 1 ? "" : "s"} · team size {row.teamCount}
        </p>
      )}
    </ChartTooltipBox>
  );
}

function EmployeeCompletionChart({
  data,
  employeeCount,
}: {
  data: CompletionChartRow[];
  employeeCount: number;
}) {
  const hasApplicable = data.some((row) => row.done > 0 || row.pending > 0);

  if (employeeCount === 0) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        No employees in the system yet.
      </p>
    );
  }

  if (!hasApplicable) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        No check-in data yet — open a quarter window and ensure employees have approved goals.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          interval={0}
          angle={-12}
          textAnchor="end"
          height={72}
        />
        <YAxis
          domain={[0, 100]}
          allowDecimals={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          tickFormatter={(v) => `${v}%`}
          width={40}
        />
        <Tooltip
          {...chartTooltipMotionProps}
          content={(props) => <CompletionTooltip {...(props as RechartsTooltipProps)} />}
        />
        <Legend formatter={(value) => <span className="text-xs text-foreground">{value}</span>} />
        <Bar
          dataKey="done"
          name="Completed"
          stackId="stack"
          fill={COMPLETION_COLORS.done}
          radius={[0, 0, 0, 0]}
        />
        <Bar
          dataKey="pending"
          name="Pending"
          stackId="stack"
          fill={COMPLETION_COLORS.pending}
        />
        <Bar dataKey="na" name="N/A" stackId="stack" fill={COMPLETION_COLORS.na} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function ManagerReviewChart({ data }: { data: ManagerReviewChartRow[] }) {
  if (data.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        No managers with direct reports found.
      </p>
    );
  }

  const chartHeight = Math.max(160, data.length * 48);

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 24, left: 8, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" horizontal={false} />
        <XAxis
          type="number"
          allowDecimals={false}
          domain={[0, "dataMax"]}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={120}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
        />
        <Tooltip
          {...chartTooltipMotionProps}
          content={(props) => <ManagerReviewTooltip {...(props as RechartsTooltipProps)} />}
        />
        <Legend formatter={(value) => <span className="text-xs text-foreground">{value}</span>} />
        <Bar
          dataKey="cleared"
          name="Reviews complete"
          stackId="reviews"
          fill={COMPLETION_COLORS.done}
        />
        <Bar
          dataKey="pending"
          name="Pending reviews"
          stackId="reviews"
          fill={COMPLETION_COLORS.pending}
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CompletionRatesChart({
  employeeData,
  managerReviewData,
  employeeCount,
  managerCount,
}: CompletionRatesChartProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Completion rates</h2>
        <p className="text-sm text-muted-foreground">
          Same statuses as the Completion tab — shown as % of employees per phase.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Employee check-ins & goals</CardTitle>
          <CardDescription>
            % of {employeeCount} employee{employeeCount === 1 ? "" : "s"} completed, pending, or N/A
            per cycle.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeCompletionChart data={employeeData} employeeCount={employeeCount} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Manager goal reviews</CardTitle>
          <CardDescription>
            Per L1 manager — green = no pending submissions; amber = reviews still open (
            {managerCount} manager{managerCount === 1 ? "" : "s"}).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ManagerReviewChart data={managerReviewData} />
        </CardContent>
      </Card>
    </div>
  );
}
