"use client";

import { LeadsTable } from "@/components/sales-dashboard/leads-table";

export default function LeadsPage() {
  return (
    <main className="flex-1 p-4 sm:p-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Leads Management</h1>
      <LeadsTable />
    </main>
  );
}
