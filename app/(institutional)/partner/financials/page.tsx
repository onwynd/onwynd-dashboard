import type { Metadata } from "next";
import { FinancialFlowChart } from "@/components/partner-dashboard/financial-flow-chart";
import { StatsCards } from "@/components/partner-dashboard/stats-cards";

export const metadata: Metadata = { title: "Financials" };

export default function PartnerFinancialsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Financials</h1>
        <p className="text-muted-foreground text-sm mt-1">Revenue, contracts, and financial overview.</p>
      </div>
      <StatsCards />
      <FinancialFlowChart />
    </div>
  );
}
