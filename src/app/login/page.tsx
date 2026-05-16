"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const loginTypes = [
  { label: "Employee", email: "employee@test.com" },
  { label: "Manager", email: "manager@test.com" },
  { label: "Admin", email: "admin@test.com" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedLoginType, setSelectedLoginType] = useState("Employee");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const selectLoginType = (loginType: (typeof loginTypes)[number]) => {
    setSelectedLoginType(loginType.label);
    setEmail(loginType.email);
    setPassword("password123");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const expectedRole = selectedLoginType.toLowerCase();
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profileError || profile?.role !== expectedRole) {
      await supabase.auth.signOut();
      setError(`This account is not a ${selectedLoginType} account.`);
      setLoading(false);
      return;
    }

    // Session is now set automatically via cookies.
    // The middleware will read the role and redirect, so just push to root.
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Nucleus</CardTitle>
          <CardDescription>Enter your email and password to access your dashboard.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && <div className="text-sm text-destructive font-medium">{error}</div>}
            <div className="space-y-2">
              <label className="text-sm font-medium">Login as</label>
              <div className="grid grid-cols-3 gap-2">
                {loginTypes.map((loginType) => (
                  <Button
                    key={loginType.label}
                    type="button"
                    variant={selectedLoginType === loginType.label ? "default" : "outline"}
                    onClick={() => selectLoginType(loginType)}
                  >
                    {loginType.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder={loginTypes.find((loginType) => loginType.label === selectedLoginType)?.email}
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="password123"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
