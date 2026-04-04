"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatCard } from "@/components/shared/stat-card";
import { StatCardsShimmer } from "@/components/shared/shimmer-skeleton";
import client from "@/lib/api/client";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip,
  CartesianGrid, Legend,
} from "recharts";
import { RefreshCw, DollarSign, TrendingUp, TrendingDown, FileText, AlertTriangle } from "lucide-react";
import { usePageView } from "@/hooks/usePageView";

interface FinanceOverview {
  total_revenue?: number;
  mrr?: number;
  gross_margin?: number;
  burn_rate?: number;
  cash_runway_months?: number;
  outstanding_invoices?: number;
  revenue_series?: { name: string; revenue: number; expenses: number }[];
  recent_transactions?: {
    id: number | string;
    description: string;
    amount: number;
    type: "credit" | "debit";
    date: string;
    category?: string;
  }[];
  invoice_aging?: { label: string; count: number; value: number }[];
  payroll_summary?: { total: number; due_date?: string; headcount?: number };
}

function fmt(n?: number) {
  if (n === undefined || n === null) return "—";
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n.toFixed(0)}`;
}

export default function CfoDashboardPage() {
  usePageView("cfo.dashboard");
  const [data, setData] = useState<FinanceOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.get("/api/v1/finance/overview");
      setData(res.data?.data ?? res.data ?? {});
    } catch {
      setError("Unable to load financial data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const revSeries = data?.revenue_series ?? [];
  const transactions = data?.recent_transactions ?? [];
  const aging = data?.invoice_aging ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Control Center</h1>
          <p className="text-muted-foreground text-sm mt-1">CFO executive view — all figures in NGN</p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm" className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && !data ? (
        <StatCardsShimmer count={6} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard label="Total Revenue" value={fmt(data?.total_revenue)} icon={DollarSign} colour="emerald" isLoading={loading} />
          <StatCard label="MRR" value={fmt(data?.mrr)} icon={TrendingUp} colour="blue" isLoading={loading} />
          <StatCard label="Gross Margin" value={data?.gross_margin !== undefined ? `${data.gross_margin}%` : "—"} icon={TrendingUp} colour={((data?.gross_margin ?? 0) > 40) ? "emerald" : "amber"} isLoading={loading} />
          <StatCard label="Burn Rate / Mo" value={fmt(data?.burn_rate)} icon={TrendingDown} colour="red" isLoading={loading} />
          <StatCard label="Cash Runway" value={data?.cash_runway_months !== undefined ? `${data.cash_runway_months} mo` : "—"} icon={AlertTriangle} colour={((data?.cash_runway_months ?? 99) < 6) ? "red" : "emerald"} isLoading={loading} />
          <StatCard label="Outstanding Invoices" value={fmt(data?.outstanding_invoices)} icon={FileText} colour="amber" isLoading={loading} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue vs Expenses</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revSeries}>
                  <defs>
                    <linearGradient id="cfoRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.7} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="cfoExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.7} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#16a34a" fill="url(#cfoRev)" />
                  <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" fill="url(#cfoExp)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Aging</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
            ) : aging.length === 0 ? (
              <p className="text-sm text-muted-foreground">No invoice data.</p>
            ) : (
              aging.map((bucket) => (
                <div key={bucket.label} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm text-muted-foreground">{bucket.label}</span>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{fmt(bucket.value)}</div>
                    <div className="text-xs text-muted-foreground">{bucket.count} invoice{bucket.count !== 1 ? "s" : ""}</div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-48 w-full" />
            ) : transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent transactions.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.slice(0, 10).map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-sm font-medium">{tx.description}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">{tx.category ?? "General"}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(tx.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className={`text-right text-sm font-semibold ${tx.type === "credit" ? "text-emerald-600" : "text-red-500"}`}>
                        {tx.type === "credit" ? "+" : "-"}{fmt(tx.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payroll Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Total Payroll</span>
                  <span className="text-sm font-bold">{fmt(data?.payroll_summary?.total)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Headcount</span>
                  <span className="text-sm font-semibold">{data?.payroll_summary?.headcount ?? "—"}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Next Pay Date</span>
                  <span className="text-sm font-semibold">
                    {data?.payroll_summary?.due_date
                      ? new Date(data.payroll_summary.due_date).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
