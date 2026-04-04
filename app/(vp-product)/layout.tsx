import type { Metadata } from "next";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { UnifiedSidebar } from "@/components/shared/UnifiedSidebar";
import { PortalHeader } from "@/components/shared/portal-header";
import {
  LayoutDashboard, Map, Zap, Cpu, Rocket, Target, FileBarChart, PackageOpen,
} from "lucide-react";

const NAV_ITEMS = [
  { title: "Dashboard",  href: "/vp-product/dashboard",   icon: LayoutDashboard },
  { title: "Roadmap",    href: "/vp-product/roadmap",     icon: Map             },
  { title: "Features",   href: "/vp-product/features",    icon: Zap             },
  { title: "Tech Health", href: "/vp-product/tech",       icon: Cpu             },
  { title: "Deployments", href: "/vp-product/deployments", icon: Rocket         },
  { title: "OKR",        href: "/okr",                     icon: Target          },
  { title: "Reports",    href: "/vp-product/reports",     icon: FileBarChart    },
];

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "VP Product Dashboard" },
};

export default function VpProductLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <UnifiedSidebar title="Product Leadership" HeaderIcon={PackageOpen} nav={NAV_ITEMS} />
      <SidebarInset>
        <PortalHeader notificationsBasePath="/api/v1" notificationsPath="/settings/notifications" searchPlaceholder="Search product..." />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
