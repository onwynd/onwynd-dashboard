"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { settingsService } from "@/lib/api/settings";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  FileBarChart,
  Package,
  Calendar,
  Music,
  Briefcase,
  LogOut,
  CheckSquare,
} from "lucide-react";
import { SidebarUserBlock } from "@/components/shared/sidebar-user-block";
import { OnwyndLogo } from "@/components/ui/onwynd-logo";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/api/auth";
import { cn } from "@/lib/utils";

const BASE_MENU = [
  { title: "Dashboard", href: "/manager/dashboard",       icon: LayoutDashboard },
  { title: "Team",      href: "/manager/team",            icon: Users           },
  { title: "Approvals", href: "/manager/approvals",       icon: CheckSquare     },
  { title: "Reports",   href: "/manager/reports",         icon: FileBarChart    },
  { title: "Inventory", href: "/manager/inventory",       icon: Package         },
  { title: "Sounds",    href: "/manager/inventory/sounds",icon: Music           },
  { title: "Schedule",  href: "/manager/schedule",        icon: Calendar        },
];

export function ManagerSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const [menuItems, setMenuItems] = useState(BASE_MENU);

  useEffect(() => {
    (async () => {
      try {
        const s = await settingsService.getSettings();
        const nav = s?.navigation?.disabled_routes || {};
        const role = Cookies.get("user_role") || "manager";
        const dis: string[] = nav?.[role] || [];
        setMenuItems(BASE_MENU.filter((i) => !dis.some((p: string) => i.href.startsWith(p))));
      } catch {
        setMenuItems(BASE_MENU);
      }
    })();
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* ── Logo header ── */}
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <Link href="/manager/dashboard" className="flex items-center gap-2">
            <OnwyndLogo variant="icon" width={28} height={28} className="shrink-0" />
            <span className="font-bold text-base group-data-[collapsible=icon]:hidden">Manager Portal</span>
          </Link>
        </div>
      </SidebarHeader>

      {/* ── User block ── */}
      <div className="px-4 py-3 border-b group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-3 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
        <SidebarUserBlock roleOverride="manager" />
      </div>

      {/* ── Nav ── */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.title}
                    className={cn(
                      isActive(item.href)
                        ? "bg-teal/10 text-teal border-l-2 border-teal font-medium"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4 shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer ── */}
      <SidebarFooter className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-gray-500 hover:text-red-600 hover:bg-red-50 group-data-[collapsible=icon]:justify-center"
          onClick={() => authService.logout()}
        >
          <LogOut className="size-4 shrink-0" />
          <span className="group-data-[collapsible=icon]:hidden">Sign out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
