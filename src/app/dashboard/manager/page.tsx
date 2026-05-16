"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export default function ManagerDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manager Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>Log out</Button>
      </div>
      <p className="text-muted-foreground">Coming Soon — Team review will appear here in Stage 3.</p>
    </div>
  );
}
