"use client";

import { useEffect, useState, useCallback } from "react";
import client from "@/lib/api/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { ShieldAlert, CheckCircle2, Clock, AlertTriangle, Search, RefreshCw, ExternalLink } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface AuditLog {
  id: number;
  session_uuid: string;
  audit_status: "pending" | "processing" | "clean" | "flagged" | "error";
  risk_score: number | null;
  violations: Violation[] | null;
  reviewed: boolean;
  reviewed_at: string | null;
  duration_seconds: number | null;
  created_at: string;
  session?: { uuid: string; scheduled_at: string; status: string };
}

interface Violation {
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  quote: string;
  recommendation: string;
}

const STATUS_CONFIG = {
  pending:    { label: "Pending",    icon: Clock,          color: "bg-gray-100 text-gray-600" },
  processing: { label: "Processing", icon: Clock,          color: "bg-blue-100 text-blue-600" },
  clean:      { label: "Clean",      icon: CheckCircle2,   color: "bg-emerald-100 text-emerald-700" },
  flagged:    { label: "Flagged",    icon: ShieldAlert,    color: "bg-red-100 text-red-700" },
  error:      { label: "Error",      icon: AlertTriangle,  color: "bg-orange-100 text-orange-700" },
};

const SEVERITY_COLOR: Record<string, string> = {
  critical: "bg-red-600 text-white",
  high:     "bg-red-100 text-red-700",
  medium:   "bg-orange-100 text-orange-700",
  low:      "bg-yellow-100 text-yellow-700",
};

function RiskBar({ score }: { score: number | null }) {
  if (score === null) return <span className="text-xs text-muted-foreground">—</span>;
  const pct = Math.round(score * 100);
  const color = pct >= 70 ? "bg-red-500" : pct >= 40 ? "bg-orange-400" : "bg-emerald-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium tabular-nums">{pct}%</span>
    </div>
  );
}

export default function ClinicalSessionAuditsPage() {
  const [audits, setAudits]         = useState<AuditLog[]>([]);
  const [loading, setLoading]       = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [status, setStatus]         = useState<string>("all");
  const [search, setSearch]         = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setUnavailable(false);
    try {
      const params: Record<string, string> = {};
      if (status !== "all") params.status = status;
      // Use clinical advisor endpoint instead of admin
      const res = await client.get("/api/v1/clinical-advisor/session-audits", { params, suppressErrorToast: true });
      const data = res.data?.data ?? res.data;
      setAudits(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
    } catch (err: any) {
      const s = err?.response?.status;
      if (s === 404 || s === undefined) setUnavailable(true);
      setAudits([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const filtered = audits.filter((a) => {
    if (!search) return true;
    return a.session_uuid.includes(search);
  });

  const flaggedCount = audits.filter((a) => a.audit_status === "flagged" && !a.reviewed).length;

  return (
    <div className="space-y-6 p-4 md:p-8 pt-6">
      <PageHeader
        title="AI Session Audits"
        description="Review AI-generated session audit reports to ensure quality and compliance"
      />

      {unavailable && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="size-4 shrink-0" />
          <span>AI session audit endpoint is not yet available on this server. Deploy the latest backend to enable this feature.</span>
        </div>
      )}

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["flagged", "clean", "processing", "error"] as const).map((s) => {
          const cfg = STATUS_CONFIG[s];
          const count = audits.filter((a) => a.audit_status === s).length;
          return (
            <Card key={s} className="p-3 flex items-center gap-3">
              <cfg.icon className="size-5 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground capitalize">{cfg.label}</p>
                <p className="text-xl font-bold">{count}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {flaggedCount > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          <ShieldAlert className="size-4 shrink-0" />
          <span><strong>{flaggedCount}</strong> flagged session{flaggedCount !== 1 ? "s" : ""} awaiting review.</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by session UUID…"
            className="pl-8 h-8 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={(v) => v !== null && setStatus(v)}>
          <SelectTrigger className="w-40 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
            <SelectItem value="clean">Clean</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="h-8">
          <RefreshCw className={`size-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">Session</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">Status</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">Risk</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">Top violation</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">Duration</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">Reviewed</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">Age</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-3 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground text-sm">
                      No audit logs found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((a) => {
                    const cfg = STATUS_CONFIG[a.audit_status] ?? STATUS_CONFIG.pending;
                    const topViolation = a.violations?.[0];
                    return (
                      <tr key={a.id} className="border-b hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {a.session_uuid.slice(0, 8)}…
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                            <cfg.icon className="size-3" />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <RiskBar score={a.risk_score} />
                        </td>
                        <td className="px-4 py-3">
                          {topViolation ? (
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${SEVERITY_COLOR[topViolation.severity] ?? ""}`}>
                              {topViolation.type.replace(/_/g, " ")}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {a.duration_seconds ? `${Math.round(a.duration_seconds / 60)}m` : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {a.reviewed ? (
                            <span className="text-xs text-emerald-600 font-medium">Reviewed</span>
                          ) : a.audit_status === "flagged" ? (
                            <span className="text-xs text-red-600 font-medium">Pending</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/clinical/sessions/${a.session_uuid}/review`}>
                            <Button variant="ghost" size="icon" className="size-7">
                              <ExternalLink className="size-3.5" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}