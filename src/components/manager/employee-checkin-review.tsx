"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreDisplay } from "@/components/checkins/score-display";
import type { CheckinGoal } from "@/components/checkins/checkin-row";
import type { CheckinQuarter } from "@/lib/get-active-window";
import { QUARTER_LABELS } from "@/lib/quarter-labels";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";

export type ManagerCheckinUpdate = {
  id: string;
  goal_id: string;
  achievement: number | null;
  achievement_date: string | null;
  status: string;
  score: number | null;
  submitted_at: string | null;
  manager_feedback: string | null;
};

type EmployeeCheckinReviewProps = {
  employee: {
    id: string;
    name: string | null;
    email: string | null;
    department: string | null;
  };
  quarter: CheckinQuarter;
  goals: CheckinGoal[];
  updates: ManagerCheckinUpdate[];
};

function formatTarget(goal: CheckinGoal) {
  if (goal.uom === "timeline") {
    return goal.target_date || "Not set";
  }
  if (goal.uom === "percentage") {
    return goal.target !== null ? `${goal.target}%` : "Not set";
  }
  return goal.target ?? "Not set";
}

function formatAchievement(goal: CheckinGoal, update: ManagerCheckinUpdate | undefined) {
  if (!update) return "Not submitted";
  if (goal.uom === "timeline") {
    return update.achievement_date || "Not set";
  }
  return update.achievement ?? "Not set";
}

function formatStatus(status: string | undefined) {
  if (!status) return "Not set";
  return status.replace("_", " ");
}

export function EmployeeCheckinReview({
  employee,
  quarter,
  goals,
  updates,
}: EmployeeCheckinReviewProps) {
  const initialComment =
    updates.find((update) => update.manager_feedback?.trim())?.manager_feedback ?? "";
  const [comment, setComment] = useState(initialComment);
  const [saving, setSaving] = useState(false);

  const isSubmitted =
    goals.length > 0 &&
    goals.every((goal) => {
      const update = updates.find((item) => item.goal_id === goal.id);
      return Boolean(update?.submitted_at);
    });

  const handleSave = async () => {
    if (!comment.trim()) {
      toast.error("Enter a check-in comment before saving.");
      return;
    }

    setSaving(true);

    const supabase = createClient();

    for (const update of updates) {
      const { error: updateError } = await supabase
        .from("quarterly_updates")
        .update({ manager_feedback: comment.trim() })
        .eq("id", update.id);

      if (updateError) {
        toast.error(updateError.message);
        setSaving(false);
        return;
      }
    }

    toast.success("Manager feedback submitted");
    setSaving(false);
  };

  if (!isSubmitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {employee.name || employee.email} — {QUARTER_LABELS[quarter]}
          </CardTitle>
          <CardDescription>Check-in not submitted yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This employee has not submitted their {QUARTER_LABELS[quarter].toLowerCase()} check-in
            yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>
              {employee.name || employee.email} — {QUARTER_LABELS[quarter]}
            </CardTitle>
            <Badge variant="secondary">Submitted</Badge>
          </div>
          <CardDescription>
            {employee.department || "No department"} · Planned vs. actual by goal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {goals.map((goal) => {
            const update = updates.find((item) => item.goal_id === goal.id);

            return (
              <div key={goal.id} className="rounded-lg border p-4 space-y-2">
                <p className="font-medium">{goal.title || "Untitled goal"}</p>
                <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                  <p>Target: {formatTarget(goal)}</p>
                  <p>Achievement: {formatAchievement(goal, update)}</p>
                  <p>Status: {formatStatus(update?.status)}</p>
                  <div className="flex items-center gap-2">
                    <span>Score:</span>
                    <ScoreDisplay score={update?.score ?? null} />
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manager check-in comment</CardTitle>
          <CardDescription>
            Document the discussion with your direct report for this quarter.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            className="min-h-28 w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Summarize feedback from the check-in conversation…"
          />
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save feedback"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
