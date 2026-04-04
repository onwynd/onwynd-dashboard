"use client";

import { useEffect, useState, useCallback } from "react";
import client from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Users, Activity, RefreshCw, Circle } from "lucide-react";
import { EmptyState } from "./empty-state";

interface ByRoleRow {
  role: string;
  count: number;
}

interface RecentUser {
  id: number;
  first_name: string;
  last_name: string;
  last_seen_at: string;
  role?: { name: string };
}

interface ActiveUsersData {
  online_now: number;
  active_5min: number;
  active_15min: number;
  active_today: number;
  total_users: number;
  by_role: ByRoleRow[];
  recent_activity: RecentUser[];
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function ActiveUsersWidget() {
  const [data, setData] = useState<ActiveUsersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await client.get("/api/v1/admin/map/active-users");
      setData(res.data?.data ?? res.data);
      setLastRefreshed(new Date());
    } catch {
      // silently fail — widget is non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Live User Activity</h2>
          {data && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Circle className="h-2 w-2 fill-green-500 text-green-500" />
              {data.online_now} online now
            </span>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={fetchData} disabled={loading} title="Refresh">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {loading && !data ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : data ? (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="pt-4">
                <p className="text-2xl font-bold text-green-600">{data.online_now}</p>
                <p className="text-xs text-muted-foreground mt-1">Online Now</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-2xl font-bold">{data.active_5min}</p>
                <p className="text-xs text-muted-foreground mt-1">Last 5 min</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-2xl font-bold">{data.active_15min}</p>
                <p className="text-xs text-muted-foreground mt-1">Last 15 min</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-2xl font-bold">{data.active_today}</p>
                <p className="text-xs text-muted-foreground mt-1">Active Today</p>
              </CardContent>
            </Card>
          </div>

          {/* By role breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>Active Today by Role</span>
                <span className="text-xs text-muted-foreground font-normal">
                  {data.total_users.toLocaleString()} total users
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {data.by_role.length === 0 ? (
                <p className="text-xs text-muted-foreground">No activity today.</p>
              ) : (
                data.by_role.slice(0, 6).map((row) => (
                  <div key={row.role} className="flex items-center justify-between">
                    <span className="text-xs capitalize text-muted-foreground">{row.role}</span>
                    <Badge variant="secondary" className="text-xs h-5 px-1.5">
                      {row.count}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent activity feed */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Recent Activity
                {lastRefreshed && (
                  <span className="ml-auto text-xs font-normal text-muted-foreground">
                    Updated {timeAgo(lastRefreshed.toISOString())}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {data.recent_activity.slice(0, 10).map((user) => (
                  <div key={user.id} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium shrink-0">
                        {user.first_name?.[0]}{user.last_name?.[0]}
                      </span>
                      <span className="text-sm truncate">
                        {user.first_name} {user.last_name}
                      </span>
                      {user.role && (
                        <span className="text-xs text-muted-foreground capitalize hidden sm:inline">
                          · {user.role.name}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2 shrink-0">
                      {timeAgo(user.last_seen_at)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <EmptyState
          icon="users"
          title="No user activity"
          description="There is currently no user activity to display."
        />
      )}
    </div>
  );
}
