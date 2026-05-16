import { DashboardShell } from "@/components/dashboard-shell";
import { GoalSheet } from "@/components/goals/goal-sheet";
import { QuickGuide } from "@/components/quick-guide";
import { requireRole } from "@/lib/auth";

const employeeSteps = [
  { title: "Draft Goals", description: "Create up to 8 goals. Ensure your total weightage equals exactly 100%." },
  { title: "Submit for Approval", description: "Once submitted, goals go to your L1 Manager. If rejected, you must rework them." },
  { title: "Quarterly Check-ins", description: "Log your actual achievements during active windows to track your progress." },
];

export default async function EmployeeDashboard() {
  const { user } = await requireRole("employee");

  return (
    <DashboardShell
      title="Employee Dashboard"
      description="Create and balance your draft goals before sending them to your manager."
    >
      <QuickGuide role="Employee" steps={employeeSteps} />
      <GoalSheet userId={user.id} />
    </DashboardShell>
  );
}
