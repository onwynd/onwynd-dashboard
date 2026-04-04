"use client";

import { DashboardHeader } from "@/components/marketing-dashboard/header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/marketing-dashboard/sidebar";
import { DashboardContent } from "@/components/marketing-dashboard/content";

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <DashboardSidebar />
        <div className="flex flex-col flex-1">
          <DashboardHeader />
          <main className="flex-1 p-4 sm:p-6">
            <DashboardContent />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
