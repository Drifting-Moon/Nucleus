"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase";
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
  const [savingQuarter, setSavingQuarter] = useState<string | null>(null);

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
      }
    }

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
        {rows.map((row) => (
          <div
            key={row.quarter_name}
            className="grid gap-3 rounded-lg border p-4 md:grid-cols-[1fr_auto_auto_auto] md:items-end"
          >
            <div>
              <p className="font-medium">{row.label}</p>
              <p className="text-sm text-muted-foreground">{row.hint}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground" htmlFor={`${row.quarter_name}-start`}>
                Start
              </label>
              <Input
                id={`${row.quarter_name}-start`}
                type="date"
                value={row.start_date}
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
                onChange={(e) => updateRow(row.quarter_name, { end_date: e.target.value })}
              />
            </div>
            <Button
              type="button"
              onClick={() => saveRow(row)}
              disabled={savingQuarter === row.quarter_name}
            >
              {savingQuarter === row.quarter_name ? "Saving…" : "Save"}
            </Button>
          </div>
        ))}

      </CardContent>
    </Card>
  );
}
