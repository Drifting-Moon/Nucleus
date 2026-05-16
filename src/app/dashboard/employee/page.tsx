import { CheckinGate } from "@/components/checkins/checkin-gate";
import type { CheckinUpdateRecord } from "@/components/checkins/checkin-form";
import type { CheckinGoal } from "@/components/checkins/checkin-row";
import { DashboardShell } from "@/components/dashboard-shell";
import { GoalSummaryCards } from "@/components/employee/goal-summary-cards";
import { WorkflowStepper } from "@/components/employee/workflow-stepper";
import { GoalSheet } from "@/components/goals/goal-sheet";
import { QuickGuide } from "@/components/quick-guide";
import { Separator } from "@/components/ui/separator";
import { requireRole } from "@/lib/auth";
import { isQuarterSubmitted } from "@/lib/employee-workflow";
import { areAllGoalsApproved, getWorkflowGoals } from "@/lib/goal-metrics";
import {
  getActiveWindow,
  isGoalSettingOpen,
  type CheckinQuarter,
  type QuarterWindow,
} from "@/lib/get-active-window";
import { createClient } from "@/lib/supabase-server";

const employeeSteps = [
  { title: "Draft Goals", description: "Create up to 8 goals. Ensure your total weightage equals exactly 100%." },
  { title: "Submit for Approval", description: "Once submitted, goals go to your L1 Manager. If rejected, you must rework them." },
  { title: "Quarterly Check-ins", description: "Log your actual achievements during active windows to track your progress." },
];

export default async function EmployeeDashboard() {
  const { user } = await requireRole("employee");
  const supabase = await createClient();

  const { data: windows } = await supabase
    .from("quarter_windows")
    .select("quarter_name, start_date, end_date");

  const { data: allGoals } = await supabase
    .from("goals")
    .select("id, status, weightage")
    .eq("user_id", user.id);

  const { data: checkinGoals } = await supabase
    .from("goals")
    .select("id, title, uom, target, target_date, score_direction")
    .eq("user_id", user.id)
    .in("status", ["approved", "locked"])
    .order("created_at", { ascending: true });

  const quarterWindows = (windows ?? []) as QuarterWindow[];
  const activeWindow = getActiveWindow(quarterWindows);
  const goalSettingOpen = isGoalSettingOpen(quarterWindows);
  const allGoalsList = allGoals ?? [];
  const workflowGoals = getWorkflowGoals(allGoalsList);
  const allGoalIds = allGoalsList.map((goal) => goal.id);
  const approvedGoalIds = (allGoals ?? [])
    .filter((goal) => goal.status === "approved" || goal.status === "locked")
    .map((goal) => goal.id);

  const { data: allUpdates } = allGoalIds.length
    ? await supabase
        .from("quarterly_updates")
        .select("goal_id, quarter, submitted_at")
        .in("goal_id", allGoalIds)
    : { data: [] };

  const quarterSubmitted = {
    q1: isQuarterSubmitted("q1", approvedGoalIds, allUpdates ?? [], allGoalsList),
    q2: isQuarterSubmitted("q2", approvedGoalIds, allUpdates ?? [], allGoalsList),
    q3: isQuarterSubmitted("q3", approvedGoalIds, allUpdates ?? [], allGoalsList),
    annual: isQuarterSubmitted("annual", approvedGoalIds, allUpdates ?? [], allGoalsList),
  } satisfies Record<CheckinQuarter, boolean>;

  const canCheckIn = areAllGoalsApproved(allGoalsList);

  let checkinUpdates: CheckinUpdateRecord[] = [];

  if (activeWindow && approvedGoalIds.length > 0) {
    const { data: existingUpdates } = await supabase
      .from("quarterly_updates")
      .select("id, goal_id, quarter, achievement, achievement_date, status, score, submitted_at")
      .in("goal_id", approvedGoalIds)
      .eq("quarter", activeWindow.quarter_name);

    checkinUpdates = (existingUpdates ?? []) as CheckinUpdateRecord[];
  }

  return (
    <DashboardShell
      title="Employee Dashboard"
      description="Create and balance your draft goals before sending them to your manager."
    >
      <QuickGuide role="Employee" steps={employeeSteps} />
      <div className="space-y-4">
        <WorkflowStepper goals={workflowGoals} quarterSubmitted={quarterSubmitted} />
        <GoalSummaryCards
          goals={workflowGoals.length > 0 ? workflowGoals : allGoalsList}
          activeQuarter={activeWindow?.quarter_name ?? null}
          updates={allUpdates ?? []}
        />
      </div>
      <GoalSheet userId={user.id} goalSettingOpen={goalSettingOpen} />
      <Separator className="my-8" />
      {canCheckIn ? (
        <CheckinGate
          windows={(windows ?? []) as QuarterWindow[]}
          goals={(checkinGoals ?? []) as CheckinGoal[]}
          updates={checkinUpdates}
        />
      ) : (
        <CheckinGate
          windows={(windows ?? []) as QuarterWindow[]}
          goals={[]}
          updates={[]}
          blockedReason={
            allGoalsList.length === 0
              ? "Create and submit your goal sheet before quarterly check-ins."
              : "All goals must be manager-approved before you can check in."
          }
        />
      )}
    </DashboardShell>
  );
}
