import type { Metadata } from "next";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TherapistSidebar } from "@/components/therapist-dashboard/sidebar";
import { TherapistHeader } from "@/components/therapist-dashboard/header";
import { TherapistHeartbeat } from "@/components/therapist-dashboard/heartbeat";

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "Therapist Dashboard" },
};

export default function TherapistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider className="bg-sidebar">
      {/* Keeps is_online=true while dashboard is open; marks offline on tab close */}
      <TherapistHeartbeat />
      <TherapistSidebar />
      <SidebarInset>
        <TherapistHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
