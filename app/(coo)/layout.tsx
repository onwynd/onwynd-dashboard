import type { Metadata } from "next";
import { PortalShell } from "@/components/shared/portal-shell";
import { RoleGuard } from "@/components/auth/role-guard";

const NAV_ITEMS = [
  { title: "Dashboard",        href: "/coo/dashboard",        icon: "LayoutDashboard" },
  { title: "Calendar",         href: "/coo/calendar",         icon: "CalendarDays"    },
  { title: "AI Assistant",     href: "/coo/assistant",        icon: "Sparkles"        },
  { title: "Approvals",        href: "/coo/approvals",        icon: "CheckSquare"     },
  { title: "Budget Approvals", href: "/coo/budget-approvals", icon: "Wallet"          },
  { title: "Operational Log",  href: "/coo/operational-log",  icon: "FileText"        },
  { title: "Marketing",        href: "/coo/marketing",        icon: "Target"          },
  { title: "AI Operations",    href: "/coo/ai-operations",    icon: "Cpu"             },
  { title: "Notifications",    href: "/settings/notifications", icon: "Bell"           },
];

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "COO Dashboard" },
};

export default function COOLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={["coo", "admin", "super_admin"]}>
      <PortalShell title="COO Portal" headerIcon="Settings2" nav={NAV_ITEMS} searchPlaceholder="Search COO portal...">
        {children}
      </PortalShell>
    </RoleGuard>
  );
}
