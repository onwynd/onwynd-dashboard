"use client";

import { useEffect } from "react";
import { AlertBanner } from "./alert-banner";
import { StatsCards } from "./stats-cards";
import { ProductPerformanceChart } from "./product-performance-chart";
import { ProductsTable } from "./products-table";
import { useProductStore } from "@/store/product-store";
import { cn } from "@/lib/utils";

export function DashboardContent() {
  const showAlertBanner = useProductStore((state) => state.showAlertBanner);
  const showStatsCards = useProductStore((state) => state.showStatsCards);
  const showChart = useProductStore((state) => state.showChart);
  const showTable = useProductStore((state) => state.showTable);
  const layoutDensity = useProductStore((state) => state.layoutDensity);
  const fetchStats = useProductStore((state) => state.fetchStats);
  const fetchChartData = useProductStore((state) => state.fetchChartData);

  useEffect(() => {
    fetchStats();
    fetchChartData("month");
  }, [fetchStats, fetchChartData]);

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
      {showChart && <ProductPerformanceChart />}
      {showTable && <ProductsTable />}
    </main>
  );
}
