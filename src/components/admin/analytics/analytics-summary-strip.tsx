import { Card, CardContent } from "@/components/ui/card";
import { Clock, TrendingUp, CheckSquare } from "lucide-react";

export type AnalyticsSummaryStats = {
  activeEmployees: number;
  goalsSubmittedPercent: number;
  checkinsSubmittedPercent: number;
  pendingApprovals: number;
  escalations: number;
  avgOrgScore: number;
};

type Props = {
  stats: AnalyticsSummaryStats;
};

export function AnalyticsSummaryStrip({ stats }: Props) {
  const items = [
    {
      label: "Org Avg Score",
      value: `${stats.avgOrgScore}%`,
      icon: TrendingUp,
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-500/10",
      desc: "Mean of weighted goal scores",
    },
    {
      label: "Check-ins Submitted",
      value: `${stats.checkinsSubmittedPercent}%`,
      icon: CheckSquare,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      desc: "Submitted check-ins for active cycle",
    },
    {
      label: "Pending Approvals",
      value: stats.pendingApprovals.toString(),
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
      desc: "Goal sheets awaiting manager review",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="border bg-card shadow-sm transition-all hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`flex size-12 items-center justify-center rounded-xl ${item.bg} ${item.color}`}>
                <Icon className="size-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-3xl font-extrabold tracking-tight">{item.value}</p>
                <p className="text-xs text-muted-foreground/80 mt-0.5">{item.desc}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
