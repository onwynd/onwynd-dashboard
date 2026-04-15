"use client";

import * as React from "react";
import {
  Activity, Award, BarChart2, Building2, CalendarDays, CalendarOff,
  CheckSquare, Cog, Coins, Contact2, Cpu, CreditCard, Crown,
  DollarSign, Eye, FileBarChart, FileImage, FileText, GitMerge,
  Handshake, HeartPulse, LayoutDashboard, LifeBuoy, LineChart,
  Lock, Map, Megaphone, Monitor, PackageOpen, Radio, Receipt,
  Rocket, ScrollText, Settings2, ShieldAlert, ShieldCheck, Star,
  Target, TrendingUp, UserCheck, UserPlus, UserSearch, Users,
  Video, Wallet, Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { UnifiedSidebar } from "@/components/shared/UnifiedSidebar";
import { PortalHeader } from "@/components/shared/portal-header";

const ICON_MAP: Record<string, LucideIcon> = {
  Activity, Award, BarChart2, Building2, CalendarDays, CalendarOff,
  CheckSquare, Cog, Coins, Contact2, Cpu, CreditCard, Crown,
  DollarSign, Eye, FileBarChart, FileImage, FileText, GitMerge,
  Handshake, HeartPulse, LayoutDashboard, LifeBuoy, LineChart,
  Lock, Map, Megaphone, Monitor, PackageOpen, Radio, Receipt,
  Rocket, ScrollText, Settings2, ShieldAlert, ShieldCheck, Star,
  Target, TrendingUp, UserCheck, UserPlus, UserSearch, Users,
  Video, Wallet, Zap,
};

export interface SerializableNavItem {
  title: string;
  href: string;
  icon: string;
}

interface PortalShellProps {
  title: string;
  headerIcon: string;
  nav: SerializableNavItem[];
  searchPlaceholder?: string;
  notificationsPath?: string;
  children: React.ReactNode;
}

export function PortalShell({
  title,
  headerIcon,
  nav,
  searchPlaceholder,
  notificationsPath = "/settings/notifications",
  children,
}: PortalShellProps) {
  const HeaderIcon = ICON_MAP[headerIcon] ?? LayoutDashboard;
  const resolvedNav = nav.map((item) => ({
    ...item,
    icon: ICON_MAP[item.icon] ?? LayoutDashboard,
  }));

  return (
    <SidebarProvider>
      <UnifiedSidebar title={title} HeaderIcon={HeaderIcon} nav={resolvedNav} />
      <SidebarInset>
        <PortalHeader
          notificationsBasePath="/api/v1"
          notificationsPath={notificationsPath}
          searchPlaceholder={searchPlaceholder}
        />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
