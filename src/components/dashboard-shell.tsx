"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

type DashboardShellProps = {
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
  children?: ReactNode;
};

export function DashboardShell({
  title,
  description,
  backHref,
  backLabel = "Back",
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
    <div className="p-8">
      {backHref ? (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 mb-4 w-fit"
          render={<Link href={backHref} />}
          nativeButton={false}
        >
          <ArrowLeft data-icon="inline-start" />
          {backLabel}
        </Button>
      ) : null}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold">{title}</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" onClick={handleLogout}>Log out</Button>
        </div>
      </div>
      <p className="text-muted-foreground">{description}</p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
