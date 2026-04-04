"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/shared/notification-bell";
import { UserAvatarMenu } from "@/components/shared/user-avatar-menu";

export function DashboardHeader() {
  return (
    <div className="w-full sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-3 py-2.5 sm:px-4 sm:py-3 md:px-7">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <SidebarTrigger className="shrink-0" />
        <h1 className="text-base sm:text-xl md:text-2xl font-medium text-foreground truncate">
          My Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
        <ThemeToggle />
        <NotificationBell basePath="/api/v1/patient" notificationsPath="/notifications" />
        <UserAvatarMenu />
      </div>
    </div>
  );
}
