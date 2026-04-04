"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import client from "@/lib/api/client";
import { RefreshCw, ShieldCheck, AlertTriangle, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface ComplianceCheck {
  label: string;
  status: "pass" | "fail" | "warn";
  description?: string;
  last_checked?: string;
  owner?: string;
}

interface ComplianceData {
  compliance_score?: number;
  open_issues?: number;
  resolved_issues?: number;
  checks?: ComplianceCheck[];
  last_audit_date?: string;
}

const STATUS_CONFIG = {
  pass: { icon: CheckCircle2, color: "text-emerald-600", badge: "bg-emerald-50 text-emerald-700 hover:bg-emerald-50", label: "Pass" },
  warn: { icon: AlertCircle,  color: "text-yellow-600",  badge: "bg-yellow-50 text-yellow-700 hover:bg-yellow-50",   label: "Warning" },
  fail: { icon: XCircle,      color: "text-red-600",     badge: "bg-red-50 text-red-700 hover:bg-red-50",           label: "Fail" },
};

export default function AuditCompliancePage() {
  const [data, setData]       = useState<ComplianceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, overviewRes] = await Promise.all([
        client.get("/api/v1/compliance/stats").catch(() => ({ data: {} })),
        client.get("/api/v1/audit/overview").catch(() => ({ data: {} })),
      ]);
      const stats    = statsRes.data?.data   ?? statsRes.data   ?? {};
      const overview = overviewRes.data?.data ?? overviewRes.data ?? {};
      setData({
        compliance_score:  stats.compliance_score  ?? overview.compliance_score ?? 100,
        open_issues:       stats.open_issues        ?? overview.active_violations ?? 0,
        resolved_issues:   stats.resolved_issues    ?? 0,
        checks:            overview.compliance_checks ?? [],
        last_audit_date:   stats.last_audit_date    ?? null,
      });
    } catch {
      setError("Unable to load compliance data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const score       = data?.compliance_score ?? 100;
  const scoreColor  = score >= 90 ? "text-emerald-600" : score >= 70 ? "text-yellow-600" : "text-red-600";
  const checks      = data?.checks ?? [];
  const passCount   = checks.filter((c) => c.status === "pass").length;
  const warnCount   = checks.filter((c) => c.status === "warn").length;
  const failCount   = checks.filter((c) => c.status === "fail").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Compliance Status</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Platform-wide compliance posture and control checks</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Score + summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : (
          <>
            <Card className="sm:col-span-1 flex flex-col items-center justify-center py-6">
              <ShieldCheck className={`size-8 mb-2 ${scoreColor}`} />
              <p className={`text-4xl font-bold ${scoreColor}`}>{score}%</p>
              <p className="text-xs text-muted-foreground mt-1">Compliance Score</p>
            </Card>
            {[
              { label: "Passing", value: passCount, color: "text-emerald-600" },
              { label: "Warnings", value: warnCount, color: "text-yellow-600" },
              { label: "Failing", value: failCount, color: "text-red-600" },
            ].map(({ label, value, color }) => (
              <Card key={label} className="flex flex-col items-center justify-center py-6">
                <p className={`text-3xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{label} Checks</p>
              </Card>
            ))}
          </>
        )}
      </div>

      {/* Checks list */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Control Checks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12" />)
          ) : checks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No compliance checks configured.</p>
          ) : (
            checks.map((check, i) => {
              const cfg = STATUS_CONFIG[check.status] ?? STATUS_CONFIG.warn;
              return (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <cfg.icon className={`size-4 shrink-0 ${cfg.color}`} />
                    <div>
                      <p className="text-sm font-medium">{check.label}</p>
                      {check.description && <p className="text-xs text-muted-foreground">{check.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {check.owner && <span className="text-xs text-muted-foreground hidden sm:block">{check.owner}</span>}
                    <Badge className={`text-xs ${cfg.badge}`}>{cfg.label}</Badge>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
