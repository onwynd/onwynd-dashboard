"use client";

import { useEffect } from "react";
import { StatCard } from "@/components/institutional-dashboard/stat-card";
import { ChartCard } from "@/components/institutional-dashboard/chart-card";
import { ReferralsTable } from "@/components/institutional-dashboard/referrals-table";
import { RecentDocuments } from "@/components/institutional-dashboard/recent-documents";
import { UpgradeCard } from "@/components/institutional-dashboard/upgrade-card";
import { PaywallScreen } from "@/components/institutional-dashboard/paywall-screen";
import { useInstitutionalStore } from "@/store/institutional-store";

export function NgoDashboardContent() {
  const {
    stats,
    paywallCode,
    fetchStats,
    fetchMetrics,
    fetchReferrals,
    fetchDocuments,
    fetchOrganization,
  } = useInstitutionalStore();

  useEffect(() => {
    fetchOrganization();
    fetchStats();
    fetchMetrics();
    fetchReferrals();
    fetchDocuments();
  }, [fetchStats, fetchMetrics, fetchReferrals, fetchDocuments, fetchOrganization]);

  if (paywallCode) {
    return <PaywallScreen code={paywallCode} />;
  }

  // NGO-specific label remapping
  const labelMap: Record<string, string> = {
    members:    "Members",
    active:     "Active Members",
    sessions:   "Support Sessions",
    engagement: "Community Engagement",
  };

  const displayStats = stats.map((s) => ({
    ...s,
    title: labelMap[s.id] ?? s.title,
  }));

  return (
    <div className="w-full overflow-y-auto overflow-x-hidden p-4 h-full">
      <div className="mx-auto w-full space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayStats.map((stat) => (
            <StatCard
              key={stat.id}
              title={stat.title}
              value={stat.value}
              icon={(
                {
                  users: "users",
                  activity: "activity",
                  wallet: "wallet",
                  clock: "clock",
                  invoice: "invoice",
                  "file-text": "invoice",
                } as const
              )[(stat.icon || "users").toLowerCase() as keyof {
                users: "users";
                activity: "activity";
                wallet: "wallet";
                clock: "clock";
                invoice: "invoice";
                "file-text": "invoice";
              }]}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ChartCard />
            <ReferralsTable />
          </div>
          <div className="space-y-6">
            <RecentDocuments />
            <div className="lg:hidden">
              <UpgradeCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
