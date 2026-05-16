"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Clock,
  Route,
  Settings2,
  ShieldAlert,
  UserRoundCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import type {
  EscalationEvaluationInput,
  EscalationLogEntry,
  EscalationResult,
  EscalationRuleConfig,
  EscalationRuleType,
  EscalationStage,
} from "@/lib/admin/escalation-data";
import { buildEscalationData } from "@/lib/admin/escalation-data";

type EscalationCenterProps = {
  initialData: EscalationResult;
  evaluationInput: EscalationEvaluationInput;
};

const ruleHelp: Record<EscalationRuleType, string> = {
  goal_submission_overdue: "Employee has not submitted goals after cycle open.",
  manager_approval_overdue: "Manager has not approved submitted goals in time.",
  checkin_overdue: "Quarterly check-in is pending during or after a quarter window.",
};

const stageStyles: Record<EscalationStage, string> = {
  employee: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  manager: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  hr: "border-destructive/30 bg-destructive/10 text-destructive",
};

function stageLabel(stage: EscalationStage) {
  if (stage === "hr") return "Skip-level / HR";
  if (stage === "manager") return "Manager";
  return "Employee";
}

function SummaryCard({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string;
  value: number;
  detail: string;
  icon: typeof AlertTriangle;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
          <Icon className="size-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

function RuleCard({
  rule,
  onChangeDays,
  onToggle,
}: {
  rule: EscalationRuleConfig;
  onChangeDays: (type: EscalationRuleType, days: number) => void;
  onToggle: (type: EscalationRuleType) => void;
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{rule.label}</p>
            <Badge variant={rule.enabled ? "secondary" : "outline"}>
              {rule.enabled ? "Enabled" : "Paused"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{ruleHelp[rule.type]}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => onToggle(rule.type)}>
          {rule.enabled ? "Pause" : "Enable"}
        </Button>
      </div>
      <label className="mt-4 block text-xs font-medium text-muted-foreground">
        Trigger after days
      </label>
      <Input
        className="mt-1 w-24"
        min={0}
        max={30}
        type="number"
        value={rule.days}
        onChange={(event) => onChangeDays(rule.type, Number(event.target.value))}
      />
    </div>
  );
}

function ChainPreview() {
  const stages = [
    { label: "Employee", icon: UserRoundCheck },
    { label: "Manager", icon: BellRing },
    { label: "Skip-level / HR", icon: ShieldAlert },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Route className="size-4" />
          Escalation chain
        </CardTitle>
        <CardDescription>
          Notifications move through the chain as each rule remains unresolved.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-3">
          {stages.map((stage, index) => (
            <div key={stage.label} className="relative rounded-lg border bg-muted/20 p-4">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-md bg-background">
                  <stage.icon className="size-4 text-muted-foreground" />
                </div>
                <p className="font-medium">{stage.label}</p>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Level {index + 1} reminder and ownership checkpoint.
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function EscalationLogTable({ logs }: { logs: EscalationLogEntry[] }) {
  if (logs.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        No escalation items match this view.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[880px] text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">Employee</th>
            <th className="pb-2 pr-4 font-medium">Rule</th>
            <th className="pb-2 pr-4 font-medium">Stage</th>
            <th className="pb-2 pr-4 font-medium">Next recipient</th>
            <th className="pb-2 pr-4 font-medium">Age</th>
            <th className="pb-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b last:border-0">
              <td className="py-3 pr-4">
                <div>
                  <p className="font-medium">{log.subjectName}</p>
                  <p className="text-xs text-muted-foreground">
                    {log.subjectDepartment || "No department"} · Manager: {log.managerName || "Unassigned"}
                  </p>
                </div>
              </td>
              <td className="py-3 pr-4">
                <p className="font-medium">{log.ruleLabel}</p>
                <p className="text-xs text-muted-foreground">{log.message}</p>
              </td>
              <td className="py-3 pr-4">
                <span
                  className={cn(
                    "inline-flex rounded-full border px-2 py-1 text-xs font-medium",
                    stageStyles[log.stage]
                  )}
                >
                  {stageLabel(log.stage)}
                </span>
              </td>
              <td className="py-3 pr-4">{log.nextRecipient}</td>
              <td className="py-3 pr-4">
                {log.status === "monitoring" ? "In window" : `${log.daysOverdue} day${log.daysOverdue === 1 ? "" : "s"}`}
              </td>
              <td className="py-3">
                <Badge variant={log.status === "open" ? "destructive" : "secondary"}>
                  {log.status === "open" ? "Open" : "Monitoring"}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function EscalationCenter({ initialData, evaluationInput }: EscalationCenterProps) {
  const [rules, setRules] = useState(initialData.rules);
  const [stageFilter, setStageFilter] = useState<EscalationStage | "all">("all");

  const evaluatedData = useMemo(
    () =>
      buildEscalationData(
        evaluationInput.users,
        evaluationInput.goals,
        evaluationInput.updates,
        evaluationInput.windows,
        rules,
        new Date(evaluationInput.todayIso)
      ),
    [evaluationInput, rules]
  );

  const logs = useMemo(() => {
    return evaluatedData.logs.filter((log) => {
      if (stageFilter !== "all" && log.stage !== stageFilter) return false;
      return true;
    });
  }, [evaluatedData.logs, stageFilter]);

  const summary = useMemo(
    () => ({
      totalOpen: logs.filter((log) => log.status === "open").length,
      managerStage: logs.filter((log) => log.stage === "manager").length,
      hrStage: logs.filter((log) => log.stage === "hr").length,
      monitoring: logs.filter((log) => log.status === "monitoring").length,
    }),
    [logs]
  );

  const updateDays = (type: EscalationRuleType, days: number) => {
    setRules((current) =>
      current.map((rule) =>
        rule.type === type ? { ...rule, days: Number.isFinite(days) ? Math.max(0, days) : 0 } : rule
      )
    );
  };

  const toggleRule = (type: EscalationRuleType) => {
    setRules((current) =>
      current.map((rule) =>
        rule.type === type ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Escalation module</h2>
        <p className="text-sm text-muted-foreground">
          Rule-based reminders for overdue goal submission, manager approval, and quarterly check-ins.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Open escalations"
          value={summary.totalOpen}
          detail="Requires action or follow-up"
          icon={AlertTriangle}
        />
        <SummaryCard
          title="Manager stage"
          value={summary.managerStage}
          detail="Routed to reporting manager"
          icon={BellRing}
        />
        <SummaryCard
          title="HR stage"
          value={summary.hrStage}
          detail="Skip-level or HR visibility"
          icon={ShieldAlert}
        />
        <SummaryCard
          title="Monitoring"
          value={summary.monitoring}
          detail="Inside active check-in window"
          icon={Clock}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings2 className="size-4" />
              Configurable rules
            </CardTitle>
            <CardDescription>
              Demo thresholds are editable in this session; defaults come from the rule engine.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 lg:grid-cols-3">
            {rules.map((rule) => (
              <RuleCard
                key={rule.type}
                rule={rule}
                onChangeDays={updateDays}
                onToggle={toggleRule}
              />
            ))}
          </CardContent>
        </Card>

        <ChainPreview />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="size-4" />
              Escalation log
            </CardTitle>
            <CardDescription>
              Admin / HR tracking view for ownership, stage, and resolution follow-up.
            </CardDescription>
          </div>
          <div className="w-full sm:w-52">
            <label className="mb-1 block text-xs text-muted-foreground">Stage</label>
            <Select
              value={stageFilter}
              onValueChange={(value) => setStageFilter((value as EscalationStage | "all") ?? "all")}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stages</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="hr">Skip-level / HR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <EscalationLogTable logs={logs} />
        </CardContent>
      </Card>
    </div>
  );
}
