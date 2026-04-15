import type { Metadata } from "next";
import { PortalShell } from "@/components/shared/portal-shell";

const NAV_ITEMS = [
  { title: "Dashboard",            href: "/cfo/dashboard",        icon: "LayoutDashboard" },
  { title: "Approval Inbox",       href: "/cfo/approvals",        icon: "CheckSquare"     },
  { title: "Revenue",              href: "/cfo/revenue",          icon: "TrendingUp"      },
  { title: "Expenses",             href: "/cfo/expenses",         icon: "Receipt"         },
  { title: "Invoices",             href: "/cfo/invoices",         icon: "FileText"        },
  { title: "Payouts",              href: "/cfo/payouts",          icon: "Coins"           },
  { title: "Salaries",             href: "/cfo/salaries",         icon: "Users"           },
  { title: "Payroll",              href: "/cfo/payroll",          icon: "CreditCard"      },
  { title: "Financial Statements", href: "/cfo/statements",       icon: "FileBarChart"    },
  { title: "Budget Approvals",     href: "/cfo/budget-approvals", icon: "Receipt"         },
  { title: "OKR",                  href: "/okr",                  icon: "Target"          },
];

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "CFO Dashboard" },
};

export default function CfoLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell title="Finance Control" headerIcon="DollarSign" nav={NAV_ITEMS} searchPlaceholder="Search financials...">
      {children}
    </PortalShell>
  );
}
