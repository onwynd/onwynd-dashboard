"use client";

import React from 'react';
import { useEffect, useState, useCallback } from "react";
import { adminService } from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  RefreshCw,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  Activity,
  Globe,
  ShieldOff,
  Eye,
  Bot,
  Trash2,
  Plus,
  Ban,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import client from "@/lib/api/client";
import { toast } from "@/components/ui/use-toast";

interface WebOverview {
  total_views: number;
  unique_visitors: number;
  new_visitors: number;
  returning_visitors: number;
  bots_detected: number;
  avg_duration_ms: number;
  avg_scroll_pct: number;
  top_pages: Array<{ page: string; views: number; unique: number }>;
  by_country: Array<{ country: string; views: number }>;
  referrers: Array<{ referrer: string; views: number }>;
  utm_sources: Array<{ source: string; views: number }>;
  daily_views: Array<{ date: string; views: number; unique: number }>;
}

interface IpBlock {
  id: number;
  ip: string;
  reason: string | null;
  expires_at: string | null;
  blocked_by: string | null;
  is_active: boolean;
  created_at: string;
}

interface FinancialReport {
  total_revenue?: number;
  total_subscriptions?: number;
  active_subscriptions?: number;
  mrr?: number;
  arr?: number;
  currency?: string;
  period?: string;
  breakdown?: Array<{ label: string; value: number }>;
}

interface UserGrowthReport {
  total_users?: number;
  new_users_this_period?: number;
  active_users?: number;
  churn_rate?: number;
  retention_rate?: number;
  growth_rate?: number;
  by_role?: Array<{ role: string; count: number }>;
  trend?: Array<{ date: string; count: number }>;
}

// DB7: Default currency changed to NGN
const fmt = (n: number, currency = "NGN") =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(n ?? 0);

const fmtPct = (n: number) => `${(n ?? 0).toFixed(1)}%`;


//  F2: AI Cost Card 
interface AICostData {
  period: string;
  total_cost_usd: number;
  total_cost_ngn: number;
  total_tokens: number;
  conversations: number;
  avg_cost_per_conversation_usd: number;
  mrr_ngn: number;
  cost_to_revenue_ratio: number;
  trend: Array<{ date: string; cost_usd: number; conversations: number }>;
}

function AICostCard() {
  const [data, setData] = React.useState<AICostData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [period, setPeriod] = React.useState("30d");

  React.useEffect(() => {
    setLoading(true);
    adminService.getAICostSummary(period)
      .then((res: any) => setData(res as AICostData))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  const fmtUsd = (v: number) => `${v?.toFixed(4) ?? "0.0000"}`;
  const fmtNgn = (v: number) => `${(v ?? 0).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
  const ratioPct = data ? (data.cost_to_revenue_ratio * 100).toFixed(2) : "";
  const ratioColor = data && data.cost_to_revenue_ratio > 0.15 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="w-5 h-5 text-purple-500" />
          AI Inference Cost
        </CardTitle>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="text-xs border border-input rounded-lg px-2 py-1 bg-background focus:outline-none"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : !data ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No AI cost data available.</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl bg-muted p-3">
                <p className="text-xs text-muted-foreground mb-1">Total Cost (USD)</p>
                <p className="text-lg font-bold">{fmtUsd(data.total_cost_usd)}</p>
              </div>
              <div className="rounded-xl bg-muted p-3">
                <p className="text-xs text-muted-foreground mb-1">Total Cost (NGN)</p>
                <p className="text-lg font-bold">{fmtNgn(data.total_cost_ngn)}</p>
              </div>
              <div className="rounded-xl bg-muted p-3">
                <p className="text-xs text-muted-foreground mb-1">Conversations</p>
                <p className="text-lg font-bold">{data.conversations?.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-muted p-3">
                <p className="text-xs text-muted-foreground mb-1">Avg Cost / Conv.</p>
                <p className="text-lg font-bold">{fmtUsd(data.avg_cost_per_conversation_usd)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-border">
              <div>
                <p className="text-sm font-semibold">Cost-to-Revenue Ratio</p>
                <p className="text-xs text-muted-foreground">AI cost vs. subscription MRR</p>
              </div>
              <div className="text-right">
                <p className={`text-xl font-bold ${ratioColor}`}>{ratioPct}%</p>
                <p className="text-xs text-muted-foreground">MRR: {fmtNgn(data.mrr_ngn)}</p>
              </div>
            </div>

            {data.trend && data.trend.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Daily Cost Trend</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-muted-foreground">
                        <th className="text-left py-1 pr-4">Date</th>
                        <th className="text-right py-1 pr-4">Cost (USD)</th>
                        <th className="text-right py-1">Conversations</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.trend.slice(-7).map((row, i) => (
                        <tr key={i} className="border-t border-border">
                          <td className="py-1 pr-4 text-muted-foreground">{row.date}</td>
                          <td className="text-right py-1 pr-4 font-mono">{fmtUsd(row.cost_usd)}</td>
                          <td className="text-right py-1">{row.conversations}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
export default function AdminAnalyticsPage() {
  const [financialData, setFinancialData] = useState<FinancialReport | null>(null);
  const [growthData, setGrowthData] = useState<UserGrowthReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState("30");
  const [pollMs, setPollMs] = useState<number>(30000);

  // Web analytics state
  const [webDays, setWebDays] = useState("30");
  const [webData, setWebData] = useState<WebOverview | null>(null);
  const [webLoading, setWebLoading] = useState(false);

  // IP blocks state
  const [ipBlocks, setIpBlocks] = useState<IpBlock[]>([]);
  const [ipLoading, setIpLoading] = useState(false);
  const [showAddIp, setShowAddIp] = useState(false);
  const [newIp, setNewIp] = useState("");
  const [newIpReason, setNewIpReason] = useState("");
  const [newIpExpiry, setNewIpExpiry] = useState("");
  const [addingIp, setAddingIp] = useState(false);

  const fetchWebAnalytics = useCallback(async () => {
    setWebLoading(true);
    try {
      const res = await client.get("/api/v1/admin/analytics/overview", { params: { days: webDays } });
      setWebData(res.data?.data ?? res.data);
    } catch {
      toast({ title: "Error", description: "Failed to load web analytics", variant: "destructive" });
    } finally {
      setWebLoading(false);
    }
  }, [webDays]);

  const fetchIpBlocks = useCallback(async () => {
    setIpLoading(true);
    try {
      const res = await client.get("/api/v1/admin/analytics/ip-blocks");
      const d = res.data?.data ?? res.data;
      setIpBlocks(Array.isArray(d) ? d : (Array.isArray(d?.data) ? d.data : []));
    } catch {
      toast({ title: "Error", description: "Failed to load IP blocks", variant: "destructive" });
    } finally {
      setIpLoading(false);
    }
  }, []);

  const handleAddIpBlock = async () => {
    if (!newIp.trim()) return;
    setAddingIp(true);
    try {
      await client.post("/api/v1/admin/analytics/ip-blocks", {
        ip: newIp.trim(),
        reason: newIpReason.trim() || null,
        expires_at: newIpExpiry || null,
      });
      toast({ title: "Blocked", description: `${newIp} has been blocked.` });
      setNewIp(""); setNewIpReason(""); setNewIpExpiry("");
      setShowAddIp(false);
      fetchIpBlocks();
    } catch {
      toast({ title: "Error", description: "Failed to add IP block", variant: "destructive" });
    } finally {
      setAddingIp(false);
    }
  };

  const handleDeactivateIp = async (id: number) => {
    try {
      await client.patch(`/api/v1/admin/analytics/ip-blocks/${id}`, { is_active: false });
      toast({ title: "Deactivated" });
      fetchIpBlocks();
    } catch {
      toast({ title: "Error", description: "Failed to deactivate block", variant: "destructive" });
    }
  };

  const handleDeleteIp = async (id: number) => {
    try {
      await client.delete(`/api/v1/admin/analytics/ip-blocks/${id}`);
      toast({ title: "Deleted" });
      fetchIpBlocks();
    } catch {
      toast({ title: "Error", description: "Failed to delete block", variant: "destructive" });
    }
  };

  useEffect(() => { fetchWebAnalytics(); }, [fetchWebAnalytics]);
  useEffect(() => { fetchIpBlocks(); }, [fetchIpBlocks]);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { period };
      const [fin, growth] = await Promise.allSettled([
        adminService.getAnalyticsReports(params),
        adminService.getUserGrowthAnalytics(params),
      ]);
      if (fin.status === "fulfilled") setFinancialData(fin.value);
      if (growth.status === "fulfilled") setGrowthData(growth.value);
    } catch {
      toast({ title: "Error", description: "Failed to load analytics", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => {
    const tick = () => {
      if (typeof document !== "undefined" && document.hidden) return;
      fetchAll();
    };
    const id = pollMs > 0 ? setInterval(tick, pollMs) : undefined;
    return () => {
      if (id) clearInterval(id);
    };
  }, [fetchAll, pollMs]);

  const financialKpis = financialData
    ? [
        { label: "Total Revenue", value: fmt(financialData.total_revenue ?? 0, financialData.currency), icon: DollarSign, color: "text-primary" },
        { label: "MRR", value: fmt(financialData.mrr ?? 0, financialData.currency), icon: TrendingUp, color: "text-green-600" },
        { label: "ARR", value: fmt(financialData.arr ?? 0, financialData.currency), icon: BarChart3, color: "text-blue-600" },
        { label: "Active Subscriptions", value: financialData.active_subscriptions ?? 0, icon: Activity, color: "text-purple-600" },
      ]
    : [];

  const growthKpis = growthData
    ? [
        { label: "Total Users", value: growthData.total_users ?? 0, icon: Users, color: "text-primary" },
        { label: "New This Period", value: growthData.new_users_this_period ?? 0, icon: TrendingUp, color: "text-green-600" },
        { label: "Active Users", value: growthData.active_users ?? 0, icon: Activity, color: "text-blue-600" },
        { label: "Growth Rate", value: fmtPct(growthData.growth_rate ?? 0), icon: BarChart3, color: "text-purple-600" },
      ]
    : [];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">Financial performance and user growth metrics.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={(v: string | null) => setPeriod(v ?? "30")}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={String(pollMs)} onValueChange={(v: string | null) => setPollMs(Number(v ?? 30000))}>
            <SelectTrigger className="w-48" aria-label="Auto refresh">
              <SelectValue placeholder="Auto refresh" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">No auto refresh</SelectItem>
              <SelectItem value="15000">Refresh every 15s</SelectItem>
              <SelectItem value="30000">Refresh every 30s</SelectItem>
              <SelectItem value="60000">Refresh every 60s</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchAll} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="financial" className="space-y-4">
          <TabsList>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="growth">User Growth</TabsTrigger>
            <TabsTrigger value="web">Web Analytics</TabsTrigger>
            <TabsTrigger value="ip-blocks">IP Blocks</TabsTrigger>
          </TabsList>

          <TabsContent value="financial" className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {financialKpis.map(({ label, value, icon: Icon, color }) => (
                <Card key={label}>
                  <CardContent className="pt-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{label}</p>
                      <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    </div>
                    <Icon className={`h-8 w-8 opacity-20 ${color}`} />
                  </CardContent>
                </Card>
              ))}
            </div>

            {financialData?.breakdown && financialData.breakdown.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {financialData.breakdown.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{row.label}</TableCell>
                          <TableCell className="text-right">{fmt(row.value, financialData.currency)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {!financialData && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No financial data available for this period.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="growth" className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {growthKpis.map(({ label, value, icon: Icon, color }) => (
                <Card key={label}>
                  <CardContent className="pt-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{label}</p>
                      <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    </div>
                    <Icon className={`h-8 w-8 opacity-20 ${color}`} />
                  </CardContent>
                </Card>
              ))}
            </div>

            {growthData?.by_role && growthData.by_role.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Users by Role</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Users</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {growthData.by_role.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium capitalize">{row.role.replace(/_/g, " ")}</TableCell>
                          <TableCell className="text-right">{row.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {growthData?.trend && growthData.trend.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Registration Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">New Users</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {growthData.trend.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell>{row.date}</TableCell>
                          <TableCell className="text-right">{row.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {!growthData && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No growth data available for this period.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ── Web Analytics ── */}
          <TabsContent value="web" className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-sm text-muted-foreground">Website traffic and engagement metrics.</p>
              <div className="flex items-center gap-2">
                <Select value={webDays} onValueChange={(value) => setWebDays(value ?? "7")}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="14">Last 14 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={fetchWebAnalytics} title="Refresh">
                  <RefreshCw className={`h-4 w-4 ${webLoading ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>

            {webLoading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !webData ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Globe className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>No web analytics data for this period.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Stat cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { label: "Total Views",      value: webData.total_views?.toLocaleString() ?? "0",    icon: Eye,      color: "text-primary" },
                    { label: "Unique Visitors",  value: webData.unique_visitors?.toLocaleString() ?? "0", icon: Users,    color: "text-blue-600" },
                    { label: "New Visitors",     value: webData.new_visitors?.toLocaleString() ?? "0",    icon: TrendingUp, color: "text-green-600" },
                    { label: "Returning",        value: webData.returning_visitors?.toLocaleString() ?? "0", icon: Activity, color: "text-purple-600" },
                    { label: "Bots Detected",    value: webData.bots_detected?.toLocaleString() ?? "0",   icon: Bot,      color: "text-orange-500" },
                    { label: "Avg Scroll",       value: `${webData.avg_scroll_pct?.toFixed(0) ?? 0}%`,   icon: BarChart3, color: "text-teal-600" },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <Card key={label}>
                      <CardContent className="pt-4 pb-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-muted-foreground">{label}</p>
                          <Icon className={`h-4 w-4 opacity-40 ${color}`} />
                        </div>
                        <p className={`text-xl font-bold ${color}`}>{value}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Avg duration banner */}
                <Card>
                  <CardContent className="py-3 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Average time on page</span>
                    <span className="font-semibold">
                      {webData.avg_duration_ms
                        ? webData.avg_duration_ms >= 60000
                          ? `${Math.floor(webData.avg_duration_ms / 60000)}m ${Math.floor((webData.avg_duration_ms % 60000) / 1000)}s`
                          : `${Math.floor(webData.avg_duration_ms / 1000)}s`
                        : "—"}
                    </span>
                  </CardContent>
                </Card>

                {/* Tables row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Top Pages */}
                  {webData.top_pages?.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Top Pages</CardTitle></CardHeader>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Page</TableHead>
                              <TableHead className="text-right">Views</TableHead>
                              <TableHead className="text-right">Unique</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {webData.top_pages.slice(0, 10).map((row, i) => (
                              <TableRow key={i}>
                                <TableCell className="text-xs font-mono truncate max-w-[160px]">{row.page}</TableCell>
                                <TableCell className="text-right text-sm">{row.views}</TableCell>
                                <TableCell className="text-right text-sm">{row.unique}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}

                  {/* By Country */}
                  {webData.by_country?.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Traffic by Country</CardTitle></CardHeader>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Country</TableHead>
                              <TableHead className="text-right">Views</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {webData.by_country.slice(0, 10).map((row, i) => (
                              <TableRow key={i}>
                                <TableCell className="text-sm">{row.country || "Unknown"}</TableCell>
                                <TableCell className="text-right text-sm">{row.views}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}

                  {/* Top Referrers */}
                  {webData.referrers?.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Top Referrers</CardTitle></CardHeader>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Referrer</TableHead>
                              <TableHead className="text-right">Views</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {webData.referrers.slice(0, 8).map((row, i) => (
                              <TableRow key={i}>
                                <TableCell className="text-xs truncate max-w-[200px]">{row.referrer || "Direct"}</TableCell>
                                <TableCell className="text-right text-sm">{row.views}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}

                  {/* UTM Sources */}
                  {webData.utm_sources?.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm">UTM Sources</CardTitle></CardHeader>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Source</TableHead>
                              <TableHead className="text-right">Views</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {webData.utm_sources.slice(0, 8).map((row, i) => (
                              <TableRow key={i}>
                                <TableCell className="text-sm">{row.source}</TableCell>
                                <TableCell className="text-right text-sm">{row.views}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Daily trend */}
                {webData.daily_views?.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Daily Views Trend</CardTitle></CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Views</TableHead>
                            <TableHead className="text-right">Unique</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {webData.daily_views.map((row, i) => (
                            <TableRow key={i}>
                              <TableCell className="text-sm">{row.date}</TableCell>
                              <TableCell className="text-right text-sm">{row.views}</TableCell>
                              <TableCell className="text-right text-sm">{row.unique}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* ── IP Blocks ── */}
          <TabsContent value="ip-blocks" className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Manage blocked IP addresses and CIDR ranges.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={fetchIpBlocks} disabled={ipLoading}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${ipLoading ? "animate-spin" : ""}`} />Refresh
                </Button>
                <Button size="sm" onClick={() => setShowAddIp(true)}>
                  <Plus className="mr-2 h-4 w-4" />Block IP
                </Button>
              </div>
            </div>

            {/* Add IP dialog */}
            <Dialog open={showAddIp} onOpenChange={setShowAddIp}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Block IP Address</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-sm font-medium">IP Address or CIDR Range</label>
                    <Input
                      className="mt-1"
                      placeholder="e.g. 192.168.1.1 or 10.0.0.0/8"
                      value={newIp}
                      onChange={(e) => setNewIp(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Reason <span className="text-muted-foreground font-normal">(optional)</span></label>
                    <Input
                      className="mt-1"
                      placeholder="e.g. Spam, brute force, abuse"
                      value={newIpReason}
                      onChange={(e) => setNewIpReason(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Expires At <span className="text-muted-foreground font-normal">(optional)</span></label>
                    <Input
                      className="mt-1"
                      type="datetime-local"
                      value={newIpExpiry}
                      onChange={(e) => setNewIpExpiry(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => setShowAddIp(false)}>Cancel</Button>
                    <Button onClick={handleAddIpBlock} disabled={addingIp || !newIp.trim()}>
                      {addingIp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Ban className="mr-2 h-4 w-4" />}
                      Block
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Card>
              <CardHeader>
                <CardTitle>Blocked IPs ({ipBlocks.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {ipLoading ? (
                  <div className="flex h-36 items-center justify-center">
                    <Loader2 className="h-7 w-7 animate-spin text-primary" />
                  </div>
                ) : ipBlocks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-muted-foreground">
                    <ShieldOff className="w-10 h-10 opacity-20 mb-3" />
                    <p className="text-sm">No IP blocks configured.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>IP / CIDR</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Blocked By</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ipBlocks.map((block) => (
                        <TableRow key={block.id}>
                          <TableCell className="font-mono text-sm">{block.ip}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{block.reason || "—"}</TableCell>
                          <TableCell>
                            <Badge className={block.is_active ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"}>
                              {block.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {block.expires_at ? new Date(block.expires_at).toLocaleDateString() : "Never"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{block.blocked_by || "—"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {block.is_active && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2 text-amber-600 hover:text-amber-700"
                                  onClick={() => handleDeactivateIp(block.id)}
                                  title="Deactivate"
                                >
                                  <ShieldOff className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteIp(block.id)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
