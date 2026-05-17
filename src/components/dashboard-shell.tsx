"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { PrintDashboardButton } from "@/components/print-dashboard-button";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { RoleBadge, type UserRole } from "@/components/ui/role-badge";
import { RoleSwitcher } from "@/components/role-switcher";
import { CommandPaletteButton } from "@/components/command-palette";

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
  const pathname = usePathname();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const getBreadcrumbs = () => {
    if (!pathname) return null;
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 0) return null;

    const crumbs: { label: string; href?: string }[] = [
      { label: "Nucleus", href: "/" }
    ];

    if (parts[1] === "admin") {
      crumbs.push({ label: "Admin", href: "/dashboard/admin" });
      crumbs.push({ label: "Console" });
    } else if (parts[1] === "manager") {
      crumbs.push({ label: "Manager", href: "/dashboard/manager" });
      if (parts[2] === "review") {
        crumbs.push({ label: "Team", href: "/dashboard/manager" });
        crumbs.push({ label: "Goal Review" });
      } else if (parts[2] === "checkin") {
        crumbs.push({ label: "Team", href: "/dashboard/manager" });
        crumbs.push({ label: "Quarterly Feedback" });
      } else {
        crumbs.push({ label: "Team Overview" });
      }
    } else if (parts[1] === "employee") {
      crumbs.push({ label: "Employee", href: "/dashboard/employee" });
      crumbs.push({ label: "Goal Sheet" });
    }

    return crumbs;
  };

  const crumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/40 p-6 md:p-8 print:bg-white print:p-4">
      {crumbs && crumbs.length > 0 && (
        <nav className="mb-4 flex items-center space-x-1.5 text-xs text-muted-foreground print:hidden">
          {crumbs.map((crumb, idx) => {
            const isLast = idx === crumbs.length - 1;
            return (
              <span key={idx} className="flex items-center space-x-1.5">
                {idx > 0 && <span className="text-muted-foreground/30">/</span>}
                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="font-medium hover:text-foreground transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-foreground/80">{crumb.label}</span>
                )}
              </span>
            );
          })}
        </nav>
      )}

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
          <CommandPaletteButton />
          <RoleSwitcher currentRole={role} />
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
