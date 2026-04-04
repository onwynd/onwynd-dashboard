"use client";

import { useEffect } from "react";
import { useAdminStore } from "@/store/admin-store";
import { WelcomeSection } from "./welcome-section";
import { StatsCards } from "./stats-cards";
import { LeadSourcesChart } from "./lead-sources-chart";
import { RevenueFlowChart } from "./revenue-flow-chart";
import { DealsTable } from "./deals-table";
import { ActiveUsersWidget } from "./active-users-widget";
import { QuotaAnalyticsWidget } from "./quota-analytics-widget";

export function DashboardContent() {
  const fetchStats = useAdminStore((state) => state.fetchStats);
  const fetchRevenueFlow = useAdminStore((state) => state.fetchRevenueFlow);
  const fetchLeadSources = useAdminStore((state) => state.fetchLeadSources);
  const fetchDeals = useAdminStore((state) => state.fetchDeals);

  useEffect(() => {
    fetchStats();
    fetchRevenueFlow("6months");
    fetchLeadSources("30days");
    fetchDeals();
  }, [fetchStats, fetchRevenueFlow, fetchLeadSources, fetchDeals]);

  return (
    <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 bg-background w-full">
      <WelcomeSection />
      <StatsCards />
      <div className="flex flex-col xl:flex-row gap-4 sm:gap-6">
        <LeadSourcesChart />
        <RevenueFlowChart />
      </div>
      <QuotaAnalyticsWidget />
      <DealsTable />
      <ActiveUsersWidget />
    </main>
  );
}
