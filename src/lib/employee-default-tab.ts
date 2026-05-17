import type { EmployeeTabId } from "@/components/employee/employee-tabs";
import type { CheckinQuarter } from "@/lib/get-active-window";

export function getEmployeeDefaultTab(options: {
  goalSettingOpen: boolean;
  canCheckIn: boolean;
  hasActiveCheckinWindow: boolean;
  activeQuarter: CheckinQuarter | null;
  quarterSubmitted: Record<CheckinQuarter, boolean>;
  allGoalsLocked: boolean;
  hasDraftOrRejected: boolean;
  hasSubmittedPending: boolean;
  feedbackCount: number;
}): EmployeeTabId {
  if (
    options.canCheckIn &&
    options.hasActiveCheckinWindow &&
    options.activeQuarter &&
    !options.quarterSubmitted[options.activeQuarter]
  ) {
    return "checkins";
  }

  if (
    options.goalSettingOpen &&
    (!options.allGoalsLocked || options.hasDraftOrRejected || options.hasSubmittedPending)
  ) {
    return "goals";
  }

  return "overview";
}

export function getEmployeeTabBadges(options: {
  goalSettingOpen: boolean;
  allGoalsLocked: boolean;
  hasDraftOrRejected: boolean;
  canCheckIn: boolean;
  hasActiveCheckinWindow: boolean;
  activeQuarter: CheckinQuarter | null;
  quarterSubmitted: Record<CheckinQuarter, boolean>;
  feedbackCount: number;
  historyCount: number;
}): Partial<Record<EmployeeTabId, string>> {
  const badges: Partial<Record<EmployeeTabId, string>> = {};

  if (options.goalSettingOpen && !options.allGoalsLocked) {
    badges.goals = "Draft";
  }

  if (
    options.canCheckIn &&
    options.hasActiveCheckinWindow &&
    options.activeQuarter &&
    !options.quarterSubmitted[options.activeQuarter]
  ) {
    badges.checkins = "Active";
  }

  if (options.feedbackCount > 0 || options.historyCount > 0) {
    badges.history = String(options.feedbackCount + options.historyCount);
  }

  return badges;
}
