"use client";

import { useEffect, useState } from "react";
import client from "@/lib/api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Mail, Phone } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { format, parseISO } from "date-fns";

interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  status?: string;
  created_at: string;
  open_tickets?: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchCustomers = async (q = search, p = page) => {
    setLoading(true);
    try {
      const res = await client.get("/api/v1/admin/users", {
        params: { search: q || undefined, page: p, role: "customer", per_page: 20 },
      });
      const data = res.data?.data ?? res.data ?? {};
      const list = data?.data ?? (Array.isArray(data) ? data : []);
      setCustomers(list);
      setHasMore(!!data?.next_page_url);
    } catch {
      toast({ description: "Failed to load customers", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers(search, 1);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">View all customers who have submitted support requests.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
          <CardDescription>All registered customers in the system.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
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

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          No customers found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      customers.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">
                            {c.first_name} {c.last_name}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col text-xs text-muted-foreground gap-0.5">
                              <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{c.email}</span>
                              {c.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</span>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={c.status === "active" ? "default" : "secondary"}>
                              {c.status ?? "active"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {c.created_at ? (() => { try { return format(parseISO(c.created_at), "MMM d, yyyy"); } catch { return c.created_at; } })() : "—"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-between items-center">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => { setPage((p) => p - 1); fetchCustomers(search, page - 1); }}>
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">Page {page}</span>
                <Button variant="outline" size="sm" disabled={!hasMore} onClick={() => { setPage((p) => p + 1); fetchCustomers(search, page + 1); }}>
                  Next
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
