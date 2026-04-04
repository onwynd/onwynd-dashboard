"use client";

import { useEffect } from "react";
import { StatCard } from "./stat-card";
import { ChartCard } from "./chart-card";
import { PeopleTable } from "./people-table";
import { RecentDocuments } from "./recent-documents";
import { useDashboardStore } from "@/store/dashboard-store";
import { useGamificationStore } from "@/store/gamification-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Trophy, Target } from "lucide-react";
import { QuotaStatusCards } from "./quota-status-cards";

// derive role from cookie (for endpoint availability)
function getUserRole(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(/(?:^|; )user_role=([^;]+)/);
  return match?.[1];
}

export function DashboardContent() {
  const { stats, isLoading, fetchStats, fetchPeople, fetchDocuments, fetchChartData } =
    useDashboardStore();
  const streak = useGamificationStore((state) => state.streak);
  const badges = useGamificationStore((state) => state.badges);
  const currentChallenge = useGamificationStore((state) => state.currentChallenge);
  const gamificationLoading = useGamificationStore((state) => state.isLoading);
  const fetchGamificationData = useGamificationStore((state) => state.fetchGamificationData);
  const iconKeyMap = {
    users: "users",
    clipboard: "clipboard",
    wallet: "wallet",
    "file-text": "invoice",
    invoice: "invoice",
  } as const;

  const role = getUserRole();

  useEffect(() => {
    fetchStats();
    fetchChartData("week");
  }, [fetchStats, fetchChartData]);

  useEffect(() => {
    if (role && role !== "patient") {
      fetchPeople();
      fetchDocuments();
      fetchGamificationData();
    }
  }, [role, fetchPeople, fetchDocuments, fetchGamificationData]);

  return (
    <div className="w-full overflow-y-auto overflow-x-hidden p-4 h-full">
      <div className="mx-auto w-full space-y-6">
        
        {/* Gamification Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {gamificationLoading ? (
            [0, 1, 2].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                  <Flame className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{streak?.current_streak || 0} Days</div>
                  <p className="text-xs text-muted-foreground">Keep it up!</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
                  <Trophy className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{badges?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">Latest: {badges?.[0]?.name || "None yet"}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Challenge</CardTitle>
                  <Target className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold truncate">{currentChallenge?.title || "No Active Challenge"}</div>
                  <p className="text-xs text-muted-foreground">{currentChallenge ? "Goal: " + currentChallenge.goal_count : "Join one now!"}</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Quota Status — patients only */}
        {role === "patient" && <QuotaStatusCards />}

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            [0, 1, 2, 3].map((i) => (
              <div key={i} className="relative overflow-hidden rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="size-16 rounded-lg" />
                </div>
              </div>
            ))
          ) : (
            stats.map((stat) => (
              <StatCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                icon={iconKeyMap[(stat.iconName || "users").toLowerCase() as keyof typeof iconKeyMap]}
              />
            ))
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard />
          <RecentDocuments />
        </div>

        <PeopleTable />
      </div>
    </div>
  );
}
