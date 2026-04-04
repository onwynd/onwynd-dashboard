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
  TrendingUp,
  LifeBuoy,
  FileText,
  Target,
  Cpu,
  Users,
  Users2,
  UserCheck,
  Globe,
  CreditCard,
  Bell,
  Lock,
  LogOut,
  Sparkles,
  Landmark,
  CheckSquare,
  CalendarPlus,
  MapPin,
  ClipboardList,
  Activity,
  AlertTriangle,
  ShieldAlert,
  Inbox,
  MessageSquare,
  MailSearch,
  BarChart,
  Package,
} from "lucide-react";
import { SidebarUserBlock } from "@/components/shared/sidebar-user-block";
import { OnwyndLogo } from "@/components/ui/onwynd-logo";
import { authService } from "@/lib/api/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";

const cooMenuItems = [
  // ── Core operations ──────────────────────────────────────────────────────
  {
    title: "Operations",
    items: [
      { title: "Overview",          icon: LayoutDashboard, href: "/coo/dashboard" },
      { title: "Calendar",          icon: CalendarDays,    href: "/coo/calendar" },
      { title: "AI Assistant",      icon: Sparkles,        href: "/admin/assistant" },
      { title: "Operational Log",   icon: FileText,        href: "/coo/operational-log" },
      { title: "Analytics",         icon: BarChart,        href: "/admin/analytics" },
    ],
  },

  // ── Approvals & pipeline ─────────────────────────────────────────────────
  {
    title: "Approvals & Pipeline",
    items: [
      { title: "My Approval Inbox",      icon: Inbox,        href: "/coo/approvals" },
      { title: "Budget Approvals",       icon: CheckSquare,  href: "/coo/budget-approvals" },
      { title: "Subscription Approvals", icon: CheckSquare,  href: "/admin/approvals/subscription-upgrades" },
      { title: "Therapist Reviews",      icon: UserCheck,    href: "/admin/therapists/pending" },
      { title: "Demo Leads",             icon: CalendarPlus, href: "/admin/demo-leads" },
      { title: "Sales Agents",           icon: Users2,       href: "/admin/sales-agents" },
      { title: "Territories",            icon: MapPin,       href: "/admin/territories" },
      { title: "Waitlist",               icon: ClipboardList,href: "/admin/waitlist" },
      { title: "Centers",                icon: Globe,        href: "/admin/centers" },
    ],
  },

  // ── People & teams ───────────────────────────────────────────────────────
  {
    title: "People & Teams",
    items: [
      { title: "Users",         icon: Users,     href: "/admin/users" },
      { title: "Therapists",    icon: UserCheck, href: "/admin/therapists" },
      { title: "Organizations", icon: Globe,     href: "/admin/institutions" },
      { title: "Sessions",      icon: Activity,  href: "/admin/sessions" },
    ],
  },

  // ── Growth & AI ──────────────────────────────────────────────────────────
  {
    title: "Growth & AI",
    items: [
      { title: "Marketing",      icon: Target,    href: "/coo/marketing" },
      { title: "AI Operations",  icon: Cpu,       href: "/coo/ai-operations" },
      { title: "Sales Perf.",    icon: TrendingUp, href: "/admin/analytics" },
    ],
  },

  // ── Finance (read) ───────────────────────────────────────────────────────
  {
    title: "Finance",
    items: [
      { title: "Revenue",             icon: CreditCard, href: "/admin/finance/revenue" },
      { title: "Fin. Statements",     icon: Landmark,   href: "/admin/finance/statements" },
      { title: "Salaries",            icon: Users,      href: "/admin/finance/salaries" },
      { title: "Payouts",             icon: Landmark,   href: "/admin/finance/payouts" },
      { title: "Subscriptions",       icon: Activity,   href: "/admin/subscriptions" },
      { title: "Sub. Revenue",        icon: BarChart,   href: "/admin/finance/subscriptions" },
      { title: "Promo Codes",         icon: Package,    href: "/admin/promo-codes" },
    ],
  },

  // ── Quality & risk ───────────────────────────────────────────────────────
  {
    title: "Quality & Risk",
    items: [
      { title: "AI Session Audits",  icon: ShieldAlert,   href: "/admin/session-audits" },
      { title: "Distress Overrides", icon: AlertTriangle, href: "/admin/distress-overrides" },
      { title: "Quota Abuse",        icon: ShieldAlert,   href: "/admin/quota-abuse" },
      { title: "Audit Log",          icon: Lock,          href: "/admin/audit-log" },
      { title: "System Health",      icon: Activity,      href: "/admin/system/health" },
    ],
  },

  // ── Communications ───────────────────────────────────────────────────────
  {
    title: "Communications",
    items: [
      { title: "Contact Inbox",  icon: Inbox,       href: "/admin/contact" },
      { title: "User Feedback",  icon: MessageSquare, href: "/admin/feedback" },
      { title: "Support",        icon: LifeBuoy,    href: "/admin/support" },
      { title: "Mail Logs",      icon: MailSearch,  href: "/admin/mail-logs" },
    ],
  },

  // ── System ───────────────────────────────────────────────────────────────
  {
    title: "System",
    items: [
      { title: "Broadcast Notifications", icon: Bell, href: "/admin/notifications" },
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
