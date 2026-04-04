import type { Metadata } from "next";
import { DashboardHeader } from "@/components/compliance-dashboard/header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ComplianceSidebar } from "@/components/compliance-dashboard/sidebar";
import { DashboardContent } from "@/components/compliance-dashboard/content";

export const metadata: Metadata = { title: "Compliance Dashboard" };

export default function ComplianceDashboardPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <ComplianceSidebar />
        <div className="flex flex-col flex-1">
          <DashboardHeader />
          <DashboardContent />
        </div>
      </div>
    </SidebarProvider>
  );
}
