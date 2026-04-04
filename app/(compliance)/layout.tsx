import type { Metadata } from "next";
import { DashboardHeader } from "@/components/compliance-dashboard/header";
import { ComplianceSidebar } from "@/components/compliance-dashboard/sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "Compliance Dashboard" },
};

export default function ComplianceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <ComplianceSidebar />
      <SidebarInset>
        <DashboardHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
