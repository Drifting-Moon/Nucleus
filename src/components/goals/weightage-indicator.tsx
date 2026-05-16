import { cn } from "@/lib/utils";

type WeightageIndicatorProps = {
  total: number;
};

export function WeightageIndicator({ total }: WeightageIndicatorProps) {
  const isOver = total > 100;
  const isExact = total === 100;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-card px-4 py-3 text-sm",
        isOver && "border-destructive/40 text-destructive",
        isExact && "border-emerald-500/40 text-emerald-700",
        !isOver && !isExact && "border-amber-500/40 text-amber-700"
      )}
    >
      <span className="text-lg font-semibold">{total} / 100%</span>
      {isOver && <span>Over limit</span>}
      {isExact && <span>Ready to submit</span>}
      {!isOver && !isExact && <span>{100 - total}% remaining</span>}
    </div>
  );
}
