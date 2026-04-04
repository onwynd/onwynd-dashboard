"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/lib/api/auth";
import { getDashboardPathForRole } from "@/lib/auth/role-routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // `from` is set by the proxy when redirecting unauthenticated users
  const from = searchParams.get("from");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Clear any stale auth state before a fresh login attempt
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      document.cookie = "auth_token=; Max-Age=0; path=/";
      document.cookie = "user_role=; Max-Age=0; path=/";
      document.cookie = "user_all_roles=; Max-Age=0; path=/";
    }

    try {
      await authService.login({ email, password });

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      // user.role is a relation object { slug, name, ... }; fall back to string for safety
      const roleSlug: string = user.role?.slug ?? (typeof user.role === "string" ? user.role : "patient");
      // If redirected here from a protected route, go back there; otherwise role default
      const isSafe = (url: string) => url.startsWith("/") && !url.startsWith("/login") && !url.startsWith("/register");
      const destination = (from && isSafe(from)) ? from : getDashboardPathForRole(roleSlug);
      router.push(destination);
      toast({ title: "Signed in", description: "Welcome back!" });
      
    } catch (err: unknown) {
      console.error(err);
      const message =
        typeof err === "object" && err !== null && "response" in err
          ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message as string | undefined)
          : undefined;
      const msg = message || "Invalid email or password";
      setError(msg);
      toast({ title: "Login failed", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
        <CardDescription className="text-center">
          Enter your email to sign in to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="text-sm text-red-500 font-medium">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}
