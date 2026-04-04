"use client";

import { useEffect } from "react";
import { AlertBanner } from "./alert-banner";
import { SecretaryStatsCards } from "./stats-cards";
import { CalendarView } from "./calendar-view";
import { TasksList } from "./tasks-list";
import { ChartCard } from "./chart-card";
import { RecentDocuments } from "./recent-documents";
import { PeopleTable } from "./people-table";
import { useSecretaryStore } from "@/store/secretary-store";
import { cn } from "@/lib/utils";

export function DashboardContent() {
  const { fetchStats, fetchTasks, fetchCalendarEvents, fetchPeople, fetchDocuments, fetchChartData } = useSecretaryStore();
  const showAlertBanner = useSecretaryStore((state) => state.showAlertBanner);
  const showStatsCards = useSecretaryStore((state) => state.showStatsCards);
  const showCalendar = useSecretaryStore((state) => state.showCalendar);
  const showTasks = useSecretaryStore((state) => state.showTasks);
  const layoutDensity = useSecretaryStore((state) => state.layoutDensity);

  useEffect(() => {
    fetchStats();
    fetchTasks();
    fetchCalendarEvents();
    fetchPeople();
    fetchDocuments();
    fetchChartData();
  }, [fetchStats, fetchTasks, fetchCalendarEvents, fetchPeople, fetchDocuments, fetchChartData]);

  return (
    <main
      className={cn(
        "w-full flex-1 overflow-auto",
        layoutDensity === "compact" && "p-2 sm:p-4 space-y-4",
        layoutDensity === "comfortable" && "p-6 sm:p-8 space-y-8 sm:space-y-10",
        layoutDensity === "spacious" && "p-8 sm:p-10 space-y-10 sm:space-y-12"
      )}
    >
      {showAlertBanner && <AlertBanner />}
      {showStatsCards && <SecretaryStatsCards />}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={cn("lg:col-span-2", !showTasks && "lg:col-span-3")}>
          {showCalendar && <CalendarView />}
        </div>
        <div className={cn("lg:col-span-1", !showCalendar && "lg:col-span-3")}>
          {showTasks && <TasksList />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard />
        <RecentDocuments />
      </div>

      <PeopleTable />
    </main>
  );
}
