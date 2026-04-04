import type { Metadata } from "next";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/admin-dashboard/sidebar"
import { DashboardHeader } from "@/components/admin-dashboard/header"

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "Admin Dashboard" },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <DashboardHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
