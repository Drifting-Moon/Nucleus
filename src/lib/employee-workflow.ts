import type { CheckinQuarter } from "@/lib/get-active-window";

export type WorkflowStepId = "draft" | "submitted" | "approved" | "q1" | "q2" | "q3" | "annual";

export const WORKFLOW_STEPS: { id: WorkflowStepId; label: string }[] = [
  { id: "draft", label: "Draft" },
  { id: "submitted", label: "Submitted" },
  { id: "approved", label: "Approved" },
  { id: "q1", label: "Q1" },
  { id: "q2", label: "Q2" },
  { id: "q3", label: "Q3" },
  { id: "annual", label: "Annual" },
];

const CHECKIN_ORDER: CheckinQuarter[] = ["q1", "q2", "q3", "annual"];

export function isQuarterSubmitted(
  quarter: CheckinQuarter,
  approvedGoalIds: string[],
  updates: { goal_id: string; quarter: string; submitted_at: string | null }[],
  allGoals?: { status: string }[]
) {
  if (approvedGoalIds.length === 0) return false;
  if (allGoals && allGoals.length > 0 && !allGoals.every((g) => g.status === "approved" || g.status === "locked")) {
    return false;
  }

  return approvedGoalIds.every((goalId) =>
    updates.some(
      (update) =>
        update.goal_id === goalId &&
        update.quarter === quarter &&
        Boolean(update.submitted_at)
    )
  );
}

export function getWorkflowCurrentIndex(
  goals: { status: string }[],
  quarterSubmitted: Record<CheckinQuarter, boolean>
) {
  if (goals.length === 0) return 0;

  const statuses = goals.map((goal) => goal.status);
  const allDraft = statuses.every((status) => status === "draft");
  const anyRejected = statuses.some((status) => status === "rejected");
  const anySubmitted = statuses.some((status) => status === "submitted");
  const allApproved = statuses.every(
    (status) => status === "approved" || status === "locked"
  );

  if (allDraft || anyRejected) return 0;
  if (anySubmitted || !allApproved) return 1;

  if (!quarterSubmitted.q1) return 3;
  if (!quarterSubmitted.q2) return 4;
  if (!quarterSubmitted.q3) return 5;
  if (!quarterSubmitted.annual) return 6;

  return 6;
}

export function isWorkflowComplete(
  goals: { status: string }[],
  quarterSubmitted: Record<CheckinQuarter, boolean>
) {
  return (
    goals.length > 0 &&
    goals.every((g) => g.status === "approved" || g.status === "locked") &&
    CHECKIN_ORDER.every((q) => quarterSubmitted[q])
  );
}
