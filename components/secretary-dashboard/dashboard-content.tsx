"use client";

import { useEffect } from "react";
import { StatCard } from "./stat-card";
import { ChartCard } from "./chart-card";
import { PeopleTable } from "./people-table";
import { RecentDocuments } from "./recent-documents";
import { useSecretaryStore } from "@/store/secretary-store";

export function DashboardContent() {
  const { stats, fetchStats, fetchTasks, fetchPeople, fetchChartData, fetchDocuments } = useSecretaryStore();

  useEffect(() => {
    fetchStats();
    fetchTasks();
    fetchPeople();
    fetchChartData();
    fetchDocuments();
  }, [fetchStats, fetchTasks, fetchPeople, fetchChartData, fetchDocuments]);

  return (
    <div className="w-full overflow-y-auto overflow-x-hidden p-4 h-full">
      <div className="mx-auto w-full space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(() => {
            const s = stats;
            const cards = s
              ? [
                  { id: "today", title: "Today's Appointments", value: String(s.todayAppointments), icon: "calendar" },
                  { id: "visitors", title: "Active Visitors", value: String(s.activeVisitors), icon: "users" },
                  { id: "pending", title: "Pending Requests", value: String(s.pendingRequests), icon: "clipboard" },
                  { id: "doctors", title: "Doctors Available", value: String(s.doctorsAvailable), icon: "activity" },
                ]
              : [];
            return cards.map((stat) => (
              <StatCard key={stat.id} title={stat.title} value={stat.value} icon={stat.icon} />
            ));
          })()}
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
