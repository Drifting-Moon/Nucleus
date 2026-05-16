import { DashboardShell } from "@/components/dashboard-shell";
import { TeamMemberSummary, TeamOverview } from "@/components/manager/team-overview";
import { QuickGuide } from "@/components/quick-guide";
import { requireRole } from "@/lib/auth";
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
        .select("user_id, status")
        .in("user_id", teamIds)
    : { data: [] };

  const members: TeamMemberSummary[] = (team ?? []).map((member) => {
    const memberGoals = (goals ?? []).filter((goal) => goal.user_id === member.id);
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
    };
  });

  return (
    <DashboardShell
      title="Team Dashboard"
      description="Review submitted goal sheets from your direct reports."
    >
      <QuickGuide role="Manager" steps={managerSteps} />
      <TeamOverview members={members} />
    </DashboardShell>
  );
}
