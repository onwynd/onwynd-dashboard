import type { Metadata } from "next";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { UnifiedSidebar } from "@/components/shared/UnifiedSidebar";
import { PortalHeader } from "@/components/shared/portal-header";
import {
  LayoutDashboard, Video, LifeBuoy, Users, CalendarOff, UserPlus, Target, FileBarChart, Cog,
} from "lucide-react";

const NAV_ITEMS = [
  { title: "Dashboard",   href: "/vp-ops/dashboard",   icon: LayoutDashboard },
  { title: "Sessions",    href: "/vp-ops/sessions",    icon: Video           },
  { title: "Support",     href: "/vp-ops/support",     icon: LifeBuoy        },
  { title: "HR",          href: "/vp-ops/hr",          icon: Users           },
  { title: "Leave",       href: "/vp-ops/leave",       icon: CalendarOff     },
  { title: "Recruitment", href: "/vp-ops/recruitment", icon: UserPlus        },
  { title: "OKR",         href: "/okr",                 icon: Target          },
  { title: "Reports",     href: "/vp-ops/reports",     icon: FileBarChart    },
];

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "VP Operations Dashboard" },
};

export default function VpOpsLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <UnifiedSidebar title="Operations Leadership" HeaderIcon={Cog} nav={NAV_ITEMS} />
      <SidebarInset>
        <PortalHeader notificationsBasePath="/api/v1" notificationsPath="/settings/notifications" searchPlaceholder="Search operations..." />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
