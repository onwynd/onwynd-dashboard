"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { adminService } from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Building2,
  Wrench,
  Download,
  FileText,
  Users,
  GraduationCap,
  Stethoscope,
  Briefcase,
  ShoppingBag,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { PageHeader } from "@/components/shared/page-header";

// ─── Types ───────────────────────────────────────────────────────────────────

interface RevenueStream {
  key: string;
  label: string;
  description: string;
  revenue: number;
}

interface MonthlyPoint {
  month: string;
  commission_revenue: number;
  booking_fee_revenue: number;
  subscription_revenue: number;
  session_count: number;
}

interface BreakdownData {
  period: { start: string; end: string };
  streams: RevenueStream[];
  total_platform_revenue: number;
  total_session_revenue: number;
  total_therapist_payouts: number;
  session_count: number;
  monthly_breakdown: MonthlyPoint[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STREAM_ICONS: Record<string, React.ElementType> = {
  d2c_subscriptions: Users,
  corporate:         Briefcase,
  commission:        Stethoscope,
  institutional:     GraduationCap,
  physical_wellness: Building2,
  booking_fees:      DollarSign,
  ancillary:         ShoppingBag,
};

const STREAM_COLORS: Record<string, string> = {
  d2c_subscriptions: "bg-teal-100 text-teal-800",
  corporate:         "bg-blue-100 text-blue-800",
  commission:        "bg-violet-100 text-violet-800",
  institutional:     "bg-amber-100 text-amber-800",
  physical_wellness: "bg-emerald-100 text-emerald-800",
  booking_fees:      "bg-orange-100 text-orange-800",
  ancillary:         "bg-gray-100 text-gray-700",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n ?? 0);

const pct = (part: number, total: number) =>
  total > 0 ? ((part / total) * 100).toFixed(1) + "%" : "0%";

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminRevenuePage() {
  const [data, setData]         = useState<BreakdownData | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [period, setPeriod]     = useState("30days");
  const [exporting, setExporting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const dateRange = useCallback(() => {
    const end   = new Date();
    const start = new Date();
    if (period === "7days")  start.setDate(end.getDate() - 7);
    else if (period === "30days") start.setDate(end.getDate() - 30);
    else if (period === "90days") start.setDate(end.getDate() - 90);
    else if (period === "1year")  start.setFullYear(end.getFullYear() - 1);
    return {
      start_date: start.toISOString().split("T")[0],
      end_date:   end.toISOString().split("T")[0],
    };
  }, [period]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = dateRange();
      const res = await adminService.getRevenueBreakdown(params);
      setData(((res as any)?.data ?? res) as unknown as BreakdownData);
    } catch {
      toast({ title: "Error", description: "Failed to load revenue data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleCsvExport = async () => {
    setExporting(true);
    try {
      const params = { ...dateRange(), format: "csv" as const };
      const blob   = await adminService.fullExportRevenue(params);
      const url    = URL.createObjectURL(new Blob([blob], { type: "text/csv" }));
      const a      = document.createElement("a");
      a.href       = url;
      a.download   = `onwynd-revenue-${params.start_date}-to-${params.end_date}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Exported", description: "CSV download started." });
    } catch {
      toast({ title: "Error", description: "Failed to export revenue data.", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const handlePdfPrint = () => {
    window.print();
  };

  // Peak month from monthly breakdown
  const peakMonth = data?.monthly_breakdown?.reduce(
    (best, m) => {
      const total = m.commission_revenue + m.booking_fee_revenue + m.subscription_revenue;
      const bestTotal = best.commission_revenue + best.booking_fee_revenue + best.subscription_revenue;
      return total > bestTotal ? m : best;
    },
    data.monthly_breakdown[0] ?? { month: "", commission_revenue: 0, booking_fee_revenue: 0, subscription_revenue: 0, session_count: 0 }
  );

  return (
    <>
      {/* ── Print styles injected inline so they work without Tailwind print: ── */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #revenue-print-area, #revenue-print-area * { visibility: visible !important; }
          #revenue-print-area { position: absolute; inset: 0; padding: 32px; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 no-print">
          <PageHeader
            title="Revenue Report"
            subtitle="All 7 revenue streams — real-time platform financial overview"
          />
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={(v: string | null) => setPeriod(v ?? "30days")}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="1year">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleCsvExport} disabled={exporting || isLoading}>
              {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handlePdfPrint} disabled={isLoading}>
              <FileText className="mr-2 h-4 w-4" />
              Print / PDF
            </Button>
            <Button variant="outline" size="icon" onClick={fetchAll} title="Refresh" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : data ? (
          <div id="revenue-print-area" ref={printRef}>
            {/* ── Branded print header (only visible when printing) ── */}
            <div className="hidden print:block mb-8 border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-teal-700">Onwynd</h1>
                  <p className="text-sm text-gray-500">Mental Health & Wellness Platform</p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p className="font-semibold text-gray-700">Revenue Report</p>
                  <p>{data.period.start} – {data.period.end}</p>
                  <p>Generated {new Date().toLocaleDateString("en-NG", { dateStyle: "long" })}</p>
                </div>
              </div>
            </div>

            {/* ── KPI summary row ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total Platform Revenue", value: fmt(data.total_platform_revenue), icon: DollarSign, color: "text-teal-600" },
                { label: "Total Sessions", value: data.session_count.toLocaleString(), icon: TrendingUp, color: "text-violet-600" },
                { label: "Therapist Payouts", value: fmt(data.total_therapist_payouts), icon: Stethoscope, color: "text-orange-500" },
                { label: "Gross Session Revenue", value: fmt(data.total_session_revenue), icon: DollarSign, color: "text-blue-600" },
              ].map(({ label, value, icon: Icon, color }) => (
                <Card key={label}>
                  <CardContent className="pt-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-2xl font-bold">{value}</p>
                    </div>
                    <Icon className={`h-8 w-8 opacity-30 ${color}`} />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* ── 7 Revenue Streams table ── */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">Revenue by Stream</CardTitle>
                <CardDescription>All 7 platform revenue streams — {data.period.start} to {data.period.end}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="px-4 py-3 text-xs uppercase tracking-wide">#</TableHead>
                      <TableHead className="px-4 py-3 text-xs uppercase tracking-wide">Revenue Stream</TableHead>
                      <TableHead className="px-4 py-3 text-xs uppercase tracking-wide">Description</TableHead>
                      <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-right">Amount</TableHead>
                      <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-right">% of Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.streams.map((stream, idx) => {
                      const Icon = STREAM_ICONS[stream.key] ?? DollarSign;
                      const badgeClass = STREAM_COLORS[stream.key] ?? "bg-gray-100 text-gray-700";
                      return (
                        <TableRow key={stream.key} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                          <TableCell className="px-4 py-3 text-xs text-gray-400">{idx + 1}</TableCell>
                          <TableCell className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${badgeClass}`}>
                                <Icon className="w-3.5 h-3.5" />
                              </span>
                              <span className="text-sm font-medium text-gray-900">{stream.label}</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-xs text-gray-500">{stream.description}</TableCell>
                          <TableCell className="px-4 py-3 text-right font-semibold text-gray-900 tabular-nums">
                            {fmt(stream.revenue)}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-right">
                            <Badge variant="outline" className="font-mono text-xs">
                              {pct(stream.revenue, data.total_platform_revenue)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow className="bg-teal-50 border-t-2 border-teal-200 font-bold">
                      <TableCell className="px-4 py-3" />
                      <TableCell className="px-4 py-3 text-sm text-teal-900 font-bold" colSpan={2}>
                        Total Platform Revenue
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right text-teal-900 font-bold tabular-nums text-base">
                        {fmt(data.total_platform_revenue)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <Badge className="bg-teal-600 text-white font-mono text-xs">100%</Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* ── Monthly trend ── */}
            {data.monthly_breakdown?.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-base">Monthly Breakdown (Last 12 Months)</CardTitle>
                  <CardDescription>Commission + Booking Fees + Subscriptions per month</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="px-4 py-3 text-xs uppercase tracking-wide">Month</TableHead>
                        <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-right">Commission</TableHead>
                        <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-right">Booking Fees</TableHead>
                        <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-right">Subscriptions</TableHead>
                        <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-right">Sessions</TableHead>
                        <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-right">Month Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.monthly_breakdown.map((m, idx) => {
                        const monthTotal = m.commission_revenue + m.booking_fee_revenue + m.subscription_revenue;
                        const isPeak = peakMonth?.month === m.month && monthTotal > 0;
                        return (
                          <TableRow
                            key={m.month}
                            className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"} ${isPeak ? "ring-1 ring-inset ring-teal-300" : ""}`}
                          >
                            <TableCell className="px-4 py-2.5 text-sm font-medium text-gray-700">
                              {m.month}
                              {isPeak && <Badge className="ml-2 text-xs bg-teal-100 text-teal-700 border-teal-200" variant="outline">Peak</Badge>}
                            </TableCell>
                            <TableCell className="px-4 py-2.5 text-right tabular-nums text-xs text-gray-600">{fmt(m.commission_revenue)}</TableCell>
                            <TableCell className="px-4 py-2.5 text-right tabular-nums text-xs text-gray-600">{fmt(m.booking_fee_revenue)}</TableCell>
                            <TableCell className="px-4 py-2.5 text-right tabular-nums text-xs text-gray-600">{fmt(m.subscription_revenue)}</TableCell>
                            <TableCell className="px-4 py-2.5 text-right tabular-nums text-xs text-gray-500">{m.session_count}</TableCell>
                            <TableCell className="px-4 py-2.5 text-right tabular-nums text-sm font-semibold text-gray-900">{fmt(monthTotal)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* ── Print footer ── */}
            <div className="hidden print:block mt-8 pt-4 border-t text-xs text-gray-400 flex justify-between">
              <span>Confidential — Onwynd Internal Financial Report</span>
              <span>onwynd.com</span>
            </div>
          </div>
        ) : (
          <div className="flex h-48 items-center justify-center text-muted-foreground text-sm">
            No revenue data available for the selected period.
          </div>
        )}
      </div>
    </>
  );
}
