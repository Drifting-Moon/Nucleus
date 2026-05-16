"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type QuarterWindowRecord = {
  id: string;
  quarter_name: string;
  start_date: string;
  end_date: string;
};

type QuarterWindowFormProps = {
  windows: QuarterWindowRecord[];
  adminId: string;
};

const QUARTER_DEFS = [
  { quarter_name: "goal_setting", label: "Goal Setting", hint: "Typically May" },
  { quarter_name: "q1", label: "Q1 Update", hint: "Typically July" },
  { quarter_name: "q2", label: "Q2 Update", hint: "Typically October" },
  { quarter_name: "q3", label: "Q3 Update", hint: "Typically January" },
  { quarter_name: "annual", label: "Annual Review", hint: "Typically March–April" },
] as const;

type WindowRow = {
  id: string | null;
  quarter_name: string;
  label: string;
  hint: string;
  start_date: string;
  end_date: string;
};

function buildRows(windows: QuarterWindowRecord[]): WindowRow[] {
  return QUARTER_DEFS.map((def) => {
    const existing = windows.find((w) => w.quarter_name === def.quarter_name);
    return {
      id: existing?.id ?? null,
      quarter_name: def.quarter_name,
      label: def.label,
      hint: def.hint,
      start_date: existing?.start_date ?? "",
      end_date: existing?.end_date ?? "",
    };
  });
}

export function QuarterWindowForm({ windows, adminId }: QuarterWindowFormProps) {
  const [rows, setRows] = useState(() => buildRows(windows));
  const [savedRows, setSavedRows] = useState(() => buildRows(windows));
  const [savingQuarter, setSavingQuarter] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  const updateRow = (quarterName: string, updates: Partial<Pick<WindowRow, "start_date" | "end_date">>) => {
    setRows((current) =>
      current.map((row) =>
        row.quarter_name === quarterName ? { ...row, ...updates } : row
      )
    );
  };

  const saveRow = async (row: WindowRow) => {
    if (!row.start_date || !row.end_date) {
      toast.error(`Set both dates for ${row.label}.`);
      return;
    }

    if (row.end_date < row.start_date) {
      toast.error(`End date must be on or after start date for ${row.label}.`);
      return;
    }

    setSavingQuarter(row.quarter_name);

    const supabase = createClient();
    let savedId = row.id;
    const payload = {
      quarter_name: row.quarter_name,
      start_date: row.start_date,
      end_date: row.end_date,
      created_by: adminId,
    };

    if (row.id) {
      const { error: updateError } = await supabase
        .from("quarter_windows")
        .update({
          start_date: row.start_date,
          end_date: row.end_date,
        })
        .eq("id", row.id);

      if (updateError) {
        toast.error(updateError.message);
        setSavingQuarter(null);
        return;
      }
    } else {
      const { data: existing } = await supabase
        .from("quarter_windows")
        .select("id")
        .eq("quarter_name", row.quarter_name)
        .maybeSingle();

      if (existing?.id) {
        const { error: updateError } = await supabase
          .from("quarter_windows")
          .update({
            start_date: row.start_date,
            end_date: row.end_date,
          })
          .eq("id", existing.id);

        if (updateError) {
          toast.error(updateError.message);
          setSavingQuarter(null);
          return;
        }

        setRows((current) =>
          current.map((item) =>
            item.quarter_name === row.quarter_name ? { ...item, id: existing.id } : item
          )
        );
        savedId = existing.id;
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from("quarter_windows")
          .insert(payload)
          .select("id")
          .single();

        if (insertError) {
          toast.error(insertError.message);
          setSavingQuarter(null);
          return;
        }

        setRows((current) =>
          current.map((item) =>
            item.quarter_name === row.quarter_name
              ? { ...item, id: inserted.id }
              : item
          )
        );
        savedId = inserted.id;
      }
    }

    const savedRow = { ...row, id: savedId };
    setRows((current) =>
      current.map((item) =>
        item.quarter_name === row.quarter_name ? savedRow : item
      )
    );
    setSavedRows((current) =>
      current.map((item) =>
        item.quarter_name === row.quarter_name ? savedRow : item
      )
    );
    toast.success(`${row.label} saved`);
    setSavingQuarter(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quarter Windows</CardTitle>
        <CardDescription>
          Set start and end dates for each cycle. Employees check in during open Q1–Annual windows. If
          multiple quarters overlap, the app uses Q1 → Q2 → Q3 → Annual priority (matches the workflow
          stepper).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.map((row) => {
          const savedRow = savedRows.find((item) => item.quarter_name === row.quarter_name);
          const isDirty =
            row.start_date !== savedRow?.start_date || row.end_date !== savedRow?.end_date;
          const isActive =
            Boolean(row.start_date && row.end_date) &&
            today >= row.start_date &&
            today <= row.end_date;
          const isError =
            Boolean(row.start_date && row.end_date) && row.start_date > row.end_date;
          const isIncomplete = !row.start_date || !row.end_date;
          const isSaving = savingQuarter === row.quarter_name;
          const disabled = isSaving || !isDirty || isError || isIncomplete;
          const buttonLabel = isSaving
            ? "Saving…"
            : !isDirty
              ? "Saved"
              : isError
                ? "Fix dates"
                : isIncomplete
                  ? "Set dates"
                  : "Save";

          return (
            <div
              key={row.quarter_name}
              className={cn(
                "grid gap-3 rounded-lg border p-4 transition-colors md:grid-cols-[1fr_auto_auto_auto] md:items-end",
                isActive && "border-emerald-500/40 bg-emerald-500/5",
                isError && "border-destructive/50 bg-destructive/5"
              )}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{row.label}</p>
                  {isActive ? (
                    <Badge className="bg-emerald-500 text-white hover:bg-emerald-500">
                      Active Now
                    </Badge>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">{row.hint}</p>
                {isError ? (
                  <p className="mt-1 text-xs font-medium text-destructive">
                    End date must be on or after start date.
                  </p>
                ) : null}
              </div>
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground" htmlFor={`${row.quarter_name}-start`}>
                  Start
                </label>
                <Input
                  id={`${row.quarter_name}-start`}
                  type="date"
                  value={row.start_date}
                  className={cn(isError && "border-destructive focus-visible:ring-destructive/30")}
                  onChange={(e) => updateRow(row.quarter_name, { start_date: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground" htmlFor={`${row.quarter_name}-end`}>
                  End
                </label>
                <Input
                  id={`${row.quarter_name}-end`}
                  type="date"
                  value={row.end_date}
                  className={cn(isError && "border-destructive focus-visible:ring-destructive/30")}
                  onChange={(e) => updateRow(row.quarter_name, { end_date: e.target.value })}
                />
              </div>
              <Button
                type="button"
                variant={isDirty && !isError && !isIncomplete ? "default" : "secondary"}
                onClick={() => saveRow(row)}
                disabled={disabled}
              >
                {buttonLabel}
              </Button>
            </div>
          );
        })}

      </CardContent>
    </Card>
  );
}
