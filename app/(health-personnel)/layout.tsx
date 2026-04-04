import type { Metadata } from "next";
import { HealthSidebar } from "@/components/health-dashboard/sidebar";
import { DashboardHeader } from "@/components/health-dashboard/dashboard-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "Health Personnel" },
};

export default function HealthPersonnelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <HealthSidebar />
      <SidebarInset>
        <DashboardHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
