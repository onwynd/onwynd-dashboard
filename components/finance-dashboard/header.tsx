"use client";

import { Search, Menu, Eye, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import { useFinanceStore } from "@/store/finance-store";
import { UserAvatarMenu } from "@/components/shared/user-avatar-menu";
import { NotificationBell } from "@/components/shared/notification-bell";

export function DashboardHeader() {
  const { toggleSidebar } = useSidebar();
  const layoutDensity = useFinanceStore((state) => state.layoutDensity);
  const setLayoutDensity = useFinanceStore((state) => state.setLayoutDensity);
  const dateRange = useFinanceStore((state) => state.dateRange);
  const setDateRange = useFinanceStore((state) => state.setDateRange);

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
              placeholder="Search transactions..."
              className="w-full sm:w-[300px] pl-9 bg-muted/50"
            />
          </div>
        </form>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
              <Calendar className="size-4" />
              {dateRange}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setDateRange("Last 7 days")}>
              Last 7 days
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDateRange("Last 30 days")}>
              Last 30 days
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDateRange("Last 3 months")}>
              Last 3 months
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDateRange("Year to date")}>
              Year to date
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <Eye className="size-5" />
              <span className="sr-only">View options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
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

        <NotificationBell basePath="/api/v1" notificationsPath="/settings/notifications" />
      <UserAvatarMenu />
      </div>
    </header>
  );
}
