import type { FeedbackTimelineEntry } from "@/components/employee/feedback-timeline";

export type AnytimeFeedbackInput = {
  id: string;
  feedback_text: string;
  created_at: string;
  goal_id: string | null;
  goal_title?: string | null;
};

export function buildFeedbackTimelineEntries(
  rejectionReason: string | null,
  updates: {
    quarter: string;
    manager_feedback: string | null;
    submitted_at: string | null;
  }[],
  anytimeFeedback: AnytimeFeedbackInput[] = []
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

  // Anytime feedback
  for (const item of anytimeFeedback) {
    entries.push({
      id: `anytime-${item.id}`,
      type: "anytime",
      message: item.feedback_text,
      at: item.created_at,
      goalTitle: item.goal_title,
    });
  }

  // Sort by date (newest first). Since rejection has no "at", put it first or last.
  return entries.sort((a, b) => {
    if (!a.at) return -1;
    if (!b.at) return 1;
    return new Date(b.at).getTime() - new Date(a.at).getTime();
  });
}
