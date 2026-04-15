"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  TrendingUp,
  BarChart3,
  Settings,
  HelpCircle,
  MessageSquare,
  LogOut,
  Target,
  Phone,
  Mail,
} from "lucide-react";
import { SidebarUserBlock } from "@/components/shared/sidebar-user-block";
import { OnwyndLogo } from "@/components/ui/onwynd-logo";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/api/auth";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/finder/dashboard" },
  { icon: UserPlus, label: "Add Lead", href: "/sales/leads" },
  { icon: Users, label: "My Leads", href: "/sales/leads" },
  { icon: Target, label: "Conversions", href: "/sales/deals" },
  { icon: TrendingUp, label: "Performance", href: "/sales/dashboard" },
  { icon: Phone, label: "Calls", href: "/sales/tasks" },
  { icon: Mail, label: "Emails", href: "/sales/emails" },
  { icon: BarChart3, label: "Analytics", href: "/sales/dashboard" },
];

const footerItems = [
  { icon: Settings, label: "Settings", href: "/settings/notifications" },
  { icon: MessageSquare, label: "Feedback", href: "#" },
  { icon: HelpCircle, label: "Help Center", href: "#" },
];

export function FinderSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Logo Header */}
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <Link href="/finder/dashboard" className="flex items-center gap-2">
            <OnwyndLogo variant="icon" width={28} height={28} className="shrink-0" />
            <span className="font-bold text-base group-data-[collapsible=icon]:hidden">Finder Portal</span>
          </Link>
        </div>
      </SidebarHeader>

      {/* User Block */}
      <div className="px-4 py-3 border-b group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-3 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
        <SidebarUserBlock roleOverride="finder" />
      </div>

      {/* Navigation Menu */}
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
                        ? "bg-blue-100 text-blue-700 border-l-2 border-blue-500 font-medium"
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

      {/* Footer Links */}
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