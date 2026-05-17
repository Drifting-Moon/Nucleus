import { cn } from "@/lib/utils";
import type { GoalHealth } from "@/lib/goal-health";

type GoalHealthBadgeProps = {
  health: GoalHealth;
  showScore?: boolean;
  className?: string;
};

export function GoalHealthBadge({ health, showScore = true, className }: GoalHealthBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        health.bgColor,
        health.color,
        className
      )}
    >
      <span className={cn("size-2 rounded-full", health.dotColor)} />
      {health.label}
      {showScore && health.score != null && (
        <span className="font-mono text-[11px] opacity-80">{health.score}%</span>
      )}
    </span>
  );
}
