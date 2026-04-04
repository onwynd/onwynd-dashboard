import type { Metadata } from "next";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { UnifiedSidebar } from "@/components/shared/UnifiedSidebar";
import { PortalHeader } from "@/components/shared/portal-header";
import { Settings2, LayoutDashboard, TrendingUp, LifeBuoy, Video, Monitor, Users, CalendarOff, CalendarDays, Target, Wallet } from "lucide-react";

const NAV_ITEMS = [
  { title: "Dashboard", href: "/coo/dashboard", icon: LayoutDashboard },
  { title: "Calendar", href: "/coo/calendar", icon: CalendarDays },
  { title: "Sales Pipeline", href: "/coo/sales", icon: TrendingUp },
  { title: "Support Health", href: "/coo/support", icon: LifeBuoy },
  { title: "Session Ops", href: "/coo/sessions", icon: Video },
  { title: "Platform Health", href: "/coo/platform", icon: Monitor },
  { title: "HR Overview", href: "/coo/hr", icon: Users },
  { title: "Leave", href: "/coo/leave", icon: CalendarOff },
  { title: "Budget Approvals", href: "/coo/budget-approvals", icon: Wallet },
  { title: "OKR", href: "/okr", icon: Target },
];

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "COO Dashboard" },
};

export default function COOLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <UnifiedSidebar title="COO Portal" HeaderIcon={Settings2} nav={NAV_ITEMS} />
      <SidebarInset>
        <PortalHeader notificationsBasePath="/api/v1" notificationsPath="/settings/notifications" searchPlaceholder="Search COO portal..." />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
