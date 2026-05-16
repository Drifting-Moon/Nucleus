"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { PrintDashboardButton } from "@/components/print-dashboard-button";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { RoleBadge, type UserRole } from "@/components/ui/role-badge";

type DashboardShellProps = {
  title: string;
  description: string;
  role?: UserRole;
  backHref?: string;
  backLabel?: string;
  showPrint?: boolean;
  children?: ReactNode;
};

export function DashboardShell({
  title,
  description,
  role,
  backHref,
  backLabel = "Back",
  showPrint = true,
  children,
}: DashboardShellProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/40 p-6 md:p-8 print:bg-white print:p-4">
      {backHref ? (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 mb-4 w-fit print:hidden"
          render={<Link href={backHref} />}
          nativeButton={false}
        >
          <ArrowLeft data-icon="inline-start" />
          {backLabel}
        </Button>
      ) : null}

      <header className="mb-6 flex flex-col gap-4 border-b pb-6 print:hidden md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              className="text-sm font-semibold tracking-tight text-primary hover:underline"
            >
              Nucleus
            </Link>
            {role ? <RoleBadge role={role} /> : null}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {showPrint ? <PrintDashboardButton /> : null}
          <ThemeToggle />
          <Button variant="outline" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </header>

      {children ? <main className="space-y-6 print:space-y-4">{children}</main> : null}
    </div>
  );
}
