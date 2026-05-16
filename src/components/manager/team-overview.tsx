import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type TeamMemberStatus = "not_submitted" | "awaiting_review" | "approved" | "rejected";

export type TeamMemberSummary = {
  id: string;
  name: string;
  email: string;
  department: string | null;
  submittedCount: number;
  totalGoals: number;
  status: TeamMemberStatus;
};

type TeamOverviewProps = {
  members: TeamMemberSummary[];
};

const statusLabels: Record<TeamMemberStatus, string> = {
  not_submitted: "Not Submitted",
  awaiting_review: "Awaiting Review",
  approved: "Approved",
  rejected: "Rejected",
};

const statusVariants: Record<TeamMemberStatus, "outline" | "secondary" | "default" | "destructive"> = {
  not_submitted: "outline",
  awaiting_review: "secondary",
  approved: "default",
  rejected: "destructive",
};

export function TeamOverview({ members }: TeamOverviewProps) {
  const awaitingReview = members.filter((member) => member.status === "awaiting_review").length;
  const approved = members.filter((member) => member.status === "approved").length;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Team Members</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{members.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Awaiting Review</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{awaitingReview}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Approved</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{approved}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              No employees are currently assigned to you.
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium">{member.name || member.email}</h3>
                      <Badge variant={statusVariants[member.status]}>
                        {statusLabels[member.status]}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {member.department || "No department"} · {member.submittedCount} submitted / {member.totalGoals} total goals
                    </p>
                  </div>
                  <Button
                    render={<Link href={`/dashboard/manager/review/${member.id}`} />}
                    nativeButton={false}
                    variant={member.status === "not_submitted" ? "outline" : "default"}
                    size="sm"
                  >
                    Review
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
