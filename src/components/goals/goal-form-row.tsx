"use client";

import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type GoalDraft = {
  id?: string;
  thrust_area: string;
  title: string;
  description: string;
  weightage: number | "";
  uom: string;
  target: number | "";
  target_date: string;
  is_shared: boolean;
  status: string;
};

type GoalFormRowProps = {
  goal: GoalDraft;
  index: number;
  onChange: (index: number, goal: GoalDraft) => void;
  onDelete: (index: number) => void;
};

const uomOptions = [
  { value: "number", label: "Number" },
  { value: "percentage", label: "Percentage" },
  { value: "timeline", label: "Timeline" },
  { value: "zero_based", label: "Zero-based" },
];

const thrustAreaOptions = [
  { value: "business", label: "Business" },
  { value: "customer", label: "Customer" },
  { value: "operations", label: "Operations" },
  { value: "people", label: "People" },
  { value: "compliance", label: "Compliance" },
];

export function GoalFormRow({
  goal,
  index,
  onChange,
  onDelete,
}: GoalFormRowProps) {
  const updateGoal = (updates: Partial<GoalDraft>) => {
    onChange(index, { ...goal, ...updates });
  };

  const parseNumber = (value: string) => {
    if (value === "") {
      return "";
    }

    return Number(value);
  };

  return (
    <div className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[150px_minmax(180px,1fr)_150px_140px_120px_auto] md:items-end">
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-muted-foreground">
          Thrust Area
        </label>
        <Select
          value={goal.thrust_area || null}
          onValueChange={(value) => updateGoal({ thrust_area: value ?? "" })}
        >
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
        <div className="flex min-h-5 items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground">
            Title
          </label>
          {goal.is_shared && <Badge variant="outline">Shared Goal</Badge>}
        </div>
        <Input
          value={goal.title}
          placeholder="Goal title"
          disabled={goal.is_shared}
          onChange={(event) => updateGoal({ title: event.target.value })}
        />
        <Input
          value={goal.description}
          placeholder="Brief description"
          onChange={(event) => updateGoal({ description: event.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-muted-foreground">
          UoM
        </label>
        <Select
          value={goal.uom || null}
          onValueChange={(value) => updateGoal({ uom: value ?? "" })}
        >
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
        <label className="block text-xs font-medium text-muted-foreground">
          Target
        </label>
        <Input
          type={goal.uom === "timeline" ? "date" : "number"}
          min={goal.uom === "timeline" ? undefined : "0"}
          value={goal.uom === "timeline" ? goal.target_date : goal.target}
          placeholder={goal.uom === "timeline" ? undefined : "100"}
          disabled={goal.is_shared}
          onChange={(event) =>
            goal.uom === "timeline"
              ? updateGoal({ target: "", target_date: event.target.value })
              : updateGoal({ target: parseNumber(event.target.value), target_date: "" })
          }
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-muted-foreground">
          Weightage
        </label>
        <Input
          type="number"
          min="10"
          max="100"
          value={goal.weightage}
          onChange={(event) => updateGoal({ weightage: event.target.value === "" ? "" : Number(event.target.value) })}
        />
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Delete goal"
        onClick={() => onDelete(index)}
      >
        <Trash2 />
      </Button>
    </div>
  );
}
