"use client";

import { useEffect } from "react";
import { AlertBanner } from "./alert-banner";
import { StatsCards } from "./stats-cards";
import { FinancialFlowChart } from "./financial-flow-chart";
import { EmployeesTable } from "./employees-table";
import { useManagerStore } from "@/store/manager-store";
import { cn } from "@/lib/utils";

export function DashboardContent() {
  const showAlertBanner = useManagerStore((state) => state.showAlertBanner);
  const showStatsCards = useManagerStore((state) => state.showStatsCards);
  const showChart = useManagerStore((state) => state.showChart);
  const showTable = useManagerStore((state) => state.showTable);
  const layoutDensity = useManagerStore((state) => state.layoutDensity);
  const fetchStats = useManagerStore((state) => state.fetchStats);
  const fetchEmployees = useManagerStore((state) => state.fetchEmployees);
  const fetchFinancialFlow = useManagerStore((state) => state.fetchFinancialFlow);

  useEffect(() => {
    fetchStats();
    fetchEmployees();
    fetchFinancialFlow("year");
  }, []); // Empty dependency array - these are stable Zustand actions

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
      {showTable && <EmployeesTable />}
    </main>
  );
}


