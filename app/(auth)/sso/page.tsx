"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import client from "@/lib/api/client";
import { getDashboardPathForRole } from "@/lib/auth/role-routing";
import { syncServerSession } from "@/lib/auth/session-client";

function SSOHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleSSO = async () => {
      const token = searchParams.get("token");
      const role = searchParams.get("role");

      if (!token) {
        console.error("No token provided for SSO");
        router.push("/login?error=sso_failed");
        return;
      }

      try {
        localStorage.setItem("auth_token", token);

        const response = await client.get("/api/v1/auth/me");
        const user = response.data.data ?? response.data;

        localStorage.setItem("user", JSON.stringify(user));

        const roleSlug =
          user?.role?.slug ??
          (typeof user?.role === "string" ? user.role : null) ??
          role ??
          "patient";

        const allRoles = Array.isArray(user?.all_roles) && user.all_roles.length > 0
          ? user.all_roles.filter((value: unknown): value is string => typeof value === "string" && value.length > 0)
          : [roleSlug];

        const secure = window.location.protocol === "https:";
        const secureFlag = secure ? "; Secure" : "";
        document.cookie = `user_role=${roleSlug}; path=/; max-age=86400; SameSite=Lax${secureFlag}`;
        document.cookie = `user_all_roles=${encodeURIComponent(JSON.stringify(allRoles))}; path=/; max-age=86400; SameSite=Lax${secureFlag}`;

        await syncServerSession(token);
        router.push(getDashboardPathForRole(roleSlug));
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
