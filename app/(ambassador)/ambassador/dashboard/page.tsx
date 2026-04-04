import type { Metadata } from "next";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/ambassador-dashboard/sidebar";
import { DashboardHeader } from "@/components/ambassador-dashboard/header";
import { DashboardContent } from "@/components/ambassador-dashboard/content";

export const metadata: Metadata = { title: "Ambassador Dashboard" };

export default function AmbassadorDashboard() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/50">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col">
          <DashboardHeader />
          <DashboardContent />
        </div>
      </div>
    </SidebarProvider>
  );
}
