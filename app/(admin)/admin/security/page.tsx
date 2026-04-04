"use client";

import { useEffect, useState, useCallback } from "react";
import client from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader2, Trash2, RefreshCw, Search, ShieldAlert, ShieldCheck, AlertTriangle, MoreHorizontal, Eye, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface VulnReport {
  id: number;
  tracking_number: string;
  full_name: string;
  email: string;
  url: string | null;
  description: string;
  severity: "critical" | "high" | "medium" | "low" | "informational";
  vrt_category: string;
  vrt_subcategory: string | null;
  vrt_variant: string | null;
  attachment_url: string | null;
  status: "new" | "triaging" | "confirmed" | "fixed" | "dismissed" | "duplicate";
  internal_notes: string | null;
  created_at: string;
}

interface Stats { total: number; new: number; open: number; critical: number; high: number; }

const SEVERITY_COLOR: Record<string, string> = {
  critical:      "bg-red-100 text-red-700",
  high:          "bg-orange-100 text-orange-700",
  medium:        "bg-yellow-100 text-yellow-700",
  low:           "bg-green-100 text-green-700",
  informational: "bg-gray-100 text-gray-600",
};

const STATUS_COLOR: Record<string, string> = {
  new:       "bg-red-100 text-red-700",
  triaging:  "bg-orange-100 text-orange-700",
  confirmed: "bg-yellow-100 text-yellow-700",
  fixed:     "bg-green-100 text-green-700",
  dismissed: "bg-gray-100 text-gray-500",
  duplicate: "bg-gray-100 text-gray-500",
};

const BASE = "/api/v1/admin/security/reports";

export default function SecurityReportsPage() {
  const [reports, setReports] = useState<VulnReport[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState({ total: 0, last_page: 1, current_page: 1, per_page: 20 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [detail, setDetail] = useState<VulnReport | null>(null);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const fetchData = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { page, per_page: 20 };
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;
      if (severityFilter !== "all") params.severity = severityFilter;
      const res = await client.get(BASE, { params });
      const data = res.data.data ?? res.data;
      setReports(data.reports ?? []);
      setStats(data.stats ?? null);
      setPagination(data.pagination ?? { total: 0, last_page: 1, current_page: 1, per_page: 20 });
    } catch {
      toast({ title: "Error", description: "Failed to load reports", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, severityFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateReport = async (id: number, payload: Record<string, string | null>) => {
    try {
      await client.patch(`${BASE}/${id}`, payload);
      fetchData(pagination.current_page);
      if (detail?.id === id) setDetail((prev) => prev ? { ...prev, ...payload } as VulnReport : null);
    } catch {
      toast({ title: "Error", description: "Update failed.", variant: "destructive" });
    }
  };

  const handleSaveNotes = async () => {
    if (!detail) return;
    setSavingNotes(true);
    try {
      await client.patch(`${BASE}/${detail.id}`, { internal_notes: notes });
      setDetail((prev) => prev ? { ...prev, internal_notes: notes } : null);
      toast({ title: "Notes saved." });
    } catch {
      toast({ title: "Error", description: "Failed to save notes.", variant: "destructive" });
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Permanently delete this report?")) return;
    try {
      await client.delete(`${BASE}/${id}`);
      if (detail?.id === id) setDetail(null);
      fetchData(pagination.current_page);
    } catch {
      toast({ title: "Error", description: "Delete failed.", variant: "destructive" });
    }
  };

  const openDetail = (r: VulnReport) => {
    setDetail(r);
    setNotes(r.internal_notes ?? "");
  };

  return (
    <div className="flex-1 space-y-5 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Security Reports</h2>
          <p className="text-muted-foreground">Vulnerability disclosures from the responsible reporting program.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchData(pagination.current_page)}>
          <RefreshCw className="mr-2 h-4 w-4" />Refresh
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Total",    value: stats.total,    Icon: ShieldAlert,  color: "text-foreground" },
            { label: "New",      value: stats.new,      Icon: AlertTriangle, color: "text-red-600"  },
            { label: "Open",     value: stats.open,     Icon: ShieldAlert,  color: "text-orange-600" },
            { label: "Critical", value: stats.critical, Icon: XCircle,      color: "text-red-700"   },
            { label: "High",     value: stats.high,     Icon: AlertTriangle, color: "text-orange-500" },
          ].map(({ label, value, Icon, color }) => (
            <Card key={label}>
              <CardContent className="pt-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-2xl font-bold">{value}</p>
                </div>
                <Icon className={`h-7 w-7 opacity-20 ${color}`} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search name, email, ID…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchData()} />
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? "all")}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {["new","triaging","confirmed","fixed","dismissed","duplicate"].map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={(value) => setSeverityFilter(value ?? "all")}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            {["critical","high","medium","low","informational"].map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader><CardTitle>Reports ({pagination.total})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-48 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No vulnerability reports.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((r) => (
                  <TableRow key={r.id} className={r.status === "new" ? "bg-red-50/30 dark:bg-red-950/10" : ""}>
                    <TableCell className="font-mono text-xs">{r.tracking_number}</TableCell>
                    <TableCell className="text-sm">
                      <button className="font-medium hover:underline text-left" onClick={() => openDetail(r)}>{r.full_name}</button>
                      <div className="text-xs text-muted-foreground">{r.email}</div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[140px] truncate">{r.vrt_category}</TableCell>
                    <TableCell>
                      <Badge className={`${SEVERITY_COLOR[r.severity]} hover:${SEVERITY_COLOR[r.severity]} capitalize`}>{r.severity}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${STATUS_COLOR[r.status]} hover:${STATUS_COLOR[r.status]} capitalize`}>{r.status}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(r.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDetail(r)}><Eye className="mr-2 h-4 w-4" />View</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {r.status === "new" && (
                            <DropdownMenuItem onClick={() => updateReport(r.id, { status: "triaging" })}>Start Triaging</DropdownMenuItem>
                          )}
                          {(r.status === "triaging" || r.status === "new") && (
                            <DropdownMenuItem onClick={() => updateReport(r.id, { status: "confirmed" })}>
                              <CheckCircle2 className="mr-2 h-4 w-4 text-yellow-600" />Confirm Vulnerability
                            </DropdownMenuItem>
                          )}
                          {r.status === "confirmed" && (
                            <DropdownMenuItem onClick={() => updateReport(r.id, { status: "fixed" })}>
                              <ShieldCheck className="mr-2 h-4 w-4 text-green-600" />Mark Fixed
                            </DropdownMenuItem>
                          )}
                          {!["fixed","dismissed","duplicate"].includes(r.status) && (
                            <>
                              <DropdownMenuItem onClick={() => updateReport(r.id, { status: "dismissed" })}>Dismiss</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateReport(r.id, { status: "duplicate" })}>Mark Duplicate</DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(r.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />Delete
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

      {pagination.last_page > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={pagination.current_page <= 1}
            onClick={() => fetchData(pagination.current_page - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {pagination.current_page} of {pagination.last_page}</span>
          <Button variant="outline" size="sm" disabled={pagination.current_page >= pagination.last_page}
            onClick={() => fetchData(pagination.current_page + 1)}>Next</Button>
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm text-muted-foreground">{detail?.tracking_number}</span>
              {detail && <Badge className={`${SEVERITY_COLOR[detail.severity]} capitalize`}>{detail.severity}</Badge>}
              {detail && <Badge className={`${STATUS_COLOR[detail.status]} capitalize`}>{detail.status}</Badge>}
            </DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-5 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-muted-foreground mb-0.5">Reporter</p><p className="font-medium">{detail.full_name}</p><p className="text-xs text-muted-foreground">{detail.email}</p></div>
                <div><p className="text-xs text-muted-foreground mb-0.5">Category</p><p>{detail.vrt_category}</p>{detail.vrt_subcategory && <p className="text-xs text-muted-foreground">{detail.vrt_subcategory}</p>}</div>
                {detail.url && (
                  <div className="col-span-2"><p className="text-xs text-muted-foreground mb-0.5">Affected URL</p><a href={detail.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all text-xs">{detail.url}</a></div>
                )}
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1 font-medium">Description</p>
                <div className="bg-muted/40 rounded-lg p-3 text-sm whitespace-pre-wrap">{detail.description}</div>
              </div>

              {detail.attachment_url && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1 font-medium">Attachment</p>
                  <a href={detail.attachment_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline border rounded-lg px-3 py-1.5">
                    View attachment →
                  </a>
                </div>
              )}

              <div>
                <p className="text-xs text-muted-foreground mb-1 font-medium">Internal Notes</p>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add investigation notes, remediation steps, reward details…"
                  rows={4}
                  className="text-sm"
                />
                <Button size="sm" className="mt-2" onClick={handleSaveNotes} disabled={savingNotes}>
                  {savingNotes ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
                  Save Notes
                </Button>
              </div>

              <div className="border-t pt-3 flex flex-wrap gap-2">
                {detail.status === "new" && <Button size="sm" variant="outline" onClick={() => updateReport(detail.id, { status: "triaging" })}>Start Triaging</Button>}
                {["new","triaging"].includes(detail.status) && <Button size="sm" variant="outline" onClick={() => updateReport(detail.id, { status: "confirmed" })}>Confirm Vulnerability</Button>}
                {detail.status === "confirmed" && <Button size="sm" onClick={() => updateReport(detail.id, { status: "fixed" })}><ShieldCheck className="mr-1.5 h-3.5 w-3.5" />Mark Fixed</Button>}
                {!["fixed","dismissed","duplicate"].includes(detail.status) && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => updateReport(detail.id, { status: "dismissed" })}>Dismiss</Button>
                    <Button size="sm" variant="outline" onClick={() => updateReport(detail.id, { status: "duplicate" })}>Duplicate</Button>
                  </>
                )}
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive ml-auto" onClick={() => handleDelete(detail.id)}>
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
