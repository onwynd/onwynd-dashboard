"use client";

import { VisitorsTable } from "@/components/secretary-dashboard/visitors-table";

export default function SecretaryVisitorsPage() {
  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Visitors</h1>
        <p className="text-muted-foreground">Manage visitor logs and check-ins.</p>
      </div>

      <VisitorsTable />
    </div>
  );
}
