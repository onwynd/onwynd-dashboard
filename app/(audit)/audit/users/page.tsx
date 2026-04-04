"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import client from "@/lib/api/client";
import { RefreshCw, AlertTriangle, Search, Users, Activity, Clock, Shield } from "lucide-react";

interface UserActivity {
  user_id: number;
  user_name: string;
  email: string;
  role?: string;
  last_active?: string;
  actions_today?: number;
  flagged_actions?: number;
  status?: "active" | "inactive" | "suspended";
}

export default function UserActivityPage() {
  const [users,   setUsers]   = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [search,  setSearch]  = useState("");
  const [filtered, setFiltered] = useState<UserActivity[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Pull from admin_logs grouped by user as best available proxy
      const res = await client.get("/api/v1/audit/log", {
        params: { per_page: 100, page: 1 },
      }).catch(() => null);

      if (res?.data?.data) {
        // Aggregate by user_id
        const byUser: Record<string, UserActivity> = {};
        for (const ev of res.data.data) {
          const uid = String(ev.user_id ?? "system");
          if (!byUser[uid]) {
            byUser[uid] = {
              user_id: ev.user_id ?? 0,
              user_name: ev.user_name ?? "System",
              email: ev.user_email ?? "—",
              role: ev.role ?? "—",
              last_active: ev.timestamp,
              actions_today: 0,
              flagged_actions: 0,
              status: "active",
            };
          }
          byUser[uid].actions_today = (byUser[uid].actions_today ?? 0) + 1;
          if (ev.severity === "high" || ev.severity === "critical") {
            byUser[uid].flagged_actions = (byUser[uid].flagged_actions ?? 0) + 1;
          }
          if (ev.timestamp > (byUser[uid].last_active ?? "")) {
            byUser[uid].last_active = ev.timestamp;
          }
        }
        const list = Object.values(byUser).sort(
          (a, b) => (b.actions_today ?? 0) - (a.actions_today ?? 0)
        );
        setUsers(list);
        setFiltered(list);
      } else {
        setUsers([]);
        setFiltered([]);
      }
    } catch {
      setError("Unable to load user activity data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!search.trim()) { setFiltered(users); return; }
    const q = search.toLowerCase();
    setFiltered(users.filter(
      (u) => u.user_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    ));
  }, [search, users]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Activity</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Audit trail aggregated by user — today's sessions</p>
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

      {/* Summary */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Unique Users",    value: users.length,                                             icon: Users,    color: "text-blue-600"    },
            { label: "Total Actions",   value: users.reduce((s, u) => s + (u.actions_today ?? 0), 0),   icon: Activity, color: "text-slate-600"   },
            { label: "Flagged Actions", value: users.reduce((s, u) => s + (u.flagged_actions ?? 0), 0), icon: Shield,   color: "text-orange-600"  },
            { label: "Last Event",      value: users[0]?.last_active ? new Date(users[0].last_active).toLocaleTimeString() : "—", icon: Clock, color: "text-slate-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="px-4 py-3">
              <div className="flex items-center gap-2">
                <Icon className={`size-4 shrink-0 ${color}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-semibold">{value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="py-3 px-4 border-b">
          <CardTitle className="text-sm font-semibold">User Sessions — Today</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No user activity recorded.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                  <TableHead className="text-right">Flagged</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.user_id}>
                    <TableCell>
                      <p className="text-sm font-medium">{u.user_name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </TableCell>
                    <TableCell className="text-sm capitalize text-muted-foreground">{u.role}</TableCell>
                    <TableCell className="text-right text-sm font-medium">{u.actions_today ?? 0}</TableCell>
                    <TableCell className="text-right">
                      {(u.flagged_actions ?? 0) > 0 ? (
                        <Badge className="bg-orange-50 text-orange-700 hover:bg-orange-50">{u.flagged_actions}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {u.last_active ? new Date(u.last_active).toLocaleString() : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge className={u.status === "active" ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50" : "bg-slate-100 text-slate-600 hover:bg-slate-100"}>
                        {u.status ?? "active"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
