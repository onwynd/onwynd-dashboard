import type { Metadata } from "next";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { COOSidebar } from "@/components/coo-dashboard/sidebar"
import { DashboardHeader } from "@/components/admin-dashboard/header"

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "COO Dashboard" },
};

export default function COOLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <COOSidebar />
      <SidebarInset>
        <DashboardHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
