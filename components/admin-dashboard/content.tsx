
// filepath: components/admin-dashboard/content.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useAdminStore } from "@/store/admin-store";
import { StatsCards } from "./stats-cards";
import { RevenueFlowChart } from "./revenue-flow-chart";
import { DealsTable } from "./deals-table";
import { ActiveUsersWidget } from "./active-users-widget";
import { QuotaWidget } from "./quota-widget";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardContent() {
  const router = useRouter();
  const { isAuthenticated, hasRole } = useAuth();

  const {
    stats,
    revenueFlow,
    deals,
    activeUsers,
    quotaOverview,
    loadingStats,
    loadingRevenue,
    loadingDeals,
    loadingActiveUsers,
    loadingQuota,
    fetchStats,
    fetchRevenueFlow,
    fetchDeals,
    fetchActiveUsers,
    fetchQuotaOverview,
  } = useAdminStore();

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push("/login");
    } else if (isAuthenticated === true && !hasRole("admin")) {
      router.push("/unauthorized");
    }
  }, [isAuthenticated, hasRole, router]);
  
  useEffect(() => {
    if (isAuthenticated && hasRole("admin")) {
        fetchStats();
        fetchRevenueFlow();
        fetchDeals();
        fetchActiveUsers();
        fetchQuotaOverview();

        const interval = setInterval(() => {
            fetchStats();
            fetchActiveUsers();
        }, 60000); // Refresh every minute

        return () => clearInterval(interval);
    }
  }, [isAuthenticated, hasRole, fetchStats, fetchRevenueFlow, fetchDeals, fetchActiveUsers, fetchQuotaOverview]);

  if (!isAuthenticated || !hasRole("admin")) {
    return (
        <div className="w-full h-full flex items-center justify-center">
            <p>Loading...</p>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12">
        {loadingStats ? <StatsSkeleton /> : <StatsCards stats={stats} />}
      </div>

      <div className="col-span-12 lg:col-span-8">
        {loadingRevenue ? <ChartSkeleton /> : <RevenueFlowChart data={revenueFlow} />}
      </div>

      <div className="col-span-12 lg:col-span-4">
        {loadingDeals ? <TableSkeleton /> : <DealsTable deals={deals} />}
      </div>

      <div className="col-span-12 lg:col-span-6">
        {loadingActiveUsers ? <TableSkeleton /> : <ActiveUsersWidget users={activeUsers} />}
      </div>
      
      <div className="col-span-12 lg:col-span-6">
        {loadingQuota ? <QuotaSkeleton /> : <QuotaWidget overview={quotaOverview} />}
      </div>
    </div>
  );
}

function StatsSkeleton() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-[126px] w-full" />
            <Skeleton className="h-[126px] w-full" />
            <Skeleton className="h-[126px] w-full" />
            <Skeleton className="h-[126px] w-full" />
        </div>
    );
}

function ChartSkeleton() {
    return <Skeleton className="h-[350px] w-full" />;
}

function TableSkeleton() {
    return <Skeleton className="h-[300px] w-full" />;
}

function QuotaSkeleton() {
    return <Skeleton className="h-[300px] w-full" />;
}
