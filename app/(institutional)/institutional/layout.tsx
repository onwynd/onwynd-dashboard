import type { Metadata } from "next";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { InstitutionalSidebar } from "@/components/institutional-dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header"; // Assuming a generic header or institutional specific one

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "Institutional Dashboard" },
};

export default function InstitutionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider className="bg-sidebar">
      <InstitutionalSidebar />
      <SidebarInset>
        <DashboardHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
