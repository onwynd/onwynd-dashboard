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
  BadgeCheck,
  CheckSquare,
  Briefcase,
  Landmark
} from "lucide-react";

// Icon mapping
const icons = {
  LayoutDashboard, Users, FileBarChart, FileText, Coins, TrendingUp,
  Building2, CreditCard, MapPin, Calendar, Package, Contact,
  CalendarDays, Clock, TerminalSquare, Activity, FileCode, Rocket,
  BadgeCheck, CheckSquare, Briefcase, Landmark
};

const menuItems = [
  {
    "title": "Dashboard",
    "href": "/employee/dashboard",
    "icon": "LayoutDashboard"
  },
  {
    "title": "Tasks",
    "href": "/employee/tasks",
    "icon": "CheckSquare"
  },
  {
    "title": "Timesheet",
    "href": "/employee/timesheet",
    "icon": "Clock"
  },
  {
    "title": "Approvals",
    "href": "/employee/approvals",
    "icon": "BadgeCheck"
  }
];

export function EmployeeSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2 font-bold text-xl">
          <BadgeCheck className="w-6 h-6 text-primary" />
          <span>Employee Portal</span>
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
