
// filepath: app/(therapist)/layout.tsx
import type { Metadata } from "next";
import { RoleGuard } from "@/components/auth/role-guard";
import { TherapistSidebar } from "@/components/therapist-dashboard/sidebar";
import { DashboardHeader } from "@/components/therapist-dashboard/header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: { template: "%s | Onwynd Therapist", default: "Therapist Dashboard" },
};

export default function TherapistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["therapist", "admin"]}>
        <SidebarProvider>
            <TherapistSidebar />
            <SidebarInset>
                <DashboardHeader />
                {children}
            </SidebarInset>
        </SidebarProvider>
    </RoleGuard>
  );
}
