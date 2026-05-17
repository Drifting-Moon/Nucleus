import { formatDisplayDate } from "@/lib/format-date";
import {
  Activity,
  CheckCircle2,
  ClipboardCheck,
  Lock,
  Send,
  Shield,
  Target,
  Unlock,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ActivityFeedEntry = {
  id: string;
  type:
    | "goal_submitted"
    | "goal_approved"
    | "goal_rejected"
    | "goal_locked"
    | "checkin_submitted"
    | "goal_unlocked"
    | "shared_goal_assigned"
    | "user_created"
    | "feedback_given"
    | "generic";
  actor: string;
  description: string;
  timestamp: string;
};

const ICON_MAP: Record<ActivityFeedEntry["type"], React.ElementType> = {
  goal_submitted: Send,
  goal_approved: CheckCircle2,
  goal_rejected: Activity,
  goal_locked: Lock,
  checkin_submitted: ClipboardCheck,
  goal_unlocked: Unlock,
  shared_goal_assigned: Target,
  user_created: UserPlus,
  feedback_given: Activity,
  generic: Shield,
};

const COLOR_MAP: Record<ActivityFeedEntry["type"], string> = {
  goal_submitted: "text-sky-600 dark:text-sky-400 bg-sky-500/10",
  goal_approved: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  goal_rejected: "text-red-600 dark:text-red-400 bg-red-500/10",
  goal_locked: "text-violet-600 dark:text-violet-400 bg-violet-500/10",
  checkin_submitted: "text-sky-600 dark:text-sky-400 bg-sky-500/10",
  goal_unlocked: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  shared_goal_assigned: "text-violet-600 dark:text-violet-400 bg-violet-500/10",
  user_created: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  feedback_given: "text-sky-600 dark:text-sky-400 bg-sky-500/10",
  generic: "text-muted-foreground bg-muted",
};

type ActivityFeedProps = {
  entries: ActivityFeedEntry[];
  maxItems?: number;
  className?: string;
};

export function ActivityFeed({ entries, maxItems = 15, className }: ActivityFeedProps) {
  const visible = entries.slice(0, maxItems);

  if (visible.length === 0) {
    return (
      <div className={cn("rounded-xl border bg-card p-6", className)}>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="size-5 text-primary" />
          <h3 className="text-base font-semibold">Activity Feed</h3>
        </div>
        <div className="py-8 text-center text-sm text-muted-foreground">
          <Activity className="mx-auto mb-2 size-8 opacity-20" />
          <p>No recent activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border bg-card p-6", className)}>
      <div className="flex items-center gap-2 mb-5">
        <Activity className="size-5 text-primary" />
        <h3 className="text-base font-semibold">Activity Feed</h3>
        <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          {entries.length} events
        </span>
      </div>

      <div className="relative space-y-0">
        {/* Vertical line */}
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />

        {visible.map((entry, i) => {
          const Icon = ICON_MAP[entry.type] ?? Shield;
          const colorClass = COLOR_MAP[entry.type] ?? COLOR_MAP.generic;
          const isLast = i === visible.length - 1;

          return (
            <div
              key={entry.id}
              className={cn(
                "relative flex gap-3 pb-4",
                isLast && "pb-0"
              )}
            >
              {/* Icon circle */}
              <div
                className={cn(
                  "relative z-10 flex size-[30px] shrink-0 items-center justify-center rounded-full",
                  colorClass
                )}
              >
                <Icon className="size-3.5" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm leading-snug">
                  <span className="font-medium">{entry.actor}</span>{" "}
                  <span className="text-muted-foreground">{entry.description}</span>
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                  {formatDisplayDate(entry.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {entries.length > maxItems && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          + {entries.length - maxItems} more events
        </p>
      )}
    </div>
  );
}
