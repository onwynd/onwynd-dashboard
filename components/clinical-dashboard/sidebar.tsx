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
  Bell,
  AlertTriangle,
  Shield,
  ShieldAlert,
  UserCheck,
  BarChart2,
  Settings,
  HelpCircle,
  MessageSquare,
  LogOut,
  MapPin,
  Activity,
  ArrowLeftRight,
  CalendarDays,
} from "lucide-react";
import { SidebarUserBlock } from "@/components/shared/sidebar-user-block";
import { OnwyndLogo } from "@/components/ui/onwynd-logo";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/api/auth";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Overview",           href: "/clinical/dashboard" },
  { icon: CalendarDays,    label: "Calendar",            href: "/clinical/calendar" },
  { icon: MapPin,          label: "Live Map",            href: "/admin/map" },
  { icon: Activity,        label: "Session Reviews",     href: "/clinical/sessions/review" },
  { icon: AlertTriangle,   label: "Distress Queue",      href: "/clinical/distress-queue",   badge: null as string | null },
  { icon: Shield,          label: "Crisis Alerts",       href: "/clinical/crisis-alerts" },
  { icon: UserCheck,       label: "Therapist Reviews",   href: "/clinical/therapist-reviews" },
  { icon: BarChart2,       label: "Clinical Reports",    href: "/clinical/reports" },
  { icon: Bell,            label: "Notifications",       href: "/clinical/notifications" },
  { icon: ShieldAlert,    label: "AI Session Audits",   href: "/admin/session-audits" },
];

const footerItems = [
  { icon: MessageSquare, label: "Feedback",                href: "#" },
  { icon: Settings,      label: "Notification Prefs",      href: "/settings/notifications" },
  { icon: HelpCircle,    label: "Help Center",             href: "#" },
];

export function DashboardSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const [distressCount] = React.useState<number | null>(null);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* ── Logo header ── */}
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <Link href="/clinical/dashboard" className="flex items-center gap-2">
            <OnwyndLogo variant="icon" width={28} height={28} className="shrink-0" />
            <span className="font-bold text-base group-data-[collapsible=icon]:hidden">Clinical Advisor</span>
          </Link>
        </div>
      </SidebarHeader>

      {/* ── User block ── */}
      <div className="px-4 py-3 border-b group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-3 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
        <SidebarUserBlock roleOverride="clinical_advisor" />
      </div>

      {/* ── Crisis detection badge ── */}
      <div className="px-4 py-2 group-data-[collapsible=icon]:hidden">
        <div className="flex items-center gap-2 text-xs text-teal bg-teal/5 rounded-full px-3 py-1 border border-teal/20">
          <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
          Crisis Detection Active
        </div>
      </div>

      {/* ── Nav ── */}
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
                      {item.href === "/clinical/distress-queue" && distressCount !== null && distressCount > 0 && (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1">
                          {distressCount > 99 ? "99+" : distressCount}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer links + sign out ── */}
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
        <Link href="/therapist/dashboard" className="w-full">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-teal hover:text-teal hover:bg-teal/10 mt-1 group-data-[collapsible=icon]:justify-center"
          >
            <ArrowLeftRight className="size-4 shrink-0" />
            <span className="group-data-[collapsible=icon]:hidden">Switch to Therapist</span>
          </Button>
        </Link>
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
