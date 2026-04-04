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

// NOTE: Salaries, Subscription Revenue, and Promo Codes are admin-only pages.
// Finance role cannot access /admin/* paths per middleware ROLE_ALLOWED_PREFIXES.
// Those items have been removed from this sidebar until dedicated /finance/* pages
// are created (tracked in TODOS.md). Revenue redirects to Statements in the interim.
const menuItems = [
  { "title": "Dashboard",            "href": "/finance/dashboard",        "icon": "LayoutDashboard" },
  { "title": "Approvals",            "href": "/finance/approvals",        "icon": "CheckSquare"     },
  { "title": "Budget Approvals",     "href": "/finance/budget-approvals", "icon": "Briefcase"       },
  { "title": "Financial Statements", "href": "/finance/statements",       "icon": "Landmark"        },
  { "title": "Invoices",             "href": "/finance/invoices",         "icon": "FileText"        },
  { "title": "Payouts",              "href": "/finance/payouts",          "icon": "Coins"           },
];

export function FinanceSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Landmark className="w-6 h-6 text-primary" />
          <span>Finance Portal</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = (icons as Record<string, React.ElementType>)[item.icon] || LayoutDashboard;
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
