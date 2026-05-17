"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { DashboardLoading } from "@/components/dashboard-loading";
import { AuditLogViewer, type AuditLogEntry } from "@/components/admin/audit-log-viewer";
import { CompletionDashboard } from "@/components/admin/completion-dashboard";
import { EscalationCenter } from "@/components/admin/escalation-center";
import { ExportButton } from "@/components/admin/export-button";
import { PeopleManagement, type AdminPerson } from "@/components/admin/people-management";
import { QuarterWindowForm, type QuarterWindowRecord } from "@/components/admin/quarter-window-form";
import {
  PushSharedGoalForm,
  type PushSharedGoalEmployee,
} from "@/components/admin/push-shared-goal-form";
import {
  OrgHierarchyForm,
  type OrgEmployee,
  type OrgManager,
} from "@/components/admin/org-hierarchy-form";
import { UnlockTool, type EmployeeWithLockedGoals } from "@/components/admin/unlock-tool";

const AnalyticsDashboard = dynamic(
  () =>
    import("@/components/admin/analytics-dashboard").then((mod) => ({
      default: mod.AnalyticsDashboard,
    })),
  {
    loading: () => <DashboardLoading label="Loading analytics…" />,
  }
);
import type {
  EmployeeCompletionRow,
  ManagerCompletionRow,
} from "@/lib/admin/completion-data";
import type {
  CompletionChartRow,
  ManagerReviewChartRow,
} from "@/lib/admin/completion-chart-data";
import type { ScoreBucket } from "@/lib/admin/score-distribution-data";
import type { ManagerEffectivenessResult } from "@/lib/admin/manager-effectiveness-data";
import type { QoqTrendSeries } from "@/lib/admin/qoq-chart-data";
import type { DistributionSlice } from "@/lib/admin/goal-distribution";
import type {
  EscalationEvaluationInput,
  EscalationResult,
} from "@/lib/admin/escalation-data";
import type { AnalyticsSummaryStats } from "@/components/admin/analytics/analytics-summary-strip";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "completion", label: "Completion" },
  { id: "people", label: "People" },
  { id: "escalations", label: "Escalations" },
  { id: "analytics", label: "Analytics" },
  { id: "hierarchy", label: "Org Hierarchy" },
  { id: "windows", label: "Quarter Windows" },
  { id: "export", label: "Export" },
  { id: "shared", label: "Push Shared Goal" },
  { id: "audit", label: "Audit Log" },
  { id: "unlock", label: "Unlock Goals" },
] as const;

type TabId = (typeof TABS)[number]["id"];

type AdminTabsProps = {
  adminId: string;
  windows: QuarterWindowRecord[];
  employeeRows: EmployeeCompletionRow[];
  managerRows: ManagerCompletionRow[];
  auditEntries: AuditLogEntry[];
  unlockEmployees: EmployeeWithLockedGoals[];
  sharedGoalEmployees: PushSharedGoalEmployee[];
  orgEmployees: OrgEmployee[];
  orgManagers: OrgManager[];
  people: AdminPerson[];
  analyticsByThrust: DistributionSlice[];
  analyticsByUom: DistributionSlice[];
  analyticsByStatus: DistributionSlice[];
  analyticsTotalGoals: number;
  completionChartData: CompletionChartRow[];
  managerReviewChartData: ManagerReviewChartRow[];
  scoreDistribution: ScoreBucket[];
  analyticsEmployeeCount: number;
  analyticsManagerCount: number;
  qoqDepartments: string[];
  qoqSeries: QoqTrendSeries;
  managerEffectiveness: ManagerEffectivenessResult;
  escalationData: EscalationResult;
  escalationInput: EscalationEvaluationInput;
  summaryStats: AnalyticsSummaryStats;
};

export function AdminTabs({
  adminId,
  windows,
  employeeRows,
  managerRows,
  auditEntries,
  unlockEmployees,
  sharedGoalEmployees,
  orgEmployees,
  orgManagers,
  people,
  analyticsByThrust,
  analyticsByUom,
  analyticsByStatus,
  analyticsTotalGoals,
  completionChartData,
  managerReviewChartData,
  scoreDistribution,
  analyticsEmployeeCount,
  analyticsManagerCount,
  qoqDepartments,
  qoqSeries,
  managerEffectiveness,
  escalationData,
  escalationInput,
  summaryStats,
}: AdminTabsProps) {
  const [active, setActive] = useState<TabId>("completion");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 border-b pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              active === tab.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === "completion" && (
        <CompletionDashboard employees={employeeRows} managers={managerRows} />
      )}
      {active === "people" && (
        <PeopleManagement people={people} managers={orgManagers} />
      )}
      {active === "escalations" && (
        <EscalationCenter initialData={escalationData} evaluationInput={escalationInput} />
      )}
      {active === "analytics" && (
        <AnalyticsDashboard
          byThrust={analyticsByThrust}
          byUom={analyticsByUom}
          byStatus={analyticsByStatus}
          totalGoals={analyticsTotalGoals}
          completionChartData={completionChartData}
          managerReviewChartData={managerReviewChartData}
          scoreDistribution={scoreDistribution}
          employeeCount={analyticsEmployeeCount}
          managerCount={analyticsManagerCount}
          qoqDepartments={qoqDepartments}
          qoqSeries={qoqSeries}
          managerEffectiveness={managerEffectiveness}
          summaryStats={summaryStats}
        />
      )}
      {active === "hierarchy" && (
        <OrgHierarchyForm employees={orgEmployees} managers={orgManagers} />
      )}
      {active === "windows" && <QuarterWindowForm windows={windows} adminId={adminId} />}
      {active === "export" && <ExportButton />}
      {active === "shared" && (
        <PushSharedGoalForm adminId={adminId} employees={sharedGoalEmployees} />
      )}
      {active === "audit" && <AuditLogViewer entries={auditEntries} />}
      {active === "unlock" && <UnlockTool adminId={adminId} employees={unlockEmployees} />}
    </div>
  );
}
