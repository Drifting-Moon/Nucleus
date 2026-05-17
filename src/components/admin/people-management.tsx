"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { RoleBadge, type UserRole } from "@/components/ui/role-badge";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type AdminPerson = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string | null;
  manager_id: string | null;
};

type PeopleManagementProps = {
  people: AdminPerson[];
  managers: { id: string; name: string; email: string }[];
};

export function PeopleManagement({ people, managers }: PeopleManagementProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("password123");
  const [role, setRole] = useState<UserRole>("employee");
  const [department, setDepartment] = useState("");
  const [managerId, setManagerId] = useState<string>("none");
  const [saving, setSaving] = useState(false);

  const counts = useMemo(
    () => ({
      admins: people.filter((person) => person.role === "admin").length,
      managers: people.filter((person) => person.role === "manager").length,
      employees: people.filter((person) => person.role === "employee").length,
    }),
    [people]
  );

  const createUser = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        role,
        department,
        manager_id: managerId === "none" ? null : managerId,
      }),
    });

    let result;
    try {
      result = await response.json();
    } catch (err) {
      setSaving(false);
      toast.error("An unexpected server error occurred. Check the console.");
      return;
    }

    setSaving(false);

    if (!response.ok) {
      toast.error(result.error ?? "Could not create user.");
      return;
    }

    toast.success(`${name} added`);
    setName("");
    setEmail("");
    setPassword("password123");
    setRole("employee");
    setDepartment("");
    setManagerId("none");
    router.refresh();
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="size-4" />
            Add person
          </CardTitle>
          <CardDescription>
            Create a login and profile from inside Nucleus. Default password is editable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={createUser}>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Name</label>
              <Input value={name} onChange={(event) => setName(event.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="text"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Role</label>
                <Select
                  value={role}
                  onValueChange={(value) => {
                    const nextRole = value as UserRole;
                    setRole(nextRole);
                    if (nextRole !== "employee") setManagerId("none");
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Department</label>
                <Input value={department} onChange={(event) => setDepartment(event.target.value)} />
              </div>
            </div>
            {role === "employee" ? (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">L1 Manager</label>
                <Select value={managerId} onValueChange={(value) => setManagerId(value ?? "none")}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No manager</SelectItem>
                    {managers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.name || manager.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Creating..." : "Create person"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>People directory</CardTitle>
          <CardDescription>
            {counts.employees} employees, {counts.managers} managers, {counts.admins} admins
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Person</th>
                <th className="pb-2 pr-4 font-medium">Role</th>
                <th className="pb-2 pr-4 font-medium">Department</th>
                <th className="pb-2 font-medium">Manager</th>
              </tr>
            </thead>
            <tbody>
              {people.map((person) => {
                const manager = managers.find((item) => item.id === person.manager_id);

                return (
                  <tr key={person.id} className="border-b last:border-0">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <UserAvatar name={person.name} size="sm" />
                        <div>
                          <p className="font-medium">{person.name}</p>
                          <p className="text-xs text-muted-foreground">{person.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <RoleBadge role={person.role} />
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {person.department || "No department"}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {manager?.name || manager?.email || "None"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
