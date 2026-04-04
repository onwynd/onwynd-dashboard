"use client";

import { SystemHealth } from "@/components/tech-dashboard/system-health";

export default function SystemHealthPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
        <p className="text-muted-foreground">
          Monitor the operational status of all system components and services.
        </p>
      </div>
      <SystemHealth />
    </div>
  );
}
