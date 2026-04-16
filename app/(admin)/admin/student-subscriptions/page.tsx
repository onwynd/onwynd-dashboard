"use client";

import { useEffect, useState, useCallback } from "react";
import { adminService } from "@/lib/api/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, GraduationCap, ShieldCheck, ShieldAlert, CalendarClock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { addYears, format, parseISO } from "date-fns";

type UserSubscription = {
  id: number;
  user_id: number;
  plan_id: number;
  status: string;
  plan_type: string;
  current_period_start?: string;
  current_period_end?: string;
  auto_renew: boolean;
  cancelled_at?: string;
  subscribed_at: string;
  user_name: string;
  user_email: string;
  plan_name: string;
  plan_slug: string;
  billing_interval: string;
  price_ngn?: number;
  price_usd?: number;
  student_verification_status?: string | null;
  student_verified_at?: string | null;
  student_email?: string | null;
  student_id?: string | null;
  comped_flag?: number | string | boolean | null;
  approved_by_name?: string | null;
};

type Meta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

function fmt(d?: string | null) {
  if (!d) return "—";
  try { return format(parseISO(d), "MMM d, yyyy"); } catch { return d; }
}

function computeMethod(s: UserSubscription): string {
  const email = (s.student_email ?? "").toLowerCase();
  const domain = email.includes("@") ? email.split("@").pop() ?? "" : email;
  if (domain.endsWith(".edu.ng") || domain.endsWith(".ac.ng")) return "Email Domain";
  if (s.student_id) return "Student ID";
  return "Manual";
}

function computeExpiry(verifiedAt?: string | null) {
  if (!verifiedAt) return "—";
  try {
    const dt = parseISO(verifiedAt);
    const exp = addYears(dt, 4);
    return format(exp, "MMM d, yyyy");
  } catch {
    return "—";
  }
}

export default function StudentSubscriptionsPage() {
  const [subs, setSubs] = useState<UserSubscription[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "cancelled" | "past_due" | "trial">("all");
  const [page, setPage] = useState(1);

  const load = useCallback(async (p = page, q = search, s = status) => {
    setLoading(true);
    try {
      const res = await adminService.getUserSubscriptions({
        page: p,
        search: q || undefined,
        status: s !== "all" ? s : undefined,
        plan_type: "d2c",
        per_page: 20,
      });
      const d = (res as any)?.data ?? res;
      const raw = (d as any)?.data ?? (Array.isArray(d) ? d : []);
      const list: UserSubscription[] = raw.filter((r: UserSubscription) => r.plan_slug === "student");
      setSubs(list);
      setMeta((d as any)?.meta ?? null);
    } catch {
      toast({ description: "Failed to load student subscriptions.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => { load(1, "", "active"); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            Student Subscriptions
          </h1>
          <p className="text-sm text-muted-foreground">
            Active users on the Student plan with verification details.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") load(1, search, status); }}
              />
            </div>
            <Select value={status} onValueChange={(v: any) => setStatus(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="past_due">Past Due</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => load(1, search, status)}>Apply</Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Renews</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center">
                      <Loader2 className="h-5 w-5 animate-spin inline-block text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : subs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                      No student subscriptions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  subs.map((s) => {
                    const verified = s.student_verification_status === "approved" || s.student_verification_status === "verified";
                    return (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.user_name}</TableCell>
                        <TableCell className="text-muted-foreground">{s.user_email}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{s.plan_name}</Badge>
                            {String(s.comped_flag) === "1" || String(s.comped_flag).toLowerCase() === "true" ? (
                              <span
                                title={s.approved_by_name ? `Approved by ${s.approved_by_name}` : "Approved by Admin"}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-sage/10 text-[#3d4a26] border border-sage/30"
                              >
                                Approved by Admin
                              </span>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="capitalize">{s.status.replace("_", " ")}</Badge>
                        </TableCell>
                        <TableCell>
                          {verified ? (
                            <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded-full text-xs">
                              <ShieldCheck className="h-3 w-3" /> {fmt(s.student_verified_at)}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-xs">
                              <ShieldAlert className="h-3 w-3" /> Pending
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs">{computeMethod(s)}</TableCell>
                        <TableCell className="text-xs">{computeExpiry(s.student_verified_at)}</TableCell>
                        <TableCell className="text-xs">{fmt(s.current_period_start ?? s.subscribed_at)}</TableCell>
                        <TableCell className="text-xs">{fmt(s.current_period_end)}</TableCell>
                        <TableCell className="text-right">
                          <UpgradeButton userId={s.user_id} currentPlanSlug={s.plan_slug} />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-muted-foreground">
              {meta ? `Page ${meta.current_page} of ${meta.last_page}` : ""}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!meta || meta.current_page <= 1 || loading}
                onClick={() => { const p = Math.max(1, (meta?.current_page ?? 1) - 1); setPage(p); load(p, search, status); }}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!meta || meta.current_page >= (meta?.last_page ?? 1) || loading}
                onClick={() => { const p = Math.min((meta?.last_page ?? 1), (meta?.current_page ?? 1) + 1); setPage(p); load(p, search, status); }}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center gap-3 text-sm text-muted-foreground">
          <CalendarClock className="h-4 w-4" />
          Student verification expires 4 years after approval. Renew upon graduation.
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
      const list = Array.isArray((res as any)?.data) ? (res as any).data : Array.isArray(res) ? res : [];
      setPlans(list);
    } catch {
      // ignore
    }
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
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Upgrade
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[560px] max-w-[90vw] rounded-xl bg-white p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold">Upgrade Subscription</h3>
                <p className="text-xs text-muted-foreground">Current: {currentPlanSlug ?? "none"}</p>
              </div>
              <button className="text-sm text-muted-foreground" onClick={() => setOpen(false)}>Close</button>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Plan</label>
              <Select value={selected} onValueChange={(v: string | null) => setSelected(v ?? "")}>
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
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Include in revenue reports</p>
                <p className="text-xs text-muted-foreground">Count this admin-applied upgrade towards revenue.</p>
              </div>
              <input
                type="checkbox"
                checked={includeRevenue}
                onChange={(e) => setIncludeRevenue(e.target.checked)}
                aria-label="Include in revenue"
                className="w-4 h-4"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={submit} disabled={!selected || saving}>
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
