"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { WeightageIndicator } from "@/components/goals/weightage-indicator";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";

export type ReviewGoal = {
  id: string;
  thrust_area: string | null;
  title: string | null;
  description: string | null;
  weightage: number | null;
  uom: string | null;
  target: number | null;
  target_date: string | null;
  is_shared: boolean | null;
  status: string | null;
};

type EmployeeGoalReviewProps = {
  employee: {
    id: string;
    name: string | null;
    email: string | null;
    department: string | null;
  };
  goals: ReviewGoal[];
  /** Locked / rejected / draft goals not shown in the review queue */
  otherGoalsCount?: number;
};

function formatTarget(goal: ReviewGoal) {
  if (goal.uom === "timeline") {
    return goal.target_date || "Not set";
  }

  return goal.target ?? "Not set";
}

export function EmployeeGoalReview({
  employee,
  goals,
  otherGoalsCount = 0,
}: EmployeeGoalReviewProps) {
  const [reviewGoals, setReviewGoals] = useState(goals);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const submittedGoals = reviewGoals.filter((goal) => goal.status === "submitted");
  const totalWeightage = submittedGoals.reduce((sum, goal) => sum + (goal.weightage ?? 0), 0);
  const hasSubmittedGoals = submittedGoals.length > 0;
  const canEdit = hasSubmittedGoals;
  const canApprove = hasSubmittedGoals && totalWeightage === 100;

  const updateGoal = (goalId: string, updates: Partial<ReviewGoal>) => {
    setReviewGoals((currentGoals) =>
      currentGoals.map((goal) =>
        goal.id === goalId ? { ...goal, ...updates } : goal
      )
    );
  };

  const validateManagerEdits = () => {
    for (const goal of submittedGoals) {
      if ((goal.weightage ?? 0) < 10) {
        return `"${goal.title || "Untitled goal"}" must be at least 10% weightage`;
      }
    }

    if (hasSubmittedGoals && totalWeightage !== 100) {
      return `Submitted goals total ${totalWeightage}%. Must equal exactly 100% (locked goals are not counted).`;
    }

    return null;
  };

  const saveManagerEdits = async (showSuccessMessage = true) => {
    const validationError = validateManagerEdits();

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSaving(true);

    const supabase = createClient();

    for (const goal of reviewGoals) {
      if (goal.status !== "submitted") {
        continue;
      }

      const { error: updateError } = await supabase
        .from("goals")
        .update({
          target: goal.uom === "timeline" ? null : goal.target,
          target_date: goal.uom === "timeline" ? goal.target_date : null,
          weightage: goal.weightage,
        })
        .eq("id", goal.id)
        .eq("status", "submitted");

      if (updateError) {
        toast.error(updateError.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    if (showSuccessMessage) {
      toast.success("Manager edits saved.");
    }

    return true;
  };

  const requestApprove = () => {
    const validationError = validateManagerEdits();

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setApproveDialogOpen(true);
  };

  const requestReject = () => {
    if (!hasSubmittedGoals) {
      toast.error("No submitted goals are available to return for rework.");
      return;
    }

    setRejectDialogOpen(true);
  };

  const approveGoals = async () => {
    setApproving(true);

    const editsSaved = await saveManagerEdits(false);

    if (!editsSaved) {
      setApproving(false);
      return;
    }

    const submittedGoalIds = reviewGoals
      .filter((goal) => goal.status === "submitted")
      .map((goal) => goal.id);

    if (submittedGoalIds.length === 0) {
      toast.error("No submitted goals are available to approve.");
      setApproving(false);
      return;
    }

    const supabase = createClient();
    const { error: approveError } = await supabase
      .from("goals")
      .update({ status: "locked" })
      .in("id", submittedGoalIds)
      .eq("status", "submitted");

    if (approveError) {
      toast.error(approveError.message);
      setApproving(false);
      return;
    }

    setReviewGoals((currentGoals) =>
      currentGoals.map((goal) =>
        submittedGoalIds.includes(goal.id)
          ? { ...goal, status: "locked" }
          : goal
      )
    );
    setApproveDialogOpen(false);
    setApproving(false);
    toast.success("Goals approved and locked.");
  };

  const rejectGoals = async () => {
    setRejecting(true);

    const submittedGoalIds = reviewGoals
      .filter((goal) => goal.status === "submitted")
      .map((goal) => goal.id);

    if (submittedGoalIds.length === 0) {
      toast.error("No submitted goals are available to return for rework.");
      setRejecting(false);
      return;
    }

    const supabase = createClient();
    const { error: reasonError } = await supabase
      .from("users")
      .update({ rejection_reason: rejectionReason.trim() || null })
      .eq("id", employee.id);

    if (reasonError) {
      toast.error(reasonError.message);
      setRejecting(false);
      return;
    }

    const { error: rejectError } = await supabase
      .from("goals")
      .update({ status: "rejected" })
      .in("id", submittedGoalIds)
      .eq("status", "submitted");

    if (rejectError) {
      toast.error(rejectError.message);
      setRejecting(false);
      return;
    }

    setReviewGoals((currentGoals) =>
      currentGoals.map((goal) =>
        submittedGoalIds.includes(goal.id)
          ? { ...goal, status: "rejected" }
          : goal
      )
    );
    setRejectDialogOpen(false);
    setRejecting(false);
    toast.success("Goals returned for rework.");
  };

  return (
    <>
      <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{employee.name || employee.email || "Employee"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">
              {employee.department || "No department"} · {employee.email}
            </p>
            {hasSubmittedGoals && <WeightageIndicator total={totalWeightage} />}
          </div>
          {reviewGoals.some((g) => g.status === "locked" || g.status === "approved") &&
          hasSubmittedGoals ? (
            <p className="text-xs text-muted-foreground">
              Weightage total applies to submitted goals only. Locked goals are excluded from the
              100% check.
            </p>
          ) : null}
        </CardContent>
      </Card>

      {!hasSubmittedGoals && (
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          <p>No submitted goals are waiting for review.</p>
          {otherGoalsCount > 0 ? (
            <p className="mt-2">
              This employee has {otherGoalsCount} other goal
              {otherGoalsCount === 1 ? "" : "s"} on file (locked or previously returned). Only
              submitted goals appear here.
            </p>
          ) : null}
        </div>
      )}

      <div className="space-y-3">
        {submittedGoals.map((goal) => (
          <Card key={goal.id}>
            <CardContent className="space-y-3 pt-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-medium">{goal.title || "Untitled goal"}</h3>
                {goal.is_shared && <Badge variant="outline">Shared Goal</Badge>}
                <Badge variant="secondary">{goal.status || "draft"}</Badge>
              </div>
              {goal.description && (
                <p className="text-sm text-muted-foreground">{goal.description}</p>
              )}
              <div className="grid gap-3 text-sm md:grid-cols-4">
                <p>Thrust Area: {goal.thrust_area || "Not set"}</p>
                <p>UoM: {goal.uom || "Not set"}</p>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-muted-foreground">
                    Target
                  </label>
                  {canEdit && goal.status === "submitted" ? (
                    <Input
                      type={goal.uom === "timeline" ? "date" : "number"}
                      min={goal.uom === "timeline" ? undefined : "0"}
                      value={goal.uom === "timeline" ? goal.target_date ?? "" : goal.target ?? ""}
                      onChange={(event) =>
                        goal.uom === "timeline"
                          ? updateGoal(goal.id, { target: null, target_date: event.target.value })
                          : updateGoal(goal.id, { target: Number(event.target.value), target_date: null })
                      }
                    />
                  ) : (
                    <p className="text-muted-foreground">{formatTarget(goal)}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-muted-foreground">
                    Weightage
                  </label>
                  {canEdit && goal.status === "submitted" ? (
                    <Input
                      type="number"
                      min="10"
                      max="100"
                      value={goal.weightage ?? 0}
                      onChange={(event) =>
                        updateGoal(goal.id, { weightage: Number(event.target.value) })
                      }
                    />
                  ) : (
                    <p className="text-muted-foreground">{goal.weightage ?? 0}%</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {canEdit && (
        <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={() => saveManagerEdits()} disabled={saving || approving || rejecting}>
            {saving ? "Saving..." : "Save Manager Edits"}
          </Button>
          <Button type="button" variant="outline" onClick={requestReject} disabled={saving || approving || rejecting}>
            Reject Goals
          </Button>
          <Button
            type="button"
            onClick={requestApprove}
            disabled={saving || approving || rejecting || !canApprove}
            title={
              !canApprove
                ? `Submitted goals must total 100% (currently ${totalWeightage}%)`
                : undefined
            }
          >
            Approve Goals
          </Button>
        </div>
      )}

      </div>

      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve goals?</DialogTitle>
            <DialogDescription>
              These goals will be treated as locked after approval. Only Admin
              intervention should change them later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setApproveDialogOpen(false)}
              disabled={approving}
            >
              Cancel
            </Button>
            <Button type="button" onClick={approveGoals} disabled={approving}>
              {approving ? "Approving..." : "Approve Goals"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return goals for rework?</DialogTitle>
            <DialogDescription>
              The employee will be able to edit and resubmit these goals.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="rejection-reason">
              Rejection reason
            </label>
            <textarea
              id="rejection-reason"
              className="min-h-24 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              placeholder="Optional note for the employee"
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              disabled={rejecting}
            >
              Cancel
            </Button>
            <Button type="button" onClick={rejectGoals} disabled={rejecting}>
              {rejecting ? "Returning..." : "Return for Rework"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
