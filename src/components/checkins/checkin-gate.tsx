import { CheckinForm, CheckinUpdateRecord } from "@/components/checkins/checkin-form";
import type { CheckinGoal } from "@/components/checkins/checkin-row";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getActiveWindow, getNextWindow, type QuarterWindow } from "@/lib/get-active-window";
import { formatDisplayDate } from "@/lib/format-date";
import { QUARTER_LABELS } from "@/lib/quarter-labels";

type CheckinGateProps = {
  windows: QuarterWindow[];
  goals: CheckinGoal[];
  updates: CheckinUpdateRecord[];
  blockedReason?: string;
};

export function CheckinGate({ windows, goals, updates, blockedReason }: CheckinGateProps) {
  const activeWindow = getActiveWindow(windows);
  const nextWindow = getNextWindow(windows);

  if (!activeWindow) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quarterly Check-ins</CardTitle>
          <CardDescription>No active check-in window right now.</CardDescription>
        </CardHeader>
        <CardContent className="rounded-lg border border-dashed p-6 text-center">
          {nextWindow ? (
            <>
              <p className="font-medium text-amber-700 dark:text-amber-300">Check-in window is not currently open</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {QUARTER_LABELS[nextWindow.quarter_name]} is scheduled to open on{" "}
                {formatDisplayDate(nextWindow.start_date)}. Go to <strong>Quarter Windows</strong> in the Admin panel and set active dates including today if you want to force-open it.
              </p>
            </>
          ) : (
            <>
              <p className="font-medium text-destructive">No check-in windows configured</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Check-in window is not open. Go to <strong>Quarter Windows</strong> in the Admin dashboard and set dates for Q1, Q2, Q3, or Annual so today falls within the active range.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  if (blockedReason || goals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quarterly Check-ins</CardTitle>
          <CardDescription>
            {QUARTER_LABELS[activeWindow.quarter_name]} is open.
          </CardDescription>
        </CardHeader>
        <CardContent className="rounded-lg border border-dashed p-6 text-center">
          <p className="font-medium">Check-in not available yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {blockedReason ??
              `Submit your goal sheet and wait for manager approval before ${QUARTER_LABELS[activeWindow.quarter_name].toLowerCase()} check-in opens.`}
          </p>
        </CardContent>
      </Card>
    );
  }

  const quarterUpdates = updates.filter((update) => update.quarter === activeWindow.quarter_name);

  return (
    <CheckinForm
      quarter={activeWindow.quarter_name}
      goals={goals}
      updates={quarterUpdates}
    />
  );
}
