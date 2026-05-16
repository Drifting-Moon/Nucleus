"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { UserAvatar } from "@/components/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  const departments = useMemo(() => {
    const set = new Set<string>();
    for (const member of members) {
      if (member.department) set.add(member.department);
    }
    return Array.from(set).sort();
  }, [members]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members.filter((member) => {
      if (statusFilter !== "all" && member.status !== statusFilter) return false;
      if (departmentFilter !== "all" && member.department !== departmentFilter) return false;
      if (
        q &&
        !member.name.toLowerCase().includes(q) &&
        !member.email.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [members, search, statusFilter, departmentFilter]);

  const awaitingReview = filtered.filter((member) => member.status === "awaiting_review").length;
  const approved = filtered.filter((member) => member.status === "approved").length;
  const nothingToReview = members.length > 0 && awaitingReview === 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Team Members</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{filtered.length}</CardContent>
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
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              placeholder="Search name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="awaiting_review">Awaiting review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="not_submitted">Not submitted</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={(v) => setDepartmentFilter(v ?? "all")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {members.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No employees are currently assigned to you.
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No team members match your filters.
            </div>
          ) : (
            <div className="space-y-3">
              {nothingToReview ? (
                <p className="rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                  Nothing to review right now. Check back when your team submits their goal sheets.
                </p>
              ) : null}
              {filtered.map((member) => (
                <Link
                  key={member.id}
                  href={`/dashboard/manager/review/${member.id}`}
                  className="flex flex-col gap-3 rounded-lg border p-4 transition-colors hover:border-primary/40 hover:bg-muted/30 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <UserAvatar name={member.name || member.email} size="sm" />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium">{member.name || member.email}</h3>
                        <Badge variant={statusVariants[member.status]}>
                          {statusLabels[member.status]}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {member.department || "No department"} · {member.submittedCount} submitted /{" "}
                        {member.totalGoals} total goals
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      member.status === "awaiting_review" ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    Review →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
