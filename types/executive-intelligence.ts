export type ConfidenceBand = "low" | "medium" | "high";

export interface CurrencySnapshot {
  ngn: number;
  usd: number;
}

export interface CurrencyBreakdown {
  ngn: number;
  usd: number;
}

export interface RevenueMix {
  subscriptions: CurrencyBreakdown;
  bookingFees: CurrencyBreakdown;
  otherRevenue: CurrencyBreakdown;
}

export interface CommissionSnapshot {
  therapistCommission: CurrencyBreakdown;
}

export interface PhysicalCenterSnapshot {
  capex: CurrencyBreakdown;
  opex: CurrencyBreakdown;
  monthlyRevenue: CurrencyBreakdown;
}

export interface AssetInventorySnapshot {
  totalAssetValue: CurrencyBreakdown;
  inventoryValue: CurrencyBreakdown;
  itemCount: number;
  asOfDate: string;
}

export interface BrandDriver {
  label: string;
  score: number;
  impact: "positive" | "neutral" | "negative";
}

export interface BrandValuationSnapshot {
  asOfDate: string;
  value: CurrencySnapshot;
  change7dPct: number;
  change30dPct: number;
  confidence: ConfidenceBand;
  indexScore: number;
  drivers: BrandDriver[];
}

export interface InvestmentSource {
  source: string;
  amount: CurrencyBreakdown;
}

export interface ExecutiveTractionSnapshot {
  signupsToday: number;
  signupsPeriod: number;
  activeUsers: number;
  dealsWon: number;
  salesPipelineValue: CurrencyBreakdown;
  okrHealthScore: number;
  kpiOnTrackPct: number;
}

export interface ExecutiveSpendSnapshot {
  expensesThisMonth: CurrencyBreakdown;
  salariesThisMonth: CurrencyBreakdown;
  salesBudgetApproved: CurrencyBreakdown;
  investmentInflow: CurrencyBreakdown;
  investmentSources: InvestmentSource[];
  cashRemaining: CurrencyBreakdown;
  runwayMonths: number;
}

export interface ExecutiveFinanceSnapshot {
  asOfDate: string;
  revenueMix: RevenueMix;
  commission: CommissionSnapshot;
  physicalCenters: PhysicalCenterSnapshot;
  assetsInventory: AssetInventorySnapshot;
  traction: ExecutiveTractionSnapshot;
  spend: ExecutiveSpendSnapshot;
  brandValuation: BrandValuationSnapshot;
}
