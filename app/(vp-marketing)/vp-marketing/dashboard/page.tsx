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
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  FunnelChart, Funnel, LabelList,
} from "recharts";
import { RefreshCw, Radio, Users, TrendingUp, Mail, FileImage, DollarSign, AlertTriangle } from "lucide-react";

interface MarketingDashboard {
  active_campaigns?: number;
  new_leads_mtd?: number;
  email_open_rate?: number;
  subscriber_growth?: number;
  cac?: number;
  content_published?: number;
  campaign_performance?: { name: string; sent: number; opened: number; clicked: number }[];
  email_funnel?: { name: string; value: number; fill: string }[];
  top_channels?: { channel: string; leads: number; conversion_rate: number }[];
}

export default function VpMarketingDashboardPage() {
  const [data, setData] = useState<MarketingDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.get("/api/v1/marketing/dashboard");
      setData(res.data?.data ?? res.data ?? {});
    } catch {
      setError("Unable to load marketing data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const campaigns = data?.campaign_performance ?? [];
  const channels = data?.top_channels ?? [];
  const funnel = data?.email_funnel ?? [
    { name: "Sent", value: 100, fill: "#3b82f6" },
    { name: "Opened", value: data?.email_open_rate ?? 0, fill: "#10b981" },
    { name: "Clicked", value: 0, fill: "#f59e0b" },
    { name: "Converted", value: 0, fill: "#8b5cf6" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketing Leadership Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Growth, acquisition &amp; brand performance</p>
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
          <StatCard label="Active Campaigns"    value={data?.active_campaigns}    icon={Radio}      colour="blue"   isLoading={loading} />
          <StatCard label="New Leads (MTD)"     value={data?.new_leads_mtd}       icon={TrendingUp} colour="emerald" isLoading={loading} />
          <StatCard label="Email Open Rate"     value={data?.email_open_rate !== undefined ? `${data.email_open_rate}%` : "—"} icon={Mail} colour="blue" isLoading={loading} />
          <StatCard label="Subscriber Growth"   value={data?.subscriber_growth !== undefined ? `+${data.subscriber_growth}` : "—"} icon={Users} colour="emerald" isLoading={loading} />
          <StatCard label="CAC"                 value={data?.cac !== undefined ? `₦${data.cac}` : "—"} icon={DollarSign} colour="amber" isLoading={loading} />
          <StatCard label="Content Published"   value={data?.content_published}   icon={FileImage}  colour="blue"   isLoading={loading} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : campaigns.length === 0 ? (
              <p className="text-sm text-muted-foreground">No campaign data.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={campaigns}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sent" name="Sent" fill="#3b82f6" />
                  <Bar dataKey="opened" name="Opened" fill="#10b981" />
                  <Bar dataKey="clicked" name="Clicked" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <Tooltip />
                  <Funnel dataKey="value" data={funnel} isAnimationActive>
                    <LabelList position="right" fill="#374151" stroke="none" dataKey="name" />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Channels</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : channels.length === 0 ? (
            <p className="text-sm text-muted-foreground">No channel data available.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Channel</TableHead>
                  <TableHead>Leads Generated</TableHead>
                  <TableHead>Conversion Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {channels.map((ch) => (
                  <TableRow key={ch.channel}>
                    <TableCell className="text-sm font-medium capitalize">{ch.channel}</TableCell>
                    <TableCell className="text-sm font-semibold">{ch.leads}</TableCell>
                    <TableCell>
                      <Badge className={ch.conversion_rate >= 5 ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50" : ch.conversion_rate >= 2 ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-50" : "bg-red-50 text-red-700 hover:bg-red-50"}>
                        {ch.conversion_rate}%
                      </Badge>
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
