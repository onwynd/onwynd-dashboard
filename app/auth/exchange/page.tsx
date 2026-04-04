"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AppConfig } from "@/lib/config";
import { getDashboardPathForRole } from "@/lib/auth/role-routing";
import { syncServerSession } from "@/lib/auth/session-client";
import client from "@/lib/api/client";

function persistRoleCookies(roleSlug: string, allRoles: string[]) {
  const secure = window.location.protocol === "https:";
  const secureFlag = secure ? "; Secure" : "";

  document.cookie = `user_role=${roleSlug}; path=/; max-age=86400; SameSite=Lax${secureFlag}`;
  document.cookie = `user_all_roles=${encodeURIComponent(JSON.stringify(allRoles))}; path=/; max-age=86400; SameSite=Lax${secureFlag}`;
}

function ExchangeHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const completeExchange = async () => {
      const code = searchParams.get("code");
      const next = searchParams.get("next");

      if (!code) {
        router.replace("/login?error=missing_exchange_code");
        return;
      }

      try {
        const exchangeResponse = await fetch(
          AppConfig.getApiUrl(`/api/v1/auth/exchange?code=${encodeURIComponent(code)}`),
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            credentials: "include",
            cache: "no-store",
          },
        );

        if (!exchangeResponse.ok) {
          router.replace("/login?error=invalid_exchange_code");
          return;
        }

        const exchangePayload = (await exchangeResponse.json()) as {
          data?: { token?: string };
          token?: string;
        };
        const token = exchangePayload?.data?.token ?? exchangePayload?.token;

        if (!token) {
          router.replace("/login?error=missing_exchange_token");
          return;
        }

        localStorage.setItem("auth_token", token);

        const userResponse = await client.get("/api/v1/auth/me");
        const user = userResponse.data.data ?? userResponse.data;
        localStorage.setItem("user", JSON.stringify(user));

        const roleSlug =
          user?.role?.slug ??
          (typeof user?.role === "string" ? user.role : null) ??
          "patient";

        const allRoles =
          Array.isArray(user?.all_roles) && user.all_roles.length > 0
            ? user.all_roles.filter(
                (value: unknown): value is string =>
                  typeof value === "string" && value.length > 0,
              )
            : [roleSlug];

        persistRoleCookies(roleSlug, allRoles);
        await syncServerSession(token);

        const isSafeNext =
          typeof next === "string" &&
          next.startsWith("/") &&
          !next.startsWith("/login") &&
          !next.startsWith("/register");

        router.replace(
          isSafeNext ? next : getDashboardPathForRole(roleSlug),
        );
      } catch (error) {
        console.error("Exchange authentication failed", error);
        router.replace("/login?error=exchange_failed");
      }
    };

    void completeExchange();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <h2 className="text-xl font-semibold text-gray-900">
          Signing you in...
        </h2>
        <p className="text-gray-500">
          We&apos;re finishing your secure dashboard access.
        </p>
      </div>
    </div>
  );
}

export default function ExchangePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <ExchangeHandler />
    </Suspense>
  );
}
