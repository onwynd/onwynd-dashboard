import type { Metadata } from "next";
import { PortalShell } from "@/components/shared/portal-shell";

const NAV_ITEMS = [
  { title: "Dashboard",        href: "/ceo/dashboard",        icon: "LayoutDashboard" },
  { title: "Approval Inbox",   href: "/ceo/approvals",        icon: "CheckSquare"     },
  { title: "Calendar",         href: "/ceo/calendar",         icon: "CalendarDays"    },
  { title: "AI Assistant",     href: "/ceo/assistant",        icon: "Sparkles"        },
  { title: "Revenue",          href: "/ceo/revenue",          icon: "DollarSign"      },
  { title: "User Growth",      href: "/ceo/analytics",        icon: "Users"           },
  { title: "OKR",              href: "/okr",                  icon: "Target"          },
  { title: "Lead Sources",     href: "/ceo/leads",            icon: "Megaphone"       },
  { title: "Budget Approvals", href: "/ceo/budget-approvals", icon: "Wallet"          },
  { title: "Activity Log",     href: "/ceo/activity",         icon: "Activity"        },
  { title: "Reports",          href: "/ceo/reports",          icon: "FileText"        },
];

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "CEO Dashboard" },
};

export default function CEOLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell title="CEO Portal" headerIcon="LineChart" nav={NAV_ITEMS} searchPlaceholder="Search CEO portal...">
      {children}
    </PortalShell>
  );
}
