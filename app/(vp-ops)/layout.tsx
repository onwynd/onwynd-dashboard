import type { Metadata } from "next";
import { PortalShell } from "@/components/shared/portal-shell";

const NAV_ITEMS = [
  { title: "Dashboard",   href: "/vp-ops/dashboard",   icon: "LayoutDashboard" },
  { title: "Sessions",    href: "/vp-ops/sessions",    icon: "Video"           },
  { title: "Support",     href: "/vp-ops/support",     icon: "LifeBuoy"        },
  { title: "HR",          href: "/vp-ops/hr",          icon: "Users"           },
  { title: "Leave",       href: "/vp-ops/leave",       icon: "CalendarOff"     },
  { title: "Recruitment", href: "/vp-ops/recruitment", icon: "UserPlus"        },
  { title: "OKR",         href: "/okr",                icon: "Target"          },
  { title: "Reports",     href: "/vp-ops/reports",     icon: "FileBarChart"    },
];

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "VP Operations Dashboard" },
};

export default function VpOpsLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell title="Operations Leadership" headerIcon="Cog" nav={NAV_ITEMS} searchPlaceholder="Search operations...">
      {children}
    </PortalShell>
  );
}
