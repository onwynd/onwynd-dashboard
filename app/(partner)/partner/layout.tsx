import type { Metadata } from "next";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { PartnerSidebar } from "@/components/partner-dashboard/sidebar";
import { DashboardHeader } from "@/components/partner-dashboard/header";

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "Partner Portal" },
};

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider className="bg-sidebar">
      <PartnerSidebar />
      <SidebarInset>
        <DashboardHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
