"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Plus } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { GoalDraft, GoalFormRow } from "@/components/goals/goal-form-row";
import { WeightageIndicator } from "@/components/goals/weightage-indicator";
import { createClient } from "@/lib/supabase";
import { validateGoals } from "@/lib/validate-goals";
import { Badge } from "@/components/ui/badge";

type GoalRecord = {
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

function createBlankGoal(): GoalDraft {
  return {
    thrust_area: "",
    title: "",
    description: "",
    weightage: 10,
    uom: "",
    target: "",
    target_date: "",
    is_shared: false,
    status: "draft",
  };
}

function normalizeTarget(target: number | null): number | "" {
  return target === null ? "" : target;
}

function getStatusLabel(status: string) {
  if (status === "submitted") {
    return "Submitted — Awaiting Manager Review";
  }

  if (status === "approved") {
    return "Approved";
  }

  if (status === "locked") {
    return "Locked";
  }

  return status;
}

function getGoalSheetSummary(goals: GoalDraft[]) {
  if (goals.some((goal) => goal.status === "rejected")) {
    return {
      className: "border-amber-500/30 bg-amber-500/10 text-amber-800",
      title: "Goals returned for rework",
      description:
        "Update the goals below and submit again when the total weightage is exactly 100%.",
    };
  }

  if (goals.length > 0 && goals.every((goal) => goal.status === "submitted")) {
    return {
      className: "border-sky-500/30 bg-sky-500/10 text-sky-800",
      title: "Goals submitted",
      description: "Your goals are waiting for manager review.",
    };
  }

  if (goals.length > 0 && goals.every((goal) => goal.status === "approved")) {
    return {
      className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
      title: "Goals approved",
      description: "Your manager has approved these goals.",
    };
  }

  if (goals.length > 0 && goals.every((goal) => goal.status === "locked")) {
    return {
      className: "border-foreground/20 bg-muted text-foreground",
      title: "Goals locked",
      description: "These goals are locked and cannot be edited.",
    };
  }

  return null;
}

type GoalSheetProps = {
  userId: string;
};

const subscribeToHydration = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function GoalSheet({ userId }: GoalSheetProps) {
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    getClientSnapshot,
    getServerSnapshot
  );
  const [goals, setGoals] = useState<GoalDraft[]>([createBlankGoal()]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const totalWeightage = goals.reduce((sum, goal) => sum + goal.weightage, 0);
  const canAddMore = goals.length < 8;
  const isReadOnly =
    goals.length > 0 &&
    goals.every((goal) => ["submitted", "approved", "locked"].includes(goal.status));
  const sheetSummary = getGoalSheetSummary(goals);

  useEffect(() => {
    let ignore = false;

    async function loadGoals() {
      setLoading(true);
      setError("");
      const supabase = createClient();

      const { data, error: loadError } = await supabase
        .from("goals")
        .select("id, thrust_area, title, description, weightage, uom, target, target_date, is_shared, status")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (ignore) {
        return;
      }

      if (loadError) {
        setError(loadError.message);
        setGoals([createBlankGoal()]);
        setLoading(false);
        return;
      }

      const loadedGoals: GoalDraft[] | undefined = (data as GoalRecord[] | null)?.map((goal) => ({
        id: goal.id,
        thrust_area: goal.thrust_area ?? "",
        title: goal.title ?? "",
        description: goal.description ?? "",
        weightage: goal.weightage ?? 10,
        uom: goal.uom ?? "",
        target: normalizeTarget(goal.target),
        target_date: goal.target_date ?? "",
        is_shared: goal.is_shared ?? false,
        status: goal.status ?? "draft",
      }));

      setGoals(loadedGoals?.length ? loadedGoals : [createBlankGoal()]);
      setLoading(false);
    }

    loadGoals();

    return () => {
      ignore = true;
    };
  }, [userId]);

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            Loading goals...
          </div>
        </CardContent>
      </Card>
    );
  }

  const updateGoal = (index: number, updatedGoal: GoalDraft) => {
    setGoals((currentGoals) =>
      currentGoals.map((goal, goalIndex) =>
        goalIndex === index ? updatedGoal : goal
      )
    );
  };

  const addGoal = () => {
    if (!canAddMore) {
      return;
    }

    setGoals((currentGoals) => [...currentGoals, createBlankGoal()]);
    setMessage("");
  };

  const validateDraftSave = () => {
    if (goals.length === 0) {
      return "Add at least one goal before saving";
    }

    if (goals.length > 8) {
      return "Maximum 8 goals allowed";
    }

    for (const goal of goals) {
      if (!goal.title.trim()) {
        return "Every saved draft goal needs a title";
      }

      if (!goal.uom) {
        return "Every saved draft goal needs a unit of measurement";
      }

      if (goal.weightage < 10 || goal.weightage > 100) {
        return `"${goal.title}" weightage must be between 10% and 100%`;
      }
    }

    return null;
  };

  const deleteGoal = async (index: number) => {
    const goal = goals[index];

    if (goal?.id) {
      setSaving(true);
      setError("");
      setMessage("");

      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from("goals")
        .delete()
        .eq("id", goal.id)
        .eq("user_id", userId);

      setSaving(false);

      if (deleteError) {
        setError(deleteError.message);
        return;
      }
    }

    setGoals((currentGoals) =>
      currentGoals.filter((_, goalIndex) => goalIndex !== index)
    );
    setMessage("");
  };

  const saveDraft = async (showSuccessMessage = true) => {
    const validationError = validateDraftSave();

    if (validationError) {
      setError(validationError);
      setMessage("");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    const supabase = createClient();
    const savedGoals: GoalDraft[] = [];

    for (const goal of goals) {
      const payload = {
        title: goal.title.trim(),
        description: goal.description.trim() || null,
        thrust_area: goal.thrust_area || null,
        weightage: goal.weightage,
        uom: goal.uom,
        target: goal.uom === "timeline" || goal.target === "" ? null : goal.target,
        target_date: goal.uom === "timeline" ? goal.target_date || null : null,
        is_shared: goal.is_shared,
      };

      if (goal.id) {
        const { error: updateError } = await supabase
          .from("goals")
          .update(payload)
          .eq("id", goal.id)
          .eq("user_id", userId);

        if (updateError) {
          setError(updateError.message);
          setSaving(false);
          return;
        }

        savedGoals.push({ ...goal, title: payload.title });
      } else {
        const { data, error: insertError } = await supabase
          .from("goals")
          .insert({
            user_id: userId,
            ...payload,
            status: "draft",
          })
          .select("id, thrust_area, title, description, weightage, uom, target, target_date, is_shared, status")
          .single();

        if (insertError) {
          setError(insertError.message);
          setSaving(false);
          return;
        }

        const savedGoal = data as GoalRecord;

        savedGoals.push({
          id: savedGoal.id,
          thrust_area: savedGoal.thrust_area ?? "",
          title: savedGoal.title ?? "",
          description: savedGoal.description ?? "",
          weightage: savedGoal.weightage ?? 10,
          uom: savedGoal.uom ?? "",
          target: normalizeTarget(savedGoal.target),
          target_date: savedGoal.target_date ?? "",
          is_shared: savedGoal.is_shared ?? false,
          status: savedGoal.status ?? "draft",
        });
      }
    }

    setGoals(savedGoals);
    setSaving(false);
    if (showSuccessMessage) {
      setMessage("Draft saved.");
    }

    return savedGoals;
  };

  const requestSubmit = () => {
    const validationError = validateGoals(goals);

    if (validationError) {
      setError(validationError);
      setMessage("");
      return;
    }

    setError("");
    setMessage("");
    setConfirmSubmitOpen(true);
  };

  const submitGoals = async () => {
    setSubmitting(true);
    setError("");
    setMessage("");

    const savedGoals = await saveDraft(false);

    if (!savedGoals) {
      setSubmitting(false);
      return;
    }

    const supabase = createClient();
    const { error: submitError } = await supabase
      .from("goals")
      .update({ status: "submitted" })
      .eq("user_id", userId)
      .in("status", ["draft", "rejected"]);

    if (submitError) {
      setError(submitError.message);
      setSubmitting(false);
      return;
    }

    setGoals((currentGoals) =>
      currentGoals.map((goal) =>
        ["draft", "rejected"].includes(goal.status)
          ? { ...goal, status: "submitted" }
          : goal
      )
    );
    setConfirmSubmitOpen(false);
    setSubmitting(false);
    setMessage("Goals submitted. Waiting for manager review.");
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle>My Goals</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Draft your goals and balance the total weightage before submitting.
              </p>
            </div>
            {!isReadOnly && <WeightageIndicator total={totalWeightage} />}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />

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

          {!loading && sheetSummary && (
            <div className={`rounded-lg border px-4 py-3 text-sm ${sheetSummary.className}`}>
              <p className="font-medium">{sheetSummary.title}</p>
              <p className="mt-1">{sheetSummary.description}</p>
            </div>
          )}

          {loading && (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              Loading goals...
            </div>
          )}

          {!loading && isReadOnly ? (
            <div className="space-y-3">
              {goals.map((goal) => (
                <div key={goal.id} className="rounded-lg border bg-card p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium">{goal.title}</h3>
                        <Badge variant="outline">
                          {getStatusLabel(goal.status)}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Thrust Area: {goal.thrust_area || "Not set"} · UoM: {goal.uom || "Not set"} · Target:{" "}
                        {goal.uom === "timeline"
                          ? goal.target_date || "Not set"
                          : goal.target === "" ? "Not set" : goal.target} · Weightage:{" "}
                        {goal.weightage}%
                      </p>
                      {goal.description && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {goal.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {!loading && !isReadOnly && goals.length > 0 ? (
            <div className="space-y-3">
              {goals.map((goal, index) => (
                <GoalFormRow
                  key={goal.id ?? `draft-${index}`}
                  goal={goal}
                  index={index}
                  onChange={updateGoal}
                  onDelete={deleteGoal}
                />
              ))}
            </div>
          ) : null}

          {!loading && goals.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              No goals added yet.
            </div>
          ) : null}

          {!isReadOnly && (
            <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {goals.length} / 8 goals added
              </p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={addGoal} disabled={!canAddMore || saving || submitting}>
                  <Plus />
                  Add Goal
                </Button>
                <Button type="button" variant="outline" onClick={() => saveDraft()} disabled={loading || saving || submitting}>
                  {saving ? "Saving..." : "Save Draft"}
                </Button>
                <Button type="button" onClick={requestSubmit} disabled={loading || saving || submitting}>
                  Submit Goals
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={confirmSubmitOpen} onOpenChange={setConfirmSubmitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit goals?</DialogTitle>
            <DialogDescription>
              Once submitted, your manager will review these goals. You will not
              be able to edit them unless they are returned for rework.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmSubmitOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="button" onClick={submitGoals} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Goals"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
