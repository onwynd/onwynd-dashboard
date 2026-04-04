import type { Metadata } from "next";
import { DashboardHeader } from "@/components/support-dashboard/header";
import { Sidebar } from "@/components/support-dashboard/sidebar";
import { SidebarProvider } from "@/components/layout/sidebar-provider";

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "Support Dashboard" },
};

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col lg:ml-64">
        <DashboardHeader />
        {children}
      </div>
    </SidebarProvider>
  );
}
