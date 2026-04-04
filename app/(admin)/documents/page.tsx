"use client";

import { useEffect, useMemo, useState } from "react";
import { adminService } from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal, Download, Search, Filter, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { downloadCSV } from "@/lib/export-utils";

type Resource = {
  id: number | string;
  title?: string;
  name?: string;
  type?: string;
  status?: "pending" | "approved" | "rejected" | string;
  created_at?: string;
  updated_at?: string;
  author?: string;
};

export default function AdminDocumentsPage() {
  const [items, setItems] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  async function load() {
    setIsLoading(true);
    try {
      const data = await adminService.getResources();
      const rows = Array.isArray(data) ? data : [];
      setItems(rows as Resource[]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return items.filter((r) => {
      const txt = `${r.title ?? r.name ?? ""} ${r.type ?? ""} ${r.status ?? ""} ${r.author ?? ""}`.toLowerCase();
      const matchSearch = txt.includes(s);
      const matchStatus = status === "all" ? true : (r.status ?? "").toLowerCase() === status;
      return matchSearch && matchStatus;
    });
  }, [items, search, status]);

  async function approve(id: number | string) {
    await adminService.approveResource(id);
    await load();
  }
  async function reject(id: number | string) {
    await adminService.rejectResource(id);
    await load();
  }
  async function remove(id: number | string) {
    await adminService.deleteResource(id);
    await load();
  }

  function handleExport() {
    const rows = filtered.map((r) => ({
      id: r.id,
      title: r.title ?? r.name ?? "",
      type: r.type ?? "",
      status: r.status ?? "",
      author: r.author ?? "",
      created_at: r.created_at ?? "",
    }));
    downloadCSV("admin-documents.csv", ["id", "title", "type", "status", "author", "created_at"], rows);
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
          <p className="text-sm text-muted-foreground">Manage uploaded resources and approvals</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" /> Export
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Resources</CardTitle>
            <CardDescription>Search and review pending items</CardDescription>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={status} onValueChange={(v: string | null) => setStatus(v ?? "all")}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-auto">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">Loading...</TableCell>
                  </TableRow>
                ) : filtered.length ? (
                  filtered.map((r) => (
                    <TableRow key={String(r.id)}>
                      <TableCell className="font-medium">{r.title ?? r.name ?? "—"}</TableCell>
                      <TableCell>{r.type ?? "—"}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1">
                          {String(r.status).toLowerCase() === "approved" && <CheckCircle className="h-4 w-4 text-green-500" />}
                          {String(r.status).toLowerCase() === "rejected" && <XCircle className="h-4 w-4 text-red-500" />}
                          <Badge variant="secondary" className="capitalize">{r.status ?? "pending"}</Badge>
                        </span>
                      </TableCell>
                      <TableCell>{r.author ?? "—"}</TableCell>
                      <TableCell>{r.created_at ? new Date(r.created_at).toLocaleString() : "—"}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => approve(r.id)}>Approve</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => reject(r.id)} className="text-red-600">Reject</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => remove(r.id)} className="text-red-600">
                              <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">No resources found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
