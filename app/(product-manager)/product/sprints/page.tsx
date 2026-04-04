"use client";

import { TasksList } from "@/components/pm-dashboard/tasks-list";

export default function PMSprintsPage() {
  // In a real implementation, this would fetch sprints data
  // For now, we reuse TasksList which shows tasks (items in a sprint)

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Active Sprints</h2>
      </div>
      <TasksList />
    </div>
  );
}
