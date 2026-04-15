"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import client from "@/lib/api/client";
import { formatDistanceToNow } from "date-fns";
import { Activity, RefreshCw, Search, User, Shield, Settings, FileText, CreditCard } from "lucide-react";
import { ExecutiveBrandValuation } from "@/components/shared/executive-brand-valuation";
import { ExecutiveFinancePanel } from "@/components/shared/executive-finance-panel";
import { DailyTractionStrip } from "@/components/shared/daily-traction-strip";

interface ActivityItem {
  id: string | number;
  timestamp: string;
  action: string;
  user_name?: string | null;
  user_email?: string | null;
  target_type?: string | null;
  target_id?: string | number | null;
  details?: Record<string, unknown> | null;
  ip_address?: string | null;
}

const ACTION_ICONS: Record<string, React.ElementType> = {
  login: Shield,
  logout: Shield,
  create: FileText,
  update: Settings,
  delete: FileText,
  payment: CreditCard,
  default: Activity,
};

function actionIcon(action: string) {
  const key = Object.keys(ACTION_ICONS).find((k) => action.toLowerCase().includes(k));
  return ACTION_ICONS[key ?? "default"];
}

function actionColor(action: string): string {
  if (action.toLowerCase().includes("delete")) return "destructive";
  if (action.toLowerCase().includes("create")) return "default";
  if (action.toLowerCase().includes("login")) return "secondary";
  return "outline";
}

export default function CEOActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<"recent" | "30days" | "all">("recent");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 25;

  const load = useCallback(async (r = range) => {
    setLoading(true);
    try {
      const res = await client.get("/api/v1/ceo/activity", {
        params: { range: r, per_page: 100 },
        suppressErrorToast: true,
      });
      const data = res.data?.data ?? res.data;
      const items = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setActivities(items);
    } catch {
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [range]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const filtered = activities.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.action.toLowerCase().includes(q) ||
      (a.user_name ?? "").toLowerCase().includes(q) ||
      (a.user_email ?? "").toLowerCase().includes(q) ||
      (a.target_type ?? "").toLowerCase().includes(q)
    );
  });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  return (
    <div className="space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Activity Log</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Full audit trail of platform actions.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={range} onValueChange={(v) => { setRange(v as typeof range); setPage(1); load(v as typeof range); }}>
            <SelectTrigger className="w-36 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="size-8" onClick={() => load()} disabled={loading}>
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <ExecutiveBrandValuation mode="panel" />
      <DailyTractionStrip role="ceo" />
      <ExecutiveFinancePanel role="ceo" />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <Input
          placeholder="Search actions, users…"
          className="pl-8 h-8 text-sm"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {/* Activity list */}
      <Card>
        <CardContent className="p-0 divide-y">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4 px-4 py-3">
                <Skeleton className="size-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-3 w-20" />
              </div>
            ))
          ) : paginated.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              <Activity className="size-8 mx-auto mb-2 text-muted-foreground/30" />
              No activity found.
            </div>
          ) : paginated.map((a) => {
            const Icon = actionIcon(a.action);
            return (
              <div key={a.id} className="flex items-start gap-4 px-4 py-3 hover:bg-muted/20 transition-colors">
                <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Icon className="size-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium truncate">{a.action}</span>
                    <Badge variant={actionColor(a.action) as any} className="text-[10px] px-1.5 py-0 h-4">
                      {a.target_type ?? "system"}
                    </Badge>
                  </div>
                  {(a.user_name || a.user_email) && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <User className="size-3" />
                      {a.user_name ?? a.user_email}
                      {a.user_name && a.user_email && ` · ${a.user_email}`}
                    </p>
                  )}
                  {a.ip_address && (
                    <p className="text-xs text-muted-foreground/60 mt-0.5">IP: {a.ip_address}</p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground shrink-0 pt-0.5">
                  {formatDistanceToNow(new Date(a.timestamp), { addSuffix: true })}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{filtered.length} entries</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
            <span>Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
