"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useSecretaryStore } from "@/store/secretary-store";

export function TasksList() {
  const { tasks } = useSecretaryStore();

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Daily Tasks</CardTitle>
          <CardDescription>Manage your daily to-do list</CardDescription>
        </div>
        <Button size="icon" variant="ghost">
          <Plus className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
            <Checkbox id={task.id.toString()} checked={task.status === "done"} />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor={task.id.toString()}
                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                  task.status === "done" ? "line-through text-muted-foreground" : ""
                }`}
              >
                {task.title}
              </label>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
