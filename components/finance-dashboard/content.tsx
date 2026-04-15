"use client";

import { useEffect } from "react";
import { StatsCards } from "./stats-cards";
import { RevenueChart } from "./revenue-chart";
import { TransactionsList } from "./transactions-list";
import { ExpenseBreakdownChart } from "./expense-breakdown-chart";
import { useFinanceStore } from "@/store/finance-store";
import { cn } from "@/lib/utils";
import { ExecutiveBrandValuation } from "@/components/shared/executive-brand-valuation";
import { ExecutiveFinancePanel } from "@/components/shared/executive-finance-panel";
import { DailyTractionStrip } from "@/components/shared/daily-traction-strip";

export function DashboardContent() {
  const layoutDensity = useFinanceStore((state) => state.layoutDensity);
  const fetchStats = useFinanceStore((state) => state.fetchStats);
  const fetchTransactions = useFinanceStore((state) => state.fetchTransactions);
  const fetchRevenueData = useFinanceStore((state) => state.fetchRevenueData);
  const fetchExpenseBreakdown = useFinanceStore((state) => state.fetchExpenseBreakdown);

  useEffect(() => {
    fetchStats();
    fetchTransactions();
    fetchRevenueData("6m");
    fetchExpenseBreakdown("month");
  }, [fetchStats, fetchTransactions, fetchRevenueData, fetchExpenseBreakdown]);

  return (
    <main
      className={cn(
        "flex-1 overflow-auto p-4 md:p-6 bg-background w-full",
        layoutDensity === "compact"
          ? "space-y-4"
          : layoutDensity === "comfortable"
          ? "space-y-8"
          : "space-y-6"
      )}
    >
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Finance Dashboard</h2>
      </div>
      <ExecutiveBrandValuation mode="panel" />
      <DailyTractionStrip role="cfo" />
      <ExecutiveFinancePanel role="cfo" />
      <StatsCards />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <RevenueChart />
        <div className="col-span-4 lg:col-span-3">
          <ExpenseBreakdownChart />
        </div>
      </div>
      <TransactionsList />
    </main>
  );
}
