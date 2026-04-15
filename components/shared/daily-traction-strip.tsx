"use client";

import { useEffect } from "react";
import { useCurrencyStore } from "@/store/currency-store";
import { useExecutiveIntelligenceStore } from "@/store/executive-intelligence-store";
import { cn } from "@/lib/utils";
import type { ExecutiveFinanceSnapshot } from "@/types/executive-intelligence";

type StripRole = "ceo" | "coo" | "cfo" | "general";

interface DailyTractionStripProps {
  role?: StripRole;
  className?: string;
}

interface StripItem {
  label: string;
  value: string;
}

function getItems(
  role: StripRole,
  snapshot: ExecutiveFinanceSnapshot,
  formatNGN: (value: number, decimals?: number) => string,
): StripItem[] {
  const base: Record<string, StripItem> = {
    signups: { label: "Daily Signups", value: snapshot.traction.signupsToday.toLocaleString() },
    activeUsers: { label: "Active Users", value: snapshot.traction.activeUsers.toLocaleString() },
    dealsWon: { label: "Deals Won", value: snapshot.traction.dealsWon.toLocaleString() },
    pipeline: { label: "Sales Pipeline", value: formatNGN(snapshot.traction.salesPipelineValue.ngn) },
    recurringRevenue: {
      label: "Subscription + Booking",
      value: formatNGN(snapshot.revenueMix.subscriptions.ngn + snapshot.revenueMix.bookingFees.ngn),
    },
    expenses: { label: "Monthly Expenses", value: formatNGN(snapshot.spend.expensesThisMonth.ngn) },
    salaries: { label: "Salaries", value: formatNGN(snapshot.spend.salariesThisMonth.ngn) },
    cash: { label: "Cash Left", value: formatNGN(snapshot.spend.cashRemaining.ngn) },
    runway: { label: "Runway", value: `${snapshot.spend.runwayMonths.toFixed(1)} mo` },
    okrHealth: { label: "OKR Health", value: `${snapshot.traction.okrHealthScore.toFixed(0)}%` },
  };

  if (role === "ceo") return [base.signups, base.recurringRevenue, base.cash, base.runway, base.okrHealth, base.pipeline];
  if (role === "coo") return [base.signups, base.activeUsers, base.dealsWon, base.pipeline, base.expenses, base.okrHealth];
  if (role === "cfo") return [base.cash, base.runway, base.expenses, base.salaries, base.recurringRevenue, base.dealsWon];
  return [base.signups, base.dealsWon, base.recurringRevenue, base.expenses, base.cash, base.runway];
}

export function DailyTractionStrip({ role = "general", className }: DailyTractionStripProps) {
  const fetchSnapshot = useExecutiveIntelligenceStore((s) => s.fetchSnapshot);
  const snapshot = useExecutiveIntelligenceStore((s) => s.snapshot);
  const isLoading = useExecutiveIntelligenceStore((s) => s.isLoading);
  const formatNGN = useCurrencyStore((s) => s.formatNGN);

  useEffect(() => {
    fetchSnapshot();
  }, [fetchSnapshot]);

  if (!snapshot) {
    return (
      <div className={cn("rounded-lg border border-dashed bg-background/70 px-3 py-2 text-xs text-muted-foreground", className)}>
        {isLoading ? "Loading daily traction..." : "Daily traction unavailable"}
      </div>
    );
  }

  const items = getItems(role, snapshot, formatNGN);

  return (
    <div
      className={cn(
        "sticky top-2 z-[5] rounded-xl border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85",
        className,
      )}
    >
      <div className="flex items-center gap-2 overflow-x-auto p-2">
        {items.map((item) => (
          <div key={item.label} className="min-w-[150px] rounded-lg border bg-background px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{item.label}</p>
            <p className="text-base font-extrabold leading-tight">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
