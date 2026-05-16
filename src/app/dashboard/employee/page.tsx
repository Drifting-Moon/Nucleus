import { CheckinGate } from "@/components/checkins/checkin-gate";
import type { CheckinUpdateRecord } from "@/components/checkins/checkin-form";
import type { CheckinGoal } from "@/components/checkins/checkin-row";
import { CheckinHistory, type CheckinHistoryRow } from "@/components/employee/checkin-history";
import { EmployeeTabs } from "@/components/employee/employee-tabs";
import { FeedbackTimeline } from "@/components/employee/feedback-timeline";
import { HistoryEmptyState } from "@/components/employee/history-empty-state";
import { DashboardShell } from "@/components/dashboard-shell";
import { EmployeeQoqMiniChart } from "@/components/employee/employee-qoq-mini-chart";
import { GoalSummaryCards } from "@/components/employee/goal-summary-cards";
import { WorkflowStepper } from "@/components/employee/workflow-stepper";
import { GoalSheet } from "@/components/goals/goal-sheet";
import { QuickGuide } from "@/components/quick-guide";
import { requireRole } from "@/lib/auth";
import { calculateWeightedOverallScore } from "@/lib/calculate-weighted-score";
import { buildEmployeeQoqTrend } from "@/lib/employee-qoq-trend";
import { isQuarterSubmitted } from "@/lib/employee-workflow";
import {
  getEmployeeDefaultTab,
  getEmployeeTabBadges,
} from "@/lib/employee-default-tab";
import { getWorkflowGoals } from "@/lib/goal-metrics";
import {
  getActiveWindow,
  isGoalSettingOpen,
  type CheckinQuarter,
  type QuarterWindow,
} from "@/lib/get-active-window";
import { buildFeedbackTimelineEntries } from "@/lib/build-feedback-timeline";
import { createClient } from "@/lib/supabase-server";
import { AlertTriangle } from "lucide-react";

const employeeSteps = [
  {
    title: "Draft Goals",
    description: "Create up to 8 goals. Ensure your total weightage equals exactly 100%.",
  },
  {
    title: "Submit for Approval",
    description: "Once submitted, goals go to your L1 Manager. If rejected, you must rework them.",
  },
  {
    title: "Quarterly Check-ins",
    description: "Log your actual achievements during active windows to track your progress.",
  },
];

export default async function EmployeeDashboard() {
  const { user } = await requireRole("employee");
  const supabase = await createClient();

  const { data: windows } = await supabase
    .from("quarter_windows")
    .select("quarter_name, start_date, end_date");

  const { data: profile } = await supabase
    .from("users")
    .select("rejection_reason")
    .eq("id", user.id)
    .single();

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
  const activeQuarter = activeWindow?.quarter_name ?? null;
  const goalSettingOpen = isGoalSettingOpen(quarterWindows);
  const allGoalsList = allGoals ?? [];
  const workflowGoals = getWorkflowGoals(allGoalsList);
  const allGoalIds = allGoalsList.map((goal) => goal.id);
  const approvedGoalIds = allGoalsList
    .filter((goal) => goal.status === "approved" || goal.status === "locked")
    .map((goal) => goal.id);

  const scoreGoals = allGoalsList.filter(
    (goal) => goal.status === "approved" || goal.status === "locked"
  );

  const allGoalsLocked =
    allGoalsList.length > 0 &&
    allGoalsList.every((goal) => goal.status === "approved" || goal.status === "locked");

  const { data: allUpdates } = allGoalIds.length
    ? await supabase
        .from("quarterly_updates")
        .select(
          "id, goal_id, quarter, achievement, achievement_date, status, score, submitted_at, manager_feedback"
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
  const qoqTrend = buildEmployeeQoqTrend(scoreGoals, updatesList);

  const quarterSubmitted = {
    q1: isQuarterSubmitted("q1", approvedGoalIds, updatesList, allGoalsList),
    q2: isQuarterSubmitted("q2", approvedGoalIds, updatesList, allGoalsList),
    q3: isQuarterSubmitted("q3", approvedGoalIds, updatesList, allGoalsList),
    annual: isQuarterSubmitted("annual", approvedGoalIds, updatesList, allGoalsList),
  } satisfies Record<CheckinQuarter, boolean>;

  const hasPendingGoals = allGoalsList.some(
    (goal) => goal.status === "draft" || goal.status === "submitted"
  );
  const hasOrphanPendingGoals = hasPendingGoals && approvedGoalIds.length > 0;
  const hasDraftOrRejected = allGoalsList.some(
    (goal) => goal.status === "draft" || goal.status === "rejected"
  );
  const hasSubmittedPending = allGoalsList.some((goal) => goal.status === "submitted");
  const canCheckIn = approvedGoalIds.length > 0 && !hasPendingGoals;

  const feedbackEntries = buildFeedbackTimelineEntries(
    profile?.rejection_reason ?? null,
    updatesList.map((row) => ({
      quarter: row.quarter,
      manager_feedback: row.manager_feedback ?? null,
      submitted_at: row.submitted_at,
    }))
  );

  const defaultTab = getEmployeeDefaultTab({
    goalSettingOpen,
    canCheckIn,
    hasActiveCheckinWindow: Boolean(activeWindow),
    activeQuarter,
    quarterSubmitted,
    allGoalsLocked,
    hasDraftOrRejected,
    hasSubmittedPending,
    feedbackCount: feedbackEntries.length,
  });

  const tabBadges = getEmployeeTabBadges({
    goalSettingOpen,
    allGoalsLocked,
    hasDraftOrRejected,
    canCheckIn,
    hasActiveCheckinWindow: Boolean(activeWindow),
    activeQuarter,
    quarterSubmitted,
    feedbackCount: feedbackEntries.length,
    historyCount: historyRows.length,
  });

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

  const summaryGoals = workflowGoals.length > 0 ? workflowGoals : allGoalsList;

  return (
    <DashboardShell
      role="employee"
      title="Employee Dashboard"
      description="Use the tabs below to manage goals, quarterly check-ins, and your progress."
    >
      {hasOrphanPendingGoals ? (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-700" />
          <div>
            <p className="font-medium text-amber-900 dark:text-amber-200">
              Pending goals outside your locked sheet
            </p>
            <p className="mt-0.5 text-muted-foreground">
              You have draft or submitted goals that are not shown while locked goals are active.
              Contact your administrator to resolve before check-ins.
            </p>
          </div>
        </div>
      ) : null}

      <EmployeeTabs
        defaultTab={defaultTab}
        tabBadges={tabBadges}
        overview={
          <>
            <QuickGuide role="Employee" steps={employeeSteps} defaultOpen={false} />
            <WorkflowStepper goals={workflowGoals} quarterSubmitted={quarterSubmitted} />
            <GoalSummaryCards
              goals={summaryGoals}
              activeQuarter={activeQuarter}
              updates={updatesList}
              overallScore={overallScore}
            />
            {scoreGoals.length > 0 ? <EmployeeQoqMiniChart points={qoqTrend} /> : null}
          </>
        }
        goals={
          <>
            <p className="text-sm text-muted-foreground">
              Draft, submit, or view your goal sheet for this cycle. Total weightage must equal 100%
              before submit.
            </p>
            <GoalSheet userId={user.id} goalSettingOpen={goalSettingOpen} />
          </>
        }
        checkins={
          <>
            <p className="text-sm text-muted-foreground">
              Log achievements for the active quarter when the check-in window is open.
            </p>
            {canCheckIn ? (
              <CheckinGate
                windows={quarterWindows}
                goals={(checkinGoals ?? []) as CheckinGoal[]}
                updates={checkinUpdates}
              />
            ) : (
              <CheckinGate
                windows={quarterWindows}
                goals={[]}
                updates={[]}
                blockedReason={
                  allGoalsList.length === 0
                    ? "Create and submit your goal sheet before quarterly check-ins."
                    : "All goals must be manager-approved before you can check in."
                }
              />
            )}
          </>
        }
        history={
          <>
            <p className="text-sm text-muted-foreground">
              Manager comments and your submitted check-in records.
            </p>
            {feedbackEntries.length === 0 && historyRows.length === 0 ? (
              <HistoryEmptyState />
            ) : (
              <>
                <FeedbackTimeline entries={feedbackEntries} />
                <CheckinHistory rows={historyRows} />
              </>
            )}
          </>
        }
      />
    </DashboardShell>
  );
}
