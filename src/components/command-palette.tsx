"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  BarChart3,
  Briefcase,
  Calendar,
  ClipboardCheck,
  FileText,
  Lock,
  Search,
  Users,
  UserPlus,
  AlertTriangle,
  GitBranch,
  Download,
  ScrollText,
  Target,
  Command,
} from "lucide-react";

type CommandItem = {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  action: () => void;
  keywords: string[];
  group: string;
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, _setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const setQuery = (q: string) => {
    _setQuery(q);
    setSelectedIndex(0);
  };
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Detect current role based on URL path
  const currentRole = useMemo(() => {
    if (pathname?.startsWith("/dashboard/employee")) return "employee";
    if (pathname?.startsWith("/dashboard/manager")) return "manager";
    if (pathname?.startsWith("/dashboard/admin")) return "admin";
    return null;
  }, [pathname]);

  const dispatchTabChange = useCallback((tabId: string) => {
    window.dispatchEvent(new CustomEvent("switch-tab", { detail: tabId }));
  }, []);

  const commands = useMemo((): CommandItem[] => {
    const items: CommandItem[] = [];

    if (currentRole === "employee") {
      items.push(
        {
          id: "emp-overview",
          label: "View Status Overview",
          description: "See score trends and weighted goal progress metrics",
          icon: Briefcase,
          action: () => dispatchTabChange("overview"),
          keywords: ["overview", "milestones", "metrics", "chart"],
          group: "Dashboard Tabs",
        },
        {
          id: "emp-goals",
          label: "My Goal Sheet",
          description: "Draft, edit, delete, or submit your goals for approval",
          icon: Target,
          action: () => dispatchTabChange("goals"),
          keywords: ["goals", "sheet", "draft", "submit"],
          group: "Dashboard Tabs",
        },
        {
          id: "emp-checkins",
          label: "Quarterly Check-ins",
          description: "Log achievement and scores for active quarters",
          icon: Calendar,
          action: () => dispatchTabChange("checkins"),
          keywords: ["check-in", "achievement", "quarters"],
          group: "Dashboard Tabs",
        },
        {
          id: "emp-history",
          label: "Timeline & Feedback History",
          description: "Read manager feedback notes and quarterly comments",
          icon: ScrollText,
          action: () => dispatchTabChange("history"),
          keywords: ["history", "timeline", "feedback", "rework"],
          group: "Dashboard Tabs",
        }
      );
    } else if (currentRole === "manager") {
      items.push(
        {
          id: "mgr-goals",
          label: "Goal Review Queue",
          description: "Approve, edit, or return direct report goal sheets for rework",
          icon: ClipboardCheck,
          action: () => dispatchTabChange("goals"),
          keywords: ["review", "approve", "rework", "goals"],
          group: "Dashboard Tabs",
        },
        {
          id: "mgr-checkins",
          label: "Quarterly Feedback & Heatmaps",
          description: "Submit check-in feedback and review achievement pipelines",
          icon: Users,
          action: () => dispatchTabChange("checkins"),
          keywords: ["check-in", "feedback", "quarter", "heatmap"],
          group: "Dashboard Tabs",
        }
      );
    } else if (currentRole === "admin") {
      items.push(
        {
          id: "admin-completion",
          label: "Completion Dashboard",
          description: "Monitor check-in & goal cycle completion",
          icon: ClipboardCheck,
          action: () => dispatchTabChange("completion"),
          keywords: ["completion", "progress", "tracking", "completion rates"],
          group: "Dashboard Tabs",
        },
        {
          id: "admin-people",
          label: "People Management",
          description: "Create, search, or edit system users",
          icon: UserPlus,
          action: () => dispatchTabChange("people"),
          keywords: ["people", "users", "create", "manage", "employees"],
          group: "Dashboard Tabs",
        },
        {
          id: "admin-escalation",
          label: "Escalation Bottlenecks Center",
          description: "Identify overdue cycles & pending escalations",
          icon: AlertTriangle,
          action: () => dispatchTabChange("escalations"),
          keywords: ["escalation", "overdue", "blocked", "alert"],
          group: "Dashboard Tabs",
        },
        {
          id: "admin-analytics",
          label: "Analytics & KPI Performance",
          description: "Organization performance distributions and statistics",
          icon: BarChart3,
          action: () => dispatchTabChange("analytics"),
          keywords: ["analytics", "charts", "performance", "distribution"],
          group: "Dashboard Tabs",
        },
        {
          id: "admin-org",
          label: "Org Hierarchy mapping",
          description: "Configure employee to manager reporting lines",
          icon: GitBranch,
          action: () => dispatchTabChange("hierarchy"),
          keywords: ["org", "hierarchy", "manager", "reporting line"],
          group: "Dashboard Tabs",
        },
        {
          id: "admin-quarter",
          label: "Quarter Windows setup",
          description: "Configure goal-setting and check-in window dates",
          icon: Calendar,
          action: () => dispatchTabChange("windows"),
          keywords: ["quarter", "window", "dates", "goal setting"],
          group: "Dashboard Tabs",
        },
        {
          id: "admin-export",
          label: "Export CSV/Excel Reports",
          description: "Download bulk organization goals & actuals data",
          icon: Download,
          action: () => dispatchTabChange("export"),
          keywords: ["export", "csv", "excel", "download"],
          group: "Dashboard Tabs",
        },
        {
          id: "admin-shared",
          label: "Push Shared KPI Goal",
          description: "Assign a standard forced KPI to employees in bulk",
          icon: Target,
          action: () => dispatchTabChange("shared"),
          keywords: ["push", "shared", "kpi", "bulk", "force"],
          group: "Dashboard Tabs",
        },
        {
          id: "admin-audit",
          label: "Audit Logs viewer",
          description: "Track all security & administrative goal overrides",
          icon: ScrollText,
          action: () => dispatchTabChange("audit"),
          keywords: ["audit", "log", "governance", "trail"],
          group: "Dashboard Tabs",
        },
        {
          id: "admin-unlock",
          label: "Unlock Goals Tool",
          description: "Allow employees to rewrite approved/locked goal sheets",
          icon: Lock,
          action: () => dispatchTabChange("unlock"),
          keywords: ["unlock", "locked", "edit goals"],
          group: "Dashboard Tabs",
        }
      );
    }

    // Common Actions (Always available inside any dashboard)
    if (currentRole) {
      items.push({
        id: "print-pdf",
        label: "Export Page as PDF",
        description: "Save or print the current active view",
        icon: FileText,
        action: () => window.print(),
        keywords: ["print", "pdf", "export", "save"],
        group: "System Actions",
      });
    }

    return items;
  }, [currentRole, dispatchTabChange]);

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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => {
          if (!prev) {
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

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const items = list.querySelectorAll("[data-cmd-item]");
    items[selectedIndex]?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  if (!open || !currentRole) return null;

  let flatIndex = 0;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={() => setOpen(false)}
      />

      <div className="relative w-full max-w-lg animate-in fade-in slide-in-from-top-4 duration-200">
        <div className="overflow-hidden rounded-2xl border bg-popover shadow-2xl shadow-black/20">
          <div className="flex items-center gap-3 border-b px-4 py-3">
            <Search className="size-5 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/60"
              placeholder={`Search ${currentRole} dashboard actions…`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <kbd className="hidden rounded-md border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground sm:inline-block">
              ESC
            </kbd>
          </div>

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

export function CommandPaletteButton() {
  const pathname = usePathname();
  const currentRole = pathname?.startsWith("/dashboard/employee")
    ? "employee"
    : pathname?.startsWith("/dashboard/manager")
      ? "manager"
      : pathname?.startsWith("/dashboard/admin")
        ? "admin"
        : null;

  const handleClick = () => {
    if (!currentRole) return;
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
    );
  };

  if (!currentRole) return null;

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
