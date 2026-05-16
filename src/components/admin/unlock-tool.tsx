"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { UnlockDialog, type UnlockGoal } from "@/components/admin/unlock-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export type EmployeeWithLockedGoals = {
  id: string;
  name: string;
  email: string;
  department: string | null;
  goals: UnlockGoal[];
};

type UnlockToolProps = {
  adminId: string;
  employees: EmployeeWithLockedGoals[];
};

export function UnlockTool({ adminId, employees }: UnlockToolProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editGoal, setEditGoal] = useState<UnlockGoal | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(
      (employee) =>
        employee.name.toLowerCase().includes(q) || employee.email.toLowerCase().includes(q)
    );
  }, [employees, query]);

  const selected = employees.find((employee) => employee.id === selectedId) ?? filtered[0] ?? null;

  const openEdit = (goal: UnlockGoal) => {
    setEditGoal(goal);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Unlock & edit goals</CardTitle>
          <CardDescription>
            Search an employee, edit a locked goal, and save — every change is audit-logged.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search by name or email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No employees match your search.
            </div>
          ) : (
            <div className="flex flex-col gap-4 md:flex-row">
              <ul className="md:w-1/3 space-y-1 rounded-lg border p-2 max-h-64 overflow-y-auto">
                {filtered.map((employee) => (
                  <li key={employee.id}>
                    <button
                      type="button"
                      className={`w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted ${
                        selected?.id === employee.id ? "bg-muted font-medium" : ""
                      }`}
                      onClick={() => setSelectedId(employee.id)}
                    >
                      {employee.name}
                      <span className="block text-xs text-muted-foreground">{employee.email}</span>
                    </button>
                  </li>
                ))}
              </ul>

              <div className="flex-1 space-y-3">
                {selected ? (
                  <>
                    <p className="text-sm font-medium">
                      {selected.name} · {selected.department || "No department"}
                    </p>
                    {selected.goals.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No locked or approved goals for this employee.
                      </p>
                    ) : (
                      selected.goals.map((goal) => (
                        <div
                          key={goal.id}
                          className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <Lock className="size-4 text-muted-foreground" />
                              <span className="font-medium">{goal.title || "Untitled"}</span>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Status: {goal.status} · Weightage: {goal.weightage}%
                            </p>
                          </div>
                          <Button type="button" size="sm" onClick={() => openEdit(goal)}>
                            Edit goal
                          </Button>
                        </div>
                      ))
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Select an employee.</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <UnlockDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        goal={editGoal}
        adminId={adminId}
        onSaved={() => router.refresh()}
      />
    </div>
  );
}
