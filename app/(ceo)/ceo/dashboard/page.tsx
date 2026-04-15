"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCEOStore } from "@/store/ceo-store";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { downloadCSV } from "@/lib/export-utils";
import client from "@/lib/api/client";
import { format } from "date-fns";
import { StickyNotes } from "@/components/shared/sticky-notes";
import { ExecutiveBrandValuation } from "@/components/shared/executive-brand-valuation";
import { ExecutiveFinancePanel } from "@/components/shared/executive-finance-panel";
import { DailyTractionStrip } from "@/components/shared/daily-traction-strip";

function Content() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isLoading = useCEOStore((s) => s.isLoading);
  const period = useCEOStore((s) => s.period);
  const setPeriod = useCEOStore((s) => s.setPeriod);
  const kpis = useCEOStore((s) => s.kpis);
  const revenue = useCEOStore((s) => s.revenueSeries);
  const userGrowth = useCEOStore((s) => s.userGrowthSeries);
  const leadSources = useCEOStore((s) => s.leadSources);
  const alerts = useCEOStore((s) => s.alerts);
  const fetchAll = useCEOStore((s) => s.fetchAll);
  const error = useCEOStore((s) => s.error);
  const [dismissed, setDismissed] = useState<string[]>(
    () => {
      if (typeof window === "undefined") return [];
      try {
        const raw = localStorage.getItem("ceo_alerts_dismissed");
        if (!raw) return [];
        const parsed = JSON.parse(raw) as unknown;
        return Array.isArray(parsed) ? (parsed as string[]) : [];
      } catch {
        return [];
      }
    }
  );
  const [openRevenue, setOpenRevenue] = useState(false);
  const [openLeads, setOpenLeads] = useState(false);
  const [openUsers, setOpenUsers] = useState(false);
  const [openActivity, setOpenActivity] = useState(false);
  const [activityRange, setActivityRange] = useState<"recent" | "30days" | "all">("recent");
  const [activityLoading, setActivityLoading] = useState(false);
  const [activities, setActivities] = useState<Array<{
    id: string | number;
    timestamp: string;
    action: string;
    user_name?: string | null;
    user_email?: string | null;
    target_type?: string | null;
    target_id?: string | number | null;
    details?: Record<string, unknown> | null;
    ip_address?: string | null;
  }>>([]);
  const fetchActivities = async (rng = activityRange) => {
    setActivityLoading(true);
    try {
      const res = await client.get("/api/v1/ceo/activity", { params: { range: rng, per_page: 20 } });
      const data = res.data?.data ?? res.data ?? [];
      setActivities(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
    } catch {
      setActivities([]);
    } finally {
      setActivityLoading(false);
    }
  };
  useEffect(() => { fetchActivities("recent"); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    const p = searchParams.get("period");
    const allowed = ["7days", "30days", "3months", "6months", "12months"] as const;
    if (p && (allowed as readonly string[]).includes(p) && p !== period) {
      setPeriod(p as "7days" | "30days" | "3months" | "6months" | "12months");
    }
  }, [searchParams, period, setPeriod]);

  useEffect(() => {
    const currentPeriod = useCEOStore.getState().period;
    if (new URLSearchParams(window.location.search).get("period") !== currentPeriod) {
      router.replace(`${pathname}?period=${currentPeriod}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, pathname]);

  const pieColors = ["#0ea5e9", "#22c55e", "#eab308", "#ef4444", "#8b5cf6", "#06b6d4"];

  function exportRevenue() {
    const headers = ["name", "value", "value2"];
    const rows = revenue.map((d) => ({ name: d.name, value: d.value, value2: d.value2 ?? "" }));
    downloadCSV("revenue.csv", headers, rows);
  }

  function exportLeadSources() {
    const headers = ["name", "value"];
    const rows = leadSources.map((d) => ({ name: d.name, value: d.value }));
    downloadCSV("lead-sources.csv", headers, rows);
  }

  function exportUserGrowth() {
    const headers = ["name", "value"];
    const rows = userGrowth.map((d) => ({ name: d.name, value: d.value }));
    downloadCSV("user-growth.csv", headers, rows);
  }

  return (
    <main className="flex-1 overflow-auto p-4 md:p-6 bg-background w-full space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">CEO Dashboard</h2>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={(v: string | null) => setPeriod((v ?? "") as "7days" | "30days" | "3months" | "6months" | "12months")}>
            <SelectTrigger size="sm" className="min-w-36">
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ExecutiveBrandValuation mode="panel" />
      <DailyTractionStrip role="ceo" />
      <ExecutiveFinancePanel role="ceo" />

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {alerts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {alerts.filter((a) => !dismissed.includes(a.id)).slice(0, 4).map((a) => {
            const href =
              a.id === "neg-margin"
                ? "/ceo/revenue"
                : a.id === "rev-drop"
                ? "/ceo/revenue"
                : a.id === "user-drop"
                ? "/ceo/analytics"
                : a.id === "high-churn"
                ? "/ceo/analytics"
                : a.id === "ltv-cac"
                ? "/ceo/revenue"
                : "/ceo/analytics";
            const variant =
              (a.level === "destructive" || a.level === "success" || a.level === "warning" || a.level === "info"
                ? a.level
                : "default") as "destructive" | "success" | "warning" | "info" | "default";
            return (
              <Link href={href} key={a.id} className="no-underline">
                <Alert variant={variant}>
                  <div className="flex w-full items-center justify-between">
                    <AlertDescription>{a.message}</AlertDescription>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.preventDefault();
                        const next = Array.from(new Set([...dismissed, a.id]));
                        setDismissed(next);
                        if (typeof window !== "undefined") {
                          localStorage.setItem("ceo_alerts_dismissed", JSON.stringify(next));
                        }
                      }}
                    >
                      Dismiss
                    </Button>
                  </div>
                </Alert>
              </Link>
            );
          })}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <Card key={k.id}>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">{k.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={k.id.startsWith("daily_") ? "text-3xl font-black tracking-tight" : "text-2xl font-bold"}>
                  {k.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Revenue vs Expenses</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={exportRevenue}>
                  Export CSV
                </Button>
                <Sheet open={openRevenue} onOpenChange={setOpenRevenue}>
                  <SheetTrigger asChild>
                    <Button size="sm" variant="outline">Quick View</Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <SheetHeader>
                      <SheetTitle>Revenue vs Expenses</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Period</TableHead>
                            <TableHead>Revenue</TableHead>
                            <TableHead>Expenses</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {revenue.map((r) => (
                            <TableRow key={r.name}>
                              <TableCell>{r.name}</TableCell>
                              <TableCell>{r.value}</TableCell>
                              <TableCell>{r.value2 ?? ""}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </SheetContent>
                </Sheet>
                <Button asChild size="sm" variant="secondary">
                  <Link href="/ceo/revenue">View Details</Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-80">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <AreaChart data={revenue}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="value" name="Revenue" stroke="#16a34a" fillOpacity={1} fill="url(#rev)" />
                  <Area type="monotone" dataKey="value2" name="Expenses" stroke="#ef4444" fillOpacity={1} fill="url(#exp)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lead Sources</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={exportLeadSources}>
                  Export CSV
                </Button>
                <Sheet open={openLeads} onOpenChange={setOpenLeads}>
                  <SheetTrigger asChild>
                    <Button size="sm" variant="outline">Quick View</Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <SheetHeader>
                      <SheetTitle>Lead Sources</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Source</TableHead>
                            <TableHead>Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {leadSources.map((l) => (
                            <TableRow key={l.name}>
                              <TableCell>{l.name}</TableCell>
                              <TableCell>{l.value}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </SheetContent>
                </Sheet>
                <Button asChild size="sm" variant="secondary">
                  <Link href="/ceo/leads">View Details</Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-80">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie data={leadSources} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {leadSources.map((_, i) => (
                      <Cell key={i} fill={pieColors[i % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>User Growth</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={exportUserGrowth}>
                Export CSV
              </Button>
              <Sheet open={openUsers} onOpenChange={setOpenUsers}>
                <SheetTrigger asChild>
                  <Button size="sm" variant="outline">Quick View</Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>User Growth</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Period</TableHead>
                          <TableHead>Users</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userGrowth.map((u) => (
                          <TableRow key={u.name}>
                            <TableCell>{u.name}</TableCell>
                            <TableCell>{u.value}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </SheetContent>
              </Sheet>
              <Button asChild size="sm" variant="secondary">
                <Link href="/ceo/analytics">View Details</Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-80">
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Users" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Activity Log</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={activityRange} onValueChange={(v: string | null) => { setActivityRange((v ?? "") as "recent" | "30days" | "all"); fetchActivities((v ?? "") as "recent" | "30days" | "all"); }}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Last 24 Hours</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
              <Sheet open={openActivity} onOpenChange={setOpenActivity}>
                <SheetTrigger asChild>
                  <Button size="sm" variant="outline">Quick View</Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>All Activities</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Time</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Target</TableHead>
                          <TableHead>IP</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activities.map((a) => (
                          <TableRow key={a.id}>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                              {format(new Date(a.timestamp), "dd MMM yyyy HH:mm:ss")}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm font-medium">{a.user_name ?? "—"}</div>
                              {a.user_email && <div className="text-xs text-muted-foreground">{a.user_email}</div>}
                            </TableCell>
                            <TableCell className="text-sm">{a.action}</TableCell>
                            <TableCell className="text-sm">
                              {a.target_type ? (
                                <span>
                                  {a.target_type}
                                  {a.target_id ? <span className="text-muted-foreground"> #{a.target_id}</span> : null}
                                </span>
                              ) : "—"}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{a.ip_address ?? "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activityLoading ? (
            <div className="flex justify-center py-8"><Skeleton className="h-6 w-40" /></div>
          ) : activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activities found.</p>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.slice(0, 8).map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(a.timestamp), "dd MMM HH:mm")}
                      </TableCell>
                      <TableCell className="text-sm">{a.user_name ?? "—"}</TableCell>
                      <TableCell className="text-sm">{a.action}</TableCell>
                      <TableCell className="text-sm">
                        {a.target_type ? (
                          <span>
                            {a.target_type}
                            {a.target_id ? <span className="text-muted-foreground"> #{a.target_id}</span> : null}
                          </span>
                        ) : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      <StickyNotes roleSlug="ceo" />
    </main>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Content />
    </Suspense>
  );
}
