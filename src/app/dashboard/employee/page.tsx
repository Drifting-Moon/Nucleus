import { DashboardShell } from "@/components/dashboard-shell";
import { requireRole } from "@/lib/auth";

export default async function EmployeeDashboard() {
  await requireRole("employee");

  return (
    <DashboardShell
      title="Employee Dashboard"
      description="Coming Soon — Goal Sheet will appear here in Stage 2."
    />
  );
}
