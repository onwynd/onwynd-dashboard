"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  adminWaitlistService,
  type WaitlistEntry,
  type WaitlistStats,
  type WaitlistFilters,
} from "@/lib/api/admin-waitlist.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Loader2, Trash2, Filter, MoreHorizontal, RefreshCw, Search,
  Mail, Users, UserCheck, XCircle, TrendingUp, Clock, Download,
  Globe, Megaphone, Send, AlertCircle, ChevronDown,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

type Status = WaitlistEntry["status"];
type Role = WaitlistEntry["role"];

// ── helpers ────────────────────────────────────────────────────────────────

function daysAgo(date: string) {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
}

function statusBadge(status: Status) {
  const cfg: Record<Status, { cls: string; label: string }> = {
    pending:  { cls: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100", label: "Pending" },
    invited:  { cls: "bg-green-100  text-green-700  hover:bg-green-100",  label: "Invited" },
    declined: { cls: "bg-red-100    text-red-700    hover:bg-red-100",    label: "Declined" },
  };
  const { cls, label } = cfg[status] ?? { cls: "", label: status };
  return <Badge className={cls}>{label}</Badge>;
}

function roleBadge(role: Role) {
  const cfg: Record<Role, { cls: string; label: string }> = {
    patient:     { cls: "bg-blue-100   text-blue-700   hover:bg-blue-100",   label: "Patient" },
    therapist:   { cls: "bg-purple-100 text-purple-700 hover:bg-purple-100", label: "Therapist" },
    institution: { cls: "bg-orange-100 text-orange-700 hover:bg-orange-100", label: "Institution" },
    other:       { cls: "bg-gray-100   text-gray-600   hover:bg-gray-100",   label: "Other" },
  };
  const { cls, label } = cfg[role] ?? { cls: "", label: role };
  return <Badge className={cls}>{label}</Badge>;
}

function urgencyPill(days: number) {
  if (days >= 14) return <span className="text-xs font-semibold text-red-600">🔥 {days}d</span>;
  if (days >= 7)  return <span className="text-xs font-semibold text-orange-500">⏳ {days}d</span>;
  return <span className="text-xs text-muted-foreground">{days}d</span>;
}

// Mini horizontal bar
function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs tabular-nums w-6 text-right text-muted-foreground">{value}</span>
    </div>
  );
}

// ── component ──────────────────────────────────────────────────────────────

export default function AdminWaitlistPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [stats, setStats] = useState<WaitlistStats | null>(null);
  const [pagination, setPagination] = useState({ total: 0, last_page: 1, current_page: 1, per_page: 25 });
  const [isLoading, setIsLoading] = useState(true);

  // filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<WaitlistFilters["status"]>("all");
  const [roleFilter, setRoleFilter] = useState<WaitlistFilters["role"]>("all");

  // selection
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [batchLoading, setBatchLoading] = useState(false);

  // detail dialog
  const [detail, setDetail] = useState<WaitlistEntry | null>(null);

  // ── data ────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const data = await adminWaitlistService.getWaitlist({
        search: search || undefined,
        status: statusFilter,
        role: roleFilter,
        page,
        per_page: 25,
      });
      const rows: WaitlistEntry[] = data.submissions?.data ?? (data.submissions as unknown as WaitlistEntry[]) ?? [];
      setEntries(rows);
      setStats(data.stats ?? null);
      const p = data.submissions as { total?: number; per_page?: number; current_page?: number; last_page?: number };
      setPagination({
        total: p.total ?? rows.length,
        per_page: p.per_page ?? 25,
        current_page: p.current_page ?? 1,
        last_page: p.last_page ?? 1,
      });
      setSelected(new Set());
    } catch {
      toast({ title: "Error", description: "Failed to load waitlist", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, roleFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── derived ──────────────────────────────────────────────────────────────

  // pending entries sorted oldest-first (longest wait at top)
  const inviteQueue = useMemo(() =>
    entries
      .filter((e) => e.status === "pending")
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    [entries]);

  const pendingIds = useMemo(() => entries.filter((e) => e.status === "pending").map((e) => e.id), [entries]);
  const allPendingSelected = pendingIds.length > 0 && pendingIds.every((id) => selected.has(id));

  // ── actions ──────────────────────────────────────────────────────────────

  const handleInvite = async (id: number) => {
    try {
      await adminWaitlistService.invite(id);
      toast({ title: "Invite sent!" });
      fetchData(pagination.current_page);
    } catch {
      toast({ title: "Error", description: "Could not send invite.", variant: "destructive" });
    }
  };

  const handleBatchInvite = async () => {
    const ids = [...selected].filter((id) => entries.find((e) => e.id === id)?.status === "pending");
    if (!ids.length) return;
    if (!confirm(`Send invites to ${ids.length} selected people?`)) return;
    setBatchLoading(true);
    try {
      const res = await adminWaitlistService.batchInvite(ids);
      toast({ title: `${res.invited} invite(s) sent!` });
      fetchData(pagination.current_page);
    } catch {
      toast({ title: "Error", description: "Batch invite failed.", variant: "destructive" });
    } finally {
      setBatchLoading(false);
    }
  };

  const handleInviteAll = async () => {
    if (!inviteQueue.length) return;
    if (!confirm(`Send invites to ALL ${inviteQueue.length} pending people?`)) return;
    setBatchLoading(true);
    try {
      const res = await adminWaitlistService.batchInvite(inviteQueue.map((e) => e.id));
      toast({ title: `${res.invited} invite(s) sent!` });
      fetchData(pagination.current_page);
    } catch {
      toast({ title: "Error", description: "Invite all failed.", variant: "destructive" });
    } finally {
      setBatchLoading(false);
    }
  };

  const handleStatusChange = async (id: number, status: Status) => {
    try {
      await adminWaitlistService.updateStatus(id, status);
      toast({ title: `Marked as ${status}.` });
      fetchData(pagination.current_page);
    } catch {
      toast({ title: "Error", description: "Status update failed.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this person from the waitlist?")) return;
    try {
      await adminWaitlistService.destroy(id);
      toast({ title: "Removed." });
      if (detail?.id === id) setDetail(null);
      fetchData(pagination.current_page);
    } catch {
      toast({ title: "Error", description: "Delete failed.", variant: "destructive" });
    }
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAllPending = () => {
    setSelected(allPendingSelected ? new Set() : new Set(pendingIds));
  };

  // ── render ────────────────────────────────────────────────────────────────

  const roleMax = stats ? Math.max(...Object.values(stats.by_role)) : 1;
  const countryMax = stats ? Math.max(...Object.values(stats.by_country)) : 1;
  const referralMax = stats ? Math.max(...Object.values(stats.by_referral)) : 1;

  const selectedPendingCount = [...selected].filter((id) =>
    entries.find((e) => e.id === id)?.status === "pending"
  ).length;

  return (
    <TooltipProvider>
    <div className="flex-1 space-y-5 p-4 md:p-8 pt-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Waitlist</h2>
          <p className="text-muted-foreground">
            Manage signups and send invitations when ready to onboard.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchData(pagination.current_page)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={adminWaitlistService.exportUrl()} download>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </a>
          </Button>
          {inviteQueue.length > 0 && (
            <Button size="sm" onClick={handleInviteAll} disabled={batchLoading}>
              {batchLoading
                ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                : <Send className="mr-2 h-4 w-4" />}
              Invite All Pending ({inviteQueue.length})
            </Button>
          )}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Total",      value: stats.total,     icon: Users,      color: "text-foreground" },
            { label: "Pending",    value: stats.pending,   icon: Clock,      color: "text-yellow-600" },
            { label: "Invited",    value: stats.invited,   icon: UserCheck,  color: "text-green-600"  },
            { label: "Declined",   value: stats.declined,  icon: XCircle,    color: "text-red-500"    },
            { label: "Conversion", value: `${stats.conversion_rate}%`, icon: TrendingUp, color: "text-blue-600" },
          ].map(({ label, value, icon: Icon, color }) => (
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

      {/* ── Insight Panel ── */}
      {stats && (stats.total > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* By Role */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium flex items-center gap-1.5">
                <Users className="h-4 w-4 text-muted-foreground" /> By Role
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {Object.entries(stats.by_role).sort((a,b) => b[1]-a[1]).map(([role, count]) => (
                <div key={role}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="capitalize">{role}</span>
                  </div>
                  <MiniBar value={count} max={roleMax} color="bg-primary" />
                </div>
              ))}
              {Object.keys(stats.by_role).length === 0 && (
                <p className="text-xs text-muted-foreground">No data yet.</p>
              )}
            </CardContent>
          </Card>

          {/* By Country */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-muted-foreground" /> Top Countries
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {Object.entries(stats.by_country).map(([country, count]) => (
                <div key={country}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span>{country}</span>
                  </div>
                  <MiniBar value={count} max={countryMax} color="bg-blue-500" />
                </div>
              ))}
              {Object.keys(stats.by_country).length === 0 && (
                <p className="text-xs text-muted-foreground">No country data.</p>
              )}
            </CardContent>
          </Card>

          {/* By Referral */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium flex items-center gap-1.5">
                <Megaphone className="h-4 w-4 text-muted-foreground" /> How They Found Us
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {Object.entries(stats.by_referral).map(([source, count]) => (
                <div key={source}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="capitalize">{source}</span>
                  </div>
                  <MiniBar value={count} max={referralMax} color="bg-purple-500" />
                </div>
              ))}
              {Object.keys(stats.by_referral).length === 0 && (
                <p className="text-xs text-muted-foreground">No referral data.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Invite Queue callout ── */}
      {inviteQueue.length > 0 && (
        <Card className="border-yellow-200 dark:border-yellow-900 bg-yellow-50/60 dark:bg-yellow-950/20">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                {inviteQueue.length} people waiting to be invited
                {stats?.oldest_pending && (
                  <span className="font-normal ml-1 text-yellow-600">
                    — oldest joined {daysAgo(stats.oldest_pending)} days ago
                  </span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {inviteQueue.slice(0, 5).map((e) => (
                <Tooltip key={e.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setDetail(e)}
                      className="inline-flex items-center gap-1.5 text-xs bg-white dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-full px-2.5 py-1 hover:bg-yellow-100 dark:hover:bg-yellow-900 transition-colors"
                    >
                      {urgencyPill(daysAgo(e.created_at))}
                      <span className="font-medium">{e.first_name} {e.last_name}</span>
                      <span className="text-muted-foreground">{e.role}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{e.email}</TooltipContent>
                </Tooltip>
              ))}
              {inviteQueue.length > 5 && (
                <span className="text-xs text-muted-foreground self-center">+{inviteQueue.length - 5} more</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Filters + Bulk Actions ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as WaitlistFilters["status"])}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="invited">Invited</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as WaitlistFilters["role"])}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="patient">Patient</SelectItem>
            <SelectItem value="therapist">Therapist</SelectItem>
            <SelectItem value="institution">Institution</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        {selectedPendingCount > 0 && (
          <Button size="sm" onClick={handleBatchInvite} disabled={batchLoading} className="ml-auto">
            {batchLoading
              ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              : <Mail className="mr-2 h-4 w-4" />}
            Invite Selected ({selectedPendingCount})
          </Button>
        )}
      </div>

      {/* ── Table ── */}
      <Card>
        <CardHeader>
          <CardTitle>Signups ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No signups found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Checkbox
                          checked={allPendingSelected}
                          onCheckedChange={toggleAllPending}
                          aria-label="Select all pending"
                        />
                      </TooltipTrigger>
                      <TooltipContent>Select all pending</TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Waiting</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => {
                  const days = daysAgo(entry.created_at);
                  const isPending = entry.status === "pending";
                  return (
                    <TableRow
                      key={entry.id}
                      className={isPending && days >= 7 ? "bg-orange-50/40 dark:bg-orange-950/10" : ""}
                    >
                      <TableCell>
                        {isPending && (
                          <Checkbox
                            checked={selected.has(entry.id)}
                            onCheckedChange={() => toggleSelect(entry.id)}
                          />
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        <button
                          className="font-medium hover:underline text-left"
                          onClick={() => setDetail(entry)}
                        >
                          {entry.first_name} {entry.last_name}
                        </button>
                        <div className="text-xs text-muted-foreground">{entry.email}</div>
                      </TableCell>
                      <TableCell>{roleBadge(entry.role)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{entry.country ?? "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[120px] truncate">
                        {entry.referral_source ?? "—"}
                      </TableCell>
                      <TableCell>{urgencyPill(days)}</TableCell>
                      <TableCell>{statusBadge(entry.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setDetail(entry)}>
                              View Details
                            </DropdownMenuItem>
                            {entry.status === "pending" && (
                              <DropdownMenuItem onClick={() => handleInvite(entry.id)}>
                                <Mail className="mr-2 h-4 w-4 text-green-600" />
                                Send Invite
                              </DropdownMenuItem>
                            )}
                            {entry.status !== "declined" && (
                              <DropdownMenuItem onClick={() => handleStatusChange(entry.id, "declined")}>
                                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                Decline
                              </DropdownMenuItem>
                            )}
                            {entry.status === "declined" && (
                              <DropdownMenuItem onClick={() => handleStatusChange(entry.id, "pending")}>
                                <Clock className="mr-2 h-4 w-4 text-yellow-600" />
                                Restore to Pending
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDelete(entry.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={pagination.current_page <= 1}
            onClick={() => fetchData(pagination.current_page - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.current_page} of {pagination.last_page}
          </span>
          <Button variant="outline" size="sm" disabled={pagination.current_page >= pagination.last_page}
            onClick={() => fetchData(pagination.current_page + 1)}>
            Next
          </Button>
        </div>
      )}

      {/* ── Detail Dialog ── */}
      <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Waitlist Entry</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <p className="font-semibold text-base">{detail.first_name} {detail.last_name}</p>
                  <p className="text-sm text-muted-foreground">{detail.email}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {statusBadge(detail.status)}
                  {roleBadge(detail.role)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Country</p>
                  <p>{detail.country ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Referral Source</p>
                  <p className="capitalize">{detail.referral_source ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Joined</p>
                  <p>{new Date(detail.created_at).toLocaleDateString()} ({daysAgo(detail.created_at)} days ago)</p>
                </div>
                {detail.invited_at && (
                  <div>
                    <p className="text-xs text-muted-foreground">Invited</p>
                    <p>{new Date(detail.invited_at).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              {/* Role-specific fields */}
              {detail.role === "therapist" && (
                <div className="border-t pt-3 space-y-2">
                  <p className="font-semibold text-sm">Therapist Information</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Years of Experience</p>
                      <p>{detail.years_of_experience ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Specialty</p>
                      <p>{detail.specialty ?? "—"}</p>
                    </div>
                  </div>
                </div>
              )}

              {detail.role === "institution" && (
                <div className="border-t pt-3 space-y-2">
                  <p className="font-semibold text-sm">Institution Information</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Organization Name</p>
                      <p>{detail.organization_name ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Institution Type</p>
                      <p className="capitalize">{detail.institution_type ?? "—"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Company Size / Student Count</p>
                      <p>{detail.company_size ?? "—"}</p>
                    </div>
                  </div>
                </div>
              )}

              {detail.message && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Message</p>
                  <p className="text-sm bg-muted/40 rounded-lg p-3 whitespace-pre-wrap">{detail.message}</p>
                </div>
              )}

              <div className="flex gap-2 flex-wrap pt-2 border-t">
                {detail.status === "pending" && (
                  <Button size="sm" onClick={() => { handleInvite(detail.id); setDetail(null); }}>
                    <Mail className="mr-2 h-3.5 w-3.5" />
                    Send Invite
                  </Button>
                )}
                {detail.status !== "declined" && (
                  <Button size="sm" variant="outline"
                    onClick={() => { handleStatusChange(detail.id, "declined"); setDetail(null); }}>
                    <XCircle className="mr-2 h-3.5 w-3.5" />
                    Decline
                  </Button>
                )}
                {detail.status === "declined" && (
                  <Button size="sm" variant="outline"
                    onClick={() => { handleStatusChange(detail.id, "pending"); setDetail(null); }}>
                    Restore to Pending
                  </Button>
                )}
                <Button size="sm" variant="ghost"
                  className="text-destructive hover:text-destructive ml-auto"
                  onClick={() => handleDelete(detail.id)}>
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Remove
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
    </TooltipProvider>
  );
}
