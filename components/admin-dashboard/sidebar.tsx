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
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  CalendarDays,
  LayoutGrid,
  Mail,
  Users,
  Users2,
  UserCheck,
  FileText,
  Settings,
  Sparkles,
  ShieldAlert,
  CreditCard,
  BarChart,
  LifeBuoy,
  Database,
  Globe,
  MessageSquare,
  Activity,
  CheckSquare,
  Layers,
  Lock,
  Key,
  ToggleLeft,
  Music,
  School,
  Briefcase,
  MapPin,
  AlertTriangle,
  Inbox,
  ClipboardList,
  LogOut,
  MailSearch,
  CalendarPlus,
  Landmark,
  History,
} from "lucide-react";
import { SidebarUserBlock } from "@/components/shared/sidebar-user-block";
import { OnwyndLogo } from "@/components/ui/onwynd-logo";
import { authService } from "@/lib/api/auth";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { settingsService } from "@/lib/api/settings";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { adminService } from "@/lib/api/admin";

const menuItems = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard",         icon: LayoutGrid,    href: "/admin/dashboard" },
      { title: "Calendar",          icon: CalendarDays,  href: "/admin/calendar" },
      { title: "Live Map",          icon: MapPin,        href: "/admin/map" },
      { title: "Webmail",            icon: Mail,          href: "/admin/mail" },
      { title: "AI Assistant",       icon: Sparkles,      href: "/admin/assistant" },
      { title: "Analytics",          icon: BarChart,      href: "/admin/analytics" },
    ],
  },
  {
    title: "User Management",
    items: [
      { title: "Users",                  icon: Users,       href: "/admin/users" },
      { title: "Therapists",             icon: UserCheck,   href: "/admin/therapists", badge: "pendingTherapists" },
      { title: "Sessions",               icon: Activity,    href: "/admin/sessions" },
      { title: "Approvals",              icon: CheckSquare, href: "/admin/approvals/subscription-upgrades" },
      { title: "Student Verifications",  icon: School,      href: "/admin/student-verifications" },
      { title: "Universities",           icon: School,      href: "/admin/universities" },
      { title: "Institutions",           icon: Globe,       href: "/admin/institutions" },
      { title: "Centers",                icon: Globe,       href: "/admin/centers" },
      { title: "Demo Leads",             icon: CalendarPlus,  href: "/admin/demo-leads" },
      { title: "Sales Agents",           icon: Users2,      href: "/admin/sales-agents" },
      { title: "Territories",            icon: MapPin,      href: "/admin/territories" },
      { title: "Roles & Permissions",    icon: Lock,          href: "/admin/roles" },
      { title: "Waitlist",               icon: ClipboardList, href: "/admin/waitlist" },
    ],
  },
  {
    title: "Content & Community",
    items: [
      { title: "Editorial Articles", icon: FileText,     href: "/admin/content/posts" },
      { title: "Landing Page",       icon: Globe,        href: "/admin/content/landing-page" },
      { title: "Careers",            icon: Briefcase,    href: "/admin/careers" },
      { title: "Resources",          icon: Layers,       href: "/admin/resources" },
      { title: "Sounds",             icon: Music,        href: "/admin/resources/sounds" },
      { title: "Courses",            icon: Layers,       href: "/admin/courses" },
      { title: "Community",          icon: MessageSquare, href: "/admin/community" },
      { title: "Contact Inbox",       icon: Inbox,         href: "/admin/contact" },
      { title: "User Feedback",      icon: MessageSquare, href: "/admin/feedback" },
    ],
  },
  {
    title: "Finance & Reports",
    items: [
      { title: "Financial Statements",  icon: Landmark,   href: "/admin/finance/statements" },
      { title: "Salaries",              icon: Users2,     href: "/admin/finance/salaries" },
      { title: "Revenue",               icon: CreditCard, href: "/admin/finance/revenue" },
      { title: "Payouts",               icon: Database,   href: "/admin/finance/payouts" },
      { title: "Subscriptions",         icon: Activity,   href: "/admin/finance/subscriptions" },
      { title: "Student Subscriptions", icon: Activity,   href: "/admin/student-subscriptions" },
      { title: "Reports",               icon: BarChart,   href: "/admin/reports" },
    ],
  },
  {
    title: "System & Communication",
    items: [
      { title: "Notifications",      icon: MessageSquare, href: "/admin/notifications" },
      { title: "Feature Flags",      icon: ToggleLeft,    href: "/admin/settings?tab=features" },
      { title: "Security & Keys",    icon: Key,           href: "/admin/settings?tab=security" },
      { title: "Login History",      icon: History,       href: "/admin/login-history" },
      { title: "System Health",      icon: Activity,      href: "/admin/system/health" },
      { title: "Audit Log",          icon: Activity,      href: "/admin/audit-log" },
      { title: "Security Reports",   icon: ShieldAlert,   href: "/admin/security" },
      { title: "Session Audits",     icon: ShieldAlert,   href: "/admin/session-audits" },
      { title: "Distress Overrides", icon: AlertTriangle, href: "/admin/distress-overrides" },
      { title: "Quota Abuse",        icon: ShieldAlert,   href: "/admin/quota-abuse" },
      { title: "Settings",           icon: Settings,      href: "/admin/settings?tab=general" },
      { title: "Mail Logs",          icon: MailSearch,    href: "/admin/mail-logs" },
      { title: "Support",            icon: LifeBuoy,      href: "/admin/support" },
    ],
  },
];

export function DashboardSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const role = typeof window !== "undefined" ? Cookies.get("user_role") : undefined;
  const [disabledRoutes, setDisabledRoutes] = useState<Record<string, string[]>>({});
  const [counts, setCounts] = useState({ pendingTherapists: 0 });

  React.useEffect(() => {
    (async () => {
      try {
        const [s, c] = await Promise.all([
          settingsService.getSettings(),
          adminService.getTherapistCounts(),
        ]);
        const nav = s?.navigation?.disabled_routes;
        if (nav && typeof nav === "object") setDisabledRoutes(nav as Record<string, string[]>);
        if (c) setCounts(c as { pendingTherapists: 0 });
      } catch {
        setDisabledRoutes({});
      }
    })();
  }, []);

  const isDisabled = (href: string) => {
    const r = role || "admin";
    const list = disabledRoutes?.[r] || [];
    return list.some((pattern) => href.startsWith(pattern));
  };

  const filteredMenu = menuItems
    .map((group) => {
      if (group.title !== "Overview") return group;
      const items = group.items.filter((item) => {
        if (isDisabled(item.href)) return false;
        return true;
      });
      return { ...group, items };
    })
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !isDisabled(item.href)),
    }));

  const isActive = (href: string) =>
    pathname === href || (href.includes("?") ? pathname === href.split("?")[0] : pathname.startsWith(href + "/"));

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* ── Logo header ── */}
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <OnwyndLogo variant="icon" width={28} height={28} className="shrink-0" />
            <span className="font-bold text-base group-data-[collapsible=icon]:hidden">Admin Portal</span>
          </Link>
        </div>
      </SidebarHeader>

      {/* ── User block ── */}
      <div className="px-4 py-3 border-b group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-3 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
        <SidebarUserBlock roleOverride="admin" />
      </div>

      {/* ── Nav ── */}
      <SidebarContent>
        {filteredMenu.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const badgeCount = item.badge === 'pendingTherapists' ? counts.pendingTherapists : 0;
                  return (
                    <SidebarMenuItem key={`${item.href}:${item.title}`}>
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
                          {badgeCount > 0 && (
                            <span className="ml-auto bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                              {badgeCount}
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
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
