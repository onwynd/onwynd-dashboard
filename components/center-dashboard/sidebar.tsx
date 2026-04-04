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

type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;
type IconKey =
  | "LayoutDashboard"
  | "Users"
  | "FileBarChart"
  | "FileText"
  | "Coins"
  | "TrendingUp"
  | "Building2"
  | "CreditCard"
  | "MapPin"
  | "Calendar"
  | "Package"
  | "Contact"
  | "CalendarDays"
  | "Clock"
  | "TerminalSquare"
  | "Activity"
  | "FileCode"
  | "Rocket"
  | "CheckSquare"
  | "Briefcase"
  | "Landmark";
const icons: Record<IconKey, IconComponent> = {
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
  Landmark,
};

const menuItems: { title: string; href: string; icon: IconKey }[] = [
  {
    "title": "Dashboard",
    "href": "/center/dashboard",
    "icon": "LayoutDashboard"
  },
  {
    "title": "Bookings",
    "href": "/center/bookings",
    "icon": "Calendar"
  },
  {
    "title": "Inventory",
    "href": "/center/inventory",
    "icon": "Package"
  },
  {
    "title": "Reports",
    "href": "/center/reports",
    "icon": "FileBarChart"
  },
  {
    "title": "Check In",
    "href": "/center/check-in",
    "icon": "Clock"
  }
];

export function CenterSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2 font-bold text-xl">
          <MapPin className="w-6 h-6 text-primary" />
          <span>Center Manager</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = icons[item.icon] || LayoutDashboard;
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
