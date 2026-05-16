"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CheckinQuarter } from "@/lib/get-active-window";
import { QUARTER_LABELS } from "@/lib/quarter-labels";

export type TeamCheckinMember = {
  id: string;
  name: string;
  email: string;
  department: string | null;
  approvedGoalCount: number;
  status: "no_goals" | "pending" | "submitted" | "feedback_given";
};

type TeamCheckinOverviewProps = {
  quarter: CheckinQuarter;
  members: TeamCheckinMember[];
};

const statusLabels = {
  no_goals: "No approved goals",
  pending: "Pending check-in",
  submitted: "Submitted — add feedback",
  feedback_given: "Feedback saved",
} as const;

const statusVariants = {
  no_goals: "outline",
  pending: "outline",
  submitted: "secondary",
  feedback_given: "default",
} as const;

export function TeamCheckinOverview({ quarter, members }: TeamCheckinOverviewProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (member) =>
        member.name.toLowerCase().includes(q) || member.email.toLowerCase().includes(q)
    );
  }, [members, search]);

  const submittedCount = filtered.filter(
    (m) => m.status === "submitted" || m.status === "feedback_given"
  ).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quarterly Check-ins — {QUARTER_LABELS[quarter]}</CardTitle>
        <CardDescription>
          Review submitted achievements and add check-in comments for your team.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Search team member…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          {submittedCount} of {filtered.length} shown submitted
        </p>

        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">No employees assigned to you.</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No matches for your search.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((member) => (
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
                    {member.department || "No department"} · {member.approvedGoalCount} approved goal
                    {member.approvedGoalCount === 1 ? "" : "s"}
                  </p>
                </div>
                <Button
                  render={<Link href={`/dashboard/manager/checkin/${member.id}`} />}
                  nativeButton={false}
                  size="sm"
                  variant={member.status === "submitted" ? "default" : "outline"}
                  disabled={member.status === "no_goals" || member.status === "pending"}
                >
                  Review check-in
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
