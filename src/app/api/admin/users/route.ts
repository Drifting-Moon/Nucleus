import { createClient as createAdminClient } from "@supabase/supabase-js";
import { requireAdminApi } from "@/lib/auth-api";
import { getSupabaseServiceRoleEnv } from "@/lib/env";
import type { UserRole } from "@/lib/auth";

const VALID_ROLES = new Set<UserRole>(["employee", "manager", "admin"]);

export async function POST(request: Request) {
  const auth = await requireAdminApi();

  if ("error" in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  let body: {
    name?: string;
    email?: string;
    password?: string;
    role?: UserRole;
    department?: string;
    manager_id?: string | null;
  };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password || "password123";
  const role = body.role;
  const department = body.department?.trim() || null;
  const managerId = role === "employee" ? body.manager_id || null : null;

  if (!name || !email || !role || !VALID_ROLES.has(role)) {
    return Response.json({ error: "Name, email, and role are required." }, { status: 400 });
  }

  if (password.length < 6) {
    return Response.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const { supabaseUrl, supabaseServiceRoleKey } = getSupabaseServiceRoleEnv();
  const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: created, error: createError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
    app_metadata: { provider: "email", providers: ["email"] },
  });

  const duplicate = createError?.message.toLowerCase().includes("already");
  const userId = created.user?.id;

  if (createError && !duplicate) {
    return Response.json({ error: createError.message }, { status: 400 });
  }

  let finalUserId = userId;

  if (!finalUserId) {
    const { data: existing, error: listError } = await adminSupabase.auth.admin.listUsers();
    if (listError) {
      return Response.json({ error: listError.message }, { status: 400 });
    }

    finalUserId = existing.users.find((user) => user.email?.toLowerCase() === email)?.id;
  }

  if (!finalUserId) {
    return Response.json({ error: "Could not resolve user after creation." }, { status: 400 });
  }

  const { error: profileError } = await adminSupabase
    .from("users")
    .upsert({
      id: finalUserId,
      name,
      email,
      role,
      department,
      manager_id: managerId,
    });

  if (profileError) {
    return Response.json({ error: profileError.message }, { status: 400 });
  }

  return Response.json({
    user: {
      id: finalUserId,
      name,
      email,
      role,
      department,
      manager_id: managerId,
    },
  });
}
