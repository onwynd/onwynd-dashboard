"use client";

import { useEffect } from "react";
import { StatCard } from "./stat-card";
import { ChartCard } from "./chart-card";
import { ReferralsTable } from "./referrals-table";
import { RecentDocuments } from "./recent-documents";
import { UpgradeCard } from "./upgrade-card";
import { PaywallScreen } from "./paywall-screen";
import { useInstitutionalStore } from "@/store/institutional-store";
import { getLabel } from "@/lib/institutional/labels";

export function DashboardContent() {
  const {
    stats,
    paywallCode,
    orgType,
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

  // Show paywall screen if the backend returned 402
  if (paywallCode) {
    return <PaywallScreen code={paywallCode} />;
  }

  const labels = {
    members: getLabel("members", orgType),
    active: getLabel("active", orgType),
  };

  // Remap stat titles based on org type
  const displayStats = stats.map((s) => ({
    ...s,
    title:
      s.id === "members"
        ? labels.members
        : s.id === "active"
        ? labels.active
        : s.title,
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
