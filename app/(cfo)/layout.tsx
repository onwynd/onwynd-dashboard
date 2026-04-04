import type { Metadata } from "next";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { UnifiedSidebar } from "@/components/shared/UnifiedSidebar";
import { PortalHeader } from "@/components/shared/portal-header";
import {
  LayoutDashboard, TrendingUp, Receipt, CreditCard, Coins, Users,
  FileText, Target, FileBarChart, DollarSign, CheckSquare,
} from "lucide-react";

const NAV_ITEMS = [
  { title: "Dashboard",             href: "/cfo/dashboard",    icon: LayoutDashboard },
  { title: "Approval Inbox",        href: "/cfo/approvals",    icon: CheckSquare     },
  { title: "Revenue",               href: "/cfo/revenue",      icon: TrendingUp      },
  { title: "Expenses",              href: "/cfo/expenses",     icon: Receipt         },
  { title: "Invoices",              href: "/cfo/invoices",     icon: FileText        },
  { title: "Payouts",               href: "/cfo/payouts",      icon: Coins           },
  { title: "Salaries",              href: "/cfo/salaries",     icon: Users           },
  { title: "Payroll",               href: "/cfo/payroll",      icon: CreditCard      },
  { title: "Financial Statements",  href: "/cfo/statements",   icon: FileBarChart    },
  { title: "Budget Approvals",       href: "/cfo/budget-approvals", icon: Receipt   },
  { title: "OKR",                   href: "/okr",              icon: Target          },
];

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "CFO Dashboard" },
};

export default function CfoLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <UnifiedSidebar title="Finance Control" HeaderIcon={DollarSign} nav={NAV_ITEMS} />
      <SidebarInset>
        <PortalHeader notificationsBasePath="/api/v1" notificationsPath="/settings/notifications" searchPlaceholder="Search financials..." />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
