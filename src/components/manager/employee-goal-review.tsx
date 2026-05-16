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
};

function formatTarget(goal: ReviewGoal) {
  if (goal.uom === "timeline") {
    return goal.target_date || "Not set";
  }

  return goal.target ?? "Not set";
}

export function EmployeeGoalReview({ employee, goals }: EmployeeGoalReviewProps) {
  const [reviewGoals, setReviewGoals] = useState(goals);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const totalWeightage = reviewGoals.reduce((sum, goal) => sum + (goal.weightage ?? 0), 0);
  const hasSubmittedGoals = reviewGoals.some((goal) => goal.status === "submitted");
  const canEdit = hasSubmittedGoals;

  const updateGoal = (goalId: string, updates: Partial<ReviewGoal>) => {
    setReviewGoals((currentGoals) =>
      currentGoals.map((goal) =>
        goal.id === goalId ? { ...goal, ...updates } : goal
      )
    );
    setMessage("");
  };

  const validateManagerEdits = () => {
    for (const goal of reviewGoals) {
      if ((goal.weightage ?? 0) < 10) {
        return `"${goal.title || "Untitled goal"}" must be at least 10% weightage`;
      }
    }

    if (totalWeightage !== 100) {
      return `Total weightage is ${totalWeightage}%. Must equal exactly 100%`;
    }

    return null;
  };

  const saveManagerEdits = async (showSuccessMessage = true) => {
    const validationError = validateManagerEdits();

    if (validationError) {
      setError(validationError);
      setMessage("");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

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
        setError(updateError.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    if (showSuccessMessage) {
      setMessage("Manager edits saved.");
    }

    return true;
  };

  const requestApprove = () => {
    const validationError = validateManagerEdits();

    if (validationError) {
      setError(validationError);
      setMessage("");
      return;
    }

    setError("");
    setMessage("");
    setApproveDialogOpen(true);
  };

  const requestReject = () => {
    if (!hasSubmittedGoals) {
      setError("No submitted goals are available to return for rework.");
      setMessage("");
      return;
    }

    setError("");
    setMessage("");
    setRejectDialogOpen(true);
  };

  const approveGoals = async () => {
    setApproving(true);
    setError("");
    setMessage("");

    const editsSaved = await saveManagerEdits(false);

    if (!editsSaved) {
      setApproving(false);
      return;
    }

    const submittedGoalIds = reviewGoals
      .filter((goal) => goal.status === "submitted")
      .map((goal) => goal.id);

    if (submittedGoalIds.length === 0) {
      setError("No submitted goals are available to approve.");
      setApproving(false);
      return;
    }

    const supabase = createClient();
    const { error: approveError } = await supabase
      .from("goals")
      .update({ status: "approved", is_locked: true })
      .in("id", submittedGoalIds)
      .eq("status", "submitted");

    if (approveError) {
      setError(approveError.message);
      setApproving(false);
      return;
    }

    setReviewGoals((currentGoals) =>
      currentGoals.map((goal) =>
        submittedGoalIds.includes(goal.id)
          ? { ...goal, status: "approved" }
          : goal
      )
    );
    setApproveDialogOpen(false);
    setApproving(false);
    setMessage("Goals approved and locked.");
  };

  const rejectGoals = async () => {
    setRejecting(true);
    setError("");
    setMessage("");

    const submittedGoalIds = reviewGoals
      .filter((goal) => goal.status === "submitted")
      .map((goal) => goal.id);

    if (submittedGoalIds.length === 0) {
      setError("No submitted goals are available to return for rework.");
      setRejecting(false);
      return;
    }

    const supabase = createClient();
    const { error: reasonError } = await supabase
      .from("users")
      .update({ rejection_reason: rejectionReason.trim() || null })
      .eq("id", employee.id);

    if (reasonError) {
      setError(reasonError.message);
      setRejecting(false);
      return;
    }

    const { error: rejectError } = await supabase
      .from("goals")
      .update({ status: "rejected" })
      .in("id", submittedGoalIds)
      .eq("status", "submitted");

    if (rejectError) {
      setError(rejectError.message);
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
    setMessage("Goals returned for rework.");
  };

  return (
    <>
      <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{employee.name || employee.email || "Employee"}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground">
            {employee.department || "No department"} · {employee.email}
          </p>
          {reviewGoals.length > 0 && <WeightageIndicator total={totalWeightage} />}
        </CardContent>
      </Card>

      {!hasSubmittedGoals && (
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          No submitted goals are waiting for review.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <div className="space-y-3">
        {reviewGoals.map((goal) => (
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
          <Button type="button" onClick={requestApprove} disabled={saving || approving || rejecting}>
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
