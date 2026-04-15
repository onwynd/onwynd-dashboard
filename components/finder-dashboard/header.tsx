"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { LayoutDashboard, PanelLeft, Plus, UserPlus, Check, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useFinderStore, type LayoutDensity } from "@/store/finder-store";
import { UserAvatarMenu } from "@/components/shared/user-avatar-menu";
import { NotificationBell } from "@/components/shared/notification-bell";
import { useRouter } from "next/navigation";

const densityLabels: Record<LayoutDensity, string> = {
  default: "Default",
  compact: "Compact",
  comfortable: "Comfortable",
};

export function FinderHeader() {
  const router = useRouter();
  const showAlertBanner = useFinderStore((state) => state.showAlertBanner);
  const showStatsCards = useFinderStore((state) => state.showStatsCards);
  const showChart = useFinderStore((state) => state.showChart);
  const showTable = useFinderStore((state) => state.showTable);
  const layoutDensity = useFinderStore((state) => state.layoutDensity);
  const setShowAlertBanner = useFinderStore((state) => state.setShowAlertBanner);
  const setShowStatsCards = useFinderStore((state) => state.setShowStatsCards);
  const setShowChart = useFinderStore((state) => state.setShowChart);
  const setShowTable = useFinderStore((state) => state.setShowTable);
  const setLayoutDensity = useFinderStore((state) => state.setLayoutDensity);
  const resetLayout = useFinderStore((state) => state.resetLayout);

  const handleAddLead = () => {
    router.push("/sales/leads");
  };

  return (
    <header className="w-full flex items-center gap-3 px-4 sm:px-6 py-4 border-b bg-background">
      <SidebarTrigger className="lg:hidden">
        <PanelLeft className="size-5" />
      </SidebarTrigger>

      <LayoutDashboard className="size-6" />
      <h1 className="flex-1 font-medium text-base">Finder Dashboard</h1>

      {/* Quick Actions */}
      <Button 
        onClick={handleAddLead}
        size="sm" 
        className="hidden sm:flex gap-2"
      >
        <UserPlus className="size-4" />
        Add Lead
      </Button>

      <ThemeToggle />
      <NotificationBell basePath="/api/v1/sales" notificationsPath="/finder/notifications" />
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
            Lead Sources Chart
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={showTable} onCheckedChange={setShowTable}>
            Leads Table
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