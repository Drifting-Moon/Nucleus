import type { ActivityFeedEntry } from "@/components/activity-feed";

type AuditRow = {
  id: string;
  changed_by: string | null;
  goal_id: string | null;
  field_changed: string | null;
  old_value: string | null;
  new_value: string | null;
  created_at: string | null;
};

type UserMap = Map<string, string>;

function getAuditEventType(
  field: string | null
): ActivityFeedEntry["type"] {
  if (!field) return "generic";
  if (field === "shared_goal_assigned") return "shared_goal_assigned";
  if (field === "status" || field === "goal_locked") return "goal_locked";
  if (field === "goal_unlocked" || field.includes("unlock")) return "goal_unlocked";
  return "generic";
}

function getAuditDescription(row: AuditRow): string {
  const field = row.field_changed ?? "";
  if (field === "shared_goal_assigned") {
    return `assigned shared goal "${row.new_value ?? "KPI"}"`;
  }
  if (field.includes("unlock")) {
    return `unlocked and edited ${field.replace("unlock_edit_", "")} field`;
  }
  if (row.old_value && row.new_value) {
    return `changed ${field} from "${row.old_value}" to "${row.new_value}"`;
  }
  return `updated ${field}`;
}

export function buildActivityFeed(
  auditRows: AuditRow[],
  userNames: UserMap
): ActivityFeedEntry[] {
  const entries: ActivityFeedEntry[] = [];

  for (const row of auditRows) {
    if (!row.created_at) continue;
    const actorName = userNames.get(row.changed_by ?? "") ?? "System";
    entries.push({
      id: row.id,
      type: getAuditEventType(row.field_changed),
      actor: actorName,
      description: getAuditDescription(row),
      timestamp: row.created_at,
    });
  }

  // Sort newest first
  entries.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return entries;
}
