"use client";

import { useEffect } from "react";
import { AlertBanner } from "./alert-banner";
import { StatsCards } from "./stats-cards";
import { FinancialFlowChart } from "./financial-flow-chart";
import { EmployeesTable } from "./employees-table";
import { RecentApplications } from "./recent-applications";
import { useHRStore } from "@/store/hr-store";
import { cn } from "@/lib/utils";

export function DashboardContent() {
  const { fetchStats, fetchPayrolls, fetchLeaveRequests, fetchFinancialFlow } = useHRStore();
  const showAlertBanner = useHRStore((state) => state.showAlertBanner);
  const showStatsCards = useHRStore((state) => state.showStatsCards);
  const showChart = useHRStore((state) => state.showChart);
  const showTable = useHRStore((state) => state.showTable);
  const layoutDensity = useHRStore((state) => state.layoutDensity);

  useEffect(() => {
    fetchStats();
    fetchPayrolls();
    fetchLeaveRequests();
    fetchFinancialFlow("year");
  }, [fetchStats, fetchPayrolls, fetchLeaveRequests, fetchFinancialFlow]);

  return (
    <main
      className={cn(
        "w-full flex-1 overflow-auto",
        layoutDensity === "compact" && "p-2 sm:p-4 space-y-4",
        layoutDensity === "default" && "p-4 sm:p-6 space-y-6 sm:space-y-8",
        layoutDensity === "comfortable" && "p-6 sm:p-8 space-y-8 sm:space-y-10"
      )}
    >
      {showAlertBanner && <AlertBanner />}
      {showStatsCards && <StatsCards />}
      {showChart && <FinancialFlowChart />}
      <RecentApplications />
      {showTable && <EmployeesTable />}
    </main>
  );
}
