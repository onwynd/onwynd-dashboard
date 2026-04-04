"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";

/**
 * Role-based route guard for the Sales CRM.
 *
 * Rules:
 *  - /sales/closer  → only closer, admin, founder, ceo
 *  - All other /sales/* → any authenticated sales role
 *
 * Finder / sales / builder / relationship_manager are redirected
 * away from the Closer Dashboard to their own dashboard.
 */

const CLOSER_ONLY_ROLES = ["closer", "admin", "founder", "ceo"];

function getUserRole(): string {
  return Cookies.get("user_role") ?? "";
}

export function SalesRoleGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [allowed, setAllowed] = useState(true);

  useEffect(() => {
    const role = getUserRole();

    // Closer Dashboard is restricted
    if (pathname.startsWith("/sales/closer") && !CLOSER_ONLY_ROLES.includes(role)) {
      setAllowed(false);
      router.replace("/sales/dashboard");
      return;
    }

    setAllowed(true);
  }, [pathname, router]);

  if (!allowed) return null;
  return <>{children}</>;
}
