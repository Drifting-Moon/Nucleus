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
              <p className="font-medium">Check-ins are closed for now</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {QUARTER_LABELS[nextWindow.quarter_name]} opens on{" "}
                {formatDisplayDate(nextWindow.start_date)}.
              </p>
            </>
          ) : (
            <>
              <p className="font-medium">No check-in windows configured</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Ask your admin to set quarter dates in the Admin dashboard.
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
