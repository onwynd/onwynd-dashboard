import type { Metadata } from "next";
import { PortalShell } from "@/components/shared/portal-shell";

const NAV_ITEMS = [
  { title: "Dashboard",      href: "/president/dashboard",     icon: "LayoutDashboard" },
  { title: "Company Health", href: "/president/company-health", icon: "HeartPulse"     },
  { title: "All Departments", href: "/president/departments",   icon: "Building2"      },
  { title: "OKR Overview",   href: "/president/okr",           icon: "Target"          },
  { title: "KPI Overview",   href: "/president/kpi",           icon: "BarChart2"       },
  { title: "Reports",        href: "/president/reports",       icon: "FileText"        },
];

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "President Dashboard" },
};

export default function PresidentLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell title="President Portal" headerIcon="Crown" nav={NAV_ITEMS} searchPlaceholder="Search president portal...">
      {children}
    </PortalShell>
  );
}
