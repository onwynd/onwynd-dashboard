"use client";

import { DashboardHeader } from "@/components/marketing-dashboard/header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/marketing-dashboard/sidebar";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { format, parseISO } from "date-fns";

interface Task {
  id: number;
  title: string;
  due_date?: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  campaign?: string;
}

const priorityColor: Record<string, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

export default function MarketingTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [campaign, setCampaign] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  let nextId = tasks.length + 1;

  const handleCreate = () => {
    if (!title.trim()) return;
    setTasks((prev) => [...prev, {
      id: nextId++,
      title,
      due_date: dueDate || undefined,
      priority,
      completed: false,
      campaign: campaign || undefined,
    }]);
    setTitle("");
    setDueDate("");
    setPriority("medium");
    setCampaign("");
    setDialogOpen(false);
  };

  const handleToggle = (id: number) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const displayed = tasks.filter((t) => {
    if (filter === "pending") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 p-4 sm:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
              <p className="text-muted-foreground text-sm mt-1">Track marketing tasks and campaign to-dos.</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="h-4 w-4" /> New Task</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Task</DialogTitle></DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="grid gap-2">
                    <Label>Task Title</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Write campaign copy..." />
                  </div>
                  <div className="grid gap-2">
                    <Label>Campaign (optional)</Label>
                    <Input value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="Q2 Launch..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Due Date</Label>
                      <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Priority</Label>
                      <Select value={priority} onValueChange={(v: string | null) => setPriority((v ?? "") as "low" | "medium" | "high")}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreate} disabled={!title.trim()}>Create Task</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{tasks.length}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Pending</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-yellow-600">{tasks.filter((t) => !t.completed).length}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Completed</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-green-600">{tasks.filter((t) => t.completed).length}</div></CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Task List</CardTitle>
                <div className="flex gap-1">
                  {(["all", "pending", "completed"] as const).map((f) => (
                    <Button key={f} variant={filter === f ? "default" : "ghost"} size="sm" onClick={() => setFilter(f)}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="divide-y">
              {displayed.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground text-sm">
                  {tasks.length === 0 ? "No tasks yet. Create one to get started." : "No tasks match this filter."}
                </p>
              ) : (
                displayed.map((task) => (
                  <div key={task.id} className="flex items-start gap-3 py-3">
                    <Checkbox checked={task.completed} onCheckedChange={() => handleToggle(task.id)} className="mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>{task.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {task.campaign && <span className="text-xs text-muted-foreground">{task.campaign}</span>}
                        {task.due_date && (
                          <span className="text-xs text-muted-foreground">
                            Due: {(() => { try { return format(parseISO(task.due_date), "MMM d"); } catch { return task.due_date; } })()}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className={`text-xs shrink-0 ${priorityColor[task.priority]}`}>
                      {task.priority}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
