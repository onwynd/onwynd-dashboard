"use client";

import { useEffect } from "react";
import { StatCard } from "./stat-card";
import { ChartCard } from "./chart-card";
import { PeopleTable } from "./people-table";
import { RecentDocuments } from "./recent-documents";
import { useEmployeeStore } from "@/store/employee-store";

export function DashboardContent() {
  const { stats, fetchStats, fetchPeople, fetchDocuments, fetchChartData } = useEmployeeStore();
  const iconKeyMap = {
    users: "users",
    clipboard: "clipboard",
    wallet: "wallet",
    clock: "clock",
    calendar: "calendar",
    "file-text": "file-text",
    invoice: "invoice",
  } as const;

  useEffect(() => {
    fetchStats();
    fetchPeople();
    fetchDocuments();
    fetchChartData("week");
  }, [fetchStats, fetchPeople, fetchDocuments, fetchChartData]);

  return (
    <div className="w-full overflow-y-auto overflow-x-hidden p-4 h-full">
      <div className="mx-auto w-full space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.id}
              title={stat.title}
              value={stat.value}
              icon={iconKeyMap[(stat.icon || "users").toLowerCase() as keyof typeof iconKeyMap]}
            />
          ))}
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
