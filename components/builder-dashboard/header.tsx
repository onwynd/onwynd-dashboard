"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Building2, PanelLeft } from "lucide-react";
import { UserAvatarMenu } from "@/components/shared/user-avatar-menu";
import { NotificationBell } from "@/components/shared/notification-bell";

export function BuilderHeader() {
  return (
    <header className="w-full flex items-center gap-3 px-4 sm:px-6 py-4 border-b bg-background sticky top-0 z-10">
      <SidebarTrigger className="lg:hidden">
        <PanelLeft className="size-5" />
      </SidebarTrigger>
      <Building2 className="size-5 text-teal shrink-0" />
      <h1 className="flex-1 font-medium text-base">Builder Dashboard</h1>
      <ThemeToggle />
      <NotificationBell basePath="/api/v1/sales" notificationsPath="/builder/notifications" />
      <UserAvatarMenu />
    </header>
  );
}
