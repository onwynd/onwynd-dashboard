import type { Metadata } from "next";
import { PortalShell } from "@/components/shared/portal-shell";

const NAV_ITEMS = [
  { title: "Dashboard",        href: "/vp-sales/dashboard", icon: "LayoutDashboard" },
  { title: "Approvals",        href: "/vp-sales/approvals", icon: "CheckSquare"     },
  { title: "Pipeline",         href: "/vp-sales/pipeline",  icon: "GitMerge"        },
  { title: "Deals",            href: "/vp-sales/deals",     icon: "Handshake"       },
  { title: "Leads",            href: "/vp-sales/leads",     icon: "Users"           },
  { title: "Contacts",         href: "/vp-sales/contacts",  icon: "Contact2"        },
  { title: "Team Performance", href: "/vp-sales/team",      icon: "UserCheck"       },
  { title: "Budget",           href: "/vp-sales/budget",    icon: "Wallet"          },
  { title: "OKR",              href: "/okr",                icon: "Target"          },
  { title: "Reports",          href: "/vp-sales/reports",   icon: "FileBarChart"    },
];

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "VP Sales Dashboard" },
};

export default function VpSalesLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell title="Sales Leadership" headerIcon="TrendingUp" nav={NAV_ITEMS} searchPlaceholder="Search pipeline...">
      {children}
    </PortalShell>
  );
}
