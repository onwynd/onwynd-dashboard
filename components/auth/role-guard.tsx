
// filepath: components/auth/role-guard.tsx
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { isAuthenticated, user, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push("/login");
    } else if (isAuthenticated === true && !allowedRoles.some(role => hasRole(role))) {
      router.push("/unauthorized");
    }
  }, [isAuthenticated, user, hasRole, allowedRoles, router]);

  if (!isAuthenticated || !allowedRoles.some(role => hasRole(role))) {
    return (
        <div className="w-full h-screen flex items-center justify-center">
            <p>Loading...</p>
        </div>
    );
  }

  return <>{children}</>;
}
