"use client";

import { StatsCards } from "./stats-cards";
import { AuditChart } from "./audit-chart";
import { ComplianceTable } from "./compliance-table";
import { useComplianceStore } from "@/store/compliance-store";
import { cn } from "@/lib/utils";

export function DashboardContent() {
  const showStatsCards = useComplianceStore((state) => state.showStatsCards);
  const showChart = useComplianceStore((state) => state.showChart);
  const showTable = useComplianceStore((state) => state.showTable);
  const layoutDensity = useComplianceStore((state) => state.layoutDensity);

  return (
    <main
      className={cn(
        "w-full flex-1 overflow-auto",
        layoutDensity === "compact" && "p-2 sm:p-4 space-y-4",
        layoutDensity === "default" && "p-4 sm:p-6 space-y-6 sm:space-y-8",
        layoutDensity === "comfortable" && "p-6 sm:p-8 space-y-8 sm:space-y-10"
      )}
    >
      
      {showStatsCards && <StatsCards />}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          {showChart && <AuditChart />}
        </div>
        <div className="lg:col-span-2">
          {showTable && <ComplianceTable />}
        </div>
      </div>
    </main>
  );
}
