"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  LayoutDashboard,
  PanelLeft,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useSecretaryStore } from "@/store/secretary-store";
import { UserAvatarMenu } from "@/components/shared/user-avatar-menu";
import { NotificationBell } from "@/components/shared/notification-bell";

export function DashboardHeader() {
  const layoutDensity = useSecretaryStore((state) => state.layoutDensity);
  const showCalendar = useSecretaryStore((state) => state.showCalendar);
  const showTasks = useSecretaryStore((state) => state.showTasks);
  const setLayoutDensity = useSecretaryStore((state) => state.setLayoutDensity);
  const setShowCalendar = useSecretaryStore((state) => state.setShowCalendar);
  const setShowTasks = useSecretaryStore((state) => state.setShowTasks);

  return (
    <header className="w-full flex items-center gap-3 px-4 sm:px-6 py-4 border-b bg-background">
      <SidebarTrigger className="lg:hidden">
        <PanelLeft className="size-5" />
      </SidebarTrigger>

      <LayoutDashboard className="size-6" />
      <h1 className="flex-1 font-medium text-base">Secretary Dashboard</h1>

      <span className="hidden sm:block text-sm text-muted-foreground">
        Today: {new Date().toLocaleDateString()}
      </span>

      <div className="hidden sm:block h-6 w-px bg-border" />

      <ThemeToggle />
      <NotificationBell basePath="/api/v1" notificationsPath="/settings/notifications" />
      <UserAvatarMenu />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
            <PanelLeft className="size-4" />
            View
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-muted-foreground text-xs font-medium">
            Layout Density
          </DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={layoutDensity === "comfortable"}
            onCheckedChange={() => setLayoutDensity("comfortable")}
          >
            Comfortable
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={layoutDensity === "compact"}
            onCheckedChange={() => setLayoutDensity("compact")}
          >
            Compact
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-muted-foreground text-xs font-medium">
            Widgets
          </DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={showCalendar}
            onCheckedChange={setShowCalendar}
          >
            Calendar
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={showTasks}
            onCheckedChange={setShowTasks}
          >
            Tasks
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
