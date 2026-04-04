import type { Metadata } from "next";
import { DashboardHeader } from "@/components/ambassador-dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/ambassador-dashboard/sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "Ambassador Dashboard" },
};

export default function AmbassadorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <DashboardHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
