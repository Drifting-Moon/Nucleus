import { AdminTabs } from "@/components/admin/admin-tabs";
import type { AuditLogEntry } from "@/components/admin/audit-log-viewer";
import type { EmployeeWithLockedGoals } from "@/components/admin/unlock-tool";
import { DashboardShell } from "@/components/dashboard-shell";
import { QuickGuide } from "@/components/quick-guide";
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
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";

const adminSteps = [
  { title: "Cycle Management", description: "Open and close quarterly check-in windows (e.g., Q1, Q2, Annual)." },
  { title: "Monitor Completion", description: "Track which employees and managers are lagging behind in real-time." },
  { title: "Governance & Audit", description: "Override locked goals if necessary and export organizational achievement reports." },
];

export default async function AdminDashboard() {
  const { user } = await requireRole("admin");
  const supabase = await createClient();

  const [
    { data: windows },
    { data: users },
    { data: goals },
    { data: updates },
    { data: auditLogs },
  ] = await Promise.all([
    supabase
      .from("quarter_windows")
      .select("id, quarter_name, start_date, end_date")
      .order("quarter_name", { ascending: true }),
    supabase.from("users").select("id, name, email, department, role, manager_id"),
    supabase
      .from("goals")
      .select("id, user_id, status, title, uom, target, target_date, weightage, thrust_area"),
    supabase.from("quarterly_updates").select("goal_id, quarter, score, submitted_at"),
    supabase
      .from("audit_logs")
      .select("id, changed_at, changed_by, goal_id, field_changed, old_value, new_value")
      .order("changed_at", { ascending: false })
      .limit(100),
  ]);

  const employees = (users ?? []).filter((u) => u.role === "employee");
  const managers = (users ?? []).filter((u) => u.role === "manager");
  const allGoals = goals ?? [];
  const allUpdates = updates ?? [];

  const distributionGoals = allGoals.map((goal) => ({
    thrust_area: goal.thrust_area,
    uom: goal.uom,
    status: goal.status,
  }));
  const analyticsByThrust = buildThrustDistribution(distributionGoals);
  const analyticsByUom = buildUomDistribution(distributionGoals);
  const analyticsByStatus = buildStatusDistribution(distributionGoals);

  const employeeRows = buildEmployeeCompletionRows(
    employees,
    allGoals,
    allUpdates,
    windows ?? []
  );

  const managerRows = buildManagerCompletionRows(managers, users ?? [], allGoals);
  const completionChartData = toCompletionPercentRows(
    buildCompletionRatesChartData(employeeRows),
    employees.length
  );
  const managerReviewChartData = buildManagerReviewChartData(managerRows);
  const scoreDistribution = buildScoreDistribution(allUpdates);
  const managerEffectiveness = buildManagerEffectiveness(
    managers,
    employees,
    allGoals,
    allUpdates,
    windows ?? []
  );

  const { departments: qoqDepartments, series: qoqSeries } = buildQoqTrendSeries(
    employees.map((employee) => ({
      id: employee.id,
      department: employee.department,
    })),
    allGoals,
    allUpdates
  );

  const userMap = new Map((users ?? []).map((u) => [u.id, u]));
  const goalMap = new Map(allGoals.map((g) => [g.id, g]));

  const auditEntries: AuditLogEntry[] = (auditLogs ?? []).map((log) => {
    const goal = log.goal_id ? goalMap.get(log.goal_id) : null;
    const employee = goal ? userMap.get(goal.user_id) : null;
    const changer = log.changed_by ? userMap.get(log.changed_by) : null;

    return {
      id: log.id,
      changed_at: log.changed_at,
      changed_by_name: changer?.name || changer?.email || "Unknown",
      employee_name: employee?.name || employee?.email || "—",
      goal_title: goal?.title || "—",
      field_changed: log.field_changed,
      old_value: log.old_value,
      new_value: log.new_value,
    };
  });

  const sharedGoalEmployees = employees.map((employee) => {
    const hasLockedGoals = allGoals.some(
      (goal) =>
        goal.user_id === employee.id &&
        (goal.status === "approved" || goal.status === "locked")
    );

    return {
      id: employee.id,
      name: employee.name || employee.email || "Unknown",
      email: employee.email || "",
      department: employee.department,
      hasLockedGoals,
    };
  });

  const unlockEmployees: EmployeeWithLockedGoals[] = employees.map((employee) => {
    const lockedGoals = allGoals.filter(
      (goal) =>
        goal.user_id === employee.id &&
        (goal.status === "approved" || goal.status === "locked")
    );

    return {
      id: employee.id,
      name: employee.name || employee.email || "Unknown",
      email: employee.email || "",
      department: employee.department,
      goals: lockedGoals.map((goal) => ({
        id: goal.id,
        title: goal.title,
        uom: goal.uom,
        target: goal.target,
        target_date: goal.target_date,
        weightage: goal.weightage,
        status: goal.status,
      })),
    };
  });

  return (
    <DashboardShell
      role="admin"
      title="Admin Dashboard"
      description="Governance, completion tracking, exports, and audit controls."
    >
      <QuickGuide role="Admin" steps={adminSteps} />
      <AdminTabs
        adminId={user.id}
        windows={windows ?? []}
        employeeRows={employeeRows}
        managerRows={managerRows}
        auditEntries={auditEntries}
        unlockEmployees={unlockEmployees}
        sharedGoalEmployees={sharedGoalEmployees}
        orgEmployees={employees.map((employee) => ({
          id: employee.id,
          name: employee.name || employee.email || "Unknown",
          email: employee.email || "",
          department: employee.department,
          manager_id: employee.manager_id,
        }))}
        orgManagers={managers.map((manager) => ({
          id: manager.id,
          name: manager.name || manager.email || "Unknown",
          email: manager.email || "",
        }))}
        analyticsByThrust={analyticsByThrust}
        analyticsByUom={analyticsByUom}
        analyticsByStatus={analyticsByStatus}
        analyticsTotalGoals={allGoals.length}
        completionChartData={completionChartData}
        managerReviewChartData={managerReviewChartData}
        scoreDistribution={scoreDistribution}
        analyticsEmployeeCount={employees.length}
        analyticsManagerCount={managers.length}
        qoqDepartments={qoqDepartments}
        qoqSeries={qoqSeries}
        managerEffectiveness={managerEffectiveness}
      />
    </DashboardShell>
  );
}
