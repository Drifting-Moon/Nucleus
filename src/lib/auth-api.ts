import { createClient } from "@/lib/supabase-server";
import type { UserRole } from "@/lib/auth";

export async function requireAdminApi() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized", status: 401 as const };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Forbidden", status: 403 as const };
  }

  return { user, role: profile.role as UserRole, supabase };
}
