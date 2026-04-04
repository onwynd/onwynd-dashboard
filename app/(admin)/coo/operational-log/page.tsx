"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cooService } from "@/lib/api/coo";
import {
  Plus,
  Milestone,
  AlertCircle,
  Gavel,
  Settings,
  FileText,
  HelpCircle,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";

const LOG_TYPE_ICONS: Record<string, React.ElementType> = {
  milestone:     Milestone,
  incident:      AlertCircle,
  decision:      Gavel,
  process:       Settings,
  investor_note: FileText,
  other:         HelpCircle,
};

const LOG_TYPE_COLORS: Record<string, string> = {
  milestone:     "bg-emerald-50 text-emerald-700",
  incident:      "bg-red-50 text-red-700",
  decision:      "bg-blue-50 text-blue-700",
  process:       "bg-amber-50 text-amber-700",
  investor_note: "bg-purple-50 text-purple-700",
  other:         "bg-gray-100 text-gray-700",
};

const DOT_COLORS: Record<string, string> = {
  milestone:     "bg-emerald-500",
  incident:      "bg-red-500",
  decision:      "bg-blue-500",
  process:       "bg-amber-warm",
  investor_note: "bg-purple-500",
  other:         "bg-gray-400",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface LogEntry {
  id: number;
  title: string;
  type: string;
  body: string;
  log_date: string;
  visibility: string;
  creator?: { first_name?: string; last_name?: string };
}

interface FormState {
  title: string;
  type: string;
  body: string;
  log_date: string;
  visibility: string;
}

const EMPTY_FORM: FormState = {
  title: "",
  type: "milestone",
  body: "",
  log_date: new Date().toISOString().split("T")[0],
  visibility: "coo_ceo",
};

export default function OperationalLogPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<LogEntry | null>(null);
  const [formData, setFormData] = useState<FormState>(EMPTY_FORM);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await cooService.getOperationalLogs();
      setLogs((res as { data: { data: { data: LogEntry[] } } }).data.data.data || []);
    } catch {
      toast({ title: "Error", description: "Failed to load operational logs", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLog) {
        await cooService.updateOperationalLog(editingLog.id, formData);
        toast({ title: "Success", description: "Log entry updated" });
      } else {
        await cooService.createOperationalLog(formData);
        toast({ title: "Success", description: "Log entry created" });
      }
      setIsDialogOpen(false);
      setEditingLog(null);
      setFormData(EMPTY_FORM);
      fetchLogs();
    } catch {
      toast({ title: "Error", description: "Failed to save log entry", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this log entry?")) return;
    try {
      await cooService.deleteOperationalLog(id);
      toast({ title: "Success", description: "Log entry deleted" });
      fetchLogs();
    } catch {
      toast({ title: "Error", description: "Failed to delete log entry", variant: "destructive" });
    }
  };

  const openEditDialog = (log: LogEntry) => {
    setEditingLog(log);
    setFormData({
      title: log.title,
      type: log.type,
      body: log.body,
      log_date: new Date(log.log_date).toISOString().split("T")[0],
      visibility: log.visibility,
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Operational Log"
        subtitle="Internal operational history and milestone log"
      >
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="gap-2 bg-teal text-white hover:bg-teal-mid"
              onClick={() => {
                setEditingLog(null);
                setFormData(EMPTY_FORM);
              }}
            >
              <Plus className="w-4 h-4" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <form onSubmit={handleCreateOrUpdate}>
              <DialogHeader>
                <DialogTitle>{editingLog ? "Edit Log Entry" : "Add New Log Entry"}</DialogTitle>
                <DialogDescription>
                  Document important operational events for future reference.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="log-title">Title</Label>
                  <Input
                    id="log-title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Series A Funding Completed"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="log-type">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: string | null) => setFormData({ ...formData, type: value ?? "" })}
                    >
                      <SelectTrigger id="log-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="milestone">Milestone</SelectItem>
                        <SelectItem value="incident">Incident</SelectItem>
                        <SelectItem value="decision">Decision</SelectItem>
                        <SelectItem value="process">Process Change</SelectItem>
                        <SelectItem value="investor_note">Investor Note</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="log-date">Date</Label>
                    <Input
                      id="log-date"
                      type="date"
                      value={formData.log_date}
                      onChange={(e) => setFormData({ ...formData, log_date: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="log-body">Content</Label>
                  <Textarea
                    id="log-body"
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    placeholder="Detailed description…"
                    className="h-32"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="log-visibility">Visibility</Label>
                  <Select
                    value={formData.visibility}
                    onValueChange={(value: string | null) => setFormData({ ...formData, visibility: value ?? "" })}
                  >
                    <SelectTrigger id="log-visibility">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coo_ceo">COO &amp; CEO Only</SelectItem>
                      <SelectItem value="all_admin">All Admin Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-teal text-white hover:bg-teal-mid">
                  {editingLog ? "Save Changes" : "Create Entry"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        {loading ? (
          <div className="space-y-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <Skeleton className="w-3 h-3 rounded-full mt-1 shrink-0" />
                  <Skeleton className="w-px flex-1 mt-1" />
                </div>
                <div className="pb-6 flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/5" />
                  <Skeleton className="h-3 w-2/3 mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <FileText className="w-12 h-12 text-gray-200 mb-4" />
            <p className="text-sm font-medium text-gray-600">No log entries yet</p>
            <p className="text-xs text-gray-400 mt-1">Add your first operational milestone or incident</p>
          </div>
        ) : (
          <div>
            {logs.map((log, idx) => {
              const Icon = LOG_TYPE_ICONS[log.type] ?? HelpCircle;
              const dotColor = DOT_COLORS[log.type] ?? "bg-gray-400";
              const badgeColor = LOG_TYPE_COLORS[log.type] ?? "bg-gray-100 text-gray-700";
              const isLast = idx === logs.length - 1;

              return (
                <div key={log.id} className="flex gap-4">
                  {/* Timeline spine */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${dotColor}`} />
                    {!isLast && <div className="w-px flex-1 bg-gray-100 mt-1" />}
                  </div>

                  {/* Entry content */}
                  <div className="pb-8 flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{log.title}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-gray-400">{formatDate(log.log_date)}</span>
                        {/* Edit / Delete actions */}
                        <button
                          onClick={() => openEditDialog(log)}
                          className="text-xs text-gray-400 hover:text-teal transition-colors px-1"
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(log.id)}
                          className="text-xs text-gray-400 hover:text-red-500 transition-colors px-1"
                          title="Delete"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}>
                        <Icon className="w-3 h-3" />
                        {log.type.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-gray-400">
                        by {log.creator?.first_name ?? "—"} {log.creator?.last_name ?? ""}
                      </span>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${
                        log.visibility === "coo_ceo" ? "bg-gray-100 text-gray-500" : "bg-teal/5 text-teal"
                      }`}>
                        {log.visibility === "coo_ceo" ? "Private" : "Shared"}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{log.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
