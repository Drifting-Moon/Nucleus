import { createClient } from "@/lib/supabase";

type WriteAuditLogParams = {
  changedBy: string;
  goalId: string;
  fieldChanged: string;
  oldValue: string | null;
  newValue: string | null;
};

/** Inserts one audit log row. Swallows errors so unlock flow is not blocked. */
export async function writeAuditLog({
  changedBy,
  goalId,
  fieldChanged,
  oldValue,
  newValue,
}: WriteAuditLogParams) {
  if (oldValue === newValue) return;

  const supabase = createClient();
  const { error } = await supabase.from("audit_logs").insert({
    changed_by: changedBy,
    goal_id: goalId,
    field_changed: fieldChanged,
    old_value: oldValue,
    new_value: newValue,
  });

  if (error) {
    console.error("Failed to write audit log:", error.message);
  }
}
