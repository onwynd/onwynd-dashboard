"use client";

import { useCallback, useEffect, useState } from "react";
import { adminService } from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { downloadCSV } from "@/lib/export-utils";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";

type RequestRow = {
  id: number | string;
  requested_at: string;
  status: "pending" | "approved" | "denied";
  requester?: string | null;
  requester_email?: string | null;
  subject_user?: string | null;
  subject_email?: string | null;
  plan_uuid?: string | null;
  plan_slug?: string | null;
  plan_type?: string | null;
  org_type?: "university" | "corporate" | "faith_ngo" | null;
  billing_interval?: string | null;
  include_in_revenue?: boolean;
  comped?: boolean;
  reason?: string | null;
};

export default function SubscriptionUpgradeApprovalsPage() {
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"all" | "pending" | "approved" | "denied">("pending");
  const [org, setOrg] = useState<"all" | "university" | "corporate" | "faith_ngo">("all");
  const [onlyUrgent, setOnlyUrgent] = useState(false);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());
  const [totals, setTotals] = useState<{ pending: number; approved: number; denied: number; urgent: number } | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const load = useCallback(async (s = status) => {
    setLoading(true);
    try {
      const res = await adminService.getUpgradeRequests({ status: s === "all" ? undefined : s });
      const data = (res as any)?.data ?? res ?? [];
      const list: RequestRow[] = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      let filtered = org === "all" ? list : list.filter((r) => r.org_type === org);
      if (onlyUrgent) {
        filtered = filtered.filter((r) => r.status === "pending" && Date.now() - new Date(r.requested_at).getTime() > 1000 * 60 * 60 * 72);
      }
      setRows(filtered);
    } catch {
      toast({ description: "Failed to load upgrade requests.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [status, org, onlyUrgent]);

  useEffect(() => { load("pending"); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const fetchTotals = useCallback(async () => {
    try {
      const res = await adminService.getUpgradeRequestStats(org === "all" ? undefined : { org });
      const d = (res as any)?.data ?? res ?? null;
      if (d && typeof d === "object" && "pending" in d) {
        setTotals({ pending: d.pending ?? 0, approved: d.approved ?? 0, denied: d.denied ?? 0, urgent: d.urgent ?? 0 });
      } else if (d?.pending !== undefined) {
        setTotals(d as any);
      } else {
        setTotals(null);
      }
    } catch {
      setTotals(null);
    }
  }, [org]);

  useEffect(() => { fetchTotals(); }, [fetchTotals]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => {
      load(status);
      fetchTotals();
    }, 60000);
    return () => clearInterval(id);
  }, [autoRefresh, status, load, fetchTotals]);

  const pendingCount = rows.filter((r) => r.status === "pending").length;
  const approvedCount = rows.filter((r) => r.status === "approved").length;
  const deniedCount = rows.filter((r) => r.status === "denied").length;
  const urgentCount = rows.filter(
    (r) => r.status === "pending" && Date.now() - new Date(r.requested_at).getTime() > 1000 * 60 * 60 * 72
  ).length;

  const approve = async (id: number | string) => {
    setLoading(true);
    try {
      await adminService.approveUpgradeRequest(id);
      toast({ description: "Request approved and applied." });
      load(status);
    } catch {
      toast({ description: "Failed to approve request.", variant: "destructive" });
      setLoading(false);
    }
  };
  const deny = async (id: number | string) => {
    setLoading(true);
    try {
      await adminService.denyUpgradeRequest(id);
      toast({ description: "Request denied." });
      load(status);
    } catch {
      toast({ description: "Failed to deny request.", variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Subscription Upgrade Approvals</h1>
        <div className="flex items-center gap-2">
        <Select value={status} onValueChange={(v: string | null) => { setStatus((v ?? "") as any); load((v ?? "") as any); }}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="denied">Denied</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
        <Select value={org} onValueChange={(v: string | null) => { setOrg((v ?? "") as any); load(status); }}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Org Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orgs</SelectItem>
            <SelectItem value="university">University</SelectItem>
            <SelectItem value="corporate">Corporate</SelectItem>
            <SelectItem value="faith_ngo">Faith/NGO</SelectItem>
          </SelectContent>
        </Select>
          <label className="flex items-center gap-2 border rounded-md px-3 py-2">
            <input
              type="checkbox"
              checked={onlyUrgent}
              onChange={(e) => { setOnlyUrgent(e.target.checked); load(status); }}
              className="w-4 h-4"
            />
            <span className="text-sm">Only urgent</span>
          </label>
          <div className="hidden md:flex items-center gap-2 ml-2">
            <Badge variant="outline">Pending: {pendingCount}</Badge>
            <Badge variant="outline">Approved: {approvedCount}</Badge>
            <Badge variant="outline">Denied: {deniedCount}</Badge>
            <Badge variant="destructive">Urgent: {urgentCount}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 border rounded-md px-3 py-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Auto-refresh</span>
            </label>
            <Button
              variant="outline"
              onClick={() => { setStatus("pending"); load("pending"); }}
            >
              Pending only
            </Button>
            <Button
              onClick={async () => {
                const urgentIds = rows
                  .filter((r) => r.status === "pending" && Date.now() - new Date(r.requested_at).getTime() > 1000 * 60 * 60 * 72)
                  .map((r) => r.id);
                if (urgentIds.length === 0) {
                  toast({ description: "No urgent requests found in current view.", variant: "destructive" });
                  return;
                }
                if (!confirm(`Approve ${urgentIds.length} urgent request(s)?`)) return;
                setLoading(true);
                try {
                  const results = await Promise.allSettled(urgentIds.map((id) => adminService.approveUpgradeRequest(id)));
                  const failed = results.filter((r) => r.status === "rejected").length;
                  toast({ description: `Approved ${urgentIds.length - failed}/${urgentIds.length} urgent request(s).` });
                } catch {
                  toast({ description: "Bulk approve urgent encountered errors.", variant: "destructive" });
                } finally {
                  setSelected(new Set());
                  load(status);
                  fetchTotals();
                }
              }}
              disabled={rows.length === 0 || urgentCount === 0 || loading}
            >
              Approve urgent
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                const urgentIds = rows
                  .filter((r) => r.status === "pending" && Date.now() - new Date(r.requested_at).getTime() > 1000 * 60 * 60 * 72)
                  .map((r) => r.id);
                if (urgentIds.length === 0) {
                  toast({ description: "No urgent requests found in current view.", variant: "destructive" });
                  return;
                }
                if (!confirm(`Deny ${urgentIds.length} urgent request(s)?`)) return;
                setLoading(true);
                try {
                  const results = await Promise.allSettled(urgentIds.map((id) => adminService.denyUpgradeRequest(id)));
                  const failed = results.filter((r) => r.status === "rejected").length;
                  toast({ description: `Denied ${urgentIds.length - failed}/${urgentIds.length} urgent request(s).` });
                } catch {
                  toast({ description: "Bulk deny urgent encountered errors.", variant: "destructive" });
                } finally {
                  setSelected(new Set());
                  load(status);
                  fetchTotals();
                }
              }}
              disabled={rows.length === 0 || urgentCount === 0 || loading}
            >
              Deny urgent
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                const headers = [
                  "id",
                  "requested_at",
                  "status",
                  "requester",
                  "requester_email",
                  "subject_user",
                  "subject_email",
                  "plan_slug",
                  "billing_interval",
                  "org_type",
                  "comped",
                  "include_in_revenue",
                  "reason",
                ];
                const data = rows.map((r) => ({
                  id: r.id,
                  requested_at: r.requested_at,
                  status: r.status,
                  requester: r.requester ?? "",
                  requester_email: r.requester_email ?? "",
                  subject_user: r.subject_user ?? "",
                  subject_email: r.subject_email ?? "",
                  plan_slug: r.plan_slug ?? r.plan_uuid ?? "",
                  billing_interval: r.billing_interval ?? "",
                  org_type: r.org_type ?? "",
                  comped: r.comped ? "true" : "false",
                  include_in_revenue: r.include_in_revenue ? "true" : "false",
                  reason: r.reason ?? "",
                }));
                downloadCSV("upgrade-requests.csv", headers, data);
              }}
              disabled={rows.length === 0}
            >
              Export CSV
            </Button>
            <Button
              variant="secondary"
              onClick={async () => {
                if (selected.size === 0) return;
                const ids = Array.from(selected);
                const pendings = rows.filter((r) => ids.includes(r.id) && r.status === "pending").map((r) => r.id);
                const skipped = ids.length - pendings.length;
                if (pendings.length === 0) {
                  toast({ description: "No pending requests selected.", variant: "destructive" });
                  return;
                }
                if (!confirm(`Approve ${pendings.length} request(s)?${skipped > 0 ? ` (${skipped} skipped: not pending)` : ""}`)) return;
                setLoading(true);
                try {
                  const results = await Promise.allSettled(pendings.map((id) => adminService.approveUpgradeRequest(id)));
                  const failed = results.filter((r) => r.status === "rejected").length;
                  toast({ description: `Approved ${pendings.length - failed}/${pendings.length} request(s).` });
                } catch {
                  toast({ description: "Bulk approve encountered errors.", variant: "destructive" });
                } finally {
                  setSelected(new Set());
                  load(status);
                }
              }}
              disabled={selected.size === 0 || loading}
            >
              Bulk Approve
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                if (selected.size === 0) return;
                const ids = Array.from(selected);
                const pendings = rows.filter((r) => ids.includes(r.id) && r.status === "pending").map((r) => r.id);
                const skipped = ids.length - pendings.length;
                if (pendings.length === 0) {
                  toast({ description: "No pending requests selected.", variant: "destructive" });
                  return;
                }
                if (!confirm(`Deny ${pendings.length} request(s)?${skipped > 0 ? ` (${skipped} skipped: not pending)` : ""}`)) return;
                setLoading(true);
                try {
                  const results = await Promise.allSettled(pendings.map((id) => adminService.denyUpgradeRequest(id)));
                  const failed = results.filter((r) => r.status === "rejected").length;
                  toast({ description: `Denied ${pendings.length - failed}/${pendings.length} request(s).` });
                } catch {
                  toast({ description: "Bulk deny encountered errors.", variant: "destructive" });
                } finally {
                  setSelected(new Set());
                  load(status);
                }
              }}
              disabled={selected.size === 0 || loading}
            >
              Bulk Deny
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const ids = rows.filter((r) => r.status === "pending").map((r) => r.id);
                setSelected(new Set(ids));
              }}
              disabled={rows.length === 0}
            >
              Select pending only
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const ids = rows
                  .filter((r) => r.status === "pending" && Date.now() - new Date(r.requested_at).getTime() > 1000 * 60 * 60 * 72)
                  .map((r) => r.id);
                setSelected(new Set(ids));
              }}
              disabled={rows.length === 0}
            >
              Select urgent only
            </Button>
          </div>
        </div>
      </div>

      {totals ? (
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary">Total Pending: {totals.pending}</Badge>
          <Badge variant="secondary">Total Approved: {totals.approved}</Badge>
          <Badge variant="secondary">Total Denied: {totals.denied}</Badge>
          <Badge variant="destructive">Total Urgent: {totals.urgent}</Badge>
        </div>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Requests</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[36px]">
                    <Checkbox
                      checked={rows.length > 0 && selected.size === rows.length}
                      onCheckedChange={(val) => {
                        if (val) {
                          setSelected(new Set(rows.map((r) => r.id)));
                        } else {
                          setSelected(new Set());
                        }
                      }}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center">
                      <Loader2 className="h-5 w-5 animate-spin inline-block text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                      No requests found.
                    </TableCell>
                  </TableRow>
                ) : rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <Checkbox
                        checked={selected.has(r.id)}
                        onCheckedChange={(val) => {
                          const next = new Set(selected);
                          if (val) next.add(r.id);
                          else next.delete(r.id);
                          setSelected(next);
                        }}
                        aria-label="Select row"
                      />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(r.requested_at), "dd MMM yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{r.requester ?? "—"}</div>
                      {r.requester_email && <div className="text-xs text-muted-foreground">{r.requester_email}</div>}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{r.subject_user ?? "—"}</div>
                      {r.subject_email && <div className="text-xs text-muted-foreground">{r.subject_email}</div>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{r.plan_slug ?? r.plan_uuid}</Badge>
                        <Badge variant="outline" className="capitalize">{r.billing_interval ?? "monthly"}</Badge>
                        {r.org_type ? (
                          <Badge variant="outline" className="capitalize">{r.org_type.replace("_", " ")}</Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-1">
                        {r.comped ? <Badge variant="outline">Comped</Badge> : null}
                        {r.include_in_revenue ? <Badge variant="outline">Revenue</Badge> : null}
                        {r.status === "pending" && Date.now() - new Date(r.requested_at).getTime() > 1000 * 60 * 60 * 72 ? (
                          <Badge variant="destructive">Urgent</Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate">{r.reason ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      {r.status === "pending" ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" onClick={() => approve(r.id)} disabled={loading}>Approve</Button>
                          <Button size="sm" variant="outline" onClick={() => deny(r.id)} disabled={loading}>Deny</Button>
                        </div>
                      ) : (
                        <Badge variant="outline" className="capitalize">{r.status}</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
