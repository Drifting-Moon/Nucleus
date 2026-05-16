import { DashboardShell } from "@/components/dashboard-shell";
import { GoalSheet } from "@/components/goals/goal-sheet";
import { requireRole } from "@/lib/auth";

export default async function EmployeeDashboard() {
  const { user } = await requireRole("employee");

  return (
    <DashboardShell
      title="Employee Dashboard"
      description="Create and balance your draft goals before sending them to your manager."
    >
      <GoalSheet userId={user.id} />
    </DashboardShell>
  );
}
