"use client";

import { useEffect } from "react";
import { StatsCards } from "./stats-cards";
import { TicketFilters } from "./ticket-filters";
import { TicketsList } from "./tickets-list";
import { useSupportStore } from "@/store/support-store";
import { cn } from "@/lib/utils";

export function DashboardContent() {
  const fetchStats = useSupportStore((state) => state.fetchStats);
  const fetchTickets = useSupportStore((state) => state.fetchTickets);
  const layoutDensity = useSupportStore((state) => state.layoutDensity);

  useEffect(() => {
    fetchStats();
    fetchTickets();
  }, [fetchStats, fetchTickets]);

  return (
    <main
      className={cn(
        "flex-1 overflow-auto p-4 md:p-6 bg-background w-full",
        layoutDensity === "compact"
          ? "space-y-4"
          : layoutDensity === "comfortable"
          ? "space-y-8"
          : "space-y-6"
      )}
    >
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Support Dashboard</h2>
      </div>
      <StatsCards />
      <div className="space-y-4">
        <TicketFilters />
        <TicketsList />
      </div>
    </main>
  );
}
