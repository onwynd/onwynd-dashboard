"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/shared/notification-bell";
import { UserAvatarMenu } from "@/components/shared/user-avatar-menu";
import Cookies from "js-cookie";
import { INSTITUTIONAL_ADMIN_ROLES } from "@/lib/auth/role-routing";
import { ExecutiveBrandValuation } from "@/components/shared/executive-brand-valuation";

const STAFF_ROLES = ["admin", "super_admin", "coo", "ceo", "closer", "finder", "builder", "corporate_hr"] as const;

export function DashboardHeader() {
  const roleSlug = Cookies.get("user_role");
  const isInstitutionalRole = roleSlug ? INSTITUTIONAL_ADMIN_ROLES.includes(roleSlug as (typeof INSTITUTIONAL_ADMIN_ROLES)[number]) : false;
  const isStaffRole = roleSlug ? STAFF_ROLES.includes(roleSlug as (typeof STAFF_ROLES)[number]) : false;
  const notificationBasePath = isInstitutionalRole
    ? "/api/v1/institutional"
    : isStaffRole
      ? "/api/v1/admin"
      : "/api/v1/patient";
  const notificationPath = isInstitutionalRole ? "/institutional/notifications" : "/notifications";
  const showExecutiveValuation = roleSlug === "ceo" || roleSlug === "coo";

  return (
    <div className="w-full sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-3 py-2.5 sm:px-4 sm:py-3 md:px-7">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <SidebarTrigger className="shrink-0" />
        <h1 className="text-base sm:text-xl md:text-2xl font-medium text-foreground truncate">
          My Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
        {showExecutiveValuation && <ExecutiveBrandValuation mode="chip" className="hidden 2xl:flex" />}
        <ThemeToggle />
        <NotificationBell basePath={notificationBasePath} notificationsPath={notificationPath} />
        <UserAvatarMenu />
      </div>
    </div>
  );
}
