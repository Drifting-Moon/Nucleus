"use client";

import { CompletionRatesChart } from "@/components/admin/analytics/completion-rates-chart";
import { GoalDistributionCharts } from "@/components/admin/analytics/goal-distribution-charts";
import { ManagerEffectivenessChart } from "@/components/admin/analytics/manager-effectiveness-chart";
import { ScoreDistributionChart } from "@/components/admin/analytics/score-distribution-chart";
import { QoqTrendChart } from "@/components/admin/analytics/qoq-trend-chart";
import type {
  CompletionChartRow,
  ManagerReviewChartRow,
} from "@/lib/admin/completion-chart-data";
import type { ScoreBucket } from "@/lib/admin/score-distribution-data";
import type { ManagerEffectivenessResult } from "@/lib/admin/manager-effectiveness-data";
import type { QoqTrendSeries } from "@/lib/admin/qoq-chart-data";
import type { DistributionSlice } from "@/lib/admin/goal-distribution";

export type AnalyticsDashboardProps = {
  byThrust: DistributionSlice[];
  byUom: DistributionSlice[];
  byStatus: DistributionSlice[];
  totalGoals: number;
  completionChartData: CompletionChartRow[];
  managerReviewChartData: ManagerReviewChartRow[];
  scoreDistribution: ScoreBucket[];
  employeeCount: number;
  managerCount: number;
  qoqDepartments: string[];
  qoqSeries: QoqTrendSeries;
  managerEffectiveness: ManagerEffectivenessResult;
};

export function AnalyticsDashboard({
  byThrust,
  byUom,
  byStatus,
  totalGoals,
  completionChartData,
  managerReviewChartData,
  scoreDistribution,
  employeeCount,
  managerCount,
  qoqDepartments,
  qoqSeries,
  managerEffectiveness,
}: AnalyticsDashboardProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Analytics</h2>
        <p className="text-sm text-muted-foreground">
          Organization-wide insights from goals and check-ins.
        </p>
      </div>
      <GoalDistributionCharts
        byThrust={byThrust}
        byUom={byUom}
        byStatus={byStatus}
        totalGoals={totalGoals}
      />
      <CompletionRatesChart
        employeeData={completionChartData}
        managerReviewData={managerReviewChartData}
        employeeCount={employeeCount}
        managerCount={managerCount}
      />
      <ScoreDistributionChart buckets={scoreDistribution} />
      <QoqTrendChart departments={qoqDepartments} series={qoqSeries} />
      <ManagerEffectivenessChart {...managerEffectiveness} />
    </div>
  );
}
