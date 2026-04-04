"use client";

import { Bell, Search, Menu, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import { useTechStore } from "@/store/tech-store";
import { UserAvatarMenu } from "@/components/shared/user-avatar-menu";
import { NotificationBell } from "@/components/shared/notification-bell";

export function DashboardHeader() {
  const { toggleSidebar } = useSidebar();
  
  const layoutDensity = useTechStore((state) => state.layoutDensity);
  const setLayoutDensity = useTechStore((state) => state.setLayoutDensity);
  const showStatsCards = useTechStore((state) => state.showStatsCards);
  const setShowStatsCards = useTechStore((state) => state.setShowStatsCards);
  const showChart = useTechStore((state) => state.showChart);
  const setShowChart = useTechStore((state) => state.setShowChart);
  const showIncidents = useTechStore((state) => state.showIncidents);
  const setShowIncidents = useTechStore((state) => state.setShowIncidents);

  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center gap-2 sm:gap-4 border-b bg-background px-3 sm:px-6 shadow-sm">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden shrink-0"
        onClick={toggleSidebar}
      >
        <Menu className="size-5" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>

      <div className="flex flex-1 items-center gap-2 sm:gap-4">
        <form className="flex-1 sm:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search resources..."
              className="w-full sm:w-[300px] pl-9 bg-muted/50"
            />
          </div>
        </form>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <Eye className="size-5" />
              <span className="sr-only">View options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>View Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={showStatsCards}
              onCheckedChange={setShowStatsCards}
            >
              Show Stats
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={showChart}
              onCheckedChange={setShowChart}
            >
              Show Charts
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={showIncidents}
              onCheckedChange={setShowIncidents}
            >
              Show Incidents
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Density</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setLayoutDensity("compact")}>
              Compact
              {layoutDensity === "compact" && <span className="ml-auto">✓</span>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLayoutDensity("default")}>
              Default
              {layoutDensity === "default" && <span className="ml-auto">✓</span>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLayoutDensity("comfortable")}>
              Comfortable
              {layoutDensity === "comfortable" && <span className="ml-auto">✓</span>}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="shrink-0">
          <Bell className="size-5" />
          <span className="sr-only">Notifications</span>
        </Button>

        <NotificationBell basePath="/api/v1" notificationsPath="/settings/notifications" />
      <UserAvatarMenu />
      </div>
    </header>
  );
}
