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
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  FileBarChart,
  FileText,
  Coins,
  TrendingUp,
  Building2,
  CreditCard,
  MapPin,
  Calendar,
  Package,
  Contact,
  CalendarDays,
  Clock,
  TerminalSquare,
  Activity,
  FileCode,
  Rocket,
  CheckSquare,
  Briefcase,
  Landmark
} from "lucide-react";

// Icon mapping
const icons = {
  LayoutDashboard, Users, FileBarChart, FileText, Coins, TrendingUp,
  Building2, CreditCard, MapPin, Calendar, Package, Contact,
  CalendarDays, Clock, TerminalSquare, Activity, FileCode, Rocket,
  CheckSquare, Briefcase, Landmark
};

const menuItems = [
  {
    "title": "Dashboard",
    "href": "/tech/dashboard",
    "icon": "LayoutDashboard"
  },
  {
    "title": "Approvals",
    "href": "/tech/approvals",
    "icon": "CheckSquare"
  },
  {
    "title": "System Health",
    "href": "/tech/health",
    "icon": "Activity"
  },
  {
    "title": "Logs",
    "href": "/tech/logs",
    "icon": "FileCode"
  },
  {
    "title": "Deployments",
    "href": "/tech/deployments",
    "icon": "Rocket"
  }
];

export function TechSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2 font-bold text-xl">
          <TerminalSquare className="w-6 h-6 text-primary" />
          <span>Tech Console</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = icons[item.icon as keyof typeof icons] || LayoutDashboard;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
