import type { FeedbackTimelineEntry } from "@/components/employee/feedback-timeline";

export function buildFeedbackTimelineEntries(
  rejectionReason: string | null,
  updates: {
    quarter: string;
    manager_feedback: string | null;
    submitted_at: string | null;
  }[]
): FeedbackTimelineEntry[] {
  const entries: FeedbackTimelineEntry[] = [];

  if (rejectionReason?.trim()) {
    entries.push({
      id: "rejection",
      type: "rejection",
      message: rejectionReason.trim(),
    });
  }

  const byQuarter = new Map<string, { message: string; at: string | null }>();

  for (const row of updates) {
    const text = row.manager_feedback?.trim();
    if (!text) continue;
    const existing = byQuarter.get(row.quarter);
    if (!existing || (row.submitted_at && (!existing.at || row.submitted_at > existing.at))) {
      byQuarter.set(row.quarter, { message: text, at: row.submitted_at });
    }
  }

  for (const [quarter, { message, at }] of byQuarter) {
    entries.push({
      id: `checkin-${quarter}`,
      type: "checkin",
      quarter,
      message,
      at,
    });
  }

  return entries;
}
