import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format-datetime";

export type AuditLogEntry = {
  id: string;
  changed_at: string;
  changed_by_name: string;
  employee_name: string;
  goal_title: string;
  field_changed: string;
  old_value: string | null;
  new_value: string | null;
};

type AuditLogViewerProps = {
  entries: AuditLogEntry[];
};

export function AuditLogViewer({ entries }: AuditLogViewerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit trail</CardTitle>
        <CardDescription>
          Log of admin changes to locked goals (most recent first).
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {entries.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="font-medium">No audit entries yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Changes made via the unlock tool will appear here.
            </p>
          </div>
        ) : (
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Time</th>
                <th className="pb-2 pr-4 font-medium">Changed by</th>
                <th className="pb-2 pr-4 font-medium">Employee</th>
                <th className="pb-2 pr-4 font-medium">Goal</th>
                <th className="pb-2 pr-4 font-medium">Field</th>
                <th className="pb-2 pr-4 font-medium">Old</th>
                <th className="pb-2 font-medium">New</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b last:border-0">
                  <td className="py-2 pr-4 whitespace-nowrap">
                    {formatDateTime(entry.changed_at)}
                  </td>
                  <td className="py-2 pr-4">{entry.changed_by_name}</td>
                  <td className="py-2 pr-4">{entry.employee_name}</td>
                  <td className="py-2 pr-4">{entry.goal_title}</td>
                  <td className="py-2 pr-4">{entry.field_changed}</td>
                  <td className="py-2 pr-4 text-muted-foreground">
                    {entry.old_value ?? "—"}
                  </td>
                  <td className="py-2">{entry.new_value ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
