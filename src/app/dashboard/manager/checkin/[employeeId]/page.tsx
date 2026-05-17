import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import {
  EmployeeCheckinReview,
  type ManagerCheckinUpdate,
} from "@/components/manager/employee-checkin-review";
import type { CheckinGoal } from "@/components/checkins/checkin-row";
import { requireRole } from "@/lib/auth";
import { getActiveWindow, type QuarterWindow } from "@/lib/get-active-window";
import { createClient } from "@/lib/supabase-server";
import { EmployeeQoqMiniChart } from "@/components/employee/employee-qoq-mini-chart";
import { buildEmployeeQoqTrend } from "@/lib/employee-qoq-trend";

export default async function ManagerEmployeeCheckinPage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const { employeeId } = await params;
  const { user } = await requireRole("manager");
  const supabase = await createClient();

  const { data: windows } = await supabase
    .from("quarter_windows")
    .select("quarter_name, start_date, end_date");

  const activeWindow = getActiveWindow((windows ?? []) as QuarterWindow[]);

  if (!activeWindow) {
    redirect("/dashboard/manager");
  }

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
    .select("id, title, uom, target, target_date, status, weightage")
    .eq("user_id", employeeId)
    .in("status", ["approved", "locked"])
    .order("created_at", { ascending: true });

  const goalIds = (goals ?? []).map((goal) => goal.id);

  const { data: updates } = goalIds.length
    ? await supabase
        .from("quarterly_updates")
        .select(
          "id, goal_id, achievement, achievement_date, status, score, submitted_at, manager_feedback"
        )
        .in("goal_id", goalIds)
        .eq("quarter", activeWindow.quarter_name)
    : { data: [] };

  const { data: allUpdates } = goalIds.length
    ? await supabase
        .from("quarterly_updates")
        .select("goal_id, quarter, score, submitted_at")
        .in("goal_id", goalIds)
    : { data: [] };

  const qoqTrend = buildEmployeeQoqTrend(goals ?? [], allUpdates ?? []);

  return (
    <DashboardShell
      title="Check-in Review"
      description="Review submitted achievements and add manager feedback."
      backHref="/dashboard/manager"
      backLabel="Back to team"
    >
      <div className="space-y-6">
        {qoqTrend.some((pt) => pt.score !== null) ? (
          <div className="max-w-3xl">
            <EmployeeQoqMiniChart points={qoqTrend} />
          </div>
        ) : null}
        <EmployeeCheckinReview
          employee={employee}
          quarter={activeWindow.quarter_name}
          goals={(goals ?? []) as CheckinGoal[]}
          updates={(updates ?? []) as ManagerCheckinUpdate[]}
        />
      </div>
    </DashboardShell>
  );
}
