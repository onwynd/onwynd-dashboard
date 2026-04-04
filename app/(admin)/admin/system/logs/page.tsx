"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { adminService } from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import {
  Loader2,
  RefreshCw,
  Trash2,
  FileText,
  Filter,
  Search,
  AlertCircle,
  AlertTriangle,
  Info,
  Bug,
} from "lucide-react";

interface LogLine {
  timestamp: string | null;
  level: string;
  message: string;
  raw: string;
}

interface LogData {
  lines: LogLine[];
  total: number;
  file_size: number;
}

const LEVEL_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  error:     { label: "Error",     color: "bg-red-100 text-red-700 border-red-200",     icon: AlertCircle },
  critical:  { label: "Critical",  color: "bg-red-100 text-red-800 border-red-300",     icon: AlertCircle },
  alert:     { label: "Alert",     color: "bg-red-100 text-red-700 border-red-200",     icon: AlertCircle },
  emergency: { label: "Emergency", color: "bg-red-200 text-red-900 border-red-400",     icon: AlertCircle },
  warning:   { label: "Warning",   color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: AlertTriangle },
  notice:    { label: "Notice",    color: "bg-blue-100 text-blue-700 border-blue-200",  icon: Info },
  info:      { label: "Info",      color: "bg-blue-100 text-blue-600 border-blue-200",  icon: Info },
  debug:     { label: "Debug",     color: "bg-gray-100 text-gray-600 border-gray-200",  icon: Bug },
};

const ROW_COLORS: Record<string, string> = {
  error:     "border-l-4 border-l-red-500 bg-red-50/40",
  critical:  "border-l-4 border-l-red-600 bg-red-50/60",
  alert:     "border-l-4 border-l-red-500 bg-red-50/40",
  emergency: "border-l-4 border-l-red-700 bg-red-50/80",
  warning:   "border-l-4 border-l-yellow-400 bg-yellow-50/40",
  notice:    "border-l-4 border-l-blue-400 bg-blue-50/30",
  info:      "border-l-4 border-l-blue-400 bg-blue-50/20",
  debug:     "border-l-4 border-l-gray-300 bg-transparent",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function LogsPage() {
  const [data, setData] = useState<LogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [lines, setLines] = useState("200");
  const [levelFilter, setLevelFilter] = useState("all");
  const [search, setSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getLogs(Number(lines));
      setData(res as any);
    } catch {
      toast({ title: "Failed to load logs", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [lines]);

  useEffect(() => { load(); }, [load]);

  // Auto-scroll to bottom on new data
  useEffect(() => {
    if (data && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [data]);

  const handleClear = async () => {
    setClearing(true);
    try {
      await adminService.clearLogs();
      toast({ title: "Logs cleared successfully" });
      setData({ lines: [], total: 0, file_size: 0 });
    } catch {
      toast({ title: "Failed to clear logs", variant: "destructive" });
    } finally {
      setClearing(false);
      setClearOpen(false);
    }
  };

  const filtered = data?.lines.filter((l) => {
    if (levelFilter !== "all" && l.level !== levelFilter) return false;
    if (search && !l.message.toLowerCase().includes(search.toLowerCase()) && !l.raw.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }) ?? [];

  const levelCounts = data?.lines.reduce<Record<string, number>>((acc, l) => {
    acc[l.level] = (acc[l.level] ?? 0) + 1;
    return acc;
  }, {}) ?? {};

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Laravel Logs
          </h1>
          {data && (
            <p className="text-sm text-muted-foreground mt-1">
              {data.total.toLocaleString()} total lines · {formatBytes(data.file_size)} on disk
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setClearOpen(true)}
            disabled={clearing || loading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Logs
          </Button>
        </div>
      </div>

      {/* Level summary chips */}
      {data && data.lines.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(levelCounts)
            .sort(([a], [b]) => {
              const order = ["emergency","critical","alert","error","warning","notice","info","debug"];
              return order.indexOf(a) - order.indexOf(b);
            })
            .map(([level, count]) => {
              const cfg = LEVEL_CONFIG[level] ?? LEVEL_CONFIG.debug;
              return (
                <button
                  key={level}
                  onClick={() => setLevelFilter(levelFilter === level ? "all" : level)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${cfg.color} ${levelFilter === level ? "ring-2 ring-offset-1 ring-current" : "opacity-80 hover:opacity-100"}`}
                >
                  {cfg.label}: {count}
                </button>
              );
            })}
          {levelFilter !== "all" && (
            <button
              onClick={() => setLevelFilter("all")}
              className="px-3 py-1 rounded-full text-xs font-semibold border bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              Show all
            </button>
          )}
        </div>
      )}

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search log messages…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={levelFilter} onValueChange={(v) => setLevelFilter(v ?? "all")}>
            <SelectTrigger className="w-36">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="alert">Alert</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="notice">Notice</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="debug">Debug</SelectItem>
            </SelectContent>
          </Select>
          <Select value={lines} onValueChange={(v) => setLines(v ?? "200")}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">Last 50</SelectItem>
              <SelectItem value="200">Last 200</SelectItem>
              <SelectItem value="500">Last 500</SelectItem>
              <SelectItem value="1000">Last 1 000</SelectItem>
              <SelectItem value="2000">Last 2 000</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Log output */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Showing {filtered.length} of {data?.lines.length ?? 0} loaded lines
            {search && ` · filtered by "${search}"`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
              <FileText className="h-10 w-10 opacity-30" />
              <p>{data?.lines.length === 0 ? "Log file is empty." : "No log entries match your filters."}</p>
            </div>
          ) : (
            <ScrollArea className="h-[560px] font-mono text-xs">
              <div className="divide-y divide-border">
                {filtered.map((line, idx) => {
                  const cfg = LEVEL_CONFIG[line.level] ?? LEVEL_CONFIG.debug;
                  const Icon = cfg.icon;
                  const rowColor = ROW_COLORS[line.level] ?? "";
                  return (
                    <div key={idx} className={`px-4 py-2 flex gap-3 items-start hover:bg-muted/30 transition-colors ${rowColor}`}>
                      <div className="flex-shrink-0 mt-0.5">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={`text-[10px] py-0 px-1.5 ${cfg.color}`}>
                            {cfg.label}
                          </Badge>
                          {line.timestamp && (
                            <span className="text-muted-foreground text-[11px]">{line.timestamp}</span>
                          )}
                        </div>
                        <p className="break-all leading-relaxed text-foreground/90">{line.message}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Clear confirmation */}
      <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all logs?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently truncate <strong>storage/logs/laravel.log</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleClear}
              disabled={clearing}
            >
              {clearing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Clear Logs
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
