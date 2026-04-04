"use client";

import { useEffect } from "react";
import { WelcomeSection } from "./welcome-section";
import { StatsCards } from "./stats-cards";
import { CampaignPerformanceChart } from "./campaign-performance-chart";
import { LeadsTable } from "./leads-table";
import { useMarketingStore } from "@/store/marketing-store";
import { LeadSourcesChart } from "./lead-sources-chart";
import { CampaignsList } from "./campaigns-list";

export function DashboardContent() {
  const showStatsCards = useMarketingStore((state) => state.showStatsCards);
  const showChart = useMarketingStore((state) => state.showChart);
  const showTable = useMarketingStore((state) => state.showTable);
  const fetchStats = useMarketingStore((state) => state.fetchStats);
  const fetchChartData = useMarketingStore((state) => state.fetchChartData);
  const fetchLeadSources = useMarketingStore((state) => state.fetchLeadSources);

  useEffect(() => {
    fetchStats();
    fetchChartData("Last 7 days");
    fetchLeadSources("Last 7 days");
  }, [fetchStats, fetchChartData, fetchLeadSources]);

  return (
    <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 bg-background w-full">
      <WelcomeSection />
      {showStatsCards && <StatsCards />}
      <div className="flex flex-col xl:flex-row gap-4 sm:gap-6">
        {showChart && (
          <>
            <CampaignPerformanceChart />
            <LeadSourcesChart />
          </>
        )}
      </div>
      {showTable && (
        <div className="space-y-6">
          <CampaignsList />
          <LeadsTable />
        </div>
      )}
    </main>
  );
}
