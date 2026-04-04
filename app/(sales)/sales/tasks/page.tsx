"use client";

import { useEffect, useState } from "react";
import { useSalesStore, SalesTask } from "@/store/sales-store";
import { salesService } from "@/lib/api/sales";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { format, parseISO } from "date-fns";

const priorityColor: Record<string, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

export default function SalesTasksPage() {
  const tasks = useSalesStore((state) => state.tasks);
  const fetchTasks = useSalesStore((state) => state.fetchTasks);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await salesService.createTask({ title, due_date: dueDate || undefined, priority });
      toast({ description: "Task created" });
      setTitle("");
      setDueDate("");
      setPriority("medium");
      setDialogOpen(false);
      fetchTasks();
    } catch {
      toast({ description: "Failed to create task", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (task: SalesTask) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    try {
      await salesService.updateTask(task.id, { status: newStatus });
      fetchTasks();
    } catch {
      toast({ description: "Failed to update task", variant: "destructive" });
    }
  };

  const displayed = tasks.filter((t) => {
    if (filter === "all") return true;
    return t.status === filter;
  });

  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  return (
    <main className="flex-1 p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground text-sm mt-1">Track your sales follow-up tasks.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> New Task</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid gap-2">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Follow up with client..." />
              </div>
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
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={submitting || !title.trim()}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Tasks</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{tasks.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Pending</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-yellow-600">{pendingCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Completed</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{completedCount}</div></CardContent>
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
            <p className="py-8 text-center text-muted-foreground text-sm">No tasks found.</p>
          ) : (
            displayed.map((task) => (
              <div key={task.id} className="flex items-start gap-3 py-3">
                <Checkbox
                  checked={task.status === "completed"}
                  onCheckedChange={() => handleToggle(task)}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                    {task.title}
                  </p>
                  {task.due_date && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Due: {(() => { try { return format(parseISO(task.due_date), "MMM d, yyyy"); } catch { return task.due_date; } })()}
                    </p>
                  )}
                </div>
                <Badge variant="secondary" className={`text-xs ${priorityColor[task.priority] ?? ""}`}>
                  {task.priority}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </main>
  );
}
