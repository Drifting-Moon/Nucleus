"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase";
import { writeAuditLog } from "@/lib/write-audit-log";
import { toast } from "sonner";

export type UnlockGoal = {
  id: string;
  title: string | null;
  uom: string | null;
  target: number | null;
  target_date: string | null;
  weightage: number | null;
  status: string | null;
};

type UnlockDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: UnlockGoal | null;
  adminId: string;
  onSaved: () => void;
};

export function UnlockDialog({ open, onOpenChange, goal, adminId, onSaved }: UnlockDialogProps) {
  const [target, setTarget] = useState<number | "">("");
  const [targetDate, setTargetDate] = useState("");
  const [weightage, setWeightage] = useState<number | "">("");
  const [saving, setSaving] = useState(false);

  const resetForm = (g: UnlockGoal | null) => {
    if (!g) return;
    setTarget(g.target ?? "");
    setTargetDate(g.target_date ?? "");
    setWeightage(g.weightage ?? "");
  };

  const handleOpenChange = (next: boolean) => {
    if (next && goal) resetForm(goal);
    onOpenChange(next);
  };

  const handleSave = async () => {
    if (!goal) return;

    if (weightage === "" || weightage < 10 || weightage > 100) {
      toast.error("Weightage must be between 10 and 100");
      return;
    }

    if (goal.uom === "timeline" && !targetDate) {
      toast.error("Timeline goals need a target date");
      return;
    }

    if (goal.uom !== "timeline" && target === "") {
      toast.error("Enter a target value");
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const payload = {
      target: goal.uom === "timeline" ? null : target,
      target_date: goal.uom === "timeline" ? targetDate : null,
      weightage,
      status: "locked" as const,
      is_locked: true,
    };

    const { error } = await supabase.from("goals").update(payload).eq("id", goal.id);

    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }

    const audits: Parameters<typeof writeAuditLog>[0][] = [];

    if (String(goal.target ?? "") !== String(payload.target ?? "")) {
      audits.push({
        changedBy: adminId,
        goalId: goal.id,
        fieldChanged: "target",
        oldValue: goal.target !== null ? String(goal.target) : null,
        newValue: payload.target !== null ? String(payload.target) : null,
      });
    }

    if ((goal.target_date ?? "") !== (payload.target_date ?? "")) {
      audits.push({
        changedBy: adminId,
        goalId: goal.id,
        fieldChanged: "target_date",
        oldValue: goal.target_date,
        newValue: payload.target_date,
      });
    }

    if (goal.weightage !== weightage) {
      audits.push({
        changedBy: adminId,
        goalId: goal.id,
        fieldChanged: "weightage",
        oldValue: goal.weightage !== null ? String(goal.weightage) : null,
        newValue: String(weightage),
      });
    }

    await Promise.all(audits.map((entry) => writeAuditLog(entry)));

    toast.success("Goal updated and re-locked");
    setSaving(false);
    onOpenChange(false);
    onSaved();
  };

  if (!goal) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit locked goal</DialogTitle>
          <DialogDescription>
            Changes to &quot;{goal.title || "Untitled"}&quot; will be logged in the audit trail.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {goal.uom === "timeline" ? (
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Target date</label>
              <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Target</label>
              <Input
                type="number"
                min="0"
                value={target}
                onChange={(e) =>
                  setTarget(e.target.value === "" ? "" : Number(e.target.value))
                }
              />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Weightage (%)</label>
            <Input
              type="number"
              min="10"
              max="100"
              value={weightage}
              onChange={(e) =>
                setWeightage(e.target.value === "" ? "" : Number(e.target.value))
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save & re-lock"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
