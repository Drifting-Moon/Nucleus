import { CHECKIN_QUARTERS, formatDateOnly, type CheckinQuarter } from "@/lib/get-active-window";
import { isQuarterSubmitted } from "@/lib/employee-workflow";

export type EscalationRuleType =
  | "goal_submission_overdue"
  | "manager_approval_overdue"
  | "checkin_overdue";

export type EscalationStage = "employee" | "manager" | "hr";

export type EscalationRuleConfig = {
  type: EscalationRuleType;
  label: string;
  days: number;
  enabled: boolean;
};

export type EscalationLogEntry = {
  id: string;
  ruleType: EscalationRuleType;
  ruleLabel: string;
  stage: EscalationStage;
  subjectId: string;
  subjectName: string;
  subjectDepartment: string | null;
  managerName: string | null;
  quarter: CheckinQuarter | "goal_setting" | null;
  daysOverdue: number;
  message: string;
  nextRecipient: string;
  status: "open" | "monitoring";
};

export type EscalationSummary = {
  totalOpen: number;
  employeeStage: number;
  managerStage: number;
  hrStage: number;
  monitoring: number;
};

export type EscalationResult = {
  rules: EscalationRuleConfig[];
  logs: EscalationLogEntry[];
  summary: EscalationSummary;
};

export const DEFAULT_ESCALATION_RULES: EscalationRuleConfig[] = [
  {
    type: "goal_submission_overdue",
    label: "Goal submission overdue",
    days: 3,
    enabled: true,
  },
  {
    type: "manager_approval_overdue",
    label: "Manager approval overdue",
    days: 2,
    enabled: true,
  },
  {
    type: "checkin_overdue",
    label: "Quarterly check-in overdue",
    days: 1,
    enabled: true,
  },
];

export type EscalationUserInput = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  department: string | null;
  manager_id: string | null;
};

export type EscalationGoalInput = {
  id: string;
  user_id: string;
  status: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type EscalationUpdateInput = {
  goal_id: string;
  quarter: string;
  submitted_at: string | null;
};

export type EscalationWindowInput = {
  quarter_name: string;
  start_date: string;
  end_date: string;
};

export type EscalationEvaluationInput = {
  users: EscalationUserInput[];
  goals: EscalationGoalInput[];
  updates: EscalationUpdateInput[];
  windows: EscalationWindowInput[];
  todayIso: string;
};

function daysBetween(start: string, end: string): number {
  const startDate = new Date(`${start}T00:00:00.000Z`);
  const endDate = new Date(`${end}T00:00:00.000Z`);
  return Math.max(0, Math.floor((endDate.getTime() - startDate.getTime()) / 86_400_000));
}

function dateOnly(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.slice(0, 10);
}

function displayName(user: Pick<EscalationUserInput, "name" | "email"> | undefined): string {
  return user?.name || user?.email || "Unknown";
}

function escalationStage(daysOverdue: number, intervalDays: number): EscalationStage {
  if (daysOverdue >= intervalDays * 2) return "hr";
  if (daysOverdue >= intervalDays) return "manager";
  return "employee";
}

function nextRecipient(stage: EscalationStage, managerName: string | null): string {
  if (stage === "hr") return "HR / skip-level";
  if (stage === "manager") return managerName ?? "Manager";
  return "Employee";
}

function buildSummary(logs: EscalationLogEntry[]): EscalationSummary {
  return {
    totalOpen: logs.filter((log) => log.status === "open").length,
    employeeStage: logs.filter((log) => log.stage === "employee").length,
    managerStage: logs.filter((log) => log.stage === "manager").length,
    hrStage: logs.filter((log) => log.stage === "hr").length,
    monitoring: logs.filter((log) => log.status === "monitoring").length,
  };
}

export function buildEscalationData(
  users: EscalationUserInput[],
  goals: EscalationGoalInput[],
  updates: EscalationUpdateInput[],
  windows: EscalationWindowInput[],
  rules: EscalationRuleConfig[] = DEFAULT_ESCALATION_RULES,
  today: Date = new Date()
): EscalationResult {
  const todayStr = formatDateOnly(today);
  const ruleByType = new Map(rules.map((rule) => [rule.type, rule]));
  const employees = users.filter((user) => user.role === "employee");
  const userById = new Map(users.map((user) => [user.id, user]));
  const logs: EscalationLogEntry[] = [];

  const goalSubmissionRule = ruleByType.get("goal_submission_overdue");
  const goalSettingWindow = windows.find((window) => window.quarter_name === "goal_setting");

  if (goalSubmissionRule?.enabled && goalSettingWindow && todayStr >= goalSettingWindow.start_date) {
    const triggerDate = new Date(`${goalSettingWindow.start_date}T00:00:00.000Z`);
    triggerDate.setUTCDate(triggerDate.getUTCDate() + goalSubmissionRule.days);
    const triggerDateStr = formatDateOnly(triggerDate);

    if (todayStr >= triggerDateStr) {
      for (const employee of employees) {
        const memberGoals = goals.filter((goal) => goal.user_id === employee.id);
        const hasSubmitted = memberGoals.some((goal) =>
          ["submitted", "approved", "locked", "rejected"].includes(goal.status)
        );

        if (hasSubmitted) continue;

        const manager = employee.manager_id ? userById.get(employee.manager_id) : undefined;
        const daysOverdue = daysBetween(triggerDateStr, todayStr);
        const stage = escalationStage(daysOverdue, goalSubmissionRule.days);

        logs.push({
          id: `${goalSubmissionRule.type}-${employee.id}`,
          ruleType: goalSubmissionRule.type,
          ruleLabel: goalSubmissionRule.label,
          stage,
          subjectId: employee.id,
          subjectName: displayName(employee),
          subjectDepartment: employee.department,
          managerName: manager ? displayName(manager) : null,
          quarter: "goal_setting",
          daysOverdue,
          message: "Goals have not been submitted after the cycle opened.",
          nextRecipient: nextRecipient(stage, manager ? displayName(manager) : null),
          status: "open",
        });
      }
    }
  }

  const managerApprovalRule = ruleByType.get("manager_approval_overdue");

  if (managerApprovalRule?.enabled) {
    const submittedGoals = goals.filter((goal) => goal.status === "submitted");

    for (const goal of submittedGoals) {
      const submittedDate = dateOnly(goal.updated_at ?? goal.created_at);
      if (!submittedDate) continue;

      const triggerDate = new Date(`${submittedDate}T00:00:00.000Z`);
      triggerDate.setUTCDate(triggerDate.getUTCDate() + managerApprovalRule.days);
      const triggerDateStr = formatDateOnly(triggerDate);
      if (todayStr < triggerDateStr) continue;

      const employee = userById.get(goal.user_id);
      const manager = employee?.manager_id ? userById.get(employee.manager_id) : undefined;
      const daysOverdue = daysBetween(triggerDateStr, todayStr);
      const stage = escalationStage(daysOverdue, managerApprovalRule.days);

      logs.push({
        id: `${managerApprovalRule.type}-${goal.id}`,
        ruleType: managerApprovalRule.type,
        ruleLabel: managerApprovalRule.label,
        stage,
        subjectId: goal.user_id,
        subjectName: displayName(employee),
        subjectDepartment: employee?.department ?? null,
        managerName: manager ? displayName(manager) : null,
        quarter: "goal_setting",
        daysOverdue,
        message: "Submitted goals are waiting for manager approval.",
        nextRecipient: nextRecipient(stage, manager ? displayName(manager) : null),
        status: "open",
      });
    }
  }

  const checkinRule = ruleByType.get("checkin_overdue");

  if (checkinRule?.enabled) {
    for (const quarter of CHECKIN_QUARTERS) {
      const window = windows.find((item) => item.quarter_name === quarter);
      if (!window || todayStr < window.start_date) continue;

      const triggerDate = new Date(`${window.end_date}T00:00:00.000Z`);
      triggerDate.setUTCDate(triggerDate.getUTCDate() + checkinRule.days);
      const triggerDateStr = formatDateOnly(triggerDate);
      const monitoring = todayStr <= window.end_date;

      if (!monitoring && todayStr < triggerDateStr) continue;

      for (const employee of employees) {
        const memberGoals = goals.filter((goal) => goal.user_id === employee.id);
        const approvedGoalIds = memberGoals
          .filter((goal) => goal.status === "approved" || goal.status === "locked")
          .map((goal) => goal.id);

        if (approvedGoalIds.length === 0) continue;
        if (!memberGoals.every((goal) => goal.status === "approved" || goal.status === "locked")) {
          continue;
        }
        if (isQuarterSubmitted(quarter, approvedGoalIds, updates, memberGoals)) continue;

        const manager = employee.manager_id ? userById.get(employee.manager_id) : undefined;
        const daysOverdue = monitoring ? 0 : daysBetween(triggerDateStr, todayStr);
        const stage = monitoring ? "employee" : escalationStage(daysOverdue, checkinRule.days);

        logs.push({
          id: `${checkinRule.type}-${quarter}-${employee.id}`,
          ruleType: checkinRule.type,
          ruleLabel: checkinRule.label,
          stage,
          subjectId: employee.id,
          subjectName: displayName(employee),
          subjectDepartment: employee.department,
          managerName: manager ? displayName(manager) : null,
          quarter,
          daysOverdue,
          message: monitoring
            ? "Active check-in window is open and completion is still pending."
            : "Quarterly check-in was not completed within the defined window.",
          nextRecipient: nextRecipient(stage, manager ? displayName(manager) : null),
          status: monitoring ? "monitoring" : "open",
        });
      }
    }
  }

  logs.sort((a, b) => {
    if (a.status !== b.status) return a.status === "open" ? -1 : 1;
    if (a.stage !== b.stage) {
      const weight: Record<EscalationStage, number> = { hr: 0, manager: 1, employee: 2 };
      return weight[a.stage] - weight[b.stage];
    }
    return b.daysOverdue - a.daysOverdue;
  });

  return {
    rules,
    logs,
    summary: buildSummary(logs),
  };
}
