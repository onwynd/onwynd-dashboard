import type { Metadata } from "next";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { UnifiedSidebar } from "@/components/shared/UnifiedSidebar";
import { PortalHeader } from "@/components/shared/portal-header";
import { Megaphone, LayoutDashboard, Radio, Users, UserSearch, Star, Handshake, Target, FileText } from "lucide-react";

const NAV_ITEMS = [
  { title: "Dashboard", href: "/cgo/dashboard", icon: LayoutDashboard },
  { title: "Campaigns", href: "/cgo/campaigns", icon: Radio },
  { title: "Subscribers", href: "/cgo/subscribers", icon: Users },
  { title: "Leads", href: "/cgo/leads", icon: UserSearch },
  { title: "Ambassadors", href: "/cgo/ambassadors", icon: Star },
  { title: "Partners", href: "/cgo/partners", icon: Handshake },
  { title: "OKR", href: "/okr", icon: Target },
  { title: "Reports", href: "/cgo/reports", icon: FileText },
];

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "CGO Dashboard" },
};

export default function CGOLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <UnifiedSidebar title="CGO Portal" HeaderIcon={Megaphone} nav={NAV_ITEMS} />
      <SidebarInset>
        <PortalHeader notificationsBasePath="/api/v1" notificationsPath="/settings/notifications" searchPlaceholder="Search CGO portal..." />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
