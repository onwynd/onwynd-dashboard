import type { Metadata } from "next";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { UnifiedSidebar } from "@/components/shared/UnifiedSidebar";
import { PortalHeader } from "@/components/shared/portal-header";
import {
  LayoutDashboard, Radio, Users, TrendingUp, Award, FileImage, Target, FileBarChart, Megaphone, Wallet, Receipt, CheckSquare,
} from "lucide-react";

const NAV_ITEMS = [
  { title: "Dashboard",        href: "/vp-marketing/dashboard",    icon: LayoutDashboard },
  { title: "Approvals",        href: "/vp-marketing/approvals",    icon: CheckSquare     },
  { title: "Campaigns",        href: "/vp-marketing/campaigns",    icon: Radio           },
  { title: "Subscribers",      href: "/vp-marketing/subscribers",  icon: Users           },
  { title: "Leads",            href: "/vp-marketing/leads",        icon: TrendingUp      },
  { title: "Ambassadors",      href: "/vp-marketing/ambassadors",  icon: Award           },
  { title: "Content",          href: "/vp-marketing/content",      icon: FileImage       },
  { title: "Budget Requests",  href: "/marketing/budget",          icon: Wallet          },
  { title: "Campaign Expenses",href: "/marketing/expenses",        icon: Receipt         },
  { title: "OKR",              href: "/okr",                        icon: Target          },
  { title: "Reports",          href: "/vp-marketing/reports",      icon: FileBarChart    },
];

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "VP Marketing Dashboard" },
};

export default function VpMarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <UnifiedSidebar title="Marketing Leadership" HeaderIcon={Megaphone} nav={NAV_ITEMS} />
      <SidebarInset>
        <PortalHeader notificationsBasePath="/api/v1" notificationsPath="/settings/notifications" searchPlaceholder="Search campaigns..." />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
