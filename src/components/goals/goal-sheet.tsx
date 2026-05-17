"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Lock, Plus } from "lucide-react";
import { toast } from "sonner";
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
import { LockedGoalCard } from "@/components/goals/locked-goal-card";
import { WeightageIndicator } from "@/components/goals/weightage-indicator";
import { createClient } from "@/lib/supabase";
import { hasLockedGoals } from "@/lib/goal-metrics";
import { getErrorMessage } from "@/lib/map-supabase-error";
import { validateGoals } from "@/lib/validate-goals";
import { formatDateTime } from "@/lib/format-datetime";
import { computeGoalHealth, type GoalHealth } from "@/lib/goal-health";
import { DashboardLoading } from "@/components/dashboard-loading";

const LOCKED_STATUSES = ["approved", "locked"] as const;
const ACTIVE_SHEET_STATUSES = ["draft", "rejected", "submitted"] as const;

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
  created_at: string | null;
};

type UserProfileRecord = {
  rejection_reason: string | null;
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

function getGoalSheetSummary(
  goals: GoalDraft[],
  rejectionReason: string,
  options: { hasLocked: boolean; goalSettingOpen: boolean }
) {
  if (options.hasLocked) {
    return {
      className: "border-foreground/20 bg-muted text-foreground",
      title: "Goals locked for this cycle",
      description:
        "Your approved goals cannot be changed. Use Quarterly Check-ins below to log actual achievement and update progress status.",
    };
  }

  if (!options.goalSettingOpen && goals.length === 0) {
    return {
      className: "border-amber-500/30 bg-amber-500/10 text-amber-800",
      title: "Window closed",
      description:
        "The goal-setting window is not open. Contact your administrator if you need help.",
    };
  }

  if (!options.goalSettingOpen && goals.length > 0) {
    return {
      className: "border-amber-500/30 bg-amber-500/10 text-amber-800",
      title: "Window closed",
      description: "You can no longer edit or submit goals outside the goal-setting window.",
    };
  }

  if (goals.some((goal) => goal.status === "rejected")) {
    return {
      className: "border-amber-500/30 bg-amber-500/10 text-amber-800",
      title: "Goals returned for rework",
      description:
        rejectionReason ||
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
  goalSettingOpen: boolean;
};

const subscribeToHydration = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function GoalSheet({ userId, goalSettingOpen }: GoalSheetProps) {
  const router = useRouter();
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
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [goalHealthMap, setGoalHealthMap] = useState<Map<string, GoalHealth>>(new Map());
  const totalWeightage = goals.reduce((sum, goal) => sum + (Number(goal.weightage) || 0), 0);
  const canAddMore = goals.length < 8;
  const canSubmit =
    goals.length > 0 && goals.length <= 8 && totalWeightage === 100 && !loading && !saving;
  const submitDisabledReason =
    goals.length === 0
      ? "Add at least one goal"
      : goals.length > 8
        ? "Maximum 8 goals"
        : totalWeightage !== 100
          ? `Total weightage must be 100% (currently ${totalWeightage}%)`
          : undefined;
  const lockedOnSheet = hasLockedGoals(goals);
  const inRework =
    goals.some((goal) => goal.status === "rejected") && !lockedOnSheet;
  const canEditGoals = !lockedOnSheet && (goalSettingOpen || inRework);
  const isReadOnly =
    !canEditGoals ||
    (goals.length > 0 &&
      goals.every((goal) =>
        ["submitted", "approved", "locked"].includes(goal.status)
      ));
  const isApprovedLocked =
    goals.length > 0 &&
    goals.every((goal) => LOCKED_STATUSES.includes(goal.status as (typeof LOCKED_STATUSES)[number]));
  const sheetSummary = getGoalSheetSummary(goals, rejectionReason, {
    hasLocked: lockedOnSheet,
    goalSettingOpen,
  });

  const assertCanModifyGoals = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("goals")
      .select("status")
      .eq("user_id", userId);

    if (error) {
      toast.error(getErrorMessage(error));
      return false;
    }

    const rows = data ?? [];

    if (hasLockedGoals(rows)) {
      toast.error(
        "Goals are locked for this cycle. Use quarterly check-ins to update progress."
      );
      return false;
    }

    const rework = rows.some((goal) => goal.status === "rejected");
    if (!goalSettingOpen && !rework) {
      toast.error("Goal setting window is closed.");
      return false;
    }

    return true;
  };

  const blockGoalSettingEdits = (action: "add" | "save" | "submit") => {
    if (lockedOnSheet) {
      toast.error(
        "Goals are locked for this cycle. Use quarterly check-ins to update progress."
      );
      return true;
    }

    if (!goalSettingOpen && !inRework) {
      toast.error(
        action === "add"
          ? "Goal setting window is closed. You cannot add new goals."
          : "Goal setting window is closed."
      );
      return true;
    }

    return false;
  };

  useEffect(() => {
    let ignore = false;

    async function loadGoals() {
      setLoading(true);
      const supabase = createClient();

      const { data, error: loadError } = await supabase
        .from("goals")
        .select(
          "id, thrust_area, title, description, weightage, uom, target, target_date, is_shared, status, created_at"
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      const { data: profile } = await supabase
        .from("users")
        .select("rejection_reason")
        .eq("id", userId)
        .single();

      if (ignore) {
        return;
      }

      if (loadError) {
        toast.error(getErrorMessage(loadError));
        setGoals([createBlankGoal()]);
        setLoading(false);
        return;
      }

      const latestUpdate = (data ?? [])
        .map((goal) => goal.created_at)
        .filter(Boolean)
        .sort()
        .at(-1);
      setLastUpdatedAt(latestUpdate ?? null);

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

      const allLoaded = loadedGoals ?? [];
      const locked = allLoaded.filter((goal) =>
        LOCKED_STATUSES.includes(goal.status as (typeof LOCKED_STATUSES)[number])
      );
      const active = allLoaded.filter((goal) =>
        ACTIVE_SHEET_STATUSES.includes(goal.status as (typeof ACTIVE_SHEET_STATUSES)[number])
      );

      if (locked.length > 0) {
        setGoals(locked);
      } else if (active.length > 0) {
        setGoals(active);
      } else if (goalSettingOpen) {
        setGoals([createBlankGoal()]);
      } else {
        setGoals([]);
      }

      setRejectionReason((profile as UserProfileRecord | null)?.rejection_reason ?? "");

      // Compute goal health for locked goals
      if (locked.length > 0) {
        const lockedGoalIds = locked.map((g) => g.id).filter(Boolean) as string[];
        if (lockedGoalIds.length > 0) {
          const { data: updates } = await supabase
            .from("quarterly_updates")
            .select("goal_id, score, status, submitted_at")
            .in("goal_id", lockedGoalIds)
            .order("submitted_at", { ascending: false });

          const healthMap = new Map<string, GoalHealth>();
          for (const gId of lockedGoalIds) {
            const latestUpdate = (updates ?? []).find((u) => u.goal_id === gId && u.submitted_at);
            healthMap.set(
              gId,
              computeGoalHealth({
                latestScore: latestUpdate?.score ?? null,
                latestStatus: latestUpdate?.status ?? null,
                hasSubmitted: Boolean(latestUpdate?.submitted_at),
              })
            );
          }
          if (!ignore) setGoalHealthMap(healthMap);
        }
      }

      setLoading(false);
    }

    loadGoals();

    return () => {
      ignore = true;
    };
  }, [userId, goalSettingOpen]);

  if (!mounted || loading) {
    return <DashboardLoading />;
  }

  const updateGoal = (index: number, updatedGoal: GoalDraft) => {
    setGoals((currentGoals) =>
      currentGoals.map((goal, goalIndex) =>
        goalIndex === index ? updatedGoal : goal
      )
    );
  };

  const addGoal = () => {
    if (blockGoalSettingEdits("add")) {
      return;
    }

    if (!canAddMore) {
      return;
    }

    setGoals((currentGoals) => [...currentGoals, createBlankGoal()]);
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

      if (goal.weightage === "" || goal.weightage < 10 || goal.weightage > 100) {
        return `"${goal.title}" weightage must be between 10% and 100%`;
      }
    }

    return null;
  };

  const requestDeleteGoal = (index: number) => {
    setPendingDeleteIndex(index);
    setConfirmDeleteOpen(true);
  };

  const deleteGoal = async (index: number) => {
    const goal = goals[index];

    if (goal?.id) {
      setSaving(true);

      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from("goals")
        .delete()
        .eq("id", goal.id)
        .eq("user_id", userId);

      setSaving(false);

      if (deleteError) {
        toast.error(getErrorMessage(deleteError));
        return;
      }
    }

    setGoals((currentGoals) =>
      currentGoals.filter((_, goalIndex) => goalIndex !== index)
    );
    toast.success("Goal deleted");
    router.refresh();
  };

  const saveDraft = async (showSuccessMessage = true) => {
    if (blockGoalSettingEdits("save")) {
      return;
    }

    if (!(await assertCanModifyGoals())) {
      return;
    }

    const validationError = validateDraftSave();

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSaving(true);

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
          toast.error(getErrorMessage(updateError));
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
          toast.error(getErrorMessage(insertError));
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
      toast.success("Goals saved successfully");
    }

    setLastUpdatedAt(new Date().toISOString());
    router.refresh();
    return savedGoals;
  };

  const requestSubmit = () => {
    if (blockGoalSettingEdits("submit")) {
      return;
    }

    const validationError = validateGoals(goals);

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setConfirmSubmitOpen(true);
  };

  const submitGoals = async () => {
    if (blockGoalSettingEdits("submit")) {
      return;
    }

    if (!(await assertCanModifyGoals())) {
      return;
    }

    setSubmitting(true);

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
      toast.error(getErrorMessage(submitError));
      setSubmitting(false);
      return;
    }

    await supabase
      .from("users")
      .update({ rejection_reason: null })
      .eq("id", userId);

    setGoals((currentGoals) =>
      currentGoals.map((goal) =>
        ["draft", "rejected"].includes(goal.status)
          ? { ...goal, status: "submitted" }
          : goal
      )
    );
    setConfirmSubmitOpen(false);
    setRejectionReason("");
    setSubmitting(false);
    setLastUpdatedAt(new Date().toISOString());
    toast.success("Goals submitted. Waiting for manager review.");
    router.refresh();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle>My Goals</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {lockedOnSheet
                  ? "Your goals are locked. Update progress in quarterly check-ins below."
                  : goalSettingOpen || inRework
                    ? "Draft your goals and balance the total weightage before submitting."
                    : "Goal setting is closed. Approved goals are shown below when available."}
              </p>
              {lastUpdatedAt ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Last updated: {formatDateTime(lastUpdatedAt)}
                </p>
              ) : null}
            </div>
            {!isReadOnly ? <WeightageIndicator total={totalWeightage} /> : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />

          {!loading && isReadOnly && isApprovedLocked && (
            <div className="flex items-center gap-2 rounded-lg border border-foreground/15 bg-muted/50 px-4 py-3 text-sm">
              <Lock className="size-4 shrink-0" />
              <span>Approved goals — editing is disabled</span>
            </div>
          )}

          {sheetSummary && (
            <div className={`rounded-lg border px-4 py-3 text-sm ${sheetSummary.className}`}>
              <p className="font-medium">{sheetSummary.title}</p>
              <p className="mt-1">{sheetSummary.description}</p>
            </div>
          )}



          {isReadOnly ? (
            <div className="space-y-3">
              {goals.map((goal) => (
                <LockedGoalCard
                  key={goal.id}
                  title={goal.title}
                  status={goal.status}
                  statusLabel={getStatusLabel(goal.status)}
                  thrustArea={goal.thrust_area}
                  uom={goal.uom}
                  target={goal.target}
                  targetDate={goal.target_date}
                  weightage={goal.weightage}
                  description={goal.description}
                  health={goal.id ? goalHealthMap.get(goal.id) : null}
                />
              ))}
            </div>
          ) : null}

          {!isReadOnly && goals.length > 0 ? (
            <div className="space-y-3">
              {goals.map((goal, index) => (
                <GoalFormRow
                  key={goal.id ?? `draft-${index}`}
                  goal={goal}
                  index={index}
                  onChange={updateGoal}
                  onDelete={requestDeleteGoal}
                />
              ))}
            </div>
          ) : null}

          {goals.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center bg-muted/20">
              <p className="font-medium text-amber-700 dark:text-amber-300">
                {goalSettingOpen
                  ? "Your goal sheet is currently empty"
                  : "No goals on file for this cycle"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {goalSettingOpen
                  ? 'Start building your sheet by clicking "Add Goal" below. Each goal needs at least 10% weightage, and the combined weightage across all goals must equal exactly 100% to submit.'
                  : "No employees have submitted goals this cycle. Share the goal-setting window dates with your team or check that they have been configured in Quarter Windows."}
              </p>
            </div>
          ) : null}

        </CardContent>
        {!isReadOnly ? (
          <div className="sticky bottom-0 z-10 flex flex-col gap-3 border-t bg-background/95 px-6 py-4 backdrop-blur-md print:hidden sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex flex-wrap gap-x-3 divide-x divide-border">
              <span>{goals.length} of 8 goals added</span>
              <span className="pl-3">{totalWeightage}% weightage used</span>
              <span className="pl-3">{Math.max(0, 100 - totalWeightage)}% remaining</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={addGoal} disabled={!canAddMore || saving || submitting}>
                <Plus />
                Add Goal
              </Button>
              <Button type="button" variant="outline" onClick={() => saveDraft()} disabled={loading || saving || submitting}>
                {saving ? "Saving..." : "Save Draft"}
              </Button>
              <Button
                type="button"
                onClick={requestSubmit}
                disabled={loading || saving || submitting || !canSubmit}
                title={submitDisabledReason}
              >
                {submitting ? "Submitting…" : "Submit Goals"}
              </Button>
            </div>
          </div>
        ) : null}
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

      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete goal?</DialogTitle>
            <DialogDescription>
              This will permanently remove the goal from your sheet. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDeleteOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={saving}
              onClick={async () => {
                if (pendingDeleteIndex === null) return;
                await deleteGoal(pendingDeleteIndex);
                setConfirmDeleteOpen(false);
                setPendingDeleteIndex(null);
              }}
            >
              {saving ? "Deleting…" : "Delete goal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
