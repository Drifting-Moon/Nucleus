import { Badge } from "@/components/ui/badge";
import { formatGoalTarget, formatUomLabel } from "@/lib/format-goal-target";
import { cn } from "@/lib/utils";

type LockedGoalCardProps = {
  title: string;
  status: string;
  statusLabel?: string;
  thrustArea: string;
  uom: string;
  target: number | "" | null;
  targetDate: string;
  weightage: number | "";
  description?: string;
  className?: string;
};

export function LockedGoalCard({
  title,
  status,
  statusLabel,
  thrustArea,
  uom,
  target,
  targetDate,
  weightage,
  description,
  className,
}: LockedGoalCardProps) {
  const targetDisplay = formatGoalTarget(uom, target, targetDate);

  return (
    <article
      className={cn(
        "rounded-lg border bg-card p-4 shadow-sm",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-base font-semibold">{title || "Untitled goal"}</h3>
        <Badge variant="secondary">{statusLabel ?? status}</Badge>
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Thrust area
          </dt>
          <dd className="mt-0.5 capitalize">{thrustArea || "Not set"}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Unit of measure
          </dt>
          <dd className="mt-0.5">{formatUomLabel(uom)}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {uom === "timeline" ? "Due date" : "Target"}
          </dt>
          <dd className="mt-0.5 font-medium">{targetDisplay}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Weightage
          </dt>
          <dd className="mt-0.5 font-medium">{weightage}%</dd>
        </div>
      </dl>
      {description?.trim() ? (
        <p className="mt-4 border-t pt-3 text-sm text-muted-foreground">{description}</p>
      ) : null}
    </article>
  );
}
