"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import client from "@/lib/api/client";
import { ROLE_DASHBOARD_PATHS } from "@/lib/auth/role-routing";
import { syncServerSession } from "@/lib/auth/session-client";

function SSOHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleSSO = async () => {
      const token = searchParams.get("token");

      if (!token) {
        console.error("No token provided for SSO");
        router.push("/login?error=sso_failed");
        return;
      }

      try {
        const meResponse = await client.get("/api/v1/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const user = (meResponse.data?.data ?? meResponse.data) ?? null;
        await syncServerSession(token, user);
        const roleSlug = user?.primary_role ?? user?.role?.slug ?? user?.role ?? "patient";
        router.push(ROLE_DASHBOARD_PATHS[roleSlug as keyof typeof ROLE_DASHBOARD_PATHS] ?? "/dashboard");
      } catch (error) {
        console.error("SSO Validation Failed", error);
        router.push("/login?error=invalid_token");
      }
    };

    handleSSO();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <h2 className="text-xl font-semibold text-gray-900">Authenticating...</h2>
        <p className="text-gray-500">Please wait while we log you in securely.</p>
      </div>
    </div>
  );
}

export default function SSOPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <SSOHandler />
    </Suspense>
  );
}
