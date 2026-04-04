"use client";

import { useEffect } from "react";
import { usePMStore } from "@/store/pm-store";
import { StatsCards } from "./stats-cards";
import { RoadmapChart } from "./roadmap-chart";
import { VelocityChart } from "./velocity-chart";
import { TasksList } from "./tasks-list";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";

export function DashboardContent() {
  const { fetchStats, fetchRoadmap, fetchVelocity, fetchTasks } = usePMStore();

  useEffect(() => {
    fetchStats();
    fetchRoadmap();
    fetchVelocity();
    fetchTasks();
  }, [fetchStats, fetchRoadmap, fetchVelocity, fetchTasks]);

  return (
    <main className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Product Dashboard</h2>
          <p className="text-muted-foreground">
            Manage roadmap, track velocity, and oversee product development.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Epic
          </Button>
        </div>
      </div>

      <StatsCards />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <RoadmapChart />
        </div>
        <div className="col-span-3">
          <VelocityChart />
        </div>
      </div>

      <div className="grid gap-4">
        <TasksList />
      </div>
    </main>
  );
}
