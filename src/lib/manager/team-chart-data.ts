import type { TeamCheckinMember } from "@/components/manager/team-checkin-overview";
import type { TeamMemberSummary } from "@/components/manager/team-overview";
import type { CheckinQuarter } from "@/lib/get-active-window";

export type StatusChartRow = {
  label: string;
  count: number;
  fill: string;
};

export type MemberScoreChartRow = {
  name: string;
  score: number;
  hasScore: boolean;
};

export type CheckinPipelineRow = {
  label: string;
  count: number;
  fill: string;
};

export type HeatmapCell = {
  goalId: string;
  goalTitle: string;
  scorePercent: number | null;
  submitted: boolean;
};

export type HeatmapRow = {
  employeeId: string;
  employeeName: string;
  cells: HeatmapCell[];
};

const GOAL_STATUS_CHART: {
  status: TeamMemberSummary["status"];
  label: string;
  fill: string;
}[] = [
  { status: "awaiting_review", label: "Awaiting review", fill: "var(--analytics-amber)" },
  { status: "approved", label: "Approved", fill: "var(--analytics-green)" },
  { status: "rejected", label: "Rejected", fill: "var(--analytics-red)" },
  { status: "not_submitted", label: "Not submitted", fill: "var(--analytics-grey)" },
];

const CHECKIN_PIPELINE_CHART: {
  status: TeamCheckinMember["status"];
  label: string;
  fill: string;
}[] = [
  { status: "pending", label: "Pending check-in", fill: "var(--analytics-grey)" },
  { status: "submitted", label: "Needs feedback", fill: "var(--analytics-amber)" },
  { status: "feedback_given", label: "Feedback saved", fill: "var(--analytics-green)" },
  { status: "no_goals", label: "No approved goals", fill: "var(--analytics-grey)" },
];

function truncateLabel(value: string, max = 14) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

export function buildTeamGoalStatusChart(members: TeamMemberSummary[]): StatusChartRow[] {
  return GOAL_STATUS_CHART.map((row) => ({
    label: row.label,
    count: members.filter((member) => member.status === row.status).length,
    fill: row.fill,
  })).filter((row) => row.count > 0);
}

export function buildTeamMemberScoreChart(
  members: TeamMemberSummary[],
  activeQuarter: CheckinQuarter | null
): MemberScoreChartRow[] {
  if (!activeQuarter) return [];

  return members
    .filter((member) => member.status === "approved" || member.quarterScore != null)
    .map((member) => ({
      name: truncateLabel(member.name || member.email),
      score: member.quarterScore ?? 0,
      hasScore: member.quarterScore != null,
    }))
    .sort((a, b) => b.score - a.score);
}

export function buildCheckinPipelineChart(members: TeamCheckinMember[]): CheckinPipelineRow[] {
  return CHECKIN_PIPELINE_CHART.map((row) => ({
    label: row.label,
    count: members.filter((member) => member.status === row.status).length,
    fill: row.fill,
  })).filter((row) => row.count > 0);
}

export function buildCheckinHeatmap(
  team: { id: string; name: string | null; email: string | null }[],
  goals: { id: string; user_id: string; title: string | null; created_at: string | null }[],
  updates: { goal_id: string; score: number | null; submitted_at: string | null }[]
): { rows: HeatmapRow[]; maxColumns: number } {
  const rows: HeatmapRow[] = team
    .map((employee) => {
      const empGoals = goals
        .filter((goal) => goal.user_id === employee.id)
        .sort((a, b) => (a.created_at ?? "").localeCompare(b.created_at ?? ""));

      const cells: HeatmapCell[] = empGoals.map((goal) => {
        const update = updates.find((row) => row.goal_id === goal.id);
        return {
          goalId: goal.id,
          goalTitle: goal.title?.trim() || "Goal",
          scorePercent:
            update?.score != null ? Math.min(Math.round(update.score * 100), 150) : null,
          submitted: Boolean(update?.submitted_at),
        };
      });

      return {
        employeeId: employee.id,
        employeeName: employee.name || employee.email || "Unknown",
        cells,
      };
    })
    .filter((row) => row.cells.length > 0);

  const maxColumns = rows.reduce((max, row) => Math.max(max, row.cells.length), 0);

  return { rows, maxColumns };
}

export function heatmapCellColor(cell: HeatmapCell): string {
  if (!cell.submitted || cell.scorePercent == null) {
    return "color-mix(in oklch, var(--analytics-grey) 35%, transparent)";
  }
  if (cell.scorePercent >= 100) {
    return "color-mix(in oklch, var(--analytics-green) 55%, transparent)";
  }
  if (cell.scorePercent >= 50) {
    return "color-mix(in oklch, var(--analytics-amber) 50%, transparent)";
  }
  return "color-mix(in oklch, var(--analytics-red) 45%, transparent)";
}
