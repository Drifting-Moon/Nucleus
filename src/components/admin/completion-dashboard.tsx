"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { StatusCell } from "@/components/admin/status-cell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  EmployeeCompletionRow,
  ManagerCompletionRow,
} from "@/lib/admin/completion-data";

type CompletionDashboardProps = {
  employees: EmployeeCompletionRow[];
  managers: ManagerCompletionRow[];
};

export function CompletionDashboard({ employees, managers }: CompletionDashboardProps) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Live view of goal and check-in completion across the organization.
        </p>
        <Button type="button" variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? "Refreshing…" : "Refresh"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee completion</CardTitle>
          <CardDescription>Goal submission and quarterly check-ins by employee.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {employees.length === 0 ? (
            <p className="text-sm text-muted-foreground">No employees found.</p>
          ) : (
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Employee</th>
                  <th className="pb-2 pr-4 font-medium">Department</th>
                  <th className="pb-2 pr-2 text-center font-medium">Submitted</th>
                  <th className="pb-2 pr-2 text-center font-medium">Approved</th>
                  <th className="pb-2 pr-2 text-center font-medium">Q1</th>
                  <th className="pb-2 pr-2 text-center font-medium">Q2</th>
                  <th className="pb-2 pr-2 text-center font-medium">Q3</th>
                  <th className="pb-2 text-center font-medium">Annual</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((row) => (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">{row.name}</td>
                    <td className="py-2 pr-4 text-muted-foreground">
                      {row.department || "—"}
                    </td>
                    <td className="py-2 pr-2 text-center">
                      <StatusCell status={row.goalsSubmitted} />
                    </td>
                    <td className="py-2 pr-2 text-center">
                      <StatusCell status={row.goalsApproved} />
                    </td>
                    <td className="py-2 pr-2 text-center">
                      <StatusCell status={row.q1} />
                    </td>
                    <td className="py-2 pr-2 text-center">
                      <StatusCell status={row.q2} />
                    </td>
                    <td className="py-2 pr-2 text-center">
                      <StatusCell status={row.q3} />
                    </td>
                    <td className="py-2 text-center">
                      <StatusCell status={row.annual} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manager completion</CardTitle>
          <CardDescription>
            Managers with direct reports still awaiting goal review.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {managers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No managers found.</p>
          ) : (
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Manager</th>
                  <th className="pb-2 pr-4 font-medium">Department</th>
                  <th className="pb-2 pr-4 font-medium">Team size</th>
                  <th className="pb-2 pr-4 font-medium">Pending reviews</th>
                  <th className="pb-2 text-center font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {managers.map((row) => (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">{row.name}</td>
                    <td className="py-2 pr-4 text-muted-foreground">
                      {row.department || "—"}
                    </td>
                    <td className="py-2 pr-4">{row.teamCount}</td>
                    <td className="py-2 pr-4">{row.pendingReviews}</td>
                    <td className="py-2 text-center">
                      <StatusCell status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
