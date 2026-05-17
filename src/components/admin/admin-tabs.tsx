"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
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
import { ClipboardList, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";

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
  rawGoals: any[];
  rawUpdates: any[];
  rawWindows: any[];
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
  rawGoals,
  rawUpdates,
  rawWindows,
}: AdminTabsProps) {
  const [active, setActive] = useState<TabId>("completion");

  useEffect(() => {
    const handleSwitch = (e: Event) => {
      const customEvent = e as CustomEvent<TabId>;
      if (customEvent.detail && TABS.some((t) => t.id === customEvent.detail)) {
        setActive(customEvent.detail);
      }
    };
    window.addEventListener("switch-tab", handleSwitch);
    return () => window.removeEventListener("switch-tab", handleSwitch);
  }, []);

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

      <div className="border-b pb-3 pt-1">
        <p className="text-sm text-muted-foreground font-light tracking-wide">
          {active === "completion" && "Track employees' goal sheet submission rates and review status."}
          {active === "people" && "Manage the organization's user database and system privileges."}
          {active === "escalations" && "Review goals and ratings that have been flagged for administrative arbitration."}
          {active === "analytics" && "Organisation-wide performance trends and completion rates."}
          {active === "hierarchy" && "Establish manager-employee reporting lines and hierarchy chains."}
          {active === "shared" && "Push global standard KPIs directly onto employee goal sheets."}
          {active === "windows" && "Configure active calendar dates for goal setting and quarterly check-ins."}
          {active === "audit" && "Browse and trace administrative actions with a secure, read-only audit log."}
          {active === "unlock" && "Unlock, edit, and re-lock employee goal sheets with a documented audit trail."}
        </p>
      </div>

      {active === "completion" && (
        <div className="space-y-6">
          {(!windows.length || people.length <= 1) && (
            <Card className="border border-primary/20 bg-primary/5 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Admin Onboarding Checklist</h3>
                  <p className="text-sm text-muted-foreground font-light">
                    Complete these steps to fully configure your performance cycles and prepare for employee submissions.
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Step 1 */}
                <button
                  onClick={() => setActive("windows")}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-4 text-left transition-all hover:bg-background hover:shadow-md",
                    windows.some((w) => w.quarter_name === "goal_setting")
                      ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300"
                      : "bg-background/50 border-muted"
                  )}
                >
                  <div className="mt-0.5">
                    {windows.some((w) => w.quarter_name === "goal_setting") ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <div className="h-4 w-4 rounded border border-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">1. Set Goal-Setting Dates</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-normal">
                      Configure the active planning window dates.
                    </p>
                  </div>
                </button>
                {/* Step 2 */}
                <button
                  onClick={() => setActive("people")}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-4 text-left transition-all hover:bg-background hover:shadow-md",
                    people.length > 1
                      ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300"
                      : "bg-background/50 border-muted"
                  )}
                >
                  <div className="mt-0.5">
                    {people.length > 1 ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <div className="h-4 w-4 rounded border border-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">2. Add Employees & Managers</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-normal">
                      Establish user roster database & managers.
                    </p>
                  </div>
                </button>
                {/* Step 3 */}
                <button
                  onClick={() => setActive("shared")}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-4 text-left transition-all hover:bg-background hover:shadow-md",
                    rawGoals.some((g) => g.is_shared)
                      ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300"
                      : "bg-background/50 border-muted"
                  )}
                >
                  <div className="mt-0.5">
                    {rawGoals.some((g) => g.is_shared) ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <div className="h-4 w-4 rounded border border-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">3. Push Shared KPIs (Optional)</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-normal">
                      Distribute standard organization goals.
                    </p>
                  </div>
                </button>
                {/* Step 4 */}
                <button
                  onClick={() => setActive("windows")}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-4 text-left transition-all hover:bg-background hover:shadow-md",
                    windows.some((w) => w.quarter_name === "q1")
                      ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300"
                      : "bg-background/50 border-muted"
                  )}
                >
                  <div className="mt-0.5">
                    {windows.some((w) => w.quarter_name === "q1") ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <div className="h-4 w-4 rounded border border-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">4. Open Q1 Check-in Dates</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-normal">
                      Initiate ongoing quarterly assessment window.
                    </p>
                  </div>
                </button>
              </div>
            </Card>
          )}
          <CompletionDashboard employees={employeeRows} managers={managerRows} />
        </div>
      )}
      {active === "people" && (
        <PeopleManagement people={people} managers={orgManagers} />
      )}
      {active === "escalations" && (
        <EscalationCenter initialData={escalationData} evaluationInput={escalationInput} />
      )}
      {active === "analytics" && (
        <AnalyticsDashboard
          rawEmployees={people.filter((p) => p.role === "employee")}
          rawManagers={people.filter((p) => p.role === "manager")}
          rawGoals={rawGoals}
          rawUpdates={rawUpdates}
          rawWindows={windows}
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
