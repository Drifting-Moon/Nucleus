"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase";
import { writeAuditLog } from "@/lib/write-audit-log";

export type PushSharedGoalEmployee = {
  id: string;
  name: string;
  email: string;
  department: string | null;
  hasLockedGoals: boolean;
};

type PushSharedGoalFormProps = {
  adminId: string;
  employees: PushSharedGoalEmployee[];
};

const uomOptions = [
  { value: "number", label: "Number" },
  { value: "percentage", label: "Percentage" },
  { value: "timeline", label: "Timeline" },
  { value: "zero_based", label: "Zero-based" },
] as const;

const thrustAreaOptions = [
  { value: "business", label: "Business" },
  { value: "customer", label: "Customer" },
  { value: "operations", label: "Operations" },
  { value: "people", label: "People" },
  { value: "compliance", label: "Compliance" },
] as const;

export function PushSharedGoalForm({ adminId, employees }: PushSharedGoalFormProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thrustArea, setThrustArea] = useState("");
  const [uom, setUom] = useState("");
  const [target, setTarget] = useState<number | "">("");
  const [targetDate, setTargetDate] = useState("");
  const [weightage, setWeightage] = useState<number | "">(10);
  const [scoreDirection, setScoreDirection] = useState<"higher" | "lower">("higher");
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("");

  const eligibleEmployees = useMemo(
    () => employees.filter((employee) => !employee.hasLockedGoals),
    [employees]
  );

  const filteredEmployees = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return eligibleEmployees;
    return eligibleEmployees.filter(
      (employee) =>
        employee.name.toLowerCase().includes(query) ||
        employee.email.toLowerCase().includes(query) ||
        (employee.department ?? "").toLowerCase().includes(query)
    );
  }, [eligibleEmployees, filter]);

  const toggleEmployee = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelectedIds(new Set(filteredEmployees.map((employee) => employee.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const validate = () => {
    if (selectedIds.size === 0) {
      return "Select at least one employee";
    }
    if (!title.trim()) {
      return "Title is required";
    }
    if (!thrustArea) {
      return "Thrust area is required";
    }
    if (!uom) {
      return "Unit of measurement is required";
    }
    if (uom === "timeline" && !targetDate) {
      return "Timeline goals need a target date";
    }
    if (uom !== "timeline" && target === "") {
      return "Target is required";
    }
    if (weightage === "" || weightage < 10 || weightage > 100) {
      return "Weightage must be between 10 and 100";
    }
    return null;
  };

  const handlePush = async () => {
    const validationError = validate();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const rows = [...selectedIds].map((userId) => ({
      user_id: userId,
      title: title.trim(),
      description: description.trim() || null,
      thrust_area: thrustArea,
      uom,
      target: uom === "timeline" ? null : target,
      target_date: uom === "timeline" ? targetDate : null,
      weightage,
      is_shared: true,
      status: "draft" as const,
      score_direction: uom === "zero_based" ? "higher" : scoreDirection,
    }));

    const { data, error } = await supabase.from("goals").insert(rows).select("id, user_id");

    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }

    await Promise.all(
      (data ?? []).map((goal) =>
        writeAuditLog({
          changedBy: adminId,
          goalId: goal.id,
          fieldChanged: "shared_goal_assigned",
          oldValue: null,
          newValue: title.trim(),
        })
      )
    );

    toast.success(`Shared goal assigned to ${data?.length ?? selectedIds.size} employee(s)`);
    setSelectedIds(new Set());
    setTitle("");
    setDescription("");
    setSaving(false);
    router.refresh();
  };

  const lockedCount = employees.length - eligibleEmployees.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Push shared goal</CardTitle>
        <CardDescription>
          Assign a forced KPI to selected employees. Title and target are locked on their goal
          sheet; they can adjust weightage only (must still total 100% before submit).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-medium">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="KPI title" />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-medium">Description (optional)</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Thrust area</label>
            <Select value={thrustArea || null} onValueChange={(value) => setThrustArea(value ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {thrustAreaOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">UoM</label>
            <Select value={uom || null} onValueChange={(value) => setUom(value ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {uomOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Target</label>
            {uom === "timeline" ? (
              <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
            ) : (
              <Input
                type="number"
                min="0"
                value={target}
                onChange={(e) =>
                  setTarget(e.target.value === "" ? "" : Number(e.target.value))
                }
              />
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Default weightage (%)</label>
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
          {uom && uom !== "zero_based" ? (
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-medium">Score direction</label>
              <Select
                value={scoreDirection}
                onValueChange={(value) =>
                  setScoreDirection((value as "higher" | "lower") ?? "higher")
                }
              >
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="higher">Higher is better (achievement ÷ target)</SelectItem>
                  <SelectItem value="lower">Lower is better (target ÷ achievement)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>

        <div className="space-y-3 border-t pt-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">Select employees</p>
              <p className="text-sm text-muted-foreground">
                {selectedIds.size} selected · {eligibleEmployees.length} eligible
                {lockedCount > 0
                  ? ` · ${lockedCount} skipped (goals already locked for this cycle)`
                  : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={selectAllFiltered}>
                Select visible
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={clearSelection}>
                Clear
              </Button>
            </div>
          </div>
          <Input
            placeholder="Filter by name, email, or department"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <div className="max-h-56 space-y-2 overflow-y-auto rounded-lg border p-3">
            {filteredEmployees.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No eligible employees. Employees with locked goals cannot receive new shared goals
                until Admin unlocks their sheet.
              </p>
            ) : (
              filteredEmployees.map((employee) => (
                <label
                  key={employee.id}
                  className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50"
                >
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={selectedIds.has(employee.id)}
                    onChange={() => toggleEmployee(employee.id)}
                  />
                  <span className="text-sm">
                    <span className="font-medium">{employee.name}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      · {employee.department || "No department"} · {employee.email}
                    </span>
                  </span>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end border-t pt-4">
          <Button type="button" onClick={handlePush} disabled={saving}>
            {saving ? "Assigning…" : "Push shared goal"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
