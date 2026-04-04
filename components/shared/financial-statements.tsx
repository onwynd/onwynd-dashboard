"use client";

/**
 * FinancialStatements
 * Three Pillars of Finance — Balance Sheet / Income Statement / Cash Flow
 * Shared component used by Finance, Admin, CEO, and COO dashboards.
 */

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Landmark, FileText, TrendingUp, TrendingDown, RefreshCw,
  ArrowUpRight, ArrowDownRight, Minus, Download,
} from "lucide-react";
import client from "@/lib/api/client";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────

interface BalanceSheet {
  as_of: string;
  currency: string;
  assets: {
    current: { cash_and_equivalents: number; accounts_receivable: number; prepaid_assets: number; total_current: number };
    non_current: { platform_infrastructure: number; total_non_current: number };
    total: number;
  };
  liabilities: {
    current: { accounts_payable: number; deferred_revenue: number; total_current: number };
    non_current: { long_term_debt: number; total_non_current: number };
    total: number;
  };
  equity: { paid_in_capital: number; retained_earnings: number; total: number };
}

interface IncomeStatement {
  period: string;
  start_date: string;
  end_date: string;
  currency: string;
  revenue: { gross_revenue: number; refunds: number; net_revenue: number };
  cost_of_revenue: number;
  gross_profit: number;
  gross_margin: number;
  operating_expenses: number;
  ebitda: number;
  depreciation_amortisation: number;
  ebit: number;
  interest: number;
  ebt: number;
  tax: number;
  net_income: number;
  monthly: { month: string; revenue: number; expenses: number; net_income: number }[];
}

interface CashFlow {
  period: string;
  currency: string;
  operating: { net_income: number; change_in_receivables: number; change_in_payables: number; total_cfo: number };
  investing: { capital_expenditure: number; investments: number; total_cfi: number };
  financing: { equity_raised: number; debt_repaid: number; total_cff: number };
  summary: { net_change: number; opening_cash: number; closing_cash: number };
}

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt(n: number) {
  const abs = Math.abs(n);
  let s: string;
  if (abs >= 1_000_000) s = `₦${(abs / 1_000_000).toFixed(2)}M`;
  else if (abs >= 1_000) s = `₦${(abs / 1_000).toFixed(1)}K`;
  else s = `₦${abs.toFixed(2)}`;
  return n < 0 ? `-${s}` : s;
}

function TrendIcon({ value }: { value: number }) {
  if (value > 0) return <ArrowUpRight className="h-4 w-4 text-green-500" />;
  if (value < 0) return <ArrowDownRight className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

function Row({ label, value, indent = 0, bold = false, highlight }: {
  label: string; value: number; indent?: number; bold?: boolean;
  highlight?: "positive" | "negative" | "neutral";
}) {
  const color = highlight === "positive" ? "text-green-700" : highlight === "negative" ? "text-red-600" : "";
  return (
    <div className={cn("flex items-center justify-between py-1.5 border-b border-border/40 last:border-b-0", bold && "font-semibold")}>
      <span className={cn("text-sm", color)} style={{ paddingLeft: `${indent * 16}px` }}>{label}</span>
      <span className={cn("text-sm tabular-nums", color, bold && "font-bold")}>{fmt(value)}</span>
    </div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mt-4 mb-1">{label}</p>;
}

// ── Balance Sheet ──────────────────────────────────────────────────────────

function BalanceSheetPanel() {
  const [data, setData] = useState<BalanceSheet | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await client.get("/api/v1/finance/balance-sheet");
      setData(res.data?.data ?? null);
    } catch { setData(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div className="space-y-3 p-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>;
  if (!data) return <p className="p-6 text-sm text-muted-foreground">No balance sheet data available.</p>;

  const balanced = Math.abs(data.assets.total - (data.liabilities.total + data.equity.total)) < 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">As of {data.as_of}</p>
        <div className="flex items-center gap-2">
          {balanced
            ? <Badge className="bg-green-100 text-green-700 border-0">Balanced ✓</Badge>
            : <Badge variant="destructive">Unbalanced</Badge>}
          <Button variant="ghost" size="icon" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Assets */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-600" />Assets</CardTitle></CardHeader>
          <CardContent>
            <SectionHeader label="Current Assets" />
            <Row label="Cash & Equivalents"  value={data.assets.current.cash_and_equivalents}  indent={1} />
            <Row label="Accounts Receivable" value={data.assets.current.accounts_receivable}   indent={1} />
            <Row label="Prepaid Assets"      value={data.assets.current.prepaid_assets}        indent={1} />
            <Row label="Total Current"       value={data.assets.current.total_current}         bold />
            <SectionHeader label="Non-Current Assets" />
            <Row label="Platform Infrastructure" value={data.assets.non_current.platform_infrastructure} indent={1} />
            <Row label="Total Non-Current"   value={data.assets.non_current.total_non_current} bold />
            <div className="mt-3 pt-2 border-t">
              <Row label="TOTAL ASSETS" value={data.assets.total} bold highlight="positive" />
            </div>
          </CardContent>
        </Card>

        {/* Liabilities */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingDown className="h-4 w-4 text-red-500" />Liabilities</CardTitle></CardHeader>
          <CardContent>
            <SectionHeader label="Current Liabilities" />
            <Row label="Accounts Payable"  value={data.liabilities.current.accounts_payable} indent={1} />
            <Row label="Deferred Revenue"  value={data.liabilities.current.deferred_revenue}  indent={1} />
            <Row label="Total Current"     value={data.liabilities.current.total_current}     bold />
            <SectionHeader label="Non-Current Liabilities" />
            <Row label="Long-Term Debt"    value={data.liabilities.non_current.long_term_debt} indent={1} />
            <Row label="Total Non-Current" value={data.liabilities.non_current.total_non_current} bold />
            <div className="mt-3 pt-2 border-t">
              <Row label="TOTAL LIABILITIES" value={data.liabilities.total} bold highlight="negative" />
            </div>
          </CardContent>
        </Card>

        {/* Equity */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Landmark className="h-4 w-4 text-blue-600" />Shareholders' Equity</CardTitle></CardHeader>
          <CardContent>
            <SectionHeader label="Equity Components" />
            <Row label="Paid-In Capital"    value={data.equity.paid_in_capital}   indent={1} />
            <Row label="Retained Earnings"  value={data.equity.retained_earnings}  indent={1} />
            <div className="mt-3 pt-2 border-t">
              <Row label="TOTAL EQUITY" value={data.equity.total} bold highlight="positive" />
            </div>
            <div className="mt-4 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">Accounting Identity</p>
              <p>Assets = Liabilities + Equity</p>
              <p className="font-mono">{fmt(data.assets.total)} = {fmt(data.liabilities.total)} + {fmt(data.equity.total)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Income Statement ───────────────────────────────────────────────────────

function IncomeStatementPanel() {
  const [data, setData] = useState<IncomeStatement | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");

  const load = async (p = period) => {
    setLoading(true);
    try {
      const res = await client.get("/api/v1/finance/income-statement", { params: { period: p } });
      setData(res.data?.data ?? null);
    } catch { setData(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePeriod = (p: string) => { setPeriod(p); load(p); };

  if (loading) return <div className="space-y-3 p-4">{[1,2].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>;
  if (!data) return <p className="p-6 text-sm text-muted-foreground">No income statement data available.</p>;

  const profitable = data.net_income >= 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{data.start_date} → {data.end_date}</p>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={(v) => v !== null && handlePeriod(v)}>
            <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" onClick={() => load()}><RefreshCw className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Statement */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4" />Income Statement</CardTitle>
              <Badge className={profitable ? "bg-green-100 text-green-700 border-0" : "bg-red-100 text-red-700 border-0"}>
                {profitable ? "Profitable" : "Loss"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <SectionHeader label="Revenue" />
            <Row label="Gross Revenue"        value={data.revenue.gross_revenue} indent={1} />
            <Row label="Refunds"              value={-data.revenue.refunds}      indent={1} />
            <Row label="Net Revenue"          value={data.revenue.net_revenue}   bold />
            <SectionHeader label="Cost & Gross Profit" />
            <Row label="Cost of Revenue"      value={-data.cost_of_revenue}      indent={1} />
            <Row label="Gross Profit"         value={data.gross_profit}          bold highlight={data.gross_profit >= 0 ? "positive" : "negative"} />
            <p className="text-xs text-muted-foreground text-right">Gross Margin: {data.gross_margin}%</p>
            <SectionHeader label="Operating" />
            <Row label="Operating Expenses"   value={-data.operating_expenses}   indent={1} />
            <Row label="EBITDA"               value={data.ebitda}                bold />
            <Row label="Depreciation & Amort" value={-data.depreciation_amortisation} indent={1} />
            <Row label="EBIT"                 value={data.ebit}                  bold />
            <SectionHeader label="Below EBIT" />
            <Row label="Interest Expense"     value={-data.interest}             indent={1} />
            <Row label="EBT"                  value={data.ebt}                   bold />
            <Row label="Tax"                  value={-data.tax}                  indent={1} />
            <div className="mt-3 pt-2 border-t">
              <Row label="NET INCOME" value={data.net_income} bold highlight={profitable ? "positive" : "negative"} />
            </div>
          </CardContent>
        </Card>

        {/* Monthly trend mini chart */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">12-Month Trend</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {data.monthly.slice(-6).map(m => {
                const maxVal = Math.max(...data.monthly.map(x => x.revenue), 1);
                const revPct = Math.round((m.revenue / maxVal) * 100);
                const expPct = Math.round((m.expenses / maxVal) * 100);
                return (
                  <div key={m.month} className="space-y-0.5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{m.month}</span>
                      <div className="flex items-center gap-1">
                        <TrendIcon value={m.net_income} />
                        <span className={m.net_income >= 0 ? "text-green-600" : "text-red-500"}>{fmt(m.net_income)}</span>
                      </div>
                    </div>
                    <div className="flex gap-0.5 h-2">
                      <div className="rounded-l bg-green-400" style={{ width: `${revPct}%` }} />
                      <div className="rounded-r bg-red-300" style={{ width: `${expPct}%` }} />
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-green-400 inline-block" />Revenue</span>
                <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-red-300 inline-block" />Expenses</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Cash Flow ──────────────────────────────────────────────────────────────

function CashFlowPanel() {
  const [data, setData] = useState<CashFlow | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");

  const load = async (p = period) => {
    setLoading(true);
    try {
      const res = await client.get("/api/v1/finance/cash-flow", { params: { period: p } });
      setData(res.data?.data ?? null);
    } catch { setData(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePeriod = (p: string) => { setPeriod(p); load(p); };

  if (loading) return <div className="space-y-3 p-4">{[1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>;
  if (!data) return <p className="p-6 text-sm text-muted-foreground">No cash flow data available.</p>;

  const sections = [
    { label: "Cash Flow from Operations (CFO)", icon: "🔄", items: [
        { label: "Net Income",                value: data.operating.net_income },
        { label: "Δ Accounts Receivable",     value: data.operating.change_in_receivables },
        { label: "Δ Accounts Payable",        value: data.operating.change_in_payables },
      ], total: data.operating.total_cfo, color: "blue" as const,
    },
    { label: "Cash Flow from Investing (CFI)", icon: "📈", items: [
        { label: "Capital Expenditure",       value: data.investing.capital_expenditure },
        { label: "Investments",               value: data.investing.investments },
      ], total: data.investing.total_cfi, color: "purple" as const,
    },
    { label: "Cash Flow from Financing (CFF)", icon: "💰", items: [
        { label: "Equity Raised",             value: data.financing.equity_raised },
        { label: "Debt Repaid",               value: -data.financing.debt_repaid },
      ], total: data.financing.total_cff, color: "amber" as const,
    },
  ] as const;

  const borderMap = { blue: "border-l-blue-500", purple: "border-l-purple-500", amber: "border-l-amber-500" };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Period: {data.period}</p>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={(v) => v !== null && handlePeriod(v)}>
            <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" onClick={() => load()}><RefreshCw className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Summary bar */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Net Change", value: data.summary.net_change },
          { label: "Opening Cash", value: data.summary.opening_cash },
          { label: "Closing Cash", value: data.summary.closing_cash },
        ].map(item => (
          <Card key={item.label} className={cn(item.label === "Closing Cash" && "border-2 border-primary/20")}>
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
              <p className={cn("text-xl font-bold", item.value >= 0 ? "text-green-700" : "text-red-600")}>{fmt(item.value)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Three sections */}
      <div className="grid gap-4 md:grid-cols-3">
        {sections.map(section => (
          <Card key={section.label} className={cn("border-l-4", borderMap[section.color])}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{section.icon} {section.label}</CardTitle>
            </CardHeader>
            <CardContent>
              {section.items.map(item => (
                <Row key={item.label} label={item.label} value={item.value} indent={1} />
              ))}
              <div className="mt-2 pt-2 border-t">
                <Row label="Total" value={section.total} bold highlight={section.total >= 0 ? "positive" : "negative"} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Formula note */}
      <div className="p-4 rounded-xl bg-muted/40 text-xs text-muted-foreground space-y-1">
        <p className="font-semibold text-foreground">Total Cash Flow</p>
        <p>CFO + CFI + CFF = Net Change in Cash</p>
        <p className="font-mono">
          {fmt(data.operating.total_cfo)} + {fmt(data.investing.total_cfi)} + {fmt(data.financing.total_cff)} = {fmt(data.summary.net_change)}
        </p>
      </div>
    </div>
  );
}

// ── Main Export ────────────────────────────────────────────────────────────

export function FinancialStatements() {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Landmark className="h-6 w-6" />
            Financial Statements
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            The Three Pillars of Finance — Balance Sheet · Income Statement · Cash Flow
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <Tabs defaultValue="income">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
          <TabsTrigger value="income">Income Statement</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="balance"  className="mt-4"><BalanceSheetPanel /></TabsContent>
        <TabsContent value="income"   className="mt-4"><IncomeStatementPanel /></TabsContent>
        <TabsContent value="cashflow" className="mt-4"><CashFlowPanel /></TabsContent>
      </Tabs>
    </div>
  );
}
