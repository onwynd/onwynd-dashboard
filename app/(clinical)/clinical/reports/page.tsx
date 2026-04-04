"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { BarChart2, RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { clinicalService } from "@/lib/api/clinical";
import { cn } from "@/lib/utils";

interface ClinicalReview {
  id: string;
  review_status?: "pending" | "approved" | "flagged" | "escalated";
  created_at: string;
}

interface DistressQueueItem {
  id: string;
  risk_level?: "low" | "medium" | "high" | "severe" | "critical";
  flagged_at?: string;
}

interface ClinicalMetric {
  label: string;
  value: string | number;
  change: number;
}

function Trend({ value }: { value: number }) {
  if (value > 0) return <span className="flex items-center gap-0.5 text-green-600 text-xs"><TrendingUp className="h-3 w-3" />+{value}%</span>;
  if (value < 0) return <span className="flex items-center gap-0.5 text-red-500 text-xs"><TrendingDown className="h-3 w-3" />{value}%</span>;
  return <span className="flex items-center gap-0.5 text-muted-foreground text-xs"><Minus className="h-3 w-3" />0%</span>;
}

export default function ClinicalReportsPage() {
  const [metrics, setMetrics] = useState<ClinicalMetric[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [reviewsResponse, distressResponse] = await Promise.all([
        clinicalService.getReviews(),
        clinicalService.getDistressQueue(),
      ]);

      const reviewsRaw = reviewsResponse?.data ?? reviewsResponse ?? [];
      const distressRaw = distressResponse?.data ?? distressResponse ?? [];
      const reviews = Array.isArray(reviewsRaw) ? (reviewsRaw as ClinicalReview[]) : [];
      const distress = Array.isArray(distressRaw) ? (distressRaw as DistressQueueItem[]) : [];

      const now = Date.now();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      const currentStart = now - thirtyDaysMs;
      const previousStart = currentStart - thirtyDaysMs;

      const countInWindow = (dates: Array<string | undefined>, start: number, end: number) =>
        dates.filter((value) => {
          if (!value) return false;
          const timestamp = new Date(value).getTime();
          return Number.isFinite(timestamp) && timestamp >= start && timestamp < end;
        }).length;

      const percentChange = (current: number, previous: number) => {
        if (previous === 0) return current === 0 ? 0 : 100;
        return Math.round(((current - previous) / previous) * 100);
      };

      const currentReviews = countInWindow(reviews.map((item) => item.created_at), currentStart, now);
      const previousReviews = countInWindow(reviews.map((item) => item.created_at), previousStart, currentStart);
      const currentDistress = countInWindow(distress.map((item) => item.flagged_at), currentStart, now);
      const previousDistress = countInWindow(distress.map((item) => item.flagged_at), previousStart, currentStart);

      const pendingReviews = reviews.filter((item) => item.review_status === "pending").length;
      const escalatedReviews = reviews.filter((item) => item.review_status === "escalated").length;
      const flaggedReviews = reviews.filter((item) => item.review_status === "flagged").length;
      const highRiskAlerts = distress.filter((item) => ["high", "severe", "critical"].includes(item.risk_level ?? "")).length;
      const criticalAlerts = distress.filter((item) => item.risk_level === "critical").length;

      setMetrics([
        { label: "Therapist Reviews (30d)", value: currentReviews, change: percentChange(currentReviews, previousReviews) },
        { label: "Pending Reviews", value: pendingReviews, change: 0 },
        { label: "Distress Flags (30d)", value: currentDistress, change: percentChange(currentDistress, previousDistress) },
        { label: "Escalated Reviews", value: escalatedReviews, change: 0 },
        { label: "High-Risk Alerts", value: highRiskAlerts, change: 0 },
        { label: "Critical Alerts", value: criticalAlerts, change: 0 },
        { label: "Flagged Reviews", value: flaggedReviews, change: 0 },
      ]);
    } catch {
      setMetrics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-teal" />
            Clinical Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Clinical workload and risk metrics derived from live review and distress queue data.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-2">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      ) : metrics.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <BarChart2 className="h-10 w-10 text-muted-foreground/40" />
            <p className="font-semibold">No report data available</p>
            <p className="text-sm text-muted-foreground">Reports will appear once review and distress data are available.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((metric) => (
            <Card key={metric.label}>
              <CardHeader className="pb-1">
                <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{metric.value}</p>
                <div className="mt-1">
                  <Trend value={metric.change} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

