"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScoreDisplay } from "@/components/checkins/score-display";
import { ScoreFormulaHint } from "@/components/score-formula-hint";
import { formatGoalTarget } from "@/lib/format-goal-target";
import { calculateScore } from "@/lib/calculate-score";

export type CheckinGoal = {
  id: string;
  title: string | null;
  uom: string | null;
  target: number | null;
  target_date: string | null;
  score_direction?: string | null;
  is_shared?: boolean | null;
  is_primary_owner?: boolean | null;
};

export type CheckinRowState = {
  goalId: string;
  achievement: number | "";
  achievementDate: string;
  status: "not_started" | "on_track" | "completed" | "";
};

type CheckinRowProps = {
  goal: CheckinGoal;
  row: CheckinRowState;
  readOnly: boolean;
  onChange: (updates: Partial<CheckinRowState>) => void;
};

const statusOptions = [
  { value: "not_started", label: "Not Started" },
  { value: "on_track", label: "On Track" },
  { value: "completed", label: "Completed" },
] as const;

export function CheckinRow({ goal, row, readOnly, onChange }: CheckinRowProps) {
  const achievementValue = row.achievement === "" ? null : Number(row.achievement);
  const score = calculateScore({
    uom: goal.uom ?? "",
    target: goal.target,
    achievement: achievementValue,
    targetDate: goal.target_date,
    achievementDate: row.achievementDate,
    scoreDirection: goal.score_direction,
  });

  const isNonPrimaryShared = goal.is_shared && !goal.is_primary_owner;
  const isEffectivelyReadOnly = readOnly || isNonPrimaryShared;

  return (
    <div className="grid gap-3 rounded-lg border p-4 md:grid-cols-2">
      <div className="space-y-1 md:col-span-2">
        <p className="font-medium">{goal.title || "Untitled goal"}</p>
        <p className="text-sm text-muted-foreground">
          Target: {formatGoalTarget(goal.uom, goal.target, goal.target_date)} · UoM: {goal.uom || "Not set"}
        </p>
      </div>

      <div className="space-y-1">
        <label className="text-sm text-muted-foreground">Achievement</label>
        {goal.uom === "timeline" ? (
          <Input
            type="date"
            value={row.achievementDate}
            disabled={Boolean(isEffectivelyReadOnly)}
            onChange={(e) => onChange({ achievementDate: e.target.value })}
          />
        ) : (
          <Input
            type="number"
            min="0"
            value={row.achievement}
            disabled={Boolean(isEffectivelyReadOnly)}
            placeholder={goal.uom === "zero_based" ? "0" : "Enter value"}
            onChange={(e) =>
              onChange({
                achievement: e.target.value === "" ? "" : Number(e.target.value),
              })
            }
          />
        )}
        {isNonPrimaryShared && (
          <p className="mt-1 text-xs text-muted-foreground font-medium text-blue-600 dark:text-blue-400">
            {row.status ? "Synced from team KPI owner" : "Pending — waiting for owner to submit"}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-sm text-muted-foreground">Status</label>
        <Select
          value={row.status || null}
          onValueChange={(value) =>
            onChange({ status: (value ?? "") as CheckinRowState["status"] })
          }
          disabled={Boolean(isEffectivelyReadOnly)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 md:col-span-2">
        <span className="text-sm text-muted-foreground">Score:</span>
        <ScoreDisplay score={score} />
        <ScoreFormulaHint uom={goal.uom} scoreDirection={goal.score_direction} />
      </div>
    </div>
  );
}
