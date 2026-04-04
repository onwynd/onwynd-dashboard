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
import { usePartnerStore } from "@/store/partner-store";
import { UserAvatarMenu } from "@/components/shared/user-avatar-menu";
import { NotificationBell } from "@/components/shared/notification-bell";

export function DashboardHeader() {
  const showAlertBanner = usePartnerStore((state) => state.showAlertBanner);
  const showStatsCards = usePartnerStore((state) => state.showStatsCards);
  const showChart = usePartnerStore((state) => state.showChart);
  const showTable = usePartnerStore((state) => state.showTable);
  const layoutDensity = usePartnerStore((state) => state.layoutDensity);
  const setShowAlertBanner = usePartnerStore((state) => state.setShowAlertBanner);
  const setShowStatsCards = usePartnerStore((state) => state.setShowStatsCards);
  const setShowChart = usePartnerStore((state) => state.setShowChart);
  const setShowTable = usePartnerStore((state) => state.setShowTable);
  const setLayoutDensity = usePartnerStore((state) => state.setLayoutDensity);

  return (
    <header className="w-full flex items-center gap-3 px-4 sm:px-6 py-4 border-b bg-background">
      <SidebarTrigger className="lg:hidden">
        <PanelLeft className="size-5" />
      </SidebarTrigger>

      <LayoutDashboard className="size-6" />
      <h1 className="flex-1 font-medium text-base">Partner Dashboard</h1>

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
