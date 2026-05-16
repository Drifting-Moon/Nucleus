import { DashboardShell } from "@/components/dashboard-shell";
import { requireRole } from "@/lib/auth";

export default async function ManagerDashboard() {
  await requireRole("manager");

  return (
    <DashboardShell
      title="Manager Dashboard"
      description="Coming Soon — Team review will appear here in Stage 3."
    />
  );
}
