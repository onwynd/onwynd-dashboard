"use client";

// DB16: Admin Audit Log UI

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import client from "@/lib/api/client";

interface AuditLogEntry {
  id: number | string;
  user_id?: number;
  user_name?: string;
  user_email?: string;
  action: string;
  resource?: string;
  resource_id?: number | string;
  description?: string;
  ip_address?: string;
  created_at: string;
}

const ACTION_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  create: "default",
  update: "secondary",
  delete: "destructive",
  login: "outline",
  logout: "outline",
};

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchLogs = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await client.get("/api/v1/admin/audit-logs", {
        params: { page: p, per_page: 30, search: search || undefined },
      });
      const data = res.data?.data ?? res.data;
      const list: AuditLogEntry[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];
      if (p === 1) {
        setLogs(list);
      } else {
        setLogs((prev) => [...prev, ...list]);
      }
      setHasMore(list.length === 30);
      setPage(p);
    } catch {
      // silently fail; API may not exist yet
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchLogs(1); }, [fetchLogs]);

  return (
    <div className="flex-1 space-y-6 p-6 pt-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            Audit Log
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Immutable record of all admin actions.</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search by user or action…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-60"
          />
          <Button variant="outline" size="icon" onClick={() => fetchLogs(1)}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
          <CardDescription>Showing admin platform activity logs in reverse chronological order.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && logs.length === 0 ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No audit log entries found.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                        {format(new Date(log.created_at), "dd MMM yyyy HH:mm:ss")}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{log.user_name ?? `User #${log.user_id}`}</div>
                        {log.user_email && <div className="text-xs text-muted-foreground">{log.user_email}</div>}
                      </TableCell>
                      <TableCell>
                        <Badge variant={ACTION_VARIANT[log.action] ?? "outline"}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.resource ? (
                          <span>
                            {log.resource}
                            {log.resource_id ? <span className="text-muted-foreground"> #{log.resource_id}</span> : null}
                          </span>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {log.description ?? "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{log.ip_address ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {hasMore && (
                <div className="flex justify-center pt-4">
                  <Button variant="outline" onClick={() => fetchLogs(page + 1)} disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Load more
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
