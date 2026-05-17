"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartTooltipBox } from "@/components/admin/analytics/chart-tooltip";

type ThrustDataPoint = {
  name: string;
  value: number;
  color: string;
};

type EmployeeThrustDistributionProps = {
  goals: { thrust_area: string; weightage: number }[];
};

const THRUST_COLORS: Record<string, string> = {
  business: "#8b5cf6",    // Violet
  customer: "#06b6d4",    // Cyan
  operations: "#f59e0b",  // Amber
  people: "#10b981",      // Emerald
  compliance: "#ef4444",  // Red
  other: "#6b7280"        // Gray
};

const THRUST_LABELS: Record<string, string> = {
  business: "Business",
  customer: "Customer",
  operations: "Operations",
  people: "People",
  compliance: "Compliance",
};

export function EmployeeThrustDistribution({ goals }: EmployeeThrustDistributionProps) {
  const data = Object.entries(
    goals.reduce((acc, goal) => {
      const area = goal.thrust_area || "other";
      acc[area] = (acc[area] || 0) + (Number(goal.weightage) || 0);
      return acc;
    }, {} as Record<string, number>)
  ).map(([key, value]) => ({
    name: THRUST_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1),
    value,
    color: THRUST_COLORS[key] || THRUST_COLORS.other,
  })).filter(item => item.value > 0);

  if (data.length === 0) return null;

  return (
    <Card size="sm" className="border-primary/20 bg-primary/[0.02]">
      <CardHeader>
        <CardTitle className="text-sm">Goal distribution</CardTitle>
        <CardDescription className="text-xs">
          Your active goal weightage balanced by Thrust Area
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        <ResponsiveContainer width="100%" height={140}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={50}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0].payload as ThrustDataPoint;
                return (
                  <ChartTooltipBox active={active} className="text-xs p-2">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-muted-foreground">{item.value}% of overall weightage</p>
                  </ChartTooltipBox>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-1 text-[10px]">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="font-medium text-muted-foreground">{item.name} ({item.value}%)</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
