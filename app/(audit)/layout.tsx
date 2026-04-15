import type { Metadata } from "next";
import { PortalShell } from "@/components/shared/portal-shell";

const NAV_ITEMS = [
  { title: "Dashboard",      href: "/audit/dashboard",  icon: "LayoutDashboard" },
  { title: "Audit Log",      href: "/audit/log",        icon: "ScrollText"      },
  { title: "Who Viewed",     href: "/audit/page-views", icon: "Eye"             },
  { title: "Compliance",     href: "/audit/compliance", icon: "ShieldAlert"     },
  { title: "User Activity",  href: "/audit/users",      icon: "Users"           },
  { title: "Security Events", href: "/audit/security",  icon: "Lock"            },
  { title: "Legal Docs",     href: "/audit/legal",      icon: "FileText"        },
  { title: "Reports",        href: "/audit/reports",    icon: "FileBarChart"    },
];

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "Audit Dashboard" },
};

export default function AuditLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell title="Audit & Compliance" headerIcon="ShieldCheck" nav={NAV_ITEMS} searchPlaceholder="Search audit events...">
      {children}
    </PortalShell>
  );
}
