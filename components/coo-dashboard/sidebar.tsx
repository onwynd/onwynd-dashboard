"use client";

import * as React from "react";
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
  SidebarGroupLabel,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  CalendarDays,
  LayoutDashboard,
  Target,
  FileText,
  Cpu,
  Sparkles,
  Bell,
  LogOut,
  CheckSquare,
  Inbox,
} from "lucide-react";
import { SidebarUserBlock } from "@/components/shared/sidebar-user-block";
import { OnwyndLogo } from "@/components/ui/onwynd-logo";
import { authService } from "@/lib/api/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";

const cooMenuItems = [
  {
    title: "Core",
    items: [
      { title: "Overview", icon: LayoutDashboard, href: "/coo/dashboard" },
      { title: "Calendar", icon: CalendarDays, href: "/coo/calendar" },
      { title: "AI Assistant", icon: Sparkles, href: "/coo/assistant" },
      { title: "Approvals", icon: Inbox, href: "/coo/approvals" },
      { title: "Budget Approvals", icon: CheckSquare, href: "/coo/budget-approvals" },
    ],
  },
  {
    title: "Operations",
    items: [
      { title: "Operational Log", icon: FileText, href: "/coo/operational-log" },
      { title: "Marketing", icon: Target, href: "/coo/marketing" },
      { title: "AI Operations", icon: Cpu, href: "/coo/ai-operations" },
    ],
  },
  {
    title: "System",
    items: [
      { title: "My Alert Settings",       icon: Bell, href: "/settings/notifications" },
    ],
  },
];

export function COOSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const roleSlug = Cookies.get("user_role") || "coo";

  const isActive = (href: string) =>
    pathname === href || (href.includes("?") ? pathname === href.split("?")[0] : pathname.startsWith(href + "/"));

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* ── Logo ── */}
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <Link href="/coo/dashboard" className="flex items-center gap-2">
            <OnwyndLogo variant="icon" width={28} height={28} className="shrink-0" />
            <span className="font-bold text-base group-data-[collapsible=icon]:hidden">COO Portal</span>
          </Link>
        </div>
      </SidebarHeader>

      {/* ── User block ── */}
      <div className="px-4 py-3 border-b group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-3 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
        <SidebarUserBlock roleOverride={roleSlug} />
      </div>

      {/* ── Nav ── */}
      <SidebarContent>
        {cooMenuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={`${item.href}:${item.title}`}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href)}
                      tooltip={item.title}
                      className={cn(
                        isActive(item.href)
                          ? "bg-primary/10 text-primary border-l-2 border-primary font-medium"
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
        ))}
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
