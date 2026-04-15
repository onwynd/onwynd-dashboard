
// filepath: app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authService } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { ROLE_DASHBOARD_PATHS } from "@/lib/auth/role-routing";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    await authService.getCsrfCookie();
    const { data, error } = await authService.login(values);

    if (data?.user) {
      toast({
        title: "Login Successful",
        description: "Redirecting to your dashboard...",
      });
      const roleSlug = data.user.role.slug as keyof typeof ROLE_DASHBOARD_PATHS;
      const dashboardPath = ROLE_DASHBOARD_PATHS[roleSlug] ?? "/dashboard";
      const from = searchParams.get("from");
      const safeFrom = from && from.startsWith("/") ? from : null;
      router.push(safeFrom ?? dashboardPath);
      router.refresh(); // to ensure layout re-renders with new auth state
    } else {
      toast({
        title: "Login Failed",
        description: error || "An unknown error occurred.",
        variant: "destructive",
      });
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold">Welcome Back</h1>
        <p className="text-muted-foreground">Sign in to your Onwynd account</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
