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
  overallScore?: number | null;
};

export function GoalSummaryCards({
  goals,
  activeQuarter,
  updates,
  overallScore = null,
}: GoalSummaryCardsProps) {
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
    { label: "Goals in sheet", value: String(goalsInSheet), highlight: false, warn: false },
    {
      label: weightageSummary.label,
      value: `${weightageSummary.total}%`,
      highlight: false,
      warn: goalsInSheet > 0 && !weightageSummary.isValid,
    },
    { label: "Approved / locked", value: String(approvedCount), highlight: false, warn: false },
    {
      label: "Quarter status",
      value: quarterStatus,
      highlight: overallScore == null,
      warn: false,
    },
  ];

  if (overallScore != null) {
    items.push({
      label: "Overall score",
      value: `${overallScore}%`,
      highlight: true,
      warn: false,
    });
  }

  return (
    <div
      className={cn(
        "grid gap-3 sm:grid-cols-2 print:grid-cols-2",
        overallScore != null ? "lg:grid-cols-5" : "lg:grid-cols-4"
      )}
    >
      {items.map((item) => (
        <Card
          key={item.label}
          size="sm"
          className={cn(
            item.highlight &&
              "border-primary/40 bg-primary/5 shadow-sm ring-1 ring-primary/20"
          )}
        >
          <CardHeader>
            <CardTitle
              className={cn(
                "text-sm font-normal",
                item.highlight ? "text-primary" : "text-muted-foreground"
              )}
            >
              {item.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={cn(
                "text-xl font-semibold",
                item.warn && "text-amber-700 dark:text-amber-400",
                item.highlight && "text-primary"
              )}
            >
              {item.value}
            </p>
            {item.label === "Overall score" ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Weighted by goal weightage across submitted check-ins
              </p>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
