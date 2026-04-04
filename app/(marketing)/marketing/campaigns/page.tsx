"use client";

import { DashboardHeader } from "@/components/marketing-dashboard/header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/marketing-dashboard/sidebar";
import { CampaignsTable } from "@/components/marketing-dashboard/campaigns-table";

export default function CampaignsPage() {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 p-4 sm:p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">Campaigns</h2>
            </div>
            <CampaignsTable />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
