import type { TeamCheckinMember } from "@/components/manager/team-checkin-overview";

type GoalRow = { id: string; user_id: string };
type UpdateRow = {
  goal_id: string;
  submitted_at: string | null;
  manager_feedback: string | null;
};

export function buildTeamCheckinMembers(
  team: { id: string; name: string | null; email: string | null; department: string | null }[],
  goals: GoalRow[],
  updates: UpdateRow[]
): TeamCheckinMember[] {
  return team.map((member) => {
    const memberGoals = goals.filter((goal) => goal.user_id === member.id);
    const memberGoalIds = memberGoals.map((goal) => goal.id);
    const memberUpdates = updates.filter((update) => memberGoalIds.includes(update.goal_id));

    if (memberGoalIds.length === 0) {
      return {
        id: member.id,
        name: member.name ?? "",
        email: member.email ?? "",
        department: member.department,
        approvedGoalCount: 0,
        status: "no_goals",
      };
    }

    const allSubmitted = memberGoalIds.every((goalId) =>
      memberUpdates.some((update) => update.goal_id === goalId && update.submitted_at)
    );

    const hasFeedback = memberUpdates.some((update) => update.manager_feedback?.trim());

    return {
      id: member.id,
      name: member.name ?? "",
      email: member.email ?? "",
      department: member.department,
      approvedGoalCount: memberGoalIds.length,
      status: !allSubmitted
        ? "pending"
        : hasFeedback
          ? "feedback_given"
          : "submitted",
    };
  });
}
