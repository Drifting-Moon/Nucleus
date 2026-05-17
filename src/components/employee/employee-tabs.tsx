"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export const EMPLOYEE_TABS = [
  { id: "overview", label: "Overview" },
  { id: "goals", label: "My Goals" },
  { id: "checkins", label: "Check-ins" },
  { id: "history", label: "History" },
] as const;

export type EmployeeTabId = (typeof EMPLOYEE_TABS)[number]["id"];

type EmployeeTabsProps = {
  defaultTab: EmployeeTabId;
  overview: ReactNode;
  goals: ReactNode;
  checkins: ReactNode;
  history: ReactNode;
  /** Short badge on tab, e.g. "Active" */
  tabBadges?: Partial<Record<EmployeeTabId, string>>;
};

export function EmployeeTabs({
  defaultTab,
  overview,
  goals,
  checkins,
  history,
  tabBadges,
}: EmployeeTabsProps) {
  const [active, setActive] = useState<EmployeeTabId>(defaultTab);

  useEffect(() => {
    const handleSwitch = (e: Event) => {
      const customEvent = e as CustomEvent<EmployeeTabId>;
      if (customEvent.detail && EMPLOYEE_TABS.some((t) => t.id === customEvent.detail)) {
        setActive(customEvent.detail);
      }
    };
    window.addEventListener("switch-tab", handleSwitch);
    return () => window.removeEventListener("switch-tab", handleSwitch);
  }, []);

  return (
    <div className="space-y-4">
      <nav
        className="sticky top-0 z-20 -mx-1 rounded-xl border bg-background/95 px-1 py-1.5 shadow-sm backdrop-blur-md print:hidden"
        aria-label="Employee dashboard sections"
      >
        <div className="flex flex-wrap gap-1">
          {EMPLOYEE_TABS.map((tab) => {
            const badge = tabBadges?.[tab.id];
            const isActive = active === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActive(tab.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {tab.label}
                {badge ? (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-primary/15 text-primary"
                    )}
                  >
                    {badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="min-h-[320px]">
        <section
          className={cn("space-y-4", active !== "overview" && "hidden print:block")}
          aria-hidden={active !== "overview"}
        >
          {overview}
        </section>
        <section
          className={cn("space-y-4", active !== "goals" && "hidden print:block print:break-before-page")}
          aria-hidden={active !== "goals"}
        >
          {goals}
        </section>
        <section
          className={cn(
            "space-y-4",
            active !== "checkins" && "hidden print:block print:break-before-page"
          )}
          aria-hidden={active !== "checkins"}
        >
          {checkins}
        </section>
        <section
          className={cn(
            "space-y-4",
            active !== "history" && "hidden print:block print:break-before-page"
          )}
          aria-hidden={active !== "history"}
        >
          {history}
        </section>
      </div>
    </div>
  );
}
