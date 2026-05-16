"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase";

export type OrgEmployee = {
  id: string;
  name: string;
  email: string;
  department: string | null;
  manager_id: string | null;
};

export type OrgManager = {
  id: string;
  name: string;
  email: string;
};

type OrgHierarchyFormProps = {
  employees: OrgEmployee[];
  managers: OrgManager[];
};

export function OrgHierarchyForm({ employees, managers }: OrgHierarchyFormProps) {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(employees.map((employee) => [employee.id, employee.manager_id]))
  );
  const [savingId, setSavingId] = useState<string | null>(null);

  const assignManager = async (employeeId: string, managerId: string | null) => {
    setSavingId(employeeId);
    const supabase = createClient();

    const { error } = await supabase
      .from("users")
      .update({ manager_id: managerId })
      .eq("id", employeeId)
      .eq("role", "employee");

    setSavingId(null);

    if (error) {
      toast.error(error.message);
      return;
    }

    setAssignments((current) => ({ ...current, [employeeId]: managerId }));
    toast.success("Manager assignment updated");
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization hierarchy</CardTitle>
        <CardDescription>
          Assign each employee to their L1 manager. Managers only see direct reports on their team
          dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {employees.length === 0 ? (
          <p className="text-sm text-muted-foreground">No employees found.</p>
        ) : managers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No managers found. Create a user with role &quot;manager&quot; first.
          </p>
        ) : (
          employees.map((employee) => {
            const selectedManagerId = assignments[employee.id] ?? null;

            return (
              <div
                key={employee.id}
                className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <UserAvatar name={employee.name} size="sm" />
                  <div>
                    <p className="font-medium">{employee.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {employee.department || "No department"} · {employee.email}
                    </p>
                  </div>
                </div>
                <div className="flex min-w-[220px] flex-col gap-2 sm:flex-row sm:items-center">
                  <Select
                    value={selectedManagerId ?? "none"}
                    onValueChange={(value) => {
                      const nextManagerId = value === "none" ? null : value;
                      setAssignments((current) => ({
                        ...current,
                        [employee.id]: nextManagerId,
                      }));
                    }}
                    disabled={savingId === employee.id}
                  >
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No manager</SelectItem>
                      {managers.map((manager) => (
                        <SelectItem key={manager.id} value={manager.id}>
                          {manager.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={
                      savingId === employee.id ||
                      selectedManagerId === (employee.manager_id ?? null)
                    }
                    onClick={() => assignManager(employee.id, selectedManagerId)}
                  >
                    {savingId === employee.id ? "Saving…" : "Save"}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
