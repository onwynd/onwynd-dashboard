"use client";

import { useState, useEffect } from "react";
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
import { useAmbassadorStore } from "@/store/ambassador-store";
import { UserAvatarMenu } from "@/components/shared/user-avatar-menu";
import { NotificationBell } from "@/components/shared/notification-bell";
import { ambassadorService } from "@/lib/api/ambassador";

export function DashboardHeader() {
  const layoutDensity = useAmbassadorStore((state) => state.layoutDensity);
  const showChart = useAmbassadorStore((state) => state.showChart);
  const showTable = useAmbassadorStore((state) => state.showTable);
  const setLayoutDensity = useAmbassadorStore((state) => state.setLayoutDensity);
  const setShowChart = useAmbassadorStore((state) => state.setShowChart);
  const setShowTable = useAmbassadorStore((state) => state.setShowTable);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    ambassadorService.getReferralCode()
      .then((data) => setReferralCode(data?.code || data?.referral_code || null))
      .catch(() => {});
  }, []);

  return (
    <header className="w-full flex items-center gap-3 px-4 sm:px-6 py-4 border-b bg-background">
      <SidebarTrigger className="lg:hidden">
        <PanelLeft className="size-5" />
      </SidebarTrigger>

      <LayoutDashboard className="size-6" />
      <h1 className="flex-1 font-medium text-base">Ambassador Dashboard</h1>

      {referralCode && (
        <span className="hidden sm:block text-sm text-muted-foreground">
          Referral Code: <span className="font-mono font-bold text-foreground">{referralCode}</span>
        </span>
      )}

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
            checked={showChart}
            onCheckedChange={setShowChart}
          >
            Chart
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={showTable}
            onCheckedChange={setShowTable}
          >
            Referrals Table
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
