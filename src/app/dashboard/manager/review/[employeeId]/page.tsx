import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { EmployeeGoalReview, ReviewGoal } from "@/components/manager/employee-goal-review";
import { AnytimeFeedbackForm } from "@/components/manager/anytime-feedback-form";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";
import { EmployeeQoqMiniChart } from "@/components/employee/employee-qoq-mini-chart";
import { buildEmployeeQoqTrend } from "@/lib/employee-qoq-trend";

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

  const approvedGoals = allGoals
    .filter((goal) => goal.status === "approved" || goal.status === "locked")
    .map((goal) => ({
      id: goal.id,
      title: goal.title,
    }));

  const approvedGoalIds = approvedGoals.map((g) => g.id);

  const { data: updates } = approvedGoalIds.length
    ? await supabase
        .from("quarterly_updates")
        .select("goal_id, quarter, score, submitted_at, manager_feedback")
        .in("goal_id", approvedGoalIds)
    : { data: [] };

  const scoreGoals = allGoals.map((g) => ({
    id: g.id,
    status: g.status ?? "draft",
    weightage: Number(g.weightage) || 0,
  }));

  const qoqTrend = buildEmployeeQoqTrend(scoreGoals, updates ?? []);

  return (
    <DashboardShell
      title="Employee Goal Review"
      description="Review submitted goals before approving or returning them for rework."
      backHref="/dashboard/manager"
      backLabel="Back to team"
    >
      <div className="space-y-6">
        {qoqTrend.some((pt) => pt.score !== null) ? (
          <div className="max-w-3xl">
            <EmployeeQoqMiniChart points={qoqTrend} />
          </div>
        ) : null}
        <EmployeeGoalReview
          employee={employee}
          goals={submittedGoals}
          otherGoalsCount={otherGoalsCount}
        />
        <AnytimeFeedbackForm
          employeeId={employee.id}
          managerId={user.id}
          goals={approvedGoals}
        />
      </div>
    </DashboardShell>
  );
}
