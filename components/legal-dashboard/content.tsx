"use client";

import { useEffect } from "react";
import { StatsCards } from "./stats-cards";
import { CasesTable } from "./cases-table";
import { useLegalStore } from "@/store/legal-store";

export function DashboardContent() {
  const fetchStats = useLegalStore((state) => state.fetchStats);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Legal Dashboard</h1>
      </div>
      <StatsCards />
      <CasesTable />
    </div>
  );
}

