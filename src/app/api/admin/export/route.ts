import { buildExportRows, exportRowsToCsv, exportRowsToXlsxBuffer } from "@/lib/build-export-data";
import { requireAdminApi } from "@/lib/auth-api";

export async function GET(request: Request) {
  const auth = await requireAdminApi();

  if ("error" in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const format = new URL(request.url).searchParams.get("format") ?? "csv";
  const { supabase } = auth;

  const { data: users } = await supabase.from("users").select("id, name, email, department, manager_id, role");

  const employees = (users ?? []).filter((user) => user.role === "employee");
  const managers = (users ?? []).filter((user) => user.role === "manager");

  const { data: goals } = await supabase
    .from("goals")
    .select("id, user_id, thrust_area, title, uom, target, target_date, status")
    .order("created_at", { ascending: true });

  const goalIds = (goals ?? []).map((goal) => goal.id);

  const { data: updates } = goalIds.length
    ? await supabase
        .from("quarterly_updates")
        .select("goal_id, quarter, achievement, achievement_date, score")
        .in("goal_id", goalIds)
    : { data: [] };

  const rows = buildExportRows(employees, managers, goals ?? [], updates ?? []);
  const date = new Date().toISOString().slice(0, 10);

  if (format === "xlsx") {
    const buffer = await exportRowsToXlsxBuffer(rows);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="nucleus-export-${date}.xlsx"`,
      },
    });
  }

  const csv = exportRowsToCsv(rows);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="nucleus-export-${date}.csv"`,
    },
  });
}
