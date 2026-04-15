
// filepath: app/(sales)/layout.tsx
import type { Metadata } from "next";
import { RoleGuard } from "@/components/auth/role-guard";
import { SalesSidebar } from "@/components/sales-dashboard/sidebar";
import { DashboardHeader } from "@/components/sales-dashboard/header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: { template: "%s | Onwynd Sales", default: "Sales Dashboard" },
};

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["sales", "closer", "finder", "builder"]}>
        <SidebarProvider>
            <SalesSidebar />
            <SidebarInset>
                <DashboardHeader />
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    </RoleGuard>
  );
}
