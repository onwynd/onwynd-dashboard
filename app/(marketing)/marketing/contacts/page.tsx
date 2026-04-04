"use client";

import { DashboardHeader } from "@/components/marketing-dashboard/header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/marketing-dashboard/sidebar";
import { LeadsTable } from "@/components/marketing-dashboard/leads-table";

export default function MarketingContactsPage() {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 p-4 sm:p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
            <p className="text-muted-foreground text-sm mt-1">All marketing leads and contacts in your database.</p>
          </div>
          <LeadsTable />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
