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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, Users, TrendingUp, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { format, parseISO } from "date-fns";

interface UserSubscription {
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
}

interface Stats {
  total_active: number;
  expiring_soon: number;
  cancelled_this_month: number;
  estimated_mrr_ngn: number;
  by_category: {
    d2c: number;
    b2b_corporate: number;
    b2b_university: number;
    b2b_faith_ngo: number;
  };
}

interface Meta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

const PLAN_TYPES = [
  { value: "all",           label: "All",         description: "All subscribers" },
  { value: "d2c",           label: "Individual",   description: "Direct-to-consumer plans" },
  { value: "b2b_corporate", label: "Corporate",    description: "B2B corporate plans" },
  { value: "b2b_university", label: "University",  description: "University & campus plans" },
  { value: "b2b_faith_ngo", label: "Faith & NGO",  description: "Faith & non-profit plans" },
];

const STATUS_COLORS: Record<string, string> = {
  active:   "bg-green-100 text-green-700",
  cancelled:"bg-red-100 text-red-700",
  expired:  "bg-gray-100 text-gray-600",
  trialing: "bg-blue-100 text-blue-700",
  past_due: "bg-orange-100 text-orange-700",
};

const PLAN_TYPE_COLORS: Record<string, string> = {
  d2c:            "bg-violet-100 text-violet-700",
  b2b_corporate:  "bg-blue-100 text-blue-700",
  b2b_university: "bg-cyan-100 text-cyan-700",
  b2b_faith_ngo:  "bg-green-100 text-green-700",
};

function safeFmt(dateStr?: string) {
  if (!dateStr) return "—";
  try { return format(parseISO(dateStr), "MMM d, yyyy"); } catch { return dateStr; }
}

export default function AdminFinanceSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planTypeFilter, setPlanTypeFilter] = useState("all");
  const [page, setPage] = useState(1);

  const load = useCallback(async (
    p = page,
    q = search,
    s = statusFilter,
    pt = planTypeFilter,
  ) => {
    setLoading(true);
    try {
      const res = await adminService.getUserSubscriptions({
        page: p,
        search: q || undefined,
        status: s !== "all" ? s : undefined,
        plan_type: pt !== "all" ? pt : undefined,
        per_page: 20,
      });
      setSubscriptions(res.data ?? []);
      setStats(res.stats ?? null);
      setMeta(res.meta ?? null);
    } catch {
      toast({ description: "Failed to load subscriptions.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, planTypeFilter]);

  useEffect(() => { load(1, "", "all", "all"); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load(1, search, statusFilter, planTypeFilter);
  };

  const handleStatusChange = (v: string | null) => {
    if (!v) return;
    setStatusFilter(v);
    setPage(1);
    load(1, search, v, planTypeFilter);
  };

  const handlePlanTypeChange = (v: string) => {
    setPlanTypeFilter(v);
    setPage(1);
    load(1, search, statusFilter, v);
  };

  // Category breakdown badges — always based on global stats
  const cat = stats?.by_category;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Subscriptions</h1>
        <p className="text-muted-foreground">Active subscribers across all plan categories.</p>
      </div>

      {/* Global Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Subscribers", value: stats?.total_active ?? "—",       icon: Users,         color: "text-green-600" },
          { label: "Expiring in 30 Days", value: stats?.expiring_soon ?? "—",      icon: AlertTriangle, color: "text-amber-600" },
          { label: "Cancelled This Month", value: stats?.cancelled_this_month ?? "—", icon: XCircle,    color: "text-red-500"   },
          {
            label: "Est. MRR",
            value: stats?.estimated_mrr_ngn != null
              ? `₦${stats.estimated_mrr_ngn.toLocaleString()}`
              : "—",
            icon: TrendingUp,
            color: "text-primary",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 pt-5">
              <Icon className={`h-5 w-5 shrink-0 ${color}`} />
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Per-category active counts */}
      {cat && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { key: "d2c",            label: "Individual",  color: "bg-violet-50 border-violet-200" },
            { key: "b2b_corporate",  label: "Corporate",   color: "bg-blue-50 border-blue-200" },
            { key: "b2b_university", label: "University",  color: "bg-cyan-50 border-cyan-200" },
            { key: "b2b_faith_ngo",  label: "Faith & NGO", color: "bg-green-50 border-green-200" },
          ].map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => handlePlanTypeChange(planTypeFilter === key ? "all" : key)}
              className={`rounded-lg border p-3 text-left transition-all ${color} ${planTypeFilter === key ? "ring-2 ring-primary" : "hover:opacity-80"}`}
            >
              <p className="text-2xl font-bold">{cat[key as keyof typeof cat] ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              <p className="text-[10px] text-muted-foreground">active subscribers</p>
            </button>
          ))}
        </div>
      )}

      {/* Plan-type tabs + status filter row */}
      <div className="space-y-3">
        <Tabs value={planTypeFilter} onValueChange={handlePlanTypeChange}>
          <TabsList className="flex-wrap h-auto gap-1">
            {PLAN_TYPES.map((pt) => (
              <TabsTrigger key={pt.value} value={pt.value}>
                {pt.label}
                {pt.value !== "all" && cat && (
                  <span className="ml-1.5 text-xs opacity-60">
                    ({cat[pt.value as keyof typeof cat] ?? 0})
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button type="submit" variant="secondary">Search</Button>
          </form>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="trialing">Trialing</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="past_due">Past Due</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Auto-Renew</TableHead>
                  <TableHead>Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                      No subscriptions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  subscriptions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <div className="font-medium text-sm">{sub.user_name}</div>
                        <div className="text-xs text-muted-foreground">{sub.user_email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{sub.plan_name}</div>
                        <div className="text-xs text-muted-foreground capitalize">{sub.billing_interval}</div>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PLAN_TYPE_COLORS[sub.plan_type] ?? "bg-gray-100 text-gray-600"}`}>
                          {PLAN_TYPES.find((p) => p.value === sub.plan_type)?.label ?? sub.plan_type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[sub.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {sub.status.replace("_", " ")}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {safeFmt(sub.current_period_start ?? sub.subscribed_at)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {safeFmt(sub.current_period_end)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={sub.auto_renew ? "default" : "secondary"}>
                          {sub.auto_renew ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {sub.price_ngn != null && (
                          <span>₦{sub.price_ngn.toLocaleString()}</span>
                        )}
                        {sub.price_usd != null && (
                          <span className="text-muted-foreground text-xs ml-1">/ ${sub.price_usd}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {meta && (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => { const p = page - 1; setPage(p); load(p, search, statusFilter, planTypeFilter); }}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {meta.current_page} of {meta.last_page} · {meta.total} total
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= (meta?.last_page ?? 1)}
                onClick={() => { const p = page + 1; setPage(p); load(p, search, statusFilter, planTypeFilter); }}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
