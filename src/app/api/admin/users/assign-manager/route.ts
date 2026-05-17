import { createClient as createAdminClient } from "@supabase/supabase-js";
import { requireAdminApi } from "@/lib/auth-api";
import { getSupabaseServiceRoleEnv } from "@/lib/env";

export async function POST(request: Request) {
  const auth = await requireAdminApi();

  if ("error" in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  let body: {
    employeeId: string;
    managerId: string | null;
  };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { employeeId, managerId } = body;

  if (!employeeId) {
    return Response.json({ error: "Employee ID is required." }, { status: 400 });
  }

  const { supabaseUrl, supabaseServiceRoleKey } = getSupabaseServiceRoleEnv();
  const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { error } = await adminSupabase
    .from("users")
    .update({ manager_id: managerId })
    .eq("id", employeeId)
    .eq("role", "employee");

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({ success: true });
}
