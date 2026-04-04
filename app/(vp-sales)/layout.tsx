import type { Metadata } from "next";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { UnifiedSidebar } from "@/components/shared/UnifiedSidebar";
import { PortalHeader } from "@/components/shared/portal-header";
import {
  LayoutDashboard, GitMerge, Handshake, Users, Contact2,
  UserCheck, Target, FileBarChart, TrendingUp, Wallet, CheckSquare,
} from "lucide-react";

const NAV_ITEMS = [
  { title: "Dashboard",        href: "/vp-sales/dashboard",  icon: LayoutDashboard },
  { title: "Approvals",        href: "/vp-sales/approvals",  icon: CheckSquare     },
  { title: "Pipeline",         href: "/vp-sales/pipeline",   icon: GitMerge        },
  { title: "Deals",            href: "/vp-sales/deals",      icon: Handshake       },
  { title: "Leads",            href: "/vp-sales/leads",      icon: Users           },
  { title: "Contacts",         href: "/vp-sales/contacts",   icon: Contact2        },
  { title: "Team Performance", href: "/vp-sales/team",       icon: UserCheck       },
  { title: "Budget",           href: "/vp-sales/budget",     icon: Wallet          },
  { title: "OKR",              href: "/okr",                  icon: Target          },
  { title: "Reports",          href: "/vp-sales/reports",    icon: FileBarChart    },
];

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "VP Sales Dashboard" },
};

export default function VpSalesLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <UnifiedSidebar title="Sales Leadership" HeaderIcon={TrendingUp} nav={NAV_ITEMS} />
      <SidebarInset>
        <PortalHeader notificationsBasePath="/api/v1" notificationsPath="/settings/notifications" searchPlaceholder="Search pipeline..." />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
