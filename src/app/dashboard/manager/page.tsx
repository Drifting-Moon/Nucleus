import { DashboardShell } from "@/components/dashboard-shell";
import { QuickGuide } from "@/components/quick-guide";
import { requireRole } from "@/lib/auth";

const managerSteps = [
  { title: "Review Submissions", description: "View goal sheets submitted by your direct reports." },
  { title: "Approve or Reject", description: "Approve to permanently lock goals, or reject them back for mandatory rework." },
  { title: "Quarterly Feedback", description: "Review Planned vs. Actual progress and add structured check-in comments." },
];

export default async function ManagerDashboard() {
  await requireRole("manager");

  return (
    <DashboardShell
      title="Manager Dashboard"
      description="Coming Soon — Team review will appear here in Stage 3."
    >
      <QuickGuide role="Manager" steps={managerSteps} />
    </DashboardShell>
  );
}
