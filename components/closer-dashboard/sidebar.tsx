"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, Target, TrendingUp, BarChart3, Settings, HelpCircle,
  MessageSquare, LogOut, Handshake, FileText, Clock,
} from "lucide-react";
import { SidebarUserBlock } from "@/components/shared/sidebar-user-block";
import { OnwyndLogo } from "@/components/ui/onwynd-logo";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/api/auth";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard",       href: "/closer/dashboard" },
  { icon: Target,          label: "Active Pipeline", href: "/closer/pipeline" },
  { icon: Handshake,       label: "Closed Deals",    href: "/closer/deals" },
  { icon: Clock,           label: "Action Required", href: "/closer/action-required" },
  { icon: TrendingUp,      label: "Performance",     href: "/closer/performance" },
  { icon: FileText,        label: "Contracts",       href: "/closer/contracts" },
  { icon: BarChart3,       label: "Analytics",       href: "/closer/analytics" },
];

const footerItems = [
  { icon: Settings,      label: "Settings",    href: "/closer/settings" },
  { icon: MessageSquare, label: "Feedback",    href: "#" },
  { icon: HelpCircle,    label: "Help Center", href: "#" },
];

export function CloserSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <Link href="/closer/dashboard" className="flex items-center gap-2">
            <OnwyndLogo variant="icon" width={28} height={28} className="shrink-0" />
            <span className="font-bold text-base group-data-[collapsible=icon]:hidden">Closer Portal</span>
          </Link>
        </div>
      </SidebarHeader>

      <div className="px-4 py-3 border-b group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-3 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
        <SidebarUserBlock roleOverride="closer" />
      </div>

      <SidebarContent className="pt-2">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                    className={cn(
                      "h-[38px]",
                      isActive(item.href)
                        ? "bg-teal/10 text-teal border-l-2 border-teal font-medium"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-5 shrink-0" />
                      <span className="flex-1">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-2 pb-4 border-t pt-2">
        <SidebarMenu>
          {footerItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton asChild className="h-[38px] text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                <Link href={item.href}>
                  <item.icon className="size-5" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-gray-500 hover:text-red-600 hover:bg-red-50 mt-1 group-data-[collapsible=icon]:justify-center"
          onClick={() => authService.logout()}
        >
          <LogOut className="size-4 shrink-0" />
          <span className="group-data-[collapsible=icon]:hidden">Sign out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
