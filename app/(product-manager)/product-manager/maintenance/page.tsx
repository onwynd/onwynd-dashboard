import type { Metadata } from "next";
import { MaintenanceList } from "@/components/product-manager-dashboard/maintenance-list";

export const metadata: Metadata = { title: "Maintenance" };

export default function MaintenancePage() {
  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Maintenance Schedules</h1>
        <p className="text-muted-foreground">Plan and manage system maintenance windows.</p>
      </div>
      <MaintenanceList />
    </div>
  );
}
