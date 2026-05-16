import { DashboardShell } from "@/components/dashboard-shell";
import { requireRole } from "@/lib/auth";

export default async function AdminDashboard() {
  await requireRole("admin");

  return (
    <DashboardShell
      title="Admin Dashboard"
      description="Coming Soon — Quarter settings and governance will appear here in Stage 3."
    />
  );
}
