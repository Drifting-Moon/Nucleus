import { DashboardShell } from "@/components/dashboard-shell";
import { QuickGuide } from "@/components/quick-guide";
import { requireRole } from "@/lib/auth";

const adminSteps = [
  { title: "Cycle Management", description: "Open and close quarterly check-in windows (e.g., Q1, Q2, Annual)." },
  { title: "Monitor Completion", description: "Track which employees and managers are lagging behind in real-time." },
  { title: "Governance & Audit", description: "Override locked goals if necessary and export organizational achievement reports." },
];

export default async function AdminDashboard() {
  await requireRole("admin");

  return (
    <DashboardShell
      title="Admin Dashboard"
      description="Coming Soon — Quarter settings and governance will appear here in Stage 3."
    >
      <QuickGuide role="Admin" steps={adminSteps} />
    </DashboardShell>
  );
}
