"use client";

import { useEffect } from "react";
import { useAdminStore } from "@/store/admin-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, TrendingDown, Users, MessageSquare, Activity, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { EmptyState } from "./empty-state";

export function QuotaAnalyticsWidget() {
  const { quotaAnalytics, quotaOverages, fetchQuotaAnalytics, fetchQuotaOverages, isLoading } = useAdminStore();

  useEffect(() => {
    fetchQuotaAnalytics('7days');
    fetchQuotaOverages({ limit: 10 });
  }, [fetchQuotaAnalytics, fetchQuotaOverages]);

  const latestAnalytics = quotaAnalytics[quotaAnalytics.length - 1];
  const previousAnalytics = quotaAnalytics[quotaAnalytics.length - 2];

  const calculateChange = (current: number, previous: number) => {
    if (!previous) return { value: 0, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return { value: Math.abs(Math.round(change)), isPositive: change >= 0 };
  };

  const getMetricCard = (title: string, value: number, previous: number, icon: React.ReactNode, color: string) => {
    const change = calculateChange(value, previous);
    
    return (
      <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className={`p-2 rounded-lg ${color}`}>
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value.toLocaleString()}</div>
          <div className="flex items-center text-xs text-muted-foreground">
            {change.isPositive ? (
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
            )}
            <span className={change.isPositive ? "text-green-500" : "text-red-500"}>
              {change.value}% from yesterday
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading && !quotaAnalytics.length) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // Check for empty analytics data
  if (!quotaAnalytics.length || !latestAnalytics) {
    return (
      <div className="space-y-6">
        <EmptyState
          icon="chart"
          title="No quota analytics available"
          description="Quota analytics data could not be loaded. Please try refreshing the data."
          action={{
            label: "Refresh",
            onClick: () => {
              fetchQuotaAnalytics('7days');
              fetchQuotaOverages({ limit: 10 });
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {latestAnalytics && getMetricCard(
          "Active Users",
          latestAnalytics.active_users,
          previousAnalytics?.active_users || 0,
          <Users className="h-4 w-4 text-blue-600" />,
          "bg-blue-100 dark:bg-blue-900"
        )}
        {latestAnalytics && getMetricCard(
          "AI Messages",
          latestAnalytics.ai_messages_sent,
          previousAnalytics?.ai_messages_sent || 0,
          <MessageSquare className="h-4 w-4 text-green-600" />,
          "bg-green-100 dark:bg-green-900"
        )}
        {latestAnalytics && getMetricCard(
          "Activities Logged",
          latestAnalytics.activities_logged,
          previousAnalytics?.activities_logged || 0,
          <Activity className="h-4 w-4 text-purple-600" />,
          "bg-purple-100 dark:bg-purple-900"
        )}
        {latestAnalytics && getMetricCard(
          "Quota Overages",
          latestAnalytics.quota_overages,
          previousAnalytics?.quota_overages || 0,
          <AlertTriangle className="h-4 w-4 text-orange-600" />,
          "bg-orange-100 dark:bg-orange-900"
        )}
      </div>

      {/* Recent Overages */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Quota Overages</CardTitle>
              <CardDescription>Users who exceeded their quotas in the last 24 hours</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => fetchQuotaOverages({ limit: 50 })}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {quotaOverages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No quota overages in the last 24 hours
            </div>
          ) : (
            <div className="space-y-3">
              {quotaOverages.map((overage) => (
                <div key={`${overage.user_id}-${overage.feature}`} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex flex-col">
                      <span className="font-medium">{overage.user_name}</span>
                      <span className="text-sm text-muted-foreground">{overage.user_email}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">{overage.feature}</Badge>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {overage.usage} / {overage.limit}
                      </div>
                      <div className="text-xs text-red-500">
                        +{overage.overage} over
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(overage.last_occurrence), 'HH:mm')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 7-Day Trend Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>7-Day Usage Trend</CardTitle>
          <CardDescription>Daily usage patterns for the last week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
            <span className="text-muted-foreground">Chart visualization would go here</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}