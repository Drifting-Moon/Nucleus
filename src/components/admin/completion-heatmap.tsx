import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { EmployeeCompletionRow } from "@/lib/admin/completion-data";
import { cn } from "@/lib/utils";

type CompletionHeatmapProps = {
  employees: EmployeeCompletionRow[];
};

export function CompletionHeatmap({ employees }: CompletionHeatmapProps) {
  const heatmapData = useMemo(() => {
    const deps = new Map<string, { total: number; q1: number; q2: number; q3: number; annual: number }>();

    for (const emp of employees) {
      const dep = emp.department || "Unassigned";
      if (!deps.has(dep)) {
        deps.set(dep, { total: 0, q1: 0, q2: 0, q3: 0, annual: 0 });
      }
      const data = deps.get(dep)!;
      data.total += 1;
      if (emp.q1 === "done") data.q1 += 1;
      if (emp.q2 === "done") data.q2 += 1;
      if (emp.q3 === "done") data.q3 += 1;
      if (emp.annual === "done") data.annual += 1;
    }

    return Array.from(deps.entries()).map(([department, data]) => ({
      department,
      q1: data.total > 0 ? (data.q1 / data.total) * 100 : 0,
      q2: data.total > 0 ? (data.q2 / data.total) * 100 : 0,
      q3: data.total > 0 ? (data.q3 / data.total) * 100 : 0,
      annual: data.total > 0 ? (data.annual / data.total) * 100 : 0,
      totalCount: data.total,
    })).sort((a, b) => b.totalCount - a.totalCount); // sort by size
  }, [employees]);

  const getColorClass = (percent: number) => {
    if (percent === 0) return "bg-slate-100 dark:bg-slate-800 text-transparent";
    if (percent < 25) return "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300";
    if (percent < 50) return "bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200";
    if (percent < 75) return "bg-emerald-400 dark:bg-emerald-700 text-emerald-950 dark:text-emerald-100";
    if (percent < 100) return "bg-emerald-500 dark:bg-emerald-600 text-white dark:text-white";
    return "bg-emerald-600 dark:bg-emerald-500 text-white dark:text-white";
  };

  if (heatmapData.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Completion Heatmap</CardTitle>
        <CardDescription>Check-in completion rates by department across quarters.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[500px] text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-3 pr-4 font-medium w-1/3">Department</th>
              <th className="pb-3 pr-2 text-center font-medium">Q1</th>
              <th className="pb-3 pr-2 text-center font-medium">Q2</th>
              <th className="pb-3 pr-2 text-center font-medium">Q3</th>
              <th className="pb-3 text-center font-medium">Annual</th>
            </tr>
          </thead>
          <tbody>
            {heatmapData.map((row) => (
              <tr key={row.department} className="border-b last:border-0">
                <td className="py-2.5 pr-4 font-medium">
                  {row.department}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">({row.totalCount})</span>
                </td>
                {["q1", "q2", "q3", "annual"].map((q) => {
                  const percent = row[q as keyof typeof row] as number;
                  return (
                    <td key={q} className="py-1.5 pr-2">
                      <div
                        className={cn(
                          "mx-auto flex h-8 w-14 items-center justify-center rounded text-xs font-semibold transition-colors",
                          getColorClass(percent)
                        )}
                        title={`${Math.round(percent)}% completed`}
                      >
                        {percent > 0 ? `${Math.round(percent)}%` : ""}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
