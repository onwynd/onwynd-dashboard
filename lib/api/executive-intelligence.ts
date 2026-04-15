import { financeService } from "@/lib/api/finance";
import { centerService } from "@/lib/api/center";
import { subscriptionService } from "@/lib/api/subscription";
import { useCurrencyStore } from "@/store/currency-store";
import { adminService } from "@/lib/api/admin";
import { okrService } from "@/lib/api/okr";
import { hrService } from "@/lib/api/hr";
import client from "@/lib/api/client";
import type { ExecutiveFinanceSnapshot } from "@/types/executive-intelligence";

type Dict = Record<string, unknown>;

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asDict(value: unknown): Dict {
  return typeof value === "object" && value !== null ? (value as Dict) : {};
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.-]/g, "");
    const parsed = Number(cleaned);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function sumByKeys(rows: unknown[], keys: string[]): number {
  return rows.reduce<number>((acc, row) => {
    const dict = asDict(row);
    for (const key of keys) {
      if (key in dict) {
        return acc + toNumber(dict[key]);
      }
    }
    return acc;
  }, 0);
}

function includesKeyword(value: unknown, keywords: string[]): boolean {
  const text = String(value ?? "").toLowerCase();
  return keywords.some((k) => text.includes(k));
}

function convertNgnToUsd(ngn: number): number {
  const rate = useCurrencyStore.getState().usdToNgn;
  if (!Number.isFinite(rate) || rate <= 0) return 0;
  return ngn / rate;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function isToday(dateValue: unknown): boolean {
  if (!dateValue) return false;
  const d = new Date(String(dateValue));
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

export const executiveIntelligenceService = {
  async getFinanceSnapshot(): Promise<ExecutiveFinanceSnapshot> {
    await useCurrencyStore.getState().fetchRate();

    const [
      statsRes,
      revenueRes,
      expenseRes,
      txRes,
      payoutsRes,
      subsPaymentsRes,
      inventoryRes,
      centerDashboardRes,
      centerReportsRes,
      adminStatsRes,
      okrHealthRes,
      hrPayrollRes,
      budgetsRes,
      salesStatsRes,
      dealsWonRes,
    ] =
      await Promise.allSettled([
        financeService.getStats(),
        financeService.getRevenueData("monthly"),
        financeService.getExpenseBreakdown("month"),
        financeService.getTransactions({ limit: 500 }),
        financeService.getPayouts({ limit: 500 }),
        subscriptionService.getPayments(),
        centerService.getInventory({ limit: 500 }),
        centerService.getDashboard(),
        centerService.getReports({ period: "month" }),
        adminService.getStats(),
        okrService.getCompanyHealth(),
        hrService.getPayroll({ period: "month", per_page: 200 }),
        client.get("/api/v1/budgets", { params: { per_page: 200 }, suppressErrorToast: true }),
        client.get("/api/v1/sales/stats", { suppressErrorToast: true }),
        client.get("/api/v1/sales/deals", { params: { stage: "closed_won", per_page: 200 }, suppressErrorToast: true }),
      ]);

    const revenueRows = asArray(revenueRes.status === "fulfilled" ? revenueRes.value?.data ?? revenueRes.value : []);
    const txRows = asArray(txRes.status === "fulfilled" ? txRes.value?.data ?? txRes.value : []);
    const payoutsRows = asArray(payoutsRes.status === "fulfilled" ? payoutsRes.value?.data ?? payoutsRes.value : []);
    const subscriptionPayments = asArray(subsPaymentsRes.status === "fulfilled" ? subsPaymentsRes.value?.data ?? subsPaymentsRes.value : []);
    const inventoryRows = asArray(inventoryRes.status === "fulfilled" ? inventoryRes.value?.data ?? inventoryRes.value : []);
    const expenseData = asDict(expenseRes.status === "fulfilled" ? expenseRes.value?.data ?? expenseRes.value : {});
    const statsData = asDict(statsRes.status === "fulfilled" ? statsRes.value?.data ?? statsRes.value : {});
    const centerDashboard = asDict(centerDashboardRes.status === "fulfilled" ? centerDashboardRes.value?.data ?? centerDashboardRes.value : {});
    const centerReports = asDict(centerReportsRes.status === "fulfilled" ? centerReportsRes.value?.data ?? centerReportsRes.value : {});
    const adminStatsData = asDict(adminStatsRes.status === "fulfilled" ? adminStatsRes.value?.data ?? adminStatsRes.value : {});
    const okrHealthData = asDict(okrHealthRes.status === "fulfilled" ? okrHealthRes.value : {});
    const payrollData = asArray(hrPayrollRes.status === "fulfilled" ? hrPayrollRes.value : []);
    const budgetsData = asArray(
      budgetsRes.status === "fulfilled" ? budgetsRes.value?.data?.data ?? budgetsRes.value?.data ?? budgetsRes.value : [],
    );
    const salesStatsData = asDict(
      salesStatsRes.status === "fulfilled" ? salesStatsRes.value?.data?.data ?? salesStatsRes.value?.data ?? salesStatsRes.value : {},
    );
    const dealsWonData = asArray(
      dealsWonRes.status === "fulfilled" ? dealsWonRes.value?.data?.data ?? dealsWonRes.value?.data ?? dealsWonRes.value : [],
    );

    const totalRevenueFromSeries = sumByKeys(revenueRows, ["revenue", "value", "amount"]);

    const subscriptionRevenueFromPayments = subscriptionPayments.reduce<number>((acc, row) => {
      const r = asDict(row);
      const status = String(r.status ?? "").toLowerCase();
      if (status && !["paid", "completed", "success", "succeeded"].includes(status)) return acc;
      if (!includesKeyword(r.description ?? r.type ?? r.category, ["subscription", "plan"])) return acc;
      return acc + toNumber(r.amount);
    }, 0);

    const bookingFeeRevenueFromPayments = subscriptionPayments.reduce<number>((acc, row) => {
      const r = asDict(row);
      const status = String(r.status ?? "").toLowerCase();
      if (status && !["paid", "completed", "success", "succeeded"].includes(status)) return acc;
      if (!includesKeyword(r.description ?? r.type ?? r.category, ["booking", "session fee", "platform fee"])) return acc;
      return acc + toNumber(r.amount);
    }, 0);

    const bookingFeeFromTransactions = txRows.reduce<number>((acc, row) => {
      const r = asDict(row);
      const type = String(r.type ?? "").toLowerCase();
      if (type && type !== "income") return acc;
      if (!includesKeyword(r.description ?? r.category, ["booking", "platform fee", "session fee"])) return acc;
      return acc + toNumber(r.amount);
    }, 0);

    const subscriptionRevenue =
      subscriptionRevenueFromPayments > 0
        ? subscriptionRevenueFromPayments
        : sumByKeys(txRows.filter((row) => includesKeyword(asDict(row).description ?? asDict(row).category, ["subscription", "plan"])), ["amount"]);
    const bookingFeeRevenue = bookingFeeRevenueFromPayments > 0 ? bookingFeeRevenueFromPayments : bookingFeeFromTransactions;
    const otherRevenue = Math.max(totalRevenueFromSeries - subscriptionRevenue - bookingFeeRevenue, 0);

    const therapistCommissionFromPayouts = payoutsRows.reduce<number>((acc, row) => {
      const r = asDict(row);
      if (!includesKeyword(r.user_name ?? r.description ?? r.category, ["therap", "clinician", "provider"])) return acc;
      return acc + toNumber(r.amount);
    }, 0);
    const therapistCommissionFromExpenses = sumByKeys(
      txRows.filter((row) => includesKeyword(asDict(row).description ?? asDict(row).category, ["therap", "commission", "provider payout"])),
      ["amount"],
    );
    const therapistCommission = therapistCommissionFromPayouts > 0 ? therapistCommissionFromPayouts : therapistCommissionFromExpenses;

    const expensesFromTransactions = sumByKeys(
      txRows.filter((row) => {
        const r = asDict(row);
        const t = String(r.type ?? "").toLowerCase();
        return t === "expense" || t === "debit";
      }),
      ["amount"],
    );
    const expensesFromSeries = toNumber(asDict(revenueRows.at(-1)).expenses);
    const expensesThisMonth = Math.max(expensesFromSeries, expensesFromTransactions);

    const salariesFromPayroll = payrollData.reduce<number>((acc, row) => {
      const r = asDict(row);
      return acc + toNumber(r.amount || r.net_salary || r.total || r.payable);
    }, 0);
    const salariesFromTransactions = sumByKeys(
      txRows.filter((row) => includesKeyword(asDict(row).description ?? asDict(row).category, ["salary", "payroll", "wage"])),
      ["amount"],
    );
    const salariesThisMonth = Math.max(salariesFromPayroll, salariesFromTransactions);

    const approvedSalesBudget = budgetsData.reduce<number>((acc, row) => {
      const r = asDict(row);
      const status = String(r.status ?? "").toLowerCase();
      const department = String(r.department ?? "").toLowerCase();
      if (status !== "approved") return acc;
      if (!department.includes("sales") && !department.includes("marketing")) return acc;
      return acc + toNumber(r.amount_requested ?? r.amount ?? r.value);
    }, 0);

    const investmentRows = txRows.filter((row) => {
      const r = asDict(row);
      const type = String(r.type ?? "").toLowerCase();
      return (type === "income" || type === "credit") && includesKeyword(r.description ?? r.category, ["investment", "equity", "funding", "grant", "seed"]);
    });
    const investmentInflow = sumByKeys(investmentRows, ["amount"]);
    const groupedInvestmentSources: Record<string, number> = {};
    for (const row of investmentRows) {
      const r = asDict(row);
      const sourceRaw = String(r.source ?? r.category ?? r.description ?? "Other");
      const source = sourceRaw.split("-")[0].trim().slice(0, 40) || "Other";
      groupedInvestmentSources[source] = (groupedInvestmentSources[source] ?? 0) + toNumber(r.amount);
    }
    const investmentSources = Object.entries(groupedInvestmentSources)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([source, amount]) => ({
        source,
        amount: { ngn: amount, usd: convertNgnToUsd(amount) },
      }));

    const centerCapex =
      toNumber(centerReports.capex) ||
      toNumber(centerDashboard.capex) ||
      sumByKeys(txRows.filter((row) => includesKeyword(asDict(row).description ?? asDict(row).category, ["capex", "equipment", "fit-out", "furniture"])), [
        "amount",
      ]);
    const centerOpex =
      toNumber(centerReports.opex) ||
      toNumber(centerDashboard.opex) ||
      toNumber(expenseData.centers) ||
      sumByKeys(txRows.filter((row) => includesKeyword(asDict(row).description ?? asDict(row).category, ["rent", "utilities", "center ops"])), ["amount"]);
    const centerMonthlyRevenue =
      toNumber(centerReports.revenue) ||
      toNumber(centerDashboard.monthly_revenue) ||
      sumByKeys(txRows.filter((row) => includesKeyword(asDict(row).description ?? asDict(row).category, ["center booking", "center"])), ["amount"]);

    const inventoryValue = inventoryRows.reduce<number>((acc, row) => {
      const r = asDict(row);
      const qty = toNumber(r.quantity, 1);
      const unitCost = toNumber(r.unit_cost || r.cost || r.value || r.purchase_price);
      const directValue = toNumber(r.total_value);
      return acc + (directValue > 0 ? directValue : qty * unitCost);
    }, 0);

    const fixedAssetsFromStats =
      toNumber(statsData.fixed_assets) ||
      toNumber(statsData.total_assets) ||
      toNumber(centerDashboard.assets_value);
    const totalAssetValue = Math.max(fixedAssetsFromStats, inventoryValue);

    const runwayMonths = toNumber(statsData.runway_months || statsData.cash_runway_months);
    const burnRate = toNumber(statsData.burn_rate);
    const cashRemainingNgn =
      toNumber(statsData.cash_balance) ||
      toNumber(statsData.cash_on_hand) ||
      toNumber(statsData.available_cash) ||
      (runwayMonths > 0 && burnRate > 0 ? runwayMonths * burnRate : 0);

    const signupsToday: number =
      toNumber(adminStatsData.new_signups_today) ||
      toNumber(adminStatsData.signups_today) ||
      toNumber(adminStatsData.daily_signups);
    const signupsPeriod: number = toNumber(adminStatsData.new_signups) || toNumber(adminStatsData.signups_30d);
    const activeUsers: number = toNumber(adminStatsData.active_users) || toNumber(adminStatsData.total_users);

    const dealsWonToday = dealsWonData.filter((d) => isToday(asDict(d).closed_at ?? asDict(d).won_at ?? asDict(d).updated_at)).length;
    const dealsWon: number = dealsWonToday > 0 ? dealsWonToday : toNumber(salesStatsData.won ?? salesStatsData.closed_won ?? salesStatsData.deals_won);
    const salesPipelineNgn: number =
      toNumber(salesStatsData.pipeline_value) ||
      toNumber(salesStatsData.pipeline_total) ||
      sumByKeys(dealsWonData, ["value", "amount"]);

    const okrHealthScore: number = toNumber(okrHealthData.health_score);
    const onTrack = toNumber(asDict(okrHealthData.breakdown).on_track);
    const totalObjectives = Math.max(toNumber(asDict(okrHealthData.breakdown).total), 1);
    const kpiOnTrackPct = Number(((onTrack / totalObjectives) * 100).toFixed(1));

    const revenuePoints = revenueRows.map((r) => toNumber(asDict(r).revenue ?? asDict(r).value ?? asDict(r).amount)).filter((v) => v > 0);
    const latestRevenue = revenuePoints.at(-1) ?? 0;
    const previousRevenue = revenuePoints.length > 1 ? revenuePoints[revenuePoints.length - 2] : latestRevenue;
    const growthRate = previousRevenue > 0 ? ((latestRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    const refundAmount = sumByKeys(
      txRows.filter((row) => includesKeyword(asDict(row).description ?? asDict(row).category, ["refund", "chargeback"])),
      ["amount"],
    );
    const failedCount = txRows.filter((row) => String(asDict(row).status ?? "").toLowerCase() === "failed").length;
    const txCount = txRows.length || 1;
    const trustPenalty = clamp((refundAmount / Math.max(latestRevenue, 1)) * 100 + (failedCount / txCount) * 100, 0, 40);

    const demandScore = clamp(55 + growthRate * 0.8, 20, 95);
    const revenueMomentumScore = clamp(50 + growthRate * 1.2, 20, 95);
    const trustScore = clamp(80 - trustPenalty, 15, 95);
    const operationsScore = clamp(60 + (centerMonthlyRevenue > centerOpex ? 12 : -8), 20, 95);
    const retentionProxy =
      clamp(60 + (toNumber(statsData.runway_months) > 6 ? 8 : -5) + (toNumber(statsData.churn_rate) > 0 ? -toNumber(statsData.churn_rate) : 0), 20, 95);

    const indexScore = Math.round(
      revenueMomentumScore * 0.28 + demandScore * 0.2 + trustScore * 0.2 + operationsScore * 0.16 + retentionProxy * 0.16,
    );

    const enterpriseRevenueProxy = latestRevenue > 0 ? latestRevenue : totalRevenueFromSeries;
    const annualized = enterpriseRevenueProxy * 12;
    const multiplier = 1.2 + indexScore / 100;
    const brandValueNgn = Math.max(annualized * multiplier, 0);
    const change7dPct = Number((growthRate * 0.45).toFixed(2));
    const change30dPct = Number((growthRate * 0.8).toFixed(2));

    const confidence = txRows.length > 50 && revenueRows.length > 3 ? "high" : txRows.length > 10 ? "medium" : "low";
    const asOfDate = new Date().toISOString();

    return {
      asOfDate,
      revenueMix: {
        subscriptions: { ngn: subscriptionRevenue, usd: convertNgnToUsd(subscriptionRevenue) },
        bookingFees: { ngn: bookingFeeRevenue, usd: convertNgnToUsd(bookingFeeRevenue) },
        otherRevenue: { ngn: otherRevenue, usd: convertNgnToUsd(otherRevenue) },
      },
      commission: {
        therapistCommission: { ngn: therapistCommission, usd: convertNgnToUsd(therapistCommission) },
      },
      physicalCenters: {
        capex: { ngn: centerCapex, usd: convertNgnToUsd(centerCapex) },
        opex: { ngn: centerOpex, usd: convertNgnToUsd(centerOpex) },
        monthlyRevenue: { ngn: centerMonthlyRevenue, usd: convertNgnToUsd(centerMonthlyRevenue) },
      },
      assetsInventory: {
        totalAssetValue: { ngn: totalAssetValue, usd: convertNgnToUsd(totalAssetValue) },
        inventoryValue: { ngn: Number(inventoryValue), usd: convertNgnToUsd(Number(inventoryValue)) },
        itemCount: inventoryRows.length,
        asOfDate,
      },
      traction: {
        signupsToday,
        signupsPeriod,
        activeUsers,
        dealsWon,
        salesPipelineValue: { ngn: salesPipelineNgn, usd: convertNgnToUsd(salesPipelineNgn) },
        okrHealthScore,
        kpiOnTrackPct,
      },
      spend: {
        expensesThisMonth: { ngn: expensesThisMonth, usd: convertNgnToUsd(expensesThisMonth) },
        salariesThisMonth: { ngn: salariesThisMonth, usd: convertNgnToUsd(salariesThisMonth) },
        salesBudgetApproved: { ngn: approvedSalesBudget, usd: convertNgnToUsd(approvedSalesBudget) },
        investmentInflow: { ngn: investmentInflow, usd: convertNgnToUsd(investmentInflow) },
        investmentSources,
        cashRemaining: { ngn: cashRemainingNgn, usd: convertNgnToUsd(cashRemainingNgn) },
        runwayMonths,
      },
      brandValuation: {
        asOfDate,
        value: { ngn: brandValueNgn, usd: convertNgnToUsd(brandValueNgn) },
        change7dPct,
        change30dPct,
        confidence,
        indexScore,
        drivers: [
          { label: "Revenue momentum", score: Math.round(revenueMomentumScore), impact: revenueMomentumScore >= 55 ? "positive" : "negative" },
          { label: "Demand strength", score: Math.round(demandScore), impact: demandScore >= 55 ? "positive" : "negative" },
          { label: "Trust and reliability", score: Math.round(trustScore), impact: trustScore >= 55 ? "positive" : "negative" },
        ],
      },
    };
  },
};
