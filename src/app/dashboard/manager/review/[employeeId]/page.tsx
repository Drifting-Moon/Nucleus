import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { EmployeeGoalReview, ReviewGoal } from "@/components/manager/employee-goal-review";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";

export default async function ManagerEmployeeReviewPage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const { employeeId } = await params;
  const { user } = await requireRole("manager");
  const supabase = await createClient();

  const { data: employee } = await supabase
    .from("users")
    .select("id, name, email, department")
    .eq("id", employeeId)
    .eq("manager_id", user.id)
    .single();

  if (!employee) {
    redirect("/dashboard/manager");
  }

  const { data: goals } = await supabase
    .from("goals")
    .select("id, thrust_area, title, description, weightage, uom, target, target_date, is_shared, status")
    .eq("user_id", employeeId)
    .order("created_at", { ascending: true });

  const allGoals = (goals ?? []) as ReviewGoal[];
  const submittedGoals = allGoals.filter((goal) => goal.status === "submitted");
  const otherGoalsCount = allGoals.length - submittedGoals.length;

  return (
    <DashboardShell
      title="Employee Goal Review"
      description="Review submitted goals before approving or returning them for rework."
      backHref="/dashboard/manager"
      backLabel="Back to team"
    >
      <EmployeeGoalReview
        employee={employee}
        goals={submittedGoals}
        otherGoalsCount={otherGoalsCount}
      />
    </DashboardShell>
  );
}
