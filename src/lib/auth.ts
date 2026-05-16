import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

export type UserRole = "employee" | "manager" | "admin";

export async function requireRole(expectedRole: UserRole) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role as UserRole | undefined;

  if (!role) {
    redirect("/login");
  }

  if (role !== expectedRole) {
    redirect(`/dashboard/${role}`);
  }

  return { user, role };
}
