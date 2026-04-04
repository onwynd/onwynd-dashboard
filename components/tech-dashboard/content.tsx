"use client";

import { useEffect } from "react";
import { WelcomeSection } from "./welcome-section";
import { StatsCards } from "./stats-cards";
import { SystemHealthChart } from "./system-health-chart";
import { IncidentsList } from "./incidents-list";
import { useTechStore } from "@/store/tech-store";
import { cn } from "@/lib/utils";

export function DashboardContent() {
  const showAlertBanner = useTechStore((state) => state.showAlertBanner);
  const showStatsCards = useTechStore((state) => state.showStatsCards);
  const showChart = useTechStore((state) => state.showChart);
  const showIncidents = useTechStore((state) => state.showIncidents);
  const layoutDensity = useTechStore((state) => state.layoutDensity);
  const fetchStats = useTechStore((state) => state.fetchStats);
  const fetchChartData = useTechStore((state) => state.fetchChartData);
  const fetchIncidents = useTechStore((state) => state.fetchIncidents);

  useEffect(() => {
    fetchStats();
    fetchChartData("24h");
    fetchIncidents();
  }, [fetchStats, fetchChartData, fetchIncidents]);

  return (
    <main className={cn(
      "flex-1 overflow-auto p-3 sm:p-4 md:p-6 bg-background w-full",
      layoutDensity === "compact" ? "space-y-2 sm:space-y-3" : 
      layoutDensity === "comfortable" ? "space-y-6 sm:space-y-8" : 
      "space-y-4 sm:space-y-6"
    )}>
      {showAlertBanner && <WelcomeSection />}
      {showStatsCards && <StatsCards />}
      {showChart && <SystemHealthChart />}
      {showIncidents && <IncidentsList />}
    </main>
  );
}
