"use client";

import { useMemo, useState } from "react";
import { CompletionRatesChart } from "@/components/admin/analytics/completion-rates-chart";
import { GoalDistributionCharts } from "@/components/admin/analytics/goal-distribution-charts";
import { ManagerEffectivenessChart } from "@/components/admin/analytics/manager-effectiveness-chart";
import { ScoreDistributionChart } from "@/components/admin/analytics/score-distribution-chart";
import { QoqTrendChart } from "@/components/admin/analytics/qoq-trend-chart";
import { AnalyticsSummaryStrip } from "@/components/admin/analytics/analytics-summary-strip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Pure helper function builders from lib
import {
  buildEmployeeCompletionRows,
  buildManagerCompletionRows,
} from "@/lib/admin/completion-data";
import {
  buildCompletionRatesChartData,
  buildManagerReviewChartData,
  toCompletionPercentRows,
} from "@/lib/admin/completion-chart-data";
import { buildScoreDistribution } from "@/lib/admin/score-distribution-data";
import { buildManagerEffectiveness } from "@/lib/admin/manager-effectiveness-data";
import { buildQoqTrendSeries } from "@/lib/admin/qoq-chart-data";
import {
  buildStatusDistribution,
  buildThrustDistribution,
  buildUomDistribution,
} from "@/lib/admin/goal-distribution";

type RawUser = {
  id: string;
  name: string | null;
  email: string | null;
  department: string | null;
  role: string;
  manager_id: string | null;
};

type RawGoal = {
  id: string;
  user_id: string;
  status: string;
  title: string;
  uom: string;
  target: number | null;
  target_date: string | null;
  weightage: number;
  thrust_area: string;
};

type RawUpdate = {
  goal_id: string;
  quarter: string;
  score: number | null;
  submitted_at: string | null;
};

type RawWindow = {
  id: string;
  quarter_name: string;
  start_date: string;
  end_date: string;
};

export type AnalyticsDashboardProps = {
  rawEmployees: RawUser[];
  rawManagers: RawUser[];
  rawGoals: RawGoal[];
  rawUpdates: RawUpdate[];
  rawWindows: RawWindow[];
};

export function AnalyticsDashboard({
  rawEmployees,
  rawManagers,
  rawGoals,
  rawUpdates,
  rawWindows,
}: AnalyticsDashboardProps) {
  const [selectedDept, setSelectedDept] = useState<string>("ALL");

  // Get unique departments list
  const departments = useMemo(() => {
    const set = new Set<string>();
    rawEmployees.forEach((emp) => {
      if (emp.department?.trim()) {
        set.add(emp.department.trim());
      }
    });
    return Array.from(set).sort();
  }, [rawEmployees]);

  // Compute filtered datasets dynamically in real-time
  const {
    filteredEmployees,
    filteredManagers,
    filteredGoals,
    filteredUpdates,
  } = useMemo(() => {
    if (selectedDept === "ALL") {
      return {
        filteredEmployees: rawEmployees,
        filteredManagers: rawManagers,
        filteredGoals: rawGoals,
        filteredUpdates: rawUpdates,
      };
    }

    const emps = rawEmployees.filter((e) => e.department === selectedDept);
    const mgrs = rawManagers.filter((m) => m.department === selectedDept);
    const gls = rawGoals.filter((g) => {
      const emp = rawEmployees.find((e) => e.id === g.user_id);
      return emp?.department === selectedDept;
    });
    const updts = rawUpdates.filter((u) => {
      const g = rawGoals.find((gl) => gl.id === u.goal_id);
      if (!g) return false;
      const emp = rawEmployees.find((e) => e.id === g.user_id);
      return emp?.department === selectedDept;
    });

    return {
      filteredEmployees: emps,
      filteredManagers: mgrs,
      filteredGoals: gls,
      filteredUpdates: updts,
    };
  }, [selectedDept, rawEmployees, rawManagers, rawGoals, rawUpdates]);

  // Dynamically compute charts based on filtered subsets
  const byThrust = useMemo(() => buildThrustDistribution(filteredGoals), [filteredGoals]);
  const byUom = useMemo(() => buildUomDistribution(filteredGoals), [filteredGoals]);
  const byStatus = useMemo(() => buildStatusDistribution(filteredGoals), [filteredGoals]);
  const totalGoals = filteredGoals.length;

  const employeeRows = useMemo(
    () => buildEmployeeCompletionRows(filteredEmployees, rawGoals, rawUpdates, rawWindows),
    [filteredEmployees, rawGoals, rawUpdates, rawWindows]
  );

  const managerRows = useMemo(
    () => buildManagerCompletionRows(filteredManagers, rawEmployees, rawGoals),
    [filteredManagers, rawEmployees, rawGoals]
  );

  const completionChartData = useMemo(() => {
    return toCompletionPercentRows(
      buildCompletionRatesChartData(employeeRows),
      filteredEmployees.length
    );
  }, [employeeRows, filteredEmployees.length]);

  const managerReviewChartData = useMemo(
    () => buildManagerReviewChartData(managerRows),
    [managerRows]
  );

  const scoreDistribution = useMemo(
    () => buildScoreDistribution(filteredUpdates),
    [filteredUpdates]
  );

  const managerEffectiveness = useMemo(() => {
    return buildManagerEffectiveness(
      filteredManagers,
      filteredEmployees,
      rawGoals,
      rawUpdates,
      rawWindows
    );
  }, [filteredManagers, filteredEmployees, rawGoals, rawUpdates, rawWindows]);

  const qoq = useMemo(() => {
    return buildQoqTrendSeries(
      filteredEmployees.map((e) => ({ id: e.id, department: e.department })),
      rawGoals,
      rawUpdates
    );
  }, [filteredEmployees, rawGoals, rawUpdates]);

  const summaryStats = useMemo(() => {
    const submittedEmployees = employeeRows.filter((r) => r.goalsSubmitted === "done").length;
    const goalsSubmittedPercent =
      filteredEmployees.length > 0
        ? Math.round((submittedEmployees / filteredEmployees.length) * 100)
        : 0;

    const pendingApprovals = filteredGoals.filter((g) => g.status === "submitted").length;
    const validScores = filteredUpdates
      .map((u) => u.score)
      .filter((s): s is number => s !== null);
    const avgOrgScore =
      validScores.length > 0
        ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
        : 0;

    const employeesWithGoals = employeeRows.filter((r) => r.goalsApproved === "done");
    const checkinsSubmittedCount = employeesWithGoals.filter((r) => r.q1 === "done").length;
    const checkinsSubmittedPercent =
      employeesWithGoals.length > 0
        ? Math.round((checkinsSubmittedCount / employeesWithGoals.length) * 100)
        : 0;

    return {
      activeEmployees: filteredEmployees.length,
      goalsSubmittedPercent,
      checkinsSubmittedPercent,
      pendingApprovals,
      escalations: 0,
      avgOrgScore,
    };
  }, [filteredEmployees, filteredGoals, filteredUpdates, employeeRows]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Organization Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Real-time, interactive insights and goal achievement cycles across departments.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Department:
          </span>
          <Select value={selectedDept} onValueChange={(val) => setSelectedDept(val ?? "ALL")}>
            <SelectTrigger className="w-[180px] bg-card shadow-sm border">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <AnalyticsSummaryStrip stats={summaryStats} />

      <GoalDistributionCharts
        byThrust={byThrust}
        byUom={byUom}
        byStatus={byStatus}
        totalGoals={totalGoals}
      />

      <CompletionRatesChart
        employeeData={completionChartData}
        managerReviewData={managerReviewChartData}
        employeeCount={filteredEmployees.length}
        managerCount={filteredManagers.length}
      />

      <ScoreDistributionChart buckets={scoreDistribution} />

      <QoqTrendChart departments={qoq.departments} series={qoq.series} />

      <ManagerEffectivenessChart {...managerEffectiveness} />
    </div>
  );
}
