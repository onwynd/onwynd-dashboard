import type { Metadata } from "next";
import { PortalShell } from "@/components/shared/portal-shell";

const NAV_ITEMS = [
  { title: "Dashboard",         href: "/vp-marketing/dashboard",   icon: "LayoutDashboard" },
  { title: "Approvals",         href: "/vp-marketing/approvals",   icon: "CheckSquare"     },
  { title: "Campaigns",         href: "/vp-marketing/campaigns",   icon: "Radio"           },
  { title: "Subscribers",       href: "/vp-marketing/subscribers", icon: "Users"           },
  { title: "Leads",             href: "/vp-marketing/leads",       icon: "TrendingUp"      },
  { title: "Ambassadors",       href: "/vp-marketing/ambassadors", icon: "Award"           },
  { title: "Content",           href: "/vp-marketing/content",     icon: "FileImage"       },
  { title: "Budget Requests",   href: "/marketing/budget",         icon: "Wallet"          },
  { title: "Campaign Expenses", href: "/marketing/expenses",       icon: "Receipt"         },
  { title: "OKR",               href: "/okr",                      icon: "Target"          },
  { title: "Reports",           href: "/vp-marketing/reports",     icon: "FileBarChart"    },
];

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "VP Marketing Dashboard" },
};

export default function VpMarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell title="Marketing Leadership" headerIcon="Megaphone" nav={NAV_ITEMS} searchPlaceholder="Search campaigns...">
      {children}
    </PortalShell>
  );
}
