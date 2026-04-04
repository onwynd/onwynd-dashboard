"use client";

import { useEffect, useMemo, useState } from "react";
import client from "@/lib/api/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
// Using native select for simple filters to avoid type issues
import { Button } from "@/components/ui/button";

type Subscriber = {
  id: number;
  email: string;
  status: "pending" | "confirmed" | "unsubscribed";
  confirmation_token?: string | null;
  confirmed_at?: string | null;
  unsubscribed_at?: string | null;
  created_at: string;
};

type Paginated<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export default function SubscribersPage() {
  const [items, setItems] = useState<Subscriber[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((s) => s.email.toLowerCase().includes(q));
  }, [items, search]);

  async function fetchPage(p = 1, pp = perPage, st = status) {
    setLoading(true);
    try {
      const res = await client.get<{
        success: boolean;
        data: Paginated<Subscriber>;
      }>("/api/v1/marketing/newsletter/subscribers", {
        params: { page: p, per_page: pp, status: st || undefined },
      });
      const data = res.data.data;
      setItems(data.data);
      setPage(data.current_page);
      setPerPage(data.per_page);
      setLastPage(data.last_page);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPage(1, perPage, status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, perPage]);

  function formatDate(ts?: string | null) {
    if (!ts) return "-";
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return ts;
    }
  }

  async function handleUnsubscribe(email: string) {
    if (!confirm(`Unsubscribe ${email}?`)) return;
    await client.post("/api/v1/marketing/newsletter/unsubscribe", { email });
    fetchPage(page, perPage, status);
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Newsletter Subscribers</h1>
        <div className="text-sm text-muted-foreground">
          Total: {total.toLocaleString()}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-44 border rounded-md p-2"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="unsubscribed">Unsubscribed</option>
        </select>
        <select
          value={String(perPage)}
          onChange={(e) => setPerPage(parseInt(e.target.value, 10))}
          className="w-28 border rounded-md p-2"
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
        <Button variant="outline" onClick={() => fetchPage(1, perPage, status)}>
          Refresh
        </Button>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Subscribed</TableHead>
              <TableHead>Confirmed</TableHead>
              <TableHead>Unsubscribed</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>Loading…</TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>No subscribers</TableCell>
              </TableRow>
            ) : (
              filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.email}</TableCell>
                  <TableCell className="capitalize">{s.status}</TableCell>
                  <TableCell>{formatDate(s.created_at)}</TableCell>
                  <TableCell>{formatDate(s.confirmed_at)}</TableCell>
                  <TableCell>{formatDate(s.unsubscribed_at)}</TableCell>
                  <TableCell>
                    {s.status !== "unsubscribed" ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleUnsubscribe(s.email)}
                      >
                        Unsubscribe
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between p-3">
          <div className="text-sm">
            Page {page} of {lastPage}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => fetchPage(page - 1, perPage, status)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= lastPage}
              onClick={() => fetchPage(page + 1, perPage, status)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
