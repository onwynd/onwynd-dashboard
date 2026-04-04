"use client";

// DB17: Admin Distress Override Audit Log

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle, ShieldAlert } from "lucide-react";
import { format } from "date-fns";
import client from "@/lib/api/client";
import { PageHeader } from "@/components/shared/page-header";
import { TableBodyShimmer } from "@/components/shared/shimmer-skeleton";

interface DistressOverride {
  id: number | string;
  user_id?: number;
  user_name?: string;
  user_email?: string;
  admin_id?: number;
  admin_name?: string;
  reason?: string;
  messages_granted?: number;
  original_limit?: number;
  new_limit?: number;
  expires_at?: string | null;
  created_at: string;
}

export default function DistressOverrideAuditPage() {
  const [records, setRecords] = useState<DistressOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchRecords = useCallback(async (p = 1) => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await client.get("/api/v1/admin/distress-overrides", {
        params: { page: p, per_page: 30 },
      });
      const data = res.data?.data ?? res.data;
      const list: DistressOverride[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setRecords((prev) => (p === 1 ? list : [...prev, ...list]));
      setHasMore(list.length === 30);
      setPage(p);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        setFetchError(
          "The distress override log endpoint is not yet available on this environment. It will appear automatically once the backend is deployed."
        );
      } else {
        setFetchError("Failed to load distress override records. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRecords(1); }, [fetchRecords]);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Distress Override Log"
        subtitle="Audit trail of all manual AI quota overrides issued for high-distress users"
      >
        <Button variant="outline" size="sm" className="gap-2" onClick={() => fetchRecords(1)}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldAlert className="w-4 h-4 text-amber-warm" />
            Override Events
          </CardTitle>
          <CardDescription>
            Each row represents an admin-granted quota extension due to distress signals.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {fetchError ? (
            <div className="flex flex-col items-center gap-3 py-14 text-center px-6">
              <AlertTriangle className="w-10 h-10 text-amber-warm" />
              <p className="text-sm text-gray-500 max-w-md">{fetchError}</p>
              <Button variant="outline" size="sm" onClick={() => fetchRecords(1)} className="gap-2">
                <RefreshCw className="w-3.5 h-3.5" /> Retry
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Timestamp</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">User</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Granted By</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">Messages</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Expires</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && records.length === 0 ? (
                    <TableBodyShimmer rows={5} cols={6} />
                  ) : records.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <div className="flex flex-col items-center justify-center py-14">
                          <ShieldAlert className="w-10 h-10 text-gray-200 mb-3" />
                          <p className="text-sm font-medium text-gray-600">No distress overrides on record</p>
                          <p className="text-xs text-gray-400 mt-1">Override events will appear here when issued</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    records.map((r, idx) => (
                      <TableRow
                        key={r.id}
                        className={idx % 2 === 0 ? "bg-white hover:bg-teal/5" : "bg-gray-50/50 hover:bg-teal/5"}
                      >
                        <TableCell className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                          {format(new Date(r.created_at), "dd MMM yyyy HH:mm")}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">{r.user_name ?? `User #${r.user_id}`}</div>
                          {r.user_email && (
                            <div className="text-xs text-gray-400">{r.user_email}</div>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-600">
                          {r.admin_name ?? (r.admin_id ? `Admin #${r.admin_id}` : "—")}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-warm/10 text-amber-warm">
                            +{r.messages_granted ?? "—"}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-500">
                          {r.expires_at ? format(new Date(r.expires_at), "dd MMM yyyy") : "Never"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                          {r.reason ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {hasMore && (
            <div className="flex justify-center px-4 py-3 border-t border-gray-50">
              <Button variant="outline" size="sm" onClick={() => fetchRecords(page + 1)} disabled={loading} className="gap-2">
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Load more
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
