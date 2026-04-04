import type { Metadata } from "next";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { PMSidebar } from "@/components/pm-dashboard/sidebar";
import { DashboardHeader } from "@/components/pm-dashboard/header";

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "Product Dashboard" },
};

export default function PMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <PMSidebar />
      <SidebarInset>
        <DashboardHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
