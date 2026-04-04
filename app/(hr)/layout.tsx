import type { Metadata } from "next";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/hr-dashboard/sidebar";
import { DashboardHeader } from "@/components/hr-dashboard/header";

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "HR Dashboard" },
};

export default function HRLayout({
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
