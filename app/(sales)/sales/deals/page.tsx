"use client";

import { DealsTable } from "@/components/sales-dashboard/deals-table";

export default function DealsPage() {
  return (
    <main className="flex-1 p-4 sm:p-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Deals Pipeline</h1>
      <DealsTable />
    </main>
  );
}
