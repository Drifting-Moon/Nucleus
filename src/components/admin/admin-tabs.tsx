"use client";

import { useState } from "react";
import { AuditLogViewer, type AuditLogEntry } from "@/components/admin/audit-log-viewer";
import { CompletionDashboard } from "@/components/admin/completion-dashboard";
import { ExportButton } from "@/components/admin/export-button";
import { QuarterWindowForm, type QuarterWindowRecord } from "@/components/admin/quarter-window-form";
import {
  PushSharedGoalForm,
  type PushSharedGoalEmployee,
} from "@/components/admin/push-shared-goal-form";
import { UnlockTool, type EmployeeWithLockedGoals } from "@/components/admin/unlock-tool";
import type {
  EmployeeCompletionRow,
  ManagerCompletionRow,
} from "@/lib/admin/completion-data";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "completion", label: "Completion" },
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
};

export function AdminTabs({
  adminId,
  windows,
  employeeRows,
  managerRows,
  auditEntries,
  unlockEmployees,
  sharedGoalEmployees,
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
