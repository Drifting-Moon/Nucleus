import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDisplayDate } from "@/lib/format-date";
import { formatGoalTarget } from "@/lib/format-goal-target";
import { QUARTER_LABELS } from "@/lib/quarter-labels";
import { formatScorePercent } from "@/lib/calculate-score";
import type { CheckinQuarter } from "@/lib/get-active-window";

export type CheckinHistoryRow = {
  id: string;
  quarter: string;
  goal_id: string;
  goal_title: string;
  uom: string | null;
  target: number | null;
  target_date: string | null;
  achievement: number | null;
  achievement_date: string | null;
  status: string;
  score: number | null;
  submitted_at: string | null;
};

type CheckinHistoryProps = {
  rows: CheckinHistoryRow[];
};

const quarterOrder: CheckinQuarter[] = ["q1", "q2", "q3", "annual"];

function formatAchievement(row: CheckinHistoryRow) {
  if (row.uom === "timeline") {
    return row.achievement_date ? formatDisplayDate(row.achievement_date) : "—";
  }
  if (row.achievement === null) return "—";
  if (row.uom === "percentage") return `${row.achievement}%`;
  return String(row.achievement);
}

export function CheckinHistory({ rows }: CheckinHistoryProps) {
  const submitted = rows.filter((row) => row.submitted_at);

  if (submitted.length === 0) {
    return null;
  }

  const byQuarter = quarterOrder
    .map((quarter) => ({
      quarter,
      items: submitted
        .filter((row) => row.quarter === quarter)
        .sort((a, b) => a.goal_title.localeCompare(b.goal_title)),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <Card className="print:break-inside-avoid">
      <CardHeader>
        <CardTitle>Past check-ins</CardTitle>
        <CardDescription>Read-only history of submitted quarterly achievements.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {byQuarter.map((group) => (
          <div key={group.quarter}>
            <h3 className="mb-2 text-sm font-semibold">
              {QUARTER_LABELS[group.quarter]}
            </h3>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Goal</th>
                    <th className="px-3 py-2 font-medium">Target</th>
                    <th className="px-3 py-2 font-medium">Achievement</th>
                    <th className="px-3 py-2 font-medium">Score</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {group.items.map((row) => (
                    <tr key={row.id} className="border-b last:border-0">
                      <td className="px-3 py-2 font-medium">{row.goal_title}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {formatGoalTarget(row.uom, row.target, row.target_date)}
                      </td>
                      <td className="px-3 py-2">{formatAchievement(row)}</td>
                      <td className="px-3 py-2">
                        {row.score != null ? formatScorePercent(row.score) : "—"}
                      </td>
                      <td className="px-3 py-2 capitalize">
                        {row.status.replace(/_/g, " ")}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {row.submitted_at ? formatDisplayDate(row.submitted_at) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
