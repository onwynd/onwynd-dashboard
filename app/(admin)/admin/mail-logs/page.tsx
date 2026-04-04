"use client";

import { useEffect, useState, useCallback } from "react";
import {
  adminMailLogService,
  type MailLogEntry,
  type MailLogStats,
  type MailLogFilters,
} from "@/lib/api/admin-mail-logs.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Loader2, Trash2, RefreshCw, Search, Mail, CheckCircle2,
  XCircle, AlertTriangle, MoreHorizontal, Eye, Clock,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

function statusBadge(status: "sent" | "failed") {
  if (status === "sent") {
    return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1"><CheckCircle2 className="h-3 w-3" />Sent</Badge>;
  }
  return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 gap-1"><XCircle className="h-3 w-3" />Failed</Badge>;
}

function shortClass(cls: string | null): string {
  if (!cls) return "—";
  return cls.split("\\").pop() ?? cls;
}

export default function MailLogsPage() {
  const [logs, setLogs] = useState<MailLogEntry[]>([]);
  const [stats, setStats] = useState<MailLogStats | null>(null);
  const [pagination, setPagination] = useState({ total: 0, last_page: 1, current_page: 1, per_page: 50 });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<MailLogFilters["status"]>("all");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<MailLogEntry | null>(null);
  const [purging, setPurging] = useState(false);

  const fetchLogs = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const data = await adminMailLogService.getLogs({ status: statusFilter, search: search || undefined, page, per_page: 50 });
      setLogs(data.logs ?? []);
      setStats(data.stats ?? null);
      setPagination(data.pagination ?? { total: 0, last_page: 1, current_page: 1, per_page: 50 });
    } catch {
      toast({ title: "Error", description: "Failed to load mail logs", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleDelete = async (id: number) => {
    try {
      await adminMailLogService.deleteLog(id);
      setLogs((prev) => prev.filter((l) => l.id !== id));
      if (detail?.id === id) setDetail(null);
    } catch {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  const handlePurge = async (days: number) => {
    if (!confirm(`Delete all log entries older than ${days} days?`)) return;
    setPurging(true);
    try {
      const res = await adminMailLogService.purge(days);
      toast({ title: `${res.deleted} entries purged.` });
      fetchLogs();
    } catch {
      toast({ title: "Error", description: "Purge failed.", variant: "destructive" });
    } finally {
      setPurging(false);
    }
  };

  const failureRate = stats && stats.sent_24h + stats.failed_24h > 0
    ? ((stats.failed_24h / (stats.sent_24h + stats.failed_24h)) * 100).toFixed(1)
    : "0";

  return (
    <div className="flex-1 space-y-5 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Mail Logs</h2>
          <p className="text-muted-foreground">Track every outgoing email — sent and failed — with full diagnostics.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchLogs(pagination.current_page)}>
            <RefreshCw className="mr-2 h-4 w-4" />Refresh
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={purging}>
                {purging ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Purge old logs
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {[30, 60, 90].map((days) => (
                <DropdownMenuItem key={days} onClick={() => handlePurge(days)}>Older than {days} days</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Total",         value: stats.total,      Icon: Mail,          color: "text-foreground" },
            { label: "Sent",          value: stats.sent,       Icon: CheckCircle2,  color: "text-green-600" },
            { label: "Failed",        value: stats.failed,     Icon: XCircle,       color: "text-red-600" },
            { label: "Sent (24h)",    value: stats.sent_24h,   Icon: Clock,         color: "text-blue-600" },
            { label: "Failed (24h)",  value: `${stats.failed_24h} (${failureRate}%)`, Icon: AlertTriangle, color: stats.failed_24h > 0 ? "text-red-600" : "text-muted-foreground" },
          ].map(({ label, value, Icon, color }) => (
            <Card key={label}>
              <CardContent className="pt-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-xl font-bold">{value}</p>
                </div>
                <Icon className={`h-6 w-6 opacity-20 ${color}`} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search recipient, subject, type…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchLogs()}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as MailLogFilters["status"])}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader><CardTitle>Log Entries ({pagination.total})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-48 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No log entries found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Mail Type</TableHead>
                  <TableHead>Failure Reason</TableHead>
                  <TableHead>When</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} className={log.status === "failed" ? "bg-red-50/40 dark:bg-red-950/10" : ""}>
                    <TableCell>{statusBadge(log.status)}</TableCell>
                    <TableCell className="text-sm font-mono text-xs">{log.recipient}</TableCell>
                    <TableCell className="text-sm max-w-[160px] truncate text-muted-foreground">{log.subject ?? "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{shortClass(log.mailable_class)}</TableCell>
                    <TableCell className="max-w-[180px]">
                      {log.failure_reason ? (
                        <span className="text-xs text-red-600 truncate block" title={log.failure_reason}>
                          {log.failure_reason.slice(0, 55)}{log.failure_reason.length > 55 ? "…" : ""}
                        </span>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setDetail(log)}><Eye className="mr-2 h-4 w-4" />View Details</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(log.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />Delete Entry
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={pagination.current_page <= 1}
            onClick={() => fetchLogs(pagination.current_page - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {pagination.current_page} of {pagination.last_page}</span>
          <Button variant="outline" size="sm" disabled={pagination.current_page >= pagination.last_page}
            onClick={() => fetchLogs(pagination.current_page + 1)}>Next</Button>
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Mail Log Detail</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-2 flex-wrap">
                {statusBadge(detail.status)}
                <span className="text-xs text-muted-foreground font-mono">{shortClass(detail.mailable_class)}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Recipient</p>
                  <p className="font-mono text-xs break-all">{detail.recipient}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Time</p>
                  <p>{new Date(detail.created_at).toLocaleString()}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground mb-0.5">Subject</p>
                  <p>{detail.subject ?? "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground mb-0.5">Mailable Class</p>
                  <p className="font-mono text-xs break-all">{detail.mailable_class ?? "—"}</p>
                </div>
              </div>
              {detail.failure_reason && (
                <div>
                  <p className="text-xs font-medium text-red-600 mb-1">Failure Reason</p>
                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-3">
                    <p className="text-xs font-mono text-red-700 dark:text-red-400 whitespace-pre-wrap break-all">{detail.failure_reason}</p>
                  </div>
                </div>
              )}
              {detail.metadata && Object.keys(detail.metadata).length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Metadata</p>
                  <div className="bg-muted/40 rounded-lg p-3 space-y-1">
                    {Object.entries(detail.metadata).map(([k, v]) => (
                      <div key={k} className="flex gap-2 text-xs">
                        <span className="text-muted-foreground font-mono w-32 shrink-0">{k}</span>
                        <span className="break-all">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end pt-1 border-t">
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(detail.id)}>
                  <Trash2 className="mr-2 h-3.5 w-3.5" />Delete Entry
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
