"use client";

import { StatCard } from "./stat-card";
import { ChartCard } from "./chart-card";
import { PeopleTable } from "./people-table";
import { RecentDocuments } from "./recent-documents";
import { useAmbassadorStore } from "@/store/ambassador-store";

export function DashboardContent() {
  const stats = useAmbassadorStore((state) => state.stats);
  const iconKeyMap = {
    Users: "users",
    DollarSign: "wallet",
    TrendingUp: "invoice",
    Award: "clipboard",
  } as const;

  return (
    <div className="w-full overflow-y-auto overflow-x-hidden p-4 h-full">
      <div className="mx-auto w-full space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={iconKeyMap[stat.iconName]}
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
