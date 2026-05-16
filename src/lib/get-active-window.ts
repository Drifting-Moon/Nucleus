/** Check-in quarters only — goal_setting uses the goal sheet. */
export const CHECKIN_QUARTERS = ["q1", "q2", "q3", "annual"] as const;

export type CheckinQuarter = (typeof CHECKIN_QUARTERS)[number];

export type QuarterWindow = {
  quarter_name: string;
  start_date: string;
  end_date: string;
};

export function formatDateOnly(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isCheckinQuarter(name: string): name is CheckinQuarter {
  return (CHECKIN_QUARTERS as readonly string[]).includes(name);
}

/** True when today falls within the goal_setting quarter window. */
export function isGoalSettingOpen(
  windows: QuarterWindow[],
  today: Date = new Date()
): boolean {
  const todayStr = formatDateOnly(today);
  const window = windows.find((w) => w.quarter_name === "goal_setting");

  if (!window) {
    return false;
  }

  return todayStr >= window.start_date && todayStr <= window.end_date;
}

function checkinPriority(quarter: CheckinQuarter): number {
  return CHECKIN_QUARTERS.indexOf(quarter);
}

/** Returns the open check-in window for today, or null. */
export function getActiveWindow(
  windows: QuarterWindow[],
  today: Date = new Date()
): (QuarterWindow & { quarter_name: CheckinQuarter }) | null {
  const todayStr = formatDateOnly(today);

  const openWindows = windows.filter(
    (w): w is QuarterWindow & { quarter_name: CheckinQuarter } => {
      if (!isCheckinQuarter(w.quarter_name)) return false;
      return todayStr >= w.start_date && todayStr <= w.end_date;
    }
  );

  if (openWindows.length === 0) return null;

  // When admins overlap windows (common in demos), always pick Q1 → Q2 → Q3 → Annual.
  openWindows.sort(
    (a, b) => checkinPriority(a.quarter_name) - checkinPriority(b.quarter_name)
  );

  return openWindows[0];
}

/** Next upcoming check-in window after today. */
export function getNextWindow(
  windows: QuarterWindow[],
  today: Date = new Date()
): (QuarterWindow & { quarter_name: CheckinQuarter }) | null {
  const todayStr = formatDateOnly(today);

  const upcoming = windows
    .filter((w): w is QuarterWindow & { quarter_name: CheckinQuarter } =>
      isCheckinQuarter(w.quarter_name)
    )
    .filter((w) => w.start_date > todayStr)
    .sort((a, b) => a.start_date.localeCompare(b.start_date));

  return upcoming[0] ?? null;
}
