"use client";

import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Search } from "lucide-react";
import { UserAvatarMenu } from "@/components/shared/user-avatar-menu";
import { NotificationBell } from "@/components/shared/notification-bell";
import { RoleSwitcher } from "@/components/shared/role-switcher";

interface PortalHeaderProps {
  /** API base path for fetching notifications, e.g. "/api/v1" */
  notificationsBasePath?: string;
  /** Href for the notifications settings page */
  notificationsPath?: string;
  /** Search placeholder text */
  searchPlaceholder?: string;
}

export function PortalHeader({
  notificationsBasePath = "/api/v1",
  notificationsPath = "/settings/notifications",
  searchPlaceholder = "Search...",
}: PortalHeaderProps) {
  return (
    <header className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 border-b bg-card sticky top-0 z-10 w-full">
      <SidebarTrigger className="-ml-1 sm:-ml-2" />

      <div className="hidden md:block relative flex-1 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          className="pl-9 h-9 bg-muted/50 border"
        />
      </div>

      <div className="flex-1" />

      <ThemeToggle />
      <RoleSwitcher />
      <NotificationBell basePath={notificationsBasePath} notificationsPath={notificationsPath} />
      <UserAvatarMenu />
    </header>
  );
}
