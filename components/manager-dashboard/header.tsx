"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { LayoutDashboard, PanelLeft } from "lucide-react";
import { UserAvatarMenu } from "@/components/shared/user-avatar-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useManagerStore } from "@/store/manager-store";
import { NotificationBell } from "@/components/shared/notification-bell";

export function DashboardHeader() {
  const showAlertBanner = useManagerStore((state) => state.showAlertBanner);
  const showStatsCards = useManagerStore((state) => state.showStatsCards);
  const showChart = useManagerStore((state) => state.showChart);
  const showTable = useManagerStore((state) => state.showTable);
  const layoutDensity = useManagerStore((state) => state.layoutDensity);
  const setShowAlertBanner = useManagerStore((state) => state.setShowAlertBanner);
  const setShowStatsCards = useManagerStore((state) => state.setShowStatsCards);
  const setShowChart = useManagerStore((state) => state.setShowChart);
  const setShowTable = useManagerStore((state) => state.setShowTable);
  const setLayoutDensity = useManagerStore((state) => state.setLayoutDensity);

  return (
    <header className="w-full flex items-center gap-3 px-4 sm:px-6 py-4 border-b bg-background">
      <SidebarTrigger className="lg:hidden">
        <PanelLeft className="size-5" />
      </SidebarTrigger>

      <LayoutDashboard className="size-6" />
      <h1 className="flex-1 font-medium text-base">Manager Dashboard</h1>

      <ThemeToggle />
      <NotificationBell basePath="/api/v1" notificationsPath="/settings/notifications" />
      <UserAvatarMenu />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
            <PanelLeft className="size-4" />
            Edit Layout
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-muted-foreground text-xs font-medium">
            Layout Density
          </DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={layoutDensity === "default"}
            onCheckedChange={() => setLayoutDensity("default")}
          >
            Default
          </DropdownMenuCheckboxItem>
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
            View Options
          </DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={showAlertBanner}
            onCheckedChange={setShowAlertBanner}
          >
            Alert Banner
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={showStatsCards}
            onCheckedChange={setShowStatsCards}
          >
            Stats Cards
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={showChart}
            onCheckedChange={setShowChart}
          >
            Charts
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={showTable}
            onCheckedChange={setShowTable}
          >
            Tables
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
