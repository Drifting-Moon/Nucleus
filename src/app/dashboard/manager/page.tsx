import { DashboardShell } from "@/components/dashboard-shell";
import { ManagerTabs } from "@/components/manager/manager-tabs";
import type { TeamCheckinMember } from "@/components/manager/team-checkin-overview";
import type { TeamMemberSummary } from "@/components/manager/team-overview";
import { QuickGuide } from "@/components/quick-guide";
import { requireRole } from "@/lib/auth";
import { calculateWeightedOverallScore } from "@/lib/calculate-weighted-score";
import { getActiveWindow, type QuarterWindow } from "@/lib/get-active-window";
import { buildTeamCheckinMembers } from "@/lib/team-checkin-status";
import { createClient } from "@/lib/supabase-server";

const managerSteps = [
  { title: "Review Submissions", description: "View goal sheets submitted by your direct reports." },
  { title: "Approve or Reject", description: "Approve to permanently lock goals, or reject them back for mandatory rework." },
  { title: "Quarterly Feedback", description: "Review Planned vs. Actual progress and add structured check-in comments." },
];

export default async function ManagerDashboard() {
  const { user } = await requireRole("manager");
  const supabase = await createClient();

  const { data: team } = await supabase
    .from("users")
    .select("id, name, email, department")
    .eq("manager_id", user.id)
    .order("name", { ascending: true });

  const teamIds = team?.map((member) => member.id) ?? [];

  const { data: goals } = teamIds.length
    ? await supabase
        .from("goals")
        .select("id, user_id, status, weightage")
        .in("user_id", teamIds)
    : { data: [] };

  const teamGoalIds = (goals ?? [])
    .filter((goal) => goal.status === "approved" || goal.status === "locked")
    .map((goal) => goal.id);

  const { data: windows } = await supabase
    .from("quarter_windows")
    .select("quarter_name, start_date, end_date");

  const activeWindow = getActiveWindow((windows ?? []) as QuarterWindow[]);
  const activeQuarter = activeWindow?.quarter_name ?? null;

  const { data: teamUpdates } = teamGoalIds.length
    ? await supabase
        .from("quarterly_updates")
        .select("goal_id, quarter, score, submitted_at")
        .in("goal_id", teamGoalIds)
    : { data: [] };

  const updatesList = teamUpdates ?? [];
  const lockedGoals = (goals ?? []).filter(
    (goal) => goal.status === "approved" || goal.status === "locked"
  );

  const teamAvgScore = calculateWeightedOverallScore(lockedGoals, updatesList);

  const members: TeamMemberSummary[] = (team ?? []).map((member) => {
    const memberGoals = (goals ?? []).filter((goal) => goal.user_id === member.id);
    const memberLocked = memberGoals.filter(
      (goal) => goal.status === "approved" || goal.status === "locked"
    );
    const memberUpdates =
      activeQuarter != null
        ? updatesList.filter(
            (row) =>
              row.quarter === activeQuarter &&
              memberLocked.some((goal) => goal.id === row.goal_id)
          )
        : [];
    const quarterScore =
      memberLocked.length > 0
        ? calculateWeightedOverallScore(memberLocked, memberUpdates)
        : null;
    const submittedCount = memberGoals.filter((goal) => goal.status === "submitted").length;
    const hasRejectedGoals = memberGoals.some((goal) => goal.status === "rejected");
    const hasSubmittedGoals = submittedCount > 0;
    const isApproved =
      memberGoals.length > 0 &&
      memberGoals.every((goal) => goal.status === "approved" || goal.status === "locked");

    return {
      id: member.id,
      name: member.name ?? "",
      email: member.email ?? "",
      department: member.department,
      submittedCount,
      totalGoals: memberGoals.length,
      status: hasSubmittedGoals
        ? "awaiting_review"
        : isApproved
          ? "approved"
          : hasRejectedGoals
            ? "rejected"
            : "not_submitted",
      quarterScore,
    };
  });

  let checkinMembers: TeamCheckinMember[] | null = null;

  if (activeWindow && teamIds.length > 0) {
    const { data: approvedGoals } = await supabase
      .from("goals")
      .select("id, user_id")
      .in("user_id", teamIds)
      .in("status", ["approved", "locked"]);

    const approvedGoalIds = (approvedGoals ?? []).map((goal) => goal.id);

    const { data: checkinUpdates } = approvedGoalIds.length
      ? await supabase
          .from("quarterly_updates")
          .select("goal_id, submitted_at, manager_feedback")
          .in("goal_id", approvedGoalIds)
          .eq("quarter", activeWindow.quarter_name)
      : { data: [] };

    checkinMembers = buildTeamCheckinMembers(team ?? [], approvedGoals ?? [], checkinUpdates ?? []);
  }

  return (
    <DashboardShell
      title="Team Dashboard"
      description="Review submitted goal sheets and quarterly check-ins from your direct reports."
    >
      <QuickGuide role="Manager" steps={managerSteps} />
      <ManagerTabs
        members={members}
        activeQuarter={activeQuarter}
        checkinMembers={checkinMembers}
        teamAvgScore={teamAvgScore}
      />
    </DashboardShell>
  );
}
