"use client";

import { useState, useEffect } from "react";
import { Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/shared/notification-bell";
import { UserAvatarMenu } from "@/components/shared/user-avatar-menu";

export function DashboardHeader() {
  const [displayName, setDisplayName] = useState("there");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        setDisplayName(
          u?.name ||
            [u?.first_name, u?.last_name].filter(Boolean).join(" ") ||
            "there"
        );
      }
    } catch {}
  }, []);

  return (
    <div className="w-full sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-3 py-2.5 sm:px-4 sm:py-3 md:px-7">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <SidebarTrigger className="shrink-0" />
        <h1 className="text-base sm:text-xl md:text-2xl font-medium text-foreground truncate">
          Welcome back, {displayName} 👋
        </h1>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
        <div className="hidden lg:flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="size-4" />
            <span className="hidden xl:inline">Download Report</span>
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="size-4" />
            <span className="hidden xl:inline">Request Leave</span>
          </Button>
        </div>
        <ThemeToggle />
        <NotificationBell basePath="/api/v1" notificationsPath="/settings/notifications" />
        <UserAvatarMenu />
      </div>
    </div>
  );
}
