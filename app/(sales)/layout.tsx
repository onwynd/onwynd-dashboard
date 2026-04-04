import type { Metadata } from "next";
import { DashboardHeader } from "@/components/sales-dashboard/header";
import { DashboardSidebar } from "@/components/sales-dashboard/sidebar";
import { SalesRoleGuard } from "@/components/sales-dashboard/role-guard";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "Sales Dashboard" },
};

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <DashboardHeader />
        <SalesRoleGuard>
          {children}
        </SalesRoleGuard>
      </SidebarInset>
    </SidebarProvider>
  );
}
