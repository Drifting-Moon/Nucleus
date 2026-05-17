import { MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QUARTER_LABELS } from "@/lib/quarter-labels";
import type { CheckinQuarter } from "@/lib/get-active-window";
import { formatDateTime } from "@/lib/format-datetime";

export type FeedbackTimelineEntry = {
  id: string;
  type: "rejection" | "checkin" | "anytime";
  quarter?: string;
  message: string;
  at?: string | null;
  goalTitle?: string | null;
};

type FeedbackTimelineProps = {
  entries: FeedbackTimelineEntry[];
};

export function FeedbackTimeline({ entries }: FeedbackTimelineProps) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <Card className="border-primary/15 bg-gradient-to-br from-card to-muted/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="size-5 text-primary" />
          Manager feedback
        </CardTitle>
        <CardDescription>
          Rejection notes, quarterly check-in reviews, and anytime feedback from your manager.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-4 border-l border-border pl-6">
          {entries.map((entry) => (
            <li key={entry.id} className="relative">
              <span
                className="absolute -left-[1.6rem] top-1 flex size-3 rounded-full bg-primary ring-4 ring-background"
                aria-hidden
              />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {entry.type === "rejection"
                  ? "Goal rework"
                  : entry.type === "anytime"
                    ? "Anytime Feedback"
                    : entry.quarter
                      ? (QUARTER_LABELS[entry.quarter as CheckinQuarter] ?? entry.quarter)
                      : "Check-in"}
              </p>
              {entry.goalTitle && (
                <p className="mt-0.5 text-xs font-semibold text-primary">
                  Linked Goal: {entry.goalTitle}
                </p>
              )}
              <p className="mt-1 text-sm leading-relaxed">{entry.message}</p>
              {entry.at ? (
                <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(entry.at)}</p>
              ) : null}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
