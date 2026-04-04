"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { adminService } from "@/lib/api/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Lock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import Cookies from "js-cookie";
import { PageHeader } from "@/components/shared/page-header";
import { TableBodyShimmer } from "@/components/shared/shimmer-skeleton";

const STATUS_STYLES: Record<string, string> = {
  active:   "bg-emerald-50 text-emerald-700",
  inactive: "bg-gray-100 text-gray-500",
  free:     "bg-gray-50 text-gray-500",
  trial:    "bg-blue-50 text-blue-600",
  premium:  "bg-teal/10 text-teal",
  paused:   "bg-amber-50 text-amber-700",
  expired:  "bg-red-50 text-red-700",
};

function StatusPill({ label, style }: { label: string; style?: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${style ?? "bg-gray-100 text-gray-600"}`}>
      {label}
    </span>
  );
}

type AdminUserRow = {
  id: number;
  uuid: string;
  first_name: string | null;
  last_name: string | null;
  name: string;
  email: string;
  role?: string | null;
  profile_photo?: string | null;
  is_active: boolean;
  current_plan?: string | null;
  current_plan_slug?: string | null;
  subscription_status?: string | null;
  comped_upgrade_approved?: boolean;
  comped_approved_by?: string | null;
};

type RolesList = Array<{ id: number; name: string; slug: string }>;

export default function AdminUsersPage() {
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [roles, setRoles] = useState<RolesList>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updatingRole, setUpdatingRole] = useState<number | null>(null);
  const [meta, setMeta] = useState<{ current_page: number; last_page: number } | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  useEffect(() => {
    const role = Cookies.get("user_role");
    if (role === "coo" || role === "cgo") setIsReadOnly(true);
  }, []);

  const load = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({ page: p, search: search || undefined });
      const data = ((res as { data?: AdminUserRow[] })?.data ?? res ?? []) as AdminUserRow[];
      setRows(Array.isArray(data) ? data : []);
      const m = (res as { meta?: { current_page: number; last_page: number } })?.meta ?? null;
      setMeta(m);
    } catch {
      toast({ description: "Failed to load users.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [page, search]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadRoles = useCallback(async () => {
    try {
      const res = await adminService.getRoles();
      const data = (res as { data?: RolesList })?.data ?? res ?? [];
      setRoles(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { load(1); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { loadRoles(); }, [loadRoles]);

  const roleOptions = useMemo(() => roles.map((r) => ({ slug: r.slug, name: r.name })), [roles]);

  const changeRole = async (userId: number, newRole: string) => {
    setUpdatingRole(userId);
    try {
      await adminService.updateUser(userId, { role: newRole });
      setRows((prev) => prev.map((r) => (r.id === userId ? { ...r, role: newRole } : r)));
      toast({ description: "Role updated.", variant: "default" });
    } catch {
      toast({ description: "Failed to update role.", variant: "destructive" });
    } finally {
      setUpdatingRole(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Users"
        subtitle="Manage roles, plans, and subscriptions"
      >
        <div className="flex items-center gap-2">
          {isReadOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
              <Lock className="w-3 h-3" /> Read-Only
            </span>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") load(1); }}
              className="pl-9 w-72"
            />
          </div>
          <Button onClick={() => load(1)} className="bg-teal text-white hover:bg-teal-mid">Apply</Button>
        </div>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Name</TableHead>
                  <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Email</TableHead>
                  <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Role</TableHead>
                  <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Plan</TableHead>
                  <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Subscription</TableHead>
                  <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</TableHead>
                  <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableBodyShimmer rows={8} cols={7} />
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="flex flex-col items-center justify-center py-16">
                        <Search className="w-10 h-10 text-gray-200 mb-3" />
                        <p className="text-sm font-medium text-gray-600">No users found</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {search ? "Try a different search term" : "Users will appear here once they register"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : rows.map((u, idx) => (
                  <TableRow
                    key={u.id}
                    className={idx % 2 === 0 ? "bg-white hover:bg-teal/5" : "bg-gray-50/50 hover:bg-teal/5"}
                  >
                    <TableCell className="px-4 py-3 font-medium text-gray-900">{u.name}</TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-500">{u.email}</TableCell>
                    <TableCell className="px-4 py-3 w-56">
                      <Select
                        value={u.role ?? ""}
                        onValueChange={(val) => val && changeRole(u.id, val)}
                        disabled={updatingRole === u.id || isReadOnly}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((r) => (
                            <SelectItem key={r.slug} value={r.slug}>{r.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {u.current_plan ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal/10 text-teal">
                            {u.current_plan}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                        {u.comped_upgrade_approved && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-warm/10 text-amber-warm border border-amber-warm/20">
                            Admin Approved
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {u.subscription_status ? (
                        <StatusPill
                          label={u.subscription_status.replace(/_/g, " ")}
                          style={STATUS_STYLES[u.subscription_status] ?? "bg-gray-100 text-gray-600"}
                        />
                      ) : (
                        <StatusPill label="Free" style={STATUS_STYLES.free} />
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <StatusPill
                        label={u.is_active ? "Active" : "Inactive"}
                        style={u.is_active ? STATUS_STYLES.active : STATUS_STYLES.inactive}
                      />
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      {!isReadOnly && (
                        <UpgradeButton userId={u.id} currentPlanSlug={u.current_plan_slug ?? undefined} />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50">
            <div className="text-xs text-gray-400">
              {meta ? `Page ${meta.current_page} of ${meta.last_page}` : ""}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!meta || meta.current_page <= 1 || loading}
                onClick={() => { const p = Math.max(1, (meta?.current_page ?? 1) - 1); setPage(p); load(p); }}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!meta || meta.current_page >= (meta?.last_page ?? 1) || loading}
                onClick={() => { const p = Math.min((meta?.last_page ?? 1), (meta?.current_page ?? 1) + 1); setPage(p); load(p); }}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UpgradeButton({ userId, currentPlanSlug }: { userId: number; currentPlanSlug?: string }) {
  const [open, setOpen] = useState(false);
  const [plans, setPlans] = useState<Array<{ uuid: string; name: string; slug: string; plan_type?: string; billing_interval?: string }>>([]);
  const [selected, setSelected] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [includeRevenue, setIncludeRevenue] = useState(false);

  const loadPlans = useCallback(async () => {
    try {
      const res = await adminService.getAllPlans();
      const list = Array.isArray((res as { data?: unknown[] })?.data)
        ? (res as { data: typeof plans }).data
        : Array.isArray(res) ? res : [];
      setPlans(list);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (open && plans.length === 0) loadPlans();
  }, [open, plans.length, loadPlans]);

  const submit = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await adminService.upgradeUserSubscription(userId, {
        plan_uuid: selected,
        comped: true,
        include_in_revenue: includeRevenue,
      });
      setOpen(false);
      toast({ description: "Subscription upgraded.", variant: "default" });
    } catch {
      toast({ description: "Failed to upgrade subscription.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)} className="text-xs">
        Upgrade
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[560px] max-w-[90vw] rounded-xl bg-white p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Upgrade Subscription</h3>
                <p className="text-xs text-gray-400">Current: {currentPlanSlug ?? "none"}</p>
              </div>
              <button className="text-sm text-gray-400 hover:text-gray-600" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Select Plan</label>
              <Select value={selected} onValueChange={(val) => val && setSelected(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.uuid} value={p.uuid}>
                      {p.name} {p.plan_type ? `· ${p.plan_type}` : ""} {p.billing_interval ? `· ${p.billing_interval}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-gray-700">Include in revenue reports</p>
                <p className="text-xs text-gray-400">Count this admin-applied upgrade towards revenue.</p>
              </div>
              <input
                type="checkbox"
                checked={includeRevenue}
                onChange={(e) => setIncludeRevenue(e.target.checked)}
                aria-label="Include in revenue"
                className="w-4 h-4 accent-teal"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button
                onClick={submit}
                disabled={!selected || saving}
                className="bg-teal text-white hover:bg-teal-mid"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
