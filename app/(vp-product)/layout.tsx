import type { Metadata } from "next";
import { PortalShell } from "@/components/shared/portal-shell";

const NAV_ITEMS = [
  { title: "Dashboard",   href: "/vp-product/dashboard",   icon: "LayoutDashboard" },
  { title: "Roadmap",     href: "/vp-product/roadmap",     icon: "Map"             },
  { title: "Features",    href: "/vp-product/features",    icon: "Zap"             },
  { title: "Tech Health", href: "/vp-product/tech",        icon: "Cpu"             },
  { title: "Deployments", href: "/vp-product/deployments", icon: "Rocket"          },
  { title: "OKR",         href: "/okr",                    icon: "Target"          },
  { title: "Reports",     href: "/vp-product/reports",     icon: "FileBarChart"    },
];

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "VP Product Dashboard" },
};

export default function VpProductLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell title="Product Leadership" headerIcon="PackageOpen" nav={NAV_ITEMS} searchPlaceholder="Search product...">
      {children}
    </PortalShell>
  );
}
