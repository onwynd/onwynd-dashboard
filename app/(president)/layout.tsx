import type { Metadata } from "next";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { UnifiedSidebar } from "@/components/shared/UnifiedSidebar";
import { PortalHeader } from "@/components/shared/portal-header";
import { Crown, LayoutDashboard, HeartPulse, Building2, Target, BarChart2, FileText } from "lucide-react";

const NAV_ITEMS = [
  { title: "Dashboard", href: "/president/dashboard", icon: LayoutDashboard },
  { title: "Company Health", href: "/president/company-health", icon: HeartPulse },
  { title: "All Departments", href: "/president/departments", icon: Building2 },
  { title: "OKR Overview", href: "/president/okr", icon: Target },
  { title: "KPI Overview", href: "/president/kpi", icon: BarChart2 },
  { title: "Reports", href: "/president/reports", icon: FileText },
];

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "President Dashboard" },
};

export default function PresidentLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <UnifiedSidebar title="President Portal" HeaderIcon={Crown} nav={NAV_ITEMS} />
      <SidebarInset>
        <PortalHeader notificationsBasePath="/api/v1" notificationsPath="/settings/notifications" searchPlaceholder="Search president portal..." />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
