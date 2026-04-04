"use client";

import { useEffect } from "react";
import Cookies from "js-cookie";
import { useSalesStore } from "@/store/sales-store";
import { WelcomeSection } from "./welcome-section";
import { NewInboundLeads } from "./new-inbound-leads";
import { RMDashboard } from "./rm-dashboard";
import { StatsCards } from "./stats-cards";
import { LeadSourcesChart } from "./lead-sources-chart";
import { RevenueFlowChart } from "./revenue-flow-chart";
import { DealsTable } from "./deals-table";

export function DashboardContent() {
  const fetchStats = useSalesStore((state) => state.fetchStats);
  const fetchRevenueFlow = useSalesStore((state) => state.fetchRevenueFlow);
  const fetchLeadSources = useSalesStore((state) => state.fetchLeadSources);

  const userRole = Cookies.get("user_role") ?? "";

  useEffect(() => {
    fetchStats();
    fetchRevenueFlow("6months");
    fetchLeadSources("30days");
  }, [fetchStats, fetchRevenueFlow, fetchLeadSources]);

  // Relationship Manager / Builder View
  if (userRole === 'relationship_manager' || userRole === 'builder') {
    return (
      <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 bg-background w-full">
        <WelcomeSection />
        <RMDashboard />
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 bg-background w-full">
      <WelcomeSection />
      <NewInboundLeads />
      <StatsCards />
      <div className="flex flex-col xl:flex-row gap-4 sm:gap-6">
        <LeadSourcesChart />
        <RevenueFlowChart />
      </div>
      <DealsTable />
    </main>
  );
}
