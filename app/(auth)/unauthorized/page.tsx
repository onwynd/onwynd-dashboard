"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLE_DASHBOARD_PATHS } from "@/lib/auth/role-routing";
import { useAuth } from "@/hooks/use-auth";
import { authService } from "@/lib/api/auth";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user } = useAuth();
  const role = user?.role?.slug ?? "patient";
  const dashboardPath = useMemo(
    () => ROLE_DASHBOARD_PATHS[role as keyof typeof ROLE_DASHBOARD_PATHS] ?? "/dashboard",
    [role],
  );

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You do not have access to this page.
          </p>
          <p className="text-sm">
            Current role: <span className="font-medium">{role}</span>
          </p>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => router.push(dashboardPath)}>
              Go to my dashboard
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={async () => {
                await authService.logout();
                router.push("/login");
              }}
            >
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
