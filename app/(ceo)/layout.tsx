import type { Metadata } from "next";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { UnifiedSidebar } from "@/components/shared/UnifiedSidebar";
import { PortalHeader } from "@/components/shared/portal-header";
import { LineChart, LayoutDashboard, DollarSign, Users, Target, Megaphone, Activity, FileText, Wallet, CheckSquare, CalendarDays } from "lucide-react";

const NAV_ITEMS = [
  { title: "Dashboard", href: "/ceo/dashboard", icon: LayoutDashboard },
  { title: "Approval Inbox", href: "/ceo/approvals", icon: CheckSquare },
  { title: "Calendar", href: "/ceo/calendar", icon: CalendarDays },
  { title: "Revenue", href: "/ceo/revenue", icon: DollarSign },
  { title: "User Growth", href: "/ceo/analytics", icon: Users },
  { title: "OKR", href: "/okr", icon: Target },
  { title: "Lead Sources", href: "/ceo/leads", icon: Megaphone },
  { title: "Budget Approvals", href: "/ceo/budget-approvals", icon: Wallet },
  { title: "Activity Log", href: "/ceo/activity", icon: Activity },
  { title: "Reports", href: "/ceo/reports", icon: FileText },
];

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "CEO Dashboard" },
};

export default function CEOLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <UnifiedSidebar title="CEO Portal" HeaderIcon={LineChart} nav={NAV_ITEMS} />
      <SidebarInset>
        <PortalHeader notificationsBasePath="/api/v1" notificationsPath="/settings/notifications" searchPlaceholder="Search CEO portal..." />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
