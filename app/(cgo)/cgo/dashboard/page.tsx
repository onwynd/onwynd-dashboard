"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatCard } from "@/components/shared/stat-card";
import { StatCardsShimmer } from "@/components/shared/shimmer-skeleton";
import client from "@/lib/api/client";
import {
  RefreshCw,
  UserSearch,
  Radio,
  Users,
  Star,
  Handshake,
  DollarSign,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

interface Campaign {
  id: string | number;
  name: string;
  status: string;
  leads_generated?: number;
  conversions?: number;
  spend?: number;
}

interface Ambassador {
  id: string | number;
  name: string;
  referrals?: number;
  conversions?: number;
  status?: string;
}

interface GrowthPoint {
  month: string;
  subscribers: number;
}

interface CGODashboard {
  total_leads?: number;
  active_campaigns?: number;
  subscribers?: number;
  ambassador_count?: number;
  partner_count?: number;
  mrr_from_growth?: number;
  subscriber_growth?: GrowthPoint[];
  campaigns?: Campaign[];
  top_ambassadors?: Ambassador[];
}

export default function CGODashboardPage() {
  const [data, setData] = useState<CGODashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    client
      .get("/api/v1/marketing/dashboard")
      .then((res) => {
        const body = res.data?.data ?? res.data ?? {};
        setData(body);
      })
      .catch(() => setError("Failed to load growth dashboard data."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fmt = (n?: number) => (n !== undefined ? n.toLocaleString() : "—");
  const fmtCurrency = (n?: number) =>
    n !== undefined ? `₦${n.toLocaleString("en-NG")}` : "—";

  const campaignStatusBadge = (status: string) => {
    if (status === "active") return "bg-emerald-50 text-emerald-700 hover:bg-emerald-50";
    if (status === "paused") return "bg-amber-50 text-amber-700 hover:bg-amber-50";
    return "bg-gray-50 text-gray-600 hover:bg-gray-50";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Growth &amp; Marketing Command Center</h1>
          <p className="text-sm text-gray-500 mt-1">Campaigns, subscribers, and growth metrics</p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm" className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stat Cards */}
      {loading && !data ? (
        <StatCardsShimmer count={6} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard label="Total Leads" value={fmt(data?.total_leads)} icon={UserSearch} colour="blue" isLoading={loading} />
          <StatCard label="Active Campaigns" value={fmt(data?.active_campaigns)} icon={Radio} colour="purple" isLoading={loading} />
          <StatCard label="Subscribers" value={fmt(data?.subscribers)} icon={Users} colour="emerald" isLoading={loading} />
          <StatCard label="Ambassadors" value={fmt(data?.ambassador_count)} icon={Star} colour="amber" isLoading={loading} />
          <StatCard label="Partners" value={fmt(data?.partner_count)} icon={Handshake} colour="blue" isLoading={loading} />
          <StatCard label="MRR from Growth" value={fmtCurrency(data?.mrr_from_growth)} icon={DollarSign} colour="emerald" isLoading={loading} />
        </div>
      )}

      {/* Subscriber Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Subscriber Growth Over Time</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          {loading && !data ? (
            <div className="h-full bg-gray-100 animate-pulse rounded" />
          ) : !data?.subscriber_growth?.length ? (
            <p className="text-sm text-gray-400 pt-4">No growth data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={data.subscriber_growth}>
                <defs>
                  <linearGradient id="subGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="subscribers" name="Subscribers" stroke="#8b5cf6" fill="url(#subGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Radio className="w-4 h-4 text-purple-500" />
              Campaign Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && !data ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 animate-pulse rounded" />
                ))}
              </div>
            ) : !data?.campaigns?.length ? (
              <p className="text-sm text-gray-400">No campaign data.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100">
                      <th className="pb-2 font-medium">Campaign</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium text-right">Leads</th>
                      <th className="pb-2 font-medium text-right">Conv.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.campaigns.map((c) => (
                      <tr key={c.id} className="border-b border-gray-50 last:border-0">
                        <td className="py-2 font-medium text-gray-800">{c.name}</td>
                        <td className="py-2">
                          <Badge className={campaignStatusBadge(c.status)}>{c.status}</Badge>
                        </td>
                        <td className="py-2 text-right text-gray-700">{fmt(c.leads_generated)}</td>
                        <td className="py-2 text-right text-gray-700">{fmt(c.conversions)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Ambassadors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              Top Ambassadors
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && !data ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 animate-pulse rounded" />
                ))}
              </div>
            ) : !data?.top_ambassadors?.length ? (
              <p className="text-sm text-gray-400">No ambassador data.</p>
            ) : (
              <div className="space-y-2">
                {data.top_ambassadors.map((amb, idx) => (
                  <div key={amb.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-400 w-5">#{idx + 1}</span>
                      <span className="text-sm font-medium text-gray-800">{amb.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{fmt(amb.referrals)} refs</span>
                      <span className="text-emerald-600 font-medium">{fmt(amb.conversions)} conv.</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
