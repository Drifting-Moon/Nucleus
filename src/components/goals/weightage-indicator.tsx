import { cn } from "@/lib/utils";

type WeightageIndicatorProps = {
  total: number;
  showBrdHint?: boolean;
};

export function WeightageIndicator({ total, showBrdHint = true }: WeightageIndicatorProps) {
  const isOver = total > 100;
  const isExact = total === 100;

  return (
    <div
      className={cn(
        "flex min-w-[200px] flex-col gap-1 rounded-xl border bg-card px-4 py-3 text-sm shadow-sm",
        isOver && "border-destructive/40 bg-destructive/5 text-destructive",
        isExact && "border-emerald-500/40 bg-emerald-500/5 text-emerald-800 dark:text-emerald-400",
        !isOver && !isExact && "border-amber-500/40 bg-amber-500/5 text-amber-800 dark:text-amber-400"
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold tabular-nums">{total} / 100%</span>
        {isOver && <span className="text-xs font-medium">Over limit</span>}
        {isExact && <span className="text-xs font-medium">Ready to submit</span>}
        {!isOver && !isExact && (
          <span className="text-xs font-medium">{100 - total}% remaining</span>
        )}
      </div>
      {showBrdHint ? (
        <p className="text-xs text-muted-foreground leading-snug">
          BRD: max 8 goals · min 10% each · total must equal 100%
        </p>
      ) : null}
    </div>
  );
}