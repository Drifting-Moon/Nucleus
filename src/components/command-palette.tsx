"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Briefcase,
  Calendar,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  Lock,
  Search,
  Shield,
  Users,
  UserPlus,
  AlertTriangle,
  GitBranch,
  Download,
  ScrollText,
  Target,
  Command,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";

type CommandItem = {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  action: () => void;
  keywords: string[];
  group: string;
};

const DEMO_ACCOUNTS = {
  employee: { email: "employee@test.com", password: "password123" },
  manager: { email: "manager@test.com", password: "password123" },
  admin: { email: "admin@test.com", password: "password123" },
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, _setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Wrap setQuery to also reset selection index (avoids useEffect)
  const setQuery = (q: string) => {
    _setQuery(q);
    setSelectedIndex(0);
  };
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const switchRole = useCallback(
    async (role: keyof typeof DEMO_ACCOUNTS) => {
      const supabase = createClient();
      await supabase.auth.signOut();
      const account = DEMO_ACCOUNTS[role];
      const { error } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password,
      });
      if (error) {
        toast.error(`Switch failed: ${error.message}`);
        return;
      }
      toast.success(`Switched to ${role}`, { icon: "🔄" });
      router.replace(`/dashboard/${role}`);
      router.refresh();
    },
    [router]
  );

  const commands: CommandItem[] = useMemo(
    () => [
      // Navigation
      {
        id: "nav-employee",
        label: "Employee Dashboard",
        description: "View employee goal sheet & check-ins",
        icon: Briefcase,
        action: () => router.push("/dashboard/employee"),
        keywords: ["employee", "goals", "my dashboard", "goal sheet"],
        group: "Navigation",
      },
      {
        id: "nav-manager",
        label: "Manager Dashboard",
        description: "Review team goals & quarterly feedback",
        icon: Users,
        action: () => router.push("/dashboard/manager"),
        keywords: ["manager", "team", "review", "approve", "feedback"],
        group: "Navigation",
      },
      {
        id: "nav-admin",
        label: "Admin Dashboard",
        description: "Governance, analytics & organization settings",
        icon: Shield,
        action: () => router.push("/dashboard/admin"),
        keywords: ["admin", "hr", "governance", "settings"],
        group: "Navigation",
      },
      {
        id: "nav-login",
        label: "Login Page",
        description: "Go to the login screen",
        icon: LayoutDashboard,
        action: () => router.push("/login"),
        keywords: ["login", "sign in", "authenticate"],
        group: "Navigation",
      },
      // Quick Actions
      {
        id: "switch-employee",
        label: "Switch to Employee",
        description: "Sign in as employee@test.com",
        icon: Briefcase,
        action: () => switchRole("employee"),
        keywords: ["switch", "employee", "demo", "role"],
        group: "Switch Role",
      },
      {
        id: "switch-manager",
        label: "Switch to Manager",
        description: "Sign in as manager@test.com",
        icon: Users,
        action: () => switchRole("manager"),
        keywords: ["switch", "manager", "demo", "role"],
        group: "Switch Role",
      },
      {
        id: "switch-admin",
        label: "Switch to Admin",
        description: "Sign in as admin@test.com",
        icon: Shield,
        action: () => switchRole("admin"),
        keywords: ["switch", "admin", "demo", "role"],
        group: "Switch Role",
      },
      // Admin Features
      {
        id: "admin-completion",
        label: "Completion Dashboard",
        description: "View goal completion across org",
        icon: ClipboardCheck,
        action: () => router.push("/dashboard/admin"),
        keywords: ["completion", "status", "progress", "tracking"],
        group: "Admin",
      },
      {
        id: "admin-analytics",
        label: "Analytics",
        description: "Charts, scores & org performance",
        icon: BarChart3,
        action: () => router.push("/dashboard/admin"),
        keywords: ["analytics", "charts", "performance", "scores", "data"],
        group: "Admin",
      },
      {
        id: "admin-people",
        label: "People Management",
        description: "Create & manage users",
        icon: UserPlus,
        action: () => router.push("/dashboard/admin"),
        keywords: ["people", "users", "create", "manage", "employees"],
        group: "Admin",
      },
      {
        id: "admin-escalation",
        label: "Escalation Center",
        description: "View overdue & blocked employees",
        icon: AlertTriangle,
        action: () => router.push("/dashboard/admin"),
        keywords: ["escalation", "overdue", "blocked", "alert"],
        group: "Admin",
      },
      {
        id: "admin-quarter",
        label: "Quarter Windows",
        description: "Configure goal-setting & check-in dates",
        icon: Calendar,
        action: () => router.push("/dashboard/admin"),
        keywords: ["quarter", "window", "dates", "q1", "q2", "q3", "annual", "goal setting"],
        group: "Admin",
      },
      {
        id: "admin-export",
        label: "Export Reports",
        description: "Download CSV or Excel reports",
        icon: Download,
        action: () => router.push("/dashboard/admin"),
        keywords: ["export", "csv", "excel", "download", "report"],
        group: "Admin",
      },
      {
        id: "admin-shared",
        label: "Push Shared Goal",
        description: "Assign a KPI to multiple employees",
        icon: Target,
        action: () => router.push("/dashboard/admin"),
        keywords: ["push", "shared", "kpi", "goal", "assign"],
        group: "Admin",
      },
      {
        id: "admin-unlock",
        label: "Unlock Goals",
        description: "Unlock & edit locked employee goals",
        icon: Lock,
        action: () => router.push("/dashboard/admin"),
        keywords: ["unlock", "edit", "locked", "goals"],
        group: "Admin",
      },
      {
        id: "admin-audit",
        label: "Audit Log",
        description: "View change history & governance trail",
        icon: ScrollText,
        action: () => router.push("/dashboard/admin"),
        keywords: ["audit", "log", "history", "trail", "changes"],
        group: "Admin",
      },
      {
        id: "admin-org",
        label: "Org Hierarchy",
        description: "Assign managers to employees",
        icon: GitBranch,
        action: () => router.push("/dashboard/admin"),
        keywords: ["org", "hierarchy", "manager", "assign", "structure"],
        group: "Admin",
      },
      // Other
      {
        id: "print-pdf",
        label: "Export as PDF",
        description: "Print current page",
        icon: FileText,
        action: () => window.print(),
        keywords: ["print", "pdf", "export", "save"],
        group: "Actions",
      },
    ],
    [router, switchRole]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.description?.toLowerCase().includes(q) ||
        cmd.keywords.some((kw) => kw.includes(q))
    );
  }, [query, commands]);

  const groups = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    for (const item of filtered) {
      const list = map.get(item.group) ?? [];
      list.push(item);
      map.set(item.group, list);
    }
    return map;
  }, [filtered]);

  // Keyboard shortcut to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => {
          if (!prev) {
            // Reset query when opening — no effect needed
            _setQuery("");
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
          }
          return !prev;
        });
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = filtered[selectedIndex];
      if (item) {
        item.action();
        setOpen(false);
      }
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const items = list.querySelectorAll("[data-cmd-item]");
    items[selectedIndex]?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  if (!open) return null;

  let flatIndex = 0;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={() => setOpen(false)}
      />

      {/* Palette */}
      <div className="relative w-full max-w-lg animate-in fade-in slide-in-from-top-4 duration-200">
        <div className="overflow-hidden rounded-2xl border bg-popover shadow-2xl shadow-black/20">
          {/* Search input */}
          <div className="flex items-center gap-3 border-b px-4 py-3">
            <Search className="size-5 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/60"
              placeholder="Search commands, pages, or actions…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <kbd className="hidden rounded-md border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground sm:inline-block">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                <Search className="mx-auto mb-2 size-8 opacity-30" />
                <p>No commands found for &quot;{query}&quot;</p>
              </div>
            ) : (
              [...groups.entries()].map(([group, items]) => (
                <div key={group} className="mb-2 last:mb-0">
                  <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {group}
                  </p>
                  {items.map((item) => {
                    const Icon = item.icon;
                    const idx = flatIndex++;
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={item.id}
                        data-cmd-item
                        onClick={() => {
                          item.action();
                          setOpen(false);
                        }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                          isSelected
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-muted/60"
                        }`}
                      >
                        <Icon
                          className={`size-4 shrink-0 ${
                            isSelected ? "text-primary" : "text-muted-foreground"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.label}</p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {item.description}
                            </p>
                          )}
                        </div>
                        {isSelected && (
                          <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            ↵
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t px-4 py-2 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-muted px-1 py-0.5 text-[10px]">↑↓</kbd> navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-muted px-1 py-0.5 text-[10px]">↵</kbd> select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-muted px-1 py-0.5 text-[10px]">esc</kbd> close
              </span>
            </div>
            <span className="font-medium text-primary/60">Nucleus</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Small button to trigger the palette from the header. */
export function CommandPaletteButton() {
  const handleClick = () => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
    );
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1.5 rounded-lg border bg-muted/50 px-2.5 py-1.5 text-xs text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95"
      title="Command palette (⌘K)"
    >
      <Command className="size-3.5" />
      <span className="hidden sm:inline">Search</span>
      <kbd className="ml-1 hidden rounded border bg-background px-1 py-0.5 text-[10px] font-semibold sm:inline-block">
        ⌘K
      </kbd>
    </button>
  );
}
