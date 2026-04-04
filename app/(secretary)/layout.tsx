import type { Metadata } from "next";
import { DashboardHeader } from "@/components/secretary-dashboard/dashboard-header";
import { SecretarySidebar } from "@/components/secretary-dashboard/sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "Secretary Dashboard" },
};

export default function SecretaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <SecretarySidebar />
      <SidebarInset>
        <DashboardHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
