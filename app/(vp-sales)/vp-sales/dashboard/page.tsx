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
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { RefreshCw, TrendingUp, Users, DollarSign, Percent, Handshake, Target, AlertTriangle } from "lucide-react";

interface SalesDashboard {
  total_leads?: number;
  deals_closed_mtd?: number;
  pipeline_value?: number;
  win_rate?: number;
  avg_deal_size?: number;
  revenue_target_pct?: number;
  pipeline_stages?: { stage: string; count: number; value: number }[];
  top_deals?: { id: number | string; name: string; value: number; stage: string; owner?: string; close_date?: string }[];
  team_leaderboard?: { name: string; deals_closed: number; revenue: number }[];
}

function fmt(n?: number) {
  if (n === undefined || n === null) return "—";
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n.toFixed(0)}`;
}

export default function VpSalesDashboardPage() {
  const [data, setData] = useState<SalesDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.get("/api/v1/sales/dashboard");
      setData(res.data?.data ?? res.data ?? {});
    } catch {
      setError("Unable to load sales data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stages = data?.pipeline_stages ?? [];
  const topDeals = data?.top_deals ?? [];
  const leaderboard = data?.team_leaderboard ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Leadership Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Pipeline intelligence &amp; team performance</p>
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
          <StatCard label="Total Leads"          value={data?.total_leads}            icon={Users}     colour="blue"   isLoading={loading} />
          <StatCard label="Deals Closed (MTD)"   value={data?.deals_closed_mtd}       icon={Handshake} colour="emerald" isLoading={loading} />
          <StatCard label="Pipeline Value"        value={fmt(data?.pipeline_value)}    icon={DollarSign} colour="blue" isLoading={loading} />
          <StatCard label="Win Rate"             value={data?.win_rate !== undefined ? `${data.win_rate}%` : "—"} icon={Percent} colour={((data?.win_rate ?? 0) > 25) ? "emerald" : "amber"} isLoading={loading} />
          <StatCard label="Avg Deal Size"         value={fmt(data?.avg_deal_size)}     icon={TrendingUp} colour="blue" isLoading={loading} />
          <StatCard label="Revenue Target"       value={data?.revenue_target_pct !== undefined ? `${data.revenue_target_pct}%` : "—"} icon={Target} colour={((data?.revenue_target_pct ?? 0) >= 80) ? "emerald" : "amber"} isLoading={loading} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Funnel</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : stages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pipeline data.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stages} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="stage" type="category" width={100} className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="count" name="Deals" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-48 w-full" />
            ) : leaderboard.length === 0 ? (
              <p className="text-sm text-muted-foreground">No team data available.</p>
            ) : (
              <div className="space-y-3">
                {leaderboard.slice(0, 8).map((rep, i) => (
                  <div key={rep.name} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${i === 0 ? "bg-yellow-100 text-yellow-700" : i === 1 ? "bg-gray-100 text-gray-600" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-muted text-muted-foreground"}`}>
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium">{rep.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-emerald-600">{fmt(rep.revenue)}</div>
                      <div className="text-xs text-muted-foreground">{rep.deals_closed} deals</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Deals</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : topDeals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No deals in pipeline.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Deal</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Close Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topDeals.slice(0, 10).map((deal) => (
                  <TableRow key={deal.id}>
                    <TableCell className="text-sm font-medium">{deal.name}</TableCell>
                    <TableCell className="text-sm font-semibold">{fmt(deal.value)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">{deal.stage}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{deal.owner ?? "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {deal.close_date ? new Date(deal.close_date).toLocaleDateString() : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
