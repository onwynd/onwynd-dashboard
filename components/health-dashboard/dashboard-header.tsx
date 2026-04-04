"use client";

import { Download, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { NotificationBell } from "@/components/shared/notification-bell";
import { UserAvatarMenu } from "@/components/shared/user-avatar-menu";

export function DashboardHeader() {
  const isMobile = useIsMobile();

  return (
    <header className="flex h-16 w-full items-center justify-between border-b px-4 lg:px-6 bg-background shrink-0">
      <div className="flex items-center gap-4">
        {isMobile && <SidebarTrigger />}
        <h1 className="text-base sm:text-xl md:text-2xl font-medium text-foreground truncate">
          Center Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="hidden md:flex relative w-64 lg:w-80">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search patients, records..."
            className="pl-9 bg-background"
          />
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="size-4" />
            <span className="hidden xl:inline">Daily Report</span>
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="size-4" />
            <span className="hidden xl:inline">Check In Patient</span>
          </Button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 border-l pl-2 sm:pl-4">
          <NotificationBell basePath="/api/v1" notificationsPath="/settings/notifications" />
          <UserAvatarMenu />
        </div>
      </div>
    </header>
  );
}
