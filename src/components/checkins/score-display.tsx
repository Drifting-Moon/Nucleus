import { Badge } from "@/components/ui/badge";
import { formatScorePercent, getScoreTier } from "@/lib/calculate-score";
import { cn } from "@/lib/utils";

type ScoreDisplayProps = {
  score: number | null;
  showBar?: boolean;
};

const tierClass: Record<ReturnType<typeof getScoreTier>, string> = {
  green:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
  yellow: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  red: "border-red-500/20 bg-red-500/15 text-red-600 dark:text-red-400",
};

const barClass: Record<ReturnType<typeof getScoreTier>, string> = {
  green: "bg-emerald-500",
  yellow: "bg-amber-500",
  red: "bg-red-500",
};

export function ScoreDisplay({ score, showBar = true }: ScoreDisplayProps) {
  if (score === null) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  const tier = getScoreTier(score);
  const barWidth = Math.min(Math.round(score * 100), 150);

  return (
    <div className="flex min-w-[8rem] flex-col gap-1">
      <Badge variant="outline" className={cn("w-fit", tierClass[tier])}>
        {formatScorePercent(score)}
      </Badge>
      {showBar ? (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-all", barClass[tier])}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}
