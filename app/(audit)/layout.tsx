import type { Metadata } from "next";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { UnifiedSidebar } from "@/components/shared/UnifiedSidebar";
import { PortalHeader } from "@/components/shared/portal-header";
import {
  LayoutDashboard, ScrollText, ShieldAlert, Users, Lock, FileText, FileBarChart, ShieldCheck, Eye,
} from "lucide-react";

const NAV_ITEMS = [
  { title: "Dashboard",       href: "/audit/dashboard",   icon: LayoutDashboard },
  { title: "Audit Log",       href: "/audit/log",         icon: ScrollText      },
  { title: "Who Viewed",      href: "/audit/page-views",  icon: Eye             },
  { title: "Compliance",      href: "/audit/compliance",  icon: ShieldAlert     },
  { title: "User Activity",   href: "/audit/users",       icon: Users           },
  { title: "Security Events", href: "/audit/security",    icon: Lock            },
  { title: "Legal Docs",      href: "/audit/legal",       icon: FileText        },
  { title: "Reports",         href: "/audit/reports",     icon: FileBarChart    },
];

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "Audit Dashboard" },
};

export default function AuditLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <UnifiedSidebar title="Audit & Compliance" HeaderIcon={ShieldCheck} nav={NAV_ITEMS} />
      <SidebarInset>
        <PortalHeader notificationsBasePath="/api/v1" notificationsPath="/settings/notifications" searchPlaceholder="Search audit events..." />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
