"use client";

import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrencyStore } from "@/store/currency-store";
import { useExecutiveIntelligenceStore } from "@/store/executive-intelligence-store";
import type { ExecutiveFinanceSnapshot } from "@/types/executive-intelligence";

interface MoneyCellProps {
  label: string;
  ngn: number;
  usd: number;
}

function MoneyCell({ label, ngn, usd }: MoneyCellProps) {
  const formatNGN = useCurrencyStore((s) => s.formatNGN);
  const formatUSD = useCurrencyStore((s) => s.formatUSD);
  return (
    <div className="rounded-lg border bg-background px-3 py-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{formatNGN(ngn)}</p>
      <p className="text-xs text-muted-foreground">{formatUSD(usd, 0)}</p>
    </div>
  );
}

interface BigStatProps {
  label: string;
  value: string;
  subValue?: string;
}

function BigStat({ label, value, subValue }: BigStatProps) {
  return (
    <div className="rounded-xl border bg-background px-4 py-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight">{value}</p>
      {subValue ? <p className="text-xs text-muted-foreground mt-1">{subValue}</p> : null}
    </div>
  );
}

type ExecutivePanelRole = "ceo" | "coo" | "cfo" | "general";

interface ExecutiveFinancePanelProps {
  role?: ExecutivePanelRole;
}

function getTopStats(
  role: ExecutivePanelRole,
  snapshot: ExecutiveFinanceSnapshot,
  formatNGN: (value: number, decimals?: number) => string,
  formatUSD: (value: number, decimals?: number) => string,
): BigStatProps[] {
  const common: Record<string, BigStatProps> = {
    signups: {
      label: "Daily Signups",
      value: snapshot.traction.signupsToday.toLocaleString(),
      subValue: `${snapshot.traction.signupsPeriod.toLocaleString()} in current period`,
    },
    dealsWon: {
      label: "Deals Won (Daily)",
      value: snapshot.traction.dealsWon.toLocaleString(),
      subValue: `Pipeline ${formatNGN(snapshot.traction.salesPipelineValue.ngn)} / ${formatUSD(snapshot.traction.salesPipelineValue.usd, 0)}`,
    },
    cash: {
      label: "Cash Remaining",
      value: formatNGN(snapshot.spend.cashRemaining.ngn),
      subValue: `${formatUSD(snapshot.spend.cashRemaining.usd, 0)} • Runway ${snapshot.spend.runwayMonths.toFixed(1)} mo`,
    },
    okr: {
      label: "OKR / KPI Health",
      value: `${snapshot.traction.okrHealthScore.toFixed(0)}%`,
      subValue: `${snapshot.traction.kpiOnTrackPct.toFixed(1)}% KPIs on-track`,
    },
    expenses: {
      label: "Monthly Expenses",
      value: formatNGN(snapshot.spend.expensesThisMonth.ngn),
      subValue: `Salaries ${formatNGN(snapshot.spend.salariesThisMonth.ngn)}`,
    },
    revenue: {
      label: "Recurring + Booking Revenue",
      value: formatNGN(snapshot.revenueMix.subscriptions.ngn + snapshot.revenueMix.bookingFees.ngn),
      subValue: `${formatUSD(snapshot.revenueMix.subscriptions.usd + snapshot.revenueMix.bookingFees.usd, 0)}`,
    },
  };

  if (role === "ceo") return [common.revenue, common.signups, common.cash, common.okr];
  if (role === "coo") return [common.signups, common.dealsWon, common.expenses, common.okr];
  if (role === "cfo") return [common.cash, common.expenses, common.revenue, common.dealsWon];
  return [common.signups, common.dealsWon, common.cash, common.okr];
}

export function ExecutiveFinancePanel({ role = "general" }: ExecutiveFinancePanelProps) {
  const fetchSnapshot = useExecutiveIntelligenceStore((s) => s.fetchSnapshot);
  const snapshot = useExecutiveIntelligenceStore((s) => s.snapshot);
  const isLoading = useExecutiveIntelligenceStore((s) => s.isLoading);
  const formatNGN = useCurrencyStore((s) => s.formatNGN);
  const formatUSD = useCurrencyStore((s) => s.formatUSD);

  useEffect(() => {
    fetchSnapshot();
  }, [fetchSnapshot]);

  if (!snapshot) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-3 text-xs text-muted-foreground">
          {isLoading ? "Loading executive finance intelligence..." : "Executive finance intelligence unavailable"}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardContent className="py-3 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground">Daily Finance Intelligence</p>
            <p className="text-sm font-semibold">Cashflow, Costs, Commission, Centers, Assets and Inventory</p>
          </div>
          <p className="text-[11px] text-muted-foreground">
            As of {new Date(snapshot.asOfDate).toLocaleDateString()}
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {getTopStats(role, snapshot, formatNGN, formatUSD).map((stat) => (
            <BigStat key={stat.label} label={stat.label} value={stat.value} subValue={stat.subValue} />
          ))}
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <MoneyCell label="Subscription Revenue" ngn={snapshot.revenueMix.subscriptions.ngn} usd={snapshot.revenueMix.subscriptions.usd} />
          <MoneyCell label="Platform Booking Fees" ngn={snapshot.revenueMix.bookingFees.ngn} usd={snapshot.revenueMix.bookingFees.usd} />
          <MoneyCell label="Monthly Expenses" ngn={snapshot.spend.expensesThisMonth.ngn} usd={snapshot.spend.expensesThisMonth.usd} />
          <MoneyCell label="Salaries / Payroll" ngn={snapshot.spend.salariesThisMonth.ngn} usd={snapshot.spend.salariesThisMonth.usd} />
          <MoneyCell label="Approved Sales Budget" ngn={snapshot.spend.salesBudgetApproved.ngn} usd={snapshot.spend.salesBudgetApproved.usd} />
          <MoneyCell label="Investment Inflow" ngn={snapshot.spend.investmentInflow.ngn} usd={snapshot.spend.investmentInflow.usd} />
          <MoneyCell label="Therapist Commission" ngn={snapshot.commission.therapistCommission.ngn} usd={snapshot.commission.therapistCommission.usd} />
          <MoneyCell label="Center CAPEX" ngn={snapshot.physicalCenters.capex.ngn} usd={snapshot.physicalCenters.capex.usd} />
          <MoneyCell label="Center OPEX" ngn={snapshot.physicalCenters.opex.ngn} usd={snapshot.physicalCenters.opex.usd} />
          <MoneyCell label="Center Revenue" ngn={snapshot.physicalCenters.monthlyRevenue.ngn} usd={snapshot.physicalCenters.monthlyRevenue.usd} />
          <MoneyCell label="Asset Value" ngn={snapshot.assetsInventory.totalAssetValue.ngn} usd={snapshot.assetsInventory.totalAssetValue.usd} />
          <MoneyCell label="Inventory Value" ngn={snapshot.assetsInventory.inventoryValue.ngn} usd={snapshot.assetsInventory.inventoryValue.usd} />
          <div className="rounded-lg border bg-background px-3 py-2">
            <p className="text-[11px] text-muted-foreground">Inventory Items</p>
            <p className="text-sm font-semibold">{snapshot.assetsInventory.itemCount}</p>
            <p className="text-xs text-muted-foreground">
              Verified {new Date(snapshot.assetsInventory.asOfDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-background px-3 py-2">
          <p className="text-[11px] text-muted-foreground">Investment Sources</p>
          {snapshot.spend.investmentSources.length === 0 ? (
            <p className="text-xs text-muted-foreground mt-1">No tagged investment inflow found in transactions.</p>
          ) : (
            <div className="mt-1 grid gap-1 sm:grid-cols-2">
              {snapshot.spend.investmentSources.map((s) => (
                <div key={s.source} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground truncate pr-2">{s.source}</span>
                  <span className="font-semibold whitespace-nowrap">{formatNGN(s.amount.ngn)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
