"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CreditCard, DollarSign, TrendingUp, Users, Download, MousePointer, RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import client from "@/lib/api/client";

const ICON_MAP: Record<string, React.ReactNode> = {
  Activity: <Activity className="h-4 w-4 text-muted-foreground" />,
  TrendingUp: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
  DollarSign: <DollarSign className="h-4 w-4 text-muted-foreground" />,
  CreditCard: <CreditCard className="h-4 w-4 text-muted-foreground" />,
  Users: <Users className="h-4 w-4 text-muted-foreground" />,
  MousePointer: <MousePointer className="h-4 w-4 text-muted-foreground" />,
};

interface Stat {
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease" | "neutral";
  iconName: string;
  description: string;
}

export function MarketingOverview() {
  const [timeRange, setTimeRange] = React.useState("last_30_days");
  const [stats, setStats] = React.useState<Stat[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchStats = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await client.get("/api/v1/marketing/stats");
      const data = res.data?.data ?? res.data;
      setStats(Array.isArray(data) ? data : []);
    } catch {
      setStats([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchStats(); }, [fetchStats]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Overview</h2>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(value: string | null) => setTimeRange(value ?? "last_30_days")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="last_7_days">Last 7 Days</SelectItem>
              <SelectItem value="last_30_days">Last 30 Days</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="this_quarter">This Quarter</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchStats} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
              <CardContent><Skeleton className="h-8 w-16" /></CardContent>
            </Card>
          ))
        ) : stats.length === 0 ? (
          <p className="col-span-4 text-center text-muted-foreground text-sm py-6">No stats available.</p>
        ) : (
          stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                {ICON_MAP[stat.iconName] ?? <Activity className="h-4 w-4 text-muted-foreground" />}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={stat.changeType === "increase" ? "text-green-600" : stat.changeType === "decrease" ? "text-red-600" : ""}>
                    {stat.change}
                  </span>{" "}
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
