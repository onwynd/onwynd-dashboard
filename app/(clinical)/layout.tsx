
// filepath: app/(clinical)/layout.tsx
import type { Metadata } from "next";
import { RoleGuard } from "@/components/auth/role-guard";
import { ClinicalSidebar } from "@/components/clinical-dashboard/sidebar";
import { DashboardHeader } from "@/components/clinical-dashboard/header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: { template: "%s | Onwynd Clinical", default: "Clinical Dashboard" },
};

export default function ClinicalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["clinical_advisor", "admin"]}>
        <SidebarProvider>
            <ClinicalSidebar />
            <SidebarInset>
                <DashboardHeader />
                {children}
            </SidebarInset>
        </SidebarProvider>
    </RoleGuard>
  );
}
