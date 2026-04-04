"use client";

import { useEffect, useState } from "react";
import { pmService } from "@/lib/api/pm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Users, Activity, Clock, Download } from "lucide-react";
import { Overview } from "@/components/admin-dashboard/overview";
import { Button } from "@/components/ui/button";
import { downloadCSV } from "@/lib/export-utils";

type MetricItem = { value: number | string; trend?: string };
type AdoptionItem = { name: string; value: number };
type Metrics = {
  daily_active_users?: MetricItem;
  retention_rate?: MetricItem;
  avg_session_duration?: MetricItem;
  feature_adoption?: AdoptionItem[];
};

export default function PMMetricsPage() {
  const [metrics, setMetrics] = useState<Metrics>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await pmService.getAnalyticsMetrics();
        setMetrics((data?.data || data) as Metrics);
      } catch (error) {
        console.error("Failed to load metrics", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleExport = () => {
    const headers = ["Category", "Metric", "Value", "Trend"];
    const rows: Array<Record<string, unknown>> = [];
    rows.push({
      Category: "Key Metrics",
      Metric: "Daily Active Users",
      Value: metrics.daily_active_users?.value ?? 0,
      Trend: metrics.daily_active_users?.trend ?? "",
    });
    rows.push({
      Category: "Key Metrics",
      Metric: "Retention Rate",
      Value: metrics.retention_rate?.value ?? 0,
      Trend: metrics.retention_rate?.trend ?? "",
    });
    rows.push({
      Category: "Key Metrics",
      Metric: "Avg Session Duration",
      Value: metrics.avg_session_duration?.value ?? 0,
      Trend: metrics.avg_session_duration?.trend ?? "",
    });
    if (metrics.feature_adoption) {
      for (const f of metrics.feature_adoption) {
        rows.push({
          Category: "Feature Adoption",
          Metric: f.name,
          Value: `${f.value}%`,
          Trend: "N/A",
        });
      }
    }
    downloadCSV("metrics_report.csv", headers, rows);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Analytics Metrics</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.daily_active_users?.value}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.daily_active_users?.trend} from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.retention_rate?.value}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.retention_rate?.trend} from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.avg_session_duration?.value}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.avg_session_duration?.trend} from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview data={(metrics.feature_adoption ?? []).map(f => ({ label: f.name, value: f.value }))} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Feature Adoption</CardTitle>
            <CardDescription>
              User adoption rates by feature
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {metrics?.feature_adoption?.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{feature.name}</p>
                  </div>
                  <div className="ml-auto font-medium">{feature.value}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
