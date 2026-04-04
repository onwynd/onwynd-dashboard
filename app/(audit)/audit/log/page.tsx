"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import client from "@/lib/api/client";
import {
  RefreshCw,
  AlertTriangle,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Activity,
  Clock,
  User,
  Calendar,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────────────── */

type EventSeverity = "low" | "medium" | "high" | "critical";
type EventCategory = "auth" | "data" | "session" | "finance" | "admin" | "security" | string;

interface AuditEvent {
  id: number | string;
  timestamp: string;
  user_id?: number;
  user_name?: string;
  user_email?: string;
  role?: string;
  action: string;
  resource?: string;
  resource_id?: string | number;
  ip_address?: string;
  user_agent?: string;
  severity: EventSeverity;
  category: EventCategory;
  details?: string;
  status?: "success" | "failure" | "blocked";
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number;
  to?: number;
}

interface AuditLogResponse {
  data: AuditEvent[];
  meta?: PaginationMeta;
  // Laravel paginates at top-level too
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number;
  to?: number;
}

/* ─── Constants ──────────────────────────────────────────────────────────── */

const SEVERITY_BADGE: Record<EventSeverity | string, string> = {
  low:      "bg-gray-100 text-gray-700 hover:bg-gray-100",
  medium:   "bg-yellow-50 text-yellow-700 hover:bg-yellow-50",
  high:     "bg-orange-50 text-orange-700 hover:bg-orange-50",
  critical: "bg-red-50 text-red-700 hover:bg-red-50",
};

const STATUS_BADGE: Record<string, string> = {
  success: "bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
  failure: "bg-red-50 text-red-700 hover:bg-red-50",
  blocked: "bg-orange-50 text-orange-700 hover:bg-orange-50",
};

const CATEGORIES: { value: string; label: string }[] = [
  { value: "all",      label: "All Categories"  },
  { value: "auth",     label: "Authentication"  },
  { value: "session",  label: "Sessions"        },
  { value: "data",     label: "Data Access"     },
  { value: "finance",  label: "Finance"         },
  { value: "admin",    label: "Admin Actions"   },
  { value: "security", label: "Security"        },
];

const SEVERITIES: { value: string; label: string }[] = [
  { value: "all",      label: "All Severities" },
  { value: "low",      label: "Low"            },
  { value: "medium",   label: "Medium"         },
  { value: "high",     label: "High"           },
  { value: "critical", label: "Critical"       },
];

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function formatTs(ts: string) {
  const d = new Date(ts);
  return {
    date: d.toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  };
}

function downloadCSV(events: AuditEvent[]) {
  const headers = ["ID", "Timestamp", "User", "Email", "Role", "Action", "Resource", "IP", "Severity", "Category", "Status"];
  const rows = events.map((e) => [
    e.id,
    e.timestamp,
    e.user_name ?? "",
    e.user_email ?? "",
    e.role ?? "",
    e.action,
    e.resource ?? "",
    e.ip_address ?? "",
    e.severity,
    e.category,
    e.status ?? "",
  ]);
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function AuditLogPage() {
  const [events,   setEvents]   = useState<AuditEvent[]>([]);
  const [meta,     setMeta]     = useState<PaginationMeta | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | number | null>(null);

  // filters
  const [search,    setSearch]    = useState("");
  const [category,  setCategory]  = useState("all");
  const [severity,  setSeverity]  = useState("all");
  const [dateFrom,  setDateFrom]  = useState("");
  const [dateTo,    setDateTo]    = useState("");
  const [page,      setPage]      = useState(1);
  const perPage = 25;

  const fetchLog = useCallback(async (p = page) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = { page: p, per_page: perPage };
      if (search)                  params.search   = search;
      if (category !== "all")      params.category = category;
      if (severity !== "all")      params.severity = severity;
      if (dateFrom)                params.from     = dateFrom;
      if (dateTo)                  params.to       = dateTo;

      const res = await client.get<AuditLogResponse>("/api/v1/audit/log", { params });
      const body = res.data?.data ? res.data : { data: (res.data as unknown as AuditEvent[]) ?? [], meta: undefined };

      setEvents(Array.isArray(body.data) ? body.data : []);

      // normalise Laravel pagination
      const m: PaginationMeta = body.meta ?? {
        current_page: (res.data as AuditLogResponse).current_page ?? p,
        last_page:    (res.data as AuditLogResponse).last_page    ?? 1,
        per_page:     (res.data as AuditLogResponse).per_page     ?? perPage,
        total:        (res.data as AuditLogResponse).total        ?? 0,
        from:         (res.data as AuditLogResponse).from,
        to:           (res.data as AuditLogResponse).to,
      };
      setMeta(m);
    } catch {
      setError("Unable to load audit log. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, search, category, severity, dateFrom, dateTo]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchLog(page);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => { setPage(1); fetchLog(1); };

  const clearFilters = () => {
    setSearch(""); setCategory("all"); setSeverity("all");
    setDateFrom(""); setDateTo(""); setPage(1);
    // fetchLog called by next render via page dep — trigger manually
    setTimeout(() => fetchLog(1), 0);
  };

  const hasFilters = search || category !== "all" || severity !== "all" || dateFrom || dateTo;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Immutable record of every significant platform event
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => downloadCSV(events)}
            disabled={events.length === 0}
          >
            <Download className="size-4" /> Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => fetchLog(page)}
            disabled={loading}
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary bar */}
      {meta && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Events", value: meta.total.toLocaleString(), icon: Activity,  color: "text-blue-600"    },
            { label: "This Page",    value: `${meta.from ?? "—"}–${meta.to ?? "—"}`,     icon: Calendar, color: "text-slate-600" },
            { label: "Page",         value: `${meta.current_page} / ${meta.last_page}`,  icon: Clock,    color: "text-slate-600" },
            { label: "Per Page",     value: String(meta.per_page),                       icon: User,     color: "text-slate-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="py-3 px-4">
              <div className="flex items-center gap-2">
                <Icon className={`size-4 shrink-0 ${color}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-semibold">{value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex flex-wrap gap-3 items-end">
            {/* Search */}
            <div className="flex-1 min-w-44">
              <p className="text-xs font-medium mb-1">Search</p>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="User, action, IP…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-8 h-9"
                />
              </div>
            </div>

            {/* Category */}
            <div className="min-w-40">
              <p className="text-xs font-medium mb-1">Category</p>
              <Select value={category} onValueChange={(v) => v !== null && setCategory(v)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Severity */}
            <div className="min-w-36">
              <p className="text-xs font-medium mb-1">Severity</p>
              <Select value={severity} onValueChange={(v) => v !== null && setSeverity(v)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SEVERITIES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date from */}
            <div className="min-w-36">
              <p className="text-xs font-medium mb-1">From</p>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9"
              />
            </div>

            {/* Date to */}
            <div className="min-w-36">
              <p className="text-xs font-medium mb-1">To</p>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9"
              />
            </div>

            <div className="flex gap-2 pb-0.5">
              <Button size="sm" onClick={handleSearch} disabled={loading} className="gap-1">
                <Search className="size-3.5" /> Search
              </Button>
              {hasFilters && (
                <Button size="sm" variant="ghost" onClick={clearFilters} className="gap-1 text-muted-foreground">
                  <X className="size-3.5" /> Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Table */}
      <Card>
        <CardHeader className="py-3 px-4 border-b">
          <CardTitle className="text-sm font-semibold">Event Log</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No audit events match the current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-36">Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead className="w-24">Category</TableHead>
                    <TableHead className="w-20">Severity</TableHead>
                    <TableHead className="w-20">Status</TableHead>
                    <TableHead className="w-28">IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((ev) => {
                    const { date, time } = formatTs(ev.timestamp);
                    const isExpanded = expanded === ev.id;
                    return (
                      <>
                        <TableRow
                          key={ev.id}
                          className="cursor-pointer hover:bg-muted/40"
                          onClick={() => setExpanded(isExpanded ? null : ev.id)}
                        >
                          <TableCell className="text-xs text-muted-foreground">
                            <div>{date}</div>
                            <div className="font-mono">{time}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium line-clamp-1">{ev.user_name ?? "System"}</div>
                            {ev.role && (
                              <div className="text-xs text-muted-foreground capitalize">{ev.role}</div>
                            )}
                          </TableCell>
                          <TableCell className="text-sm font-medium">{ev.action}</TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-40 truncate">
                            {ev.resource ?? "—"}
                            {ev.resource_id ? ` #${ev.resource_id}` : ""}
                          </TableCell>
                          <TableCell>
                            <span className="text-xs capitalize px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {ev.category}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-xs ${SEVERITY_BADGE[ev.severity] ?? SEVERITY_BADGE.low}`}>
                              {ev.severity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {ev.status ? (
                              <Badge className={`text-xs ${STATUS_BADGE[ev.status] ?? ""}`}>
                                {ev.status}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground">
                            {ev.ip_address ?? "—"}
                          </TableCell>
                        </TableRow>

                        {/* Expandable detail row */}
                        {isExpanded && (
                          <TableRow key={`${ev.id}-detail`} className="bg-muted/20">
                            <TableCell colSpan={8} className="py-3 px-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                {ev.user_email && (
                                  <div>
                                    <p className="font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Email</p>
                                    <p>{ev.user_email}</p>
                                  </div>
                                )}
                                {ev.user_agent && (
                                  <div>
                                    <p className="font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">User Agent</p>
                                    <p className="font-mono break-all">{ev.user_agent}</p>
                                  </div>
                                )}
                                {ev.details && (
                                  <div className="sm:col-span-2">
                                    <p className="font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Details</p>
                                    <p className="whitespace-pre-wrap">{ev.details}</p>
                                  </div>
                                )}
                                <div>
                                  <p className="font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Event ID</p>
                                  <p className="font-mono">{ev.id}</p>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {meta.total.toLocaleString()} total events
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={meta.current_page <= 1 || loading}
              className="gap-1"
            >
              <ChevronLeft className="size-4" /> Prev
            </Button>
            <span className="text-sm font-medium px-2">
              {meta.current_page} / {meta.last_page}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
              disabled={meta.current_page >= meta.last_page || loading}
              className="gap-1"
            >
              Next <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
