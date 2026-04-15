import type { Metadata } from "next";
import { PortalShell } from "@/components/shared/portal-shell";

const NAV_ITEMS = [
  { title: "Dashboard",   href: "/cgo/dashboard",   icon: "LayoutDashboard" },
  { title: "Campaigns",   href: "/cgo/campaigns",   icon: "Radio"           },
  { title: "Subscribers", href: "/cgo/subscribers", icon: "Users"           },
  { title: "Leads",       href: "/cgo/leads",       icon: "UserSearch"      },
  { title: "Ambassadors", href: "/cgo/ambassadors", icon: "Star"            },
  { title: "Partners",    href: "/cgo/partners",    icon: "Handshake"       },
  { title: "OKR",         href: "/okr",             icon: "Target"          },
  { title: "Reports",     href: "/cgo/reports",     icon: "FileText"        },
];

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "CGO Dashboard" },
};

export default function CGOLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell title="CGO Portal" headerIcon="Megaphone" nav={NAV_ITEMS} searchPlaceholder="Search CGO portal...">
      {children}
    </PortalShell>
  );
}
