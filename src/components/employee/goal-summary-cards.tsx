import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CheckinQuarter } from "@/lib/get-active-window";
import {
  areAllGoalsApproved,
  getActiveSheetGoals,
  getLockedGoals,
  getSheetWeightageSummary,
} from "@/lib/goal-metrics";
import { isQuarterSubmitted } from "@/lib/employee-workflow";
import { QUARTER_LABELS } from "@/lib/quarter-labels";
import { cn } from "@/lib/utils";

type GoalSummaryCardsProps = {
  goals: { id: string; status: string; weightage: number | null }[];
  activeQuarter: CheckinQuarter | null;
  updates: { goal_id: string; quarter: string; submitted_at: string | null }[];
};

export function GoalSummaryCards({ goals, activeQuarter, updates }: GoalSummaryCardsProps) {
  const weightageSummary = getSheetWeightageSummary(goals);
  const locked = getLockedGoals(goals);
  const active = getActiveSheetGoals(goals);
  const lockedCount = locked.length;
  const approvedCount = lockedCount;
  const allApproved = areAllGoalsApproved(goals);
  const goalsInSheet =
    locked.length > 0 ? locked.length : active.length > 0 ? active.length : goals.length;

  const approvedGoalIds = goals
    .filter((goal) => goal.status === "approved" || goal.status === "locked")
    .map((goal) => goal.id);

  let quarterStatus = "No active window";

  if (!allApproved && goals.length > 0) {
    quarterStatus = "Awaiting full goal approval";
  } else if (activeQuarter && allApproved) {
    const submitted = isQuarterSubmitted(activeQuarter, approvedGoalIds, updates);
    quarterStatus = submitted
      ? `${QUARTER_LABELS[activeQuarter]} submitted`
      : `${QUARTER_LABELS[activeQuarter]} open`;
  } else if (approvedGoalIds.length === 0) {
    quarterStatus = "Awaiting approved goals";
  }

  const items = [
    { label: "Goals in sheet", value: String(goalsInSheet) },
    {
      label: weightageSummary.label,
      value: `${weightageSummary.total}%`,
      warn: goalsInSheet > 0 && !weightageSummary.isValid,
    },
    { label: "Approved / locked", value: String(approvedCount) },
    { label: "Quarter status", value: quarterStatus },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} size="sm">
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">
              {item.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={cn(
                "text-xl font-semibold",
                item.warn && "text-amber-700"
              )}
            >
              {item.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
