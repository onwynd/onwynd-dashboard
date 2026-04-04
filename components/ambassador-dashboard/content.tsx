"use client";

import { useEffect } from "react";
import { AlertBanner } from "./alert-banner";
import { StatsCards } from "./stats-cards";
import { ReferralChart } from "./referral-chart";
import { ReferralTable } from "./referral-table";
import { ReferralLinkCard } from "./referral-link-card";
import { useAmbassadorStore } from "@/store/ambassador-store";
import { cn } from "@/lib/utils";

export function DashboardContent() {
  const showAlertBanner = useAmbassadorStore((state) => state.showAlertBanner);
  const showStatsCards = useAmbassadorStore((state) => state.showStatsCards);
  const showChart = useAmbassadorStore((state) => state.showChart);
  const showTable = useAmbassadorStore((state) => state.showTable);
  const layoutDensity = useAmbassadorStore((state) => state.layoutDensity);
  // DB8: fetch all data on mount
  const fetchStats = useAmbassadorStore((state) => state.fetchStats);
  const fetchReferrals = useAmbassadorStore((state) => state.fetchReferrals);
  const fetchChartData = useAmbassadorStore((state) => state.fetchChartData);

  useEffect(() => {
    fetchStats();
    fetchReferrals();
    fetchChartData("6months");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main
      className={cn(
        "w-full flex-1 overflow-auto",
        layoutDensity === "compact" && "p-2 sm:p-4 space-y-4",
        layoutDensity === "comfortable" && "p-6 sm:p-8 space-y-8 sm:space-y-10",
        layoutDensity === "spacious" && "p-8 sm:p-10 space-y-10 sm:space-y-12"
      )}
    >
      {showAlertBanner && <AlertBanner />}
      {/* DB19: Referral link prominently displayed */}
      <ReferralLinkCard />
      {showStatsCards && <StatsCards />}
      {showChart && <ReferralChart />}
      {showTable && <ReferralTable />}
    </main>
  );
}
