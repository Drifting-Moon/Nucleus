import { CheckinGate } from "@/components/checkins/checkin-gate";
import type { CheckinUpdateRecord } from "@/components/checkins/checkin-form";
import type { CheckinGoal } from "@/components/checkins/checkin-row";
import { CheckinHistory, type CheckinHistoryRow } from "@/components/employee/checkin-history";
import { DashboardShell } from "@/components/dashboard-shell";
import { GoalSummaryCards } from "@/components/employee/goal-summary-cards";
import { WorkflowStepper } from "@/components/employee/workflow-stepper";
import { GoalSheet } from "@/components/goals/goal-sheet";
import { QuickGuide } from "@/components/quick-guide";
import { Separator } from "@/components/ui/separator";
import { requireRole } from "@/lib/auth";
import { calculateWeightedOverallScore } from "@/lib/calculate-weighted-score";
import { isQuarterSubmitted } from "@/lib/employee-workflow";
import { getWorkflowGoals } from "@/lib/goal-metrics";
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
    .select("id, status, weightage, title, uom, target, target_date")
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

  const scoreGoals = allGoalsList.filter(
    (goal) => goal.status === "approved" || goal.status === "locked"
  );

  const { data: allUpdates } = allGoalIds.length
    ? await supabase
        .from("quarterly_updates")
        .select(
          "id, goal_id, quarter, achievement, achievement_date, status, score, submitted_at"
        )
        .in("goal_id", allGoalIds)
    : { data: [] };

  const updatesList = allUpdates ?? [];
  const goalById = new Map(allGoalsList.map((goal) => [goal.id, goal]));

  const historyRows: CheckinHistoryRow[] = updatesList
    .filter((row) => row.submitted_at)
    .map((row) => {
      const goal = goalById.get(row.goal_id);
      return {
        id: row.id,
        quarter: row.quarter,
        goal_id: row.goal_id,
        goal_title: goal?.title ?? "Goal",
        uom: goal?.uom ?? null,
        target: goal?.target ?? null,
        target_date: goal?.target_date ?? null,
        achievement: row.achievement,
        achievement_date: row.achievement_date,
        status: row.status,
        score: row.score,
        submitted_at: row.submitted_at,
      };
    });

  const overallScore = calculateWeightedOverallScore(scoreGoals, updatesList);

  const quarterSubmitted = {
    q1: isQuarterSubmitted("q1", approvedGoalIds, updatesList, allGoalsList),
    q2: isQuarterSubmitted("q2", approvedGoalIds, updatesList, allGoalsList),
    q3: isQuarterSubmitted("q3", approvedGoalIds, updatesList, allGoalsList),
    annual: isQuarterSubmitted("annual", approvedGoalIds, updatesList, allGoalsList),
  } satisfies Record<CheckinQuarter, boolean>;

  const hasPendingGoals = allGoalsList.some(
    (goal) => goal.status === "draft" || goal.status === "submitted"
  );
  const canCheckIn = approvedGoalIds.length > 0 && !hasPendingGoals;

  let checkinUpdates: CheckinUpdateRecord[] = [];

  if (activeWindow && approvedGoalIds.length > 0) {
    checkinUpdates = updatesList
      .filter((row) => row.quarter === activeWindow.quarter_name)
      .map((row) => ({
        id: row.id,
        goal_id: row.goal_id,
        quarter: row.quarter,
        achievement: row.achievement,
        achievement_date: row.achievement_date,
        status: row.status,
        score: row.score,
        submitted_at: row.submitted_at,
      })) as CheckinUpdateRecord[];
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
          updates={updatesList}
          overallScore={overallScore}
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
      <CheckinHistory rows={historyRows} />
    </DashboardShell>
  );
}
