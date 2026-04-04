"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { LayoutDashboard, PanelLeft, Check, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useClinicalStore, type LayoutDensity } from "@/store/clinical-store";
import { UserAvatarMenu } from "@/components/shared/user-avatar-menu";
import { NotificationBell } from "@/components/shared/notification-bell";

const densityLabels: Record<LayoutDensity, string> = {
  default: "Default",
  compact: "Compact",
  comfortable: "Comfortable",
};

export function DashboardHeader() {
  const showAlertBanner = useClinicalStore((state) => state.showAlertBanner);
  const showStatsCards = useClinicalStore((state) => state.showStatsCards);
  const showChart = useClinicalStore((state) => state.showChart);
  const showTable = useClinicalStore((state) => state.showTable);
  const layoutDensity = useClinicalStore((state) => state.layoutDensity);
  const setShowAlertBanner = useClinicalStore((state) => state.setShowAlertBanner);
  const setShowStatsCards = useClinicalStore((state) => state.setShowStatsCards);
  const setShowChart = useClinicalStore((state) => state.setShowChart);
  const setShowTable = useClinicalStore((state) => state.setShowTable);
  const setLayoutDensity = useClinicalStore((state) => state.setLayoutDensity);
  const resetLayout = useClinicalStore((state) => state.resetLayout);

  return (
    <header className="w-full flex items-center gap-3 px-4 sm:px-6 py-4 border-b bg-background">
      <SidebarTrigger className="lg:hidden">
        <PanelLeft className="size-5" />
      </SidebarTrigger>

      <LayoutDashboard className="size-6" />
      <h1 className="flex-1 font-medium text-base">Dashboard</h1>

      <ThemeToggle />
      <NotificationBell basePath="/api/v1" notificationsPath="/clinical/notifications" />
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
          {(Object.keys(densityLabels) as LayoutDensity[]).map((key) => (
            <DropdownMenuItem key={key} onClick={() => setLayoutDensity(key)}>
              {densityLabels[key]}
              {layoutDensity === key && <Check className="size-4 ml-auto" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-muted-foreground text-xs font-medium">
            Show / Hide Sections
          </DropdownMenuLabel>
          <DropdownMenuCheckboxItem checked={showAlertBanner} onCheckedChange={setShowAlertBanner}>
            Alert Banner
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={showStatsCards} onCheckedChange={setShowStatsCards}>
            Statistics Cards
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={showChart} onCheckedChange={setShowChart}>
            Financial Flow Chart
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={showTable} onCheckedChange={setShowTable}>
            Employees Table
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={resetLayout}>
            <RefreshCw className="size-4 mr-2" />
            Reset to Default
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
