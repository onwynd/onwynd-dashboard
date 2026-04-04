"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cooService } from "@/lib/api/coo";
import {
  Activity,
  LifeBuoy,
  TrendingUp,
  Clock,
  Zap,
  RefreshCw,
  Video,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { StatCard } from "@/components/shared/stat-card";
import { StatCardsShimmer } from "@/components/shared/shimmer-skeleton";
import { PageHeader } from "@/components/shared/page-header";

interface OperationsData {
  sales_health?: {
    leads_this_week?: number;
    deals_in_progress?: number;
    closed_this_month?: number;
    win_rate?: number;
    stale_deals_amber?: number;
    stale_deals_red?: number;
  };
  support_health?: {
    open_tickets?: number;
    avg_first_response_hours?: number;
    avg_resolution_hours?: number;
    long_open_tickets?: number;
    ai_handover_rate?: number;
  };
  session_ops?: {
    scheduled_today?: number;
    completed_today?: number;
    no_shows_today?: number;
    ended_early?: number;
    therapist_availability_gaps?: number;
  };
  platform_health?: {
    active_sessions?: number;
    ai_companion_uptime?: string;
    api_error_rate?: number;
    last_payment_webhook?: string;
  };
}

export default function OperationsOverviewPage() {
  const [data, setData] = useState<OperationsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await cooService.getOperationsOverview();
      setData((res as { data: { data: OperationsData } }).data.data);
    } catch {
      toast({ title: "Error", description: "Failed to load operations data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { sales_health, support_health, session_ops, platform_health } = data ?? {};
  const liveCount = platform_health?.active_sessions ?? 0;

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Operations Overview"
        subtitle="Real-time operational health monitoring"
      >
        <Button onClick={fetchData} variant="outline" size="sm" className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </PageHeader>

      {/* Stat cards */}
      {loading && !data ? (
        <StatCardsShimmer count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Sessions Live Now — pulsing if > 0 */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 card-hover-lift relative overflow-hidden">
            {liveCount > 0 && (
              <span className="flex h-2.5 w-2.5 absolute top-4 right-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal" />
              </span>
            )}
            <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center mb-3">
              <Video className="w-5 h-5 text-teal" />
            </div>
            <p className="text-2xl font-semibold text-gray-900">{liveCount}</p>
            <p className="text-sm text-gray-500 mt-1">Sessions Live Now</p>
          </div>

          <StatCard
            label="Sessions Today"
            value={session_ops?.scheduled_today}
            icon={Activity}
            colour="blue"
            isLoading={loading}
          />

          <StatCard
            label="Open Support Tickets"
            value={support_health?.open_tickets}
            icon={LifeBuoy}
            colour={(support_health?.open_tickets ?? 0) > 10 ? "red" : "amber"}
            isLoading={loading}
          />

          <StatCard
            label="Leads This Week"
            value={sales_health?.leads_this_week}
            icon={TrendingUp}
            colour="emerald"
            isLoading={loading}
          />
        </div>
      )}

      {/* Detail cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Pipeline Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Sales Pipeline Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">Deals in Negotiation</span>
              <span className="text-sm font-semibold text-gray-900">{sales_health?.deals_in_progress ?? "—"}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">Closed This Month</span>
              <span className="text-sm font-semibold text-gray-900">{sales_health?.closed_this_month ?? "—"}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">Monthly Win Rate</span>
              {sales_health?.win_rate !== undefined ? (
                <Badge className={(sales_health.win_rate ?? 0) > 20 ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50" : "bg-red-50 text-red-700 hover:bg-red-50"}>
                  {sales_health.win_rate}%
                </Badge>
              ) : <span className="text-sm text-gray-400">—</span>}
            </div>
            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Stale Deals (7d+)</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                  {sales_health?.stale_deals_amber ?? 0} Amber Alert
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Stale Deals (14d+)</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                  {sales_health?.stale_deals_red ?? 0} Red Alert
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support & SLA Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <LifeBuoy className="w-4 h-4 text-orange-500" />
              Support &amp; SLA Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">Avg. First Response Time</span>
              <span className="text-sm font-semibold text-gray-900">{support_health?.avg_first_response_hours ?? "—"}h</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">Avg. Resolution Time</span>
              <span className="text-sm font-semibold text-gray-900">{support_health?.avg_resolution_hours ?? "—"}h</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">SLA Breaches (48h+)</span>
              {support_health?.long_open_tickets !== undefined ? (
                <Badge className={(support_health.long_open_tickets ?? 0) > 0 ? "bg-red-50 text-red-700 hover:bg-red-50" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"}>
                  {support_health.long_open_tickets} tickets
                </Badge>
              ) : <span className="text-sm text-gray-400">—</span>}
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">AI Handover Rate</span>
              <span className="text-sm font-semibold text-gray-900">{support_health?.ai_handover_rate ?? "—"}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Session Operations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="w-4 h-4 text-green-500" />
              Session Operations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">Completed Today</span>
              <span className="text-sm font-semibold text-gray-900">{session_ops?.completed_today ?? "—"}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">No-Shows Today</span>
              {session_ops?.no_shows_today !== undefined ? (
                <Badge className={session_ops.no_shows_today > 0 ? "bg-red-50 text-red-700 hover:bg-red-50" : "bg-gray-50 text-gray-500 hover:bg-gray-50"}>
                  {session_ops.no_shows_today}
                </Badge>
              ) : <span className="text-sm text-gray-400">—</span>}
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">Ended Early (Flagged)</span>
              <span className="text-sm font-semibold text-gray-900">{session_ops?.ended_early ?? "—"}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Availability Gaps</span>
              {session_ops?.therapist_availability_gaps !== undefined ? (
                <Badge className={(session_ops.therapist_availability_gaps ?? 0) > 5 ? "bg-red-50 text-red-700 hover:bg-red-50" : "bg-gray-50 text-gray-500 hover:bg-gray-50"}>
                  {session_ops.therapist_availability_gaps} therapists
                </Badge>
              ) : <span className="text-sm text-gray-400">—</span>}
            </div>
          </CardContent>
        </Card>

        {/* Platform Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="w-4 h-4 text-purple-500" />
              Platform Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">API Error Rate</span>
              {platform_health?.api_error_rate !== undefined ? (
                <Badge className={platform_health.api_error_rate < 0.1 ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50" : "bg-red-50 text-red-700 hover:bg-red-50"}>
                  {platform_health.api_error_rate}%
                </Badge>
              ) : <span className="text-sm text-gray-400">—</span>}
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">Last Payment Processed</span>
              <span className="text-xs text-gray-600">
                {platform_health?.last_payment_webhook
                  ? new Date(platform_health.last_payment_webhook).toLocaleString()
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">AI Companion Uptime</span>
              <span className="text-xs text-gray-600">
                {platform_health?.ai_companion_uptime
                  ? new Date(platform_health.ai_companion_uptime).toLocaleTimeString()
                  : "—"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
