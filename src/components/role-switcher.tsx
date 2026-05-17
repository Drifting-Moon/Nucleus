"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Users, Shield, Briefcase, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";

const DEMO_ACCOUNTS = [
  {
    role: "employee" as const,
    label: "Employee",
    email: "employee@test.com",
    password: "password123",
    icon: Briefcase,
    color: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30 hover:bg-sky-500/25",
    activeColor: "bg-sky-500 text-white border-sky-600",
  },
  {
    role: "manager" as const,
    label: "Manager",
    email: "manager@test.com",
    password: "password123",
    icon: Users,
    color: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30 hover:bg-violet-500/25",
    activeColor: "bg-violet-500 text-white border-violet-600",
  },
  {
    role: "admin" as const,
    label: "Admin",
    email: "admin@test.com",
    password: "password123",
    icon: Shield,
    color: "bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/30 hover:bg-amber-500/25",
    activeColor: "bg-amber-500 text-white border-amber-600",
  },
];

type RoleSwitcherProps = {
  currentRole?: string;
};

export function RoleSwitcher({ currentRole }: RoleSwitcherProps) {
  const router = useRouter();
  const [switching, setSwitching] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSwitch = async (account: (typeof DEMO_ACCOUNTS)[number]) => {
    if (account.role === currentRole || switching) return;

    setSwitching(true);
    const supabase = createClient();

    // Sign out first
    await supabase.auth.signOut();

    // Sign in as the new role
    const { error } = await supabase.auth.signInWithPassword({
      email: account.email,
      password: account.password,
    });

    if (error) {
      toast.error(`Failed to switch: ${error.message}`);
      setSwitching(false);
      return;
    }

    toast.success(`Switched to ${account.label} view`, {
      icon: "🔄",
      duration: 2000,
    });

    router.replace(`/dashboard/${account.role}`);
    router.refresh();
    setSwitching(false);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg border border-dashed border-primary/30 bg-primary/5 px-2.5 py-1.5 text-xs font-medium text-primary transition-all hover:border-primary/60 hover:bg-primary/10 active:scale-95"
        title="Switch demo role"
      >
        <ArrowRightLeft className="size-3.5" />
        <span className="hidden sm:inline">Switch Role</span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          {/* Dropdown */}
          <div className="absolute right-0 top-full z-50 mt-2 w-56 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="rounded-xl border bg-popover p-2 shadow-xl shadow-black/10">
              <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Demo Mode — Switch Role
              </p>
              {DEMO_ACCOUNTS.map((account) => {
                const Icon = account.icon;
                const isActive = account.role === currentRole;
                return (
                  <button
                    key={account.role}
                    onClick={() => handleSwitch(account)}
                    disabled={isActive || switching}
                    className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-all ${
                      isActive ? account.activeColor : account.color
                    } ${isActive ? "cursor-default" : "cursor-pointer"} mb-1 last:mb-0`}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="flex-1">{account.label}</span>
                    {isActive && (
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                        Active
                      </span>
                    )}
                    {switching && !isActive && (
                      <span className="size-3 rounded-full border-2 border-current/30 border-t-current animate-spin" />
                    )}
                  </button>
                );
              })}
              <p className="mt-2 px-2 text-[10px] text-muted-foreground">
                Instantly switch between demo accounts without logout.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
