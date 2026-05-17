import { Card, CardContent } from "@/components/ui/card";
import { Users, CheckCircle2, Clock, AlertTriangle, TrendingUp } from "lucide-react";

export type AnalyticsSummaryStats = {
  activeEmployees: number;
  goalsSubmittedPercent: number;
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
      label: "Active Employees",
      value: stats.activeEmployees.toString(),
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Goals Submitted",
      value: `${stats.goalsSubmittedPercent}%`,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Pending Approvals",
      value: stats.pendingApprovals.toString(),
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "Escalations",
      value: stats.escalations.toString(),
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-500/10",
    },
    {
      label: "Avg Org Score",
      value: `${stats.avgOrgScore}%`,
      icon: TrendingUp,
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="border-0 bg-card shadow-sm ring-1 ring-border/50 transition-all hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`flex size-10 items-center justify-center rounded-full ${item.bg} ${item.color}`}>
                <Icon className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                <p className="text-2xl font-bold">{item.value}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
