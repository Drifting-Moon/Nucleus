"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckinGoal,
  CheckinRow,
  CheckinRowState,
} from "@/components/checkins/checkin-row";
import { calculateScore } from "@/lib/calculate-score";
import type { CheckinQuarter } from "@/lib/get-active-window";
import { QUARTER_LABELS } from "@/lib/quarter-labels";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";
import { validateCheckinRows } from "@/lib/validate-checkin";

export type CheckinUpdateRecord = {
  id: string;
  goal_id: string;
  quarter: string;
  achievement: number | null;
  achievement_date: string | null;
  status: string;
  score: number | null;
  submitted_at: string | null;
};

type CheckinFormProps = {
  quarter: CheckinQuarter;
  goals: CheckinGoal[];
  updates: CheckinUpdateRecord[];
};

function buildRows(goals: CheckinGoal[], updates: CheckinUpdateRecord[]): CheckinRowState[] {
  return goals.map((goal) => {
    const existing = updates.find((update) => update.goal_id === goal.id);
    return {
      goalId: goal.id,
      achievement: existing?.achievement ?? "",
      achievementDate: existing?.achievement_date ?? "",
      status: (existing?.status as CheckinRowState["status"]) || "",
    };
  });
}

function isSubmitted(updates: CheckinUpdateRecord[]) {
  return updates.some((update) => update.submitted_at);
}

export function CheckinForm({ quarter, goals, updates }: CheckinFormProps) {
  const router = useRouter();
  const [rows, setRows] = useState(() => buildRows(goals, updates));
  const [readOnly, setReadOnly] = useState(() => isSubmitted(updates));
  const [submitting, setSubmitting] = useState(false);

  const updateRow = (goalId: string, updates: Partial<CheckinRowState>) => {
    setRows((current) =>
      current.map((row) => (row.goalId === goalId ? { ...row, ...updates } : row))
    );
  };

  const handleSubmit = async () => {
    const validationError = validateCheckinRows(goals, rows);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSubmitting(true);

    const supabase = createClient();
    const submittedAt = new Date().toISOString();

    for (const goal of goals) {
      const row = rows.find((item) => item.goalId === goal.id);
      if (!row) continue;

      const achievementValue = row.achievement === "" ? null : Number(row.achievement);
      const score = calculateScore({
        uom: goal.uom ?? "",
        target: goal.target,
        achievement: achievementValue,
        targetDate: goal.target_date,
        achievementDate: row.achievementDate,
        scoreDirection: goal.score_direction,
      });

      const payload = {
        goal_id: goal.id,
        quarter,
        achievement: goal.uom === "timeline" ? null : achievementValue,
        achievement_date: goal.uom === "timeline" ? row.achievementDate : null,
        status: row.status,
        score,
        submitted_at: submittedAt,
      };

      const existing = updates.find((update) => update.goal_id === goal.id);

      if (existing?.id) {
        const { error: updateError } = await supabase
          .from("quarterly_updates")
          .update(payload)
          .eq("id", existing.id);

        if (updateError) {
          toast.error(updateError.message);
          setSubmitting(false);
          return;
        }
      } else {
        const { error: insertError } = await supabase
          .from("quarterly_updates")
          .insert(payload);

        if (insertError) {
          toast.error(insertError.message);
          setSubmitting(false);
          return;
        }
      }
    }

    // After all writes succeed, trigger the sync check
    try {
      const syncPayload = goals.map((goal) => {
        const row = rows.find((item) => item.goalId === goal.id);
        const achievementValue = row?.achievement === "" ? null : Number(row?.achievement);
        const score = calculateScore({
          uom: goal.uom ?? "",
          target: goal.target,
          achievement: achievementValue,
          targetDate: goal.target_date,
          achievementDate: row?.achievementDate,
          scoreDirection: goal.score_direction,
        });

        return {
          goal_id: goal.id,
          achievement: goal.uom === "timeline" ? null : achievementValue,
          achievement_date: goal.uom === "timeline" ? row?.achievementDate : null,
          status: row?.status,
          score,
          submitted_at: submittedAt,
        };
      });

      await fetch("/api/checkin/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: syncPayload, quarter }),
      });
    } catch (syncError) {
      console.error("Failed to sync shared goals:", syncError);
      // We don't block the UI for sync errors, the employee's own check-in succeeded.
    }

    setReadOnly(true);
    toast.success("Check-in submitted. Your manager can now review your progress.");
    router.refresh();
    setSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>{QUARTER_LABELS[quarter]}</CardTitle>
          {readOnly ? <Badge variant="secondary">Submitted</Badge> : null}
        </div>
        <CardDescription>
          {readOnly
            ? "Your check-in for this quarter is locked."
            : "Enter achievement and status for each approved goal, then submit."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map((goal) => {
          const row = rows.find((item) => item.goalId === goal.id);
          if (!row) return null;

          return (
            <CheckinRow
              key={goal.id}
              goal={goal}
              row={row}
              readOnly={readOnly}
              onChange={(updates) => updateRow(goal.id, updates)}
            />
          );
        })}

        {!readOnly ? (
          <Button type="button" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting…" : "Submit check-in"}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
