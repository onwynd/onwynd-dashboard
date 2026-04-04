"use client";

import { ReferralsTable } from "@/components/institutional-dashboard/referrals-table";

export default function ReferralsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Referrals</h2>
      </div>
      <ReferralsTable />
    </div>
  );
}
