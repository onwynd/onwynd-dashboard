import type { Metadata } from "next";
import { DashboardHeader } from "@/components/clinical-dashboard/header";
import { DashboardSidebar } from "@/components/clinical-dashboard/sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "Clinical Dashboard" },
};

export default function ClinicalLayout({
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
