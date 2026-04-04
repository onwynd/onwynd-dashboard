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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { MoreHorizontal, Download, Search, Filter, Pencil, Trash2, Plus, FileText } from "lucide-react";
import { downloadImportTemplate } from "@/lib/import-templates";
import { toast } from "@/components/ui/use-toast";

type Community = {
  id: number | string;
  name: string;
  slug?: string;
  uuid?: string;
  description?: string;
  icon_url?: string;
  category?: string;
  is_private: boolean;
  created_at?: string;
  updated_at?: string;
  rules?: unknown;
};

const emptyForm: Partial<Community> = {
  name: "",
  description: "",
  category: "",
  is_private: false,
};

export default function AdminCommunityPage() {
  const [items, setItems] = useState<Community[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [privacy, setPrivacy] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Community | null>(null);
  const [form, setForm] = useState<Partial<Community>>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      const params: Record<string, unknown> = {};
      if (search) params.search = search;
      if (category !== "all") params.category = category;
      if (privacy !== "all") params.is_private = privacy === "private";
      const data = await adminService.getCommunities(params);
      const rows = Array.isArray(data) ? data : [];
      setItems(rows as Community[]);
    } finally {
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories = useMemo(() => {
    return Array.from(new Set(items.map((r) => r.category).filter(Boolean))) as string[];
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((r) => {
      if (search && !(r.name || "").toLowerCase().includes(search.toLowerCase())) return false;
      if (category !== "all" && r.category !== category) return false;
      if (privacy !== "all" && String(r.is_private ? "private" : "public") !== privacy) return false;
      return true;
    });
  }, [items, search, category, privacy]);

  function startCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }
  function startEdit(c: Community) {
    setEditing(c);
    setForm({
      name: c.name,
      description: c.description,
      category: c.category,
      is_private: !!c.is_private,
    });
    setOpen(true);
  }

  async function save() {
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        description: form.description,
        category: form.category,
        is_private: !!form.is_private,
      };
      if (editing) {
        await adminService.updateCommunity(editing.id, payload);
      } else {
        await adminService.createCommunity(payload);
      }
      setOpen(false);
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: string | number) {
    await adminService.deleteCommunity(id);
    await load();
  }

  function handleExport() {
    const headers = ["id", "name", "category", "is_private", "created_at"];
    const dataRows = filtered.map((r) => [
      String(r.id ?? ""),
      String(r.name ?? ""),
      String(r.category ?? ""),
      r.is_private ? "private" : "public",
      String(r.created_at ?? ""),
    ]);
    const csv = [headers.join(","), ...dataRows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "admin-communities.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function handleDownloadTemplate() {
    downloadImportTemplate('community');
    toast({ title: "Template Downloaded", description: "Community import template downloaded successfully" });
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Communities</h2>
          <p className="text-sm text-muted-foreground">Manage communities and privacy</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <FileText className="h-4 w-4 mr-2" /> Template
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          <Button onClick={startCreate}>
            <Plus className="h-4 w-4 mr-2" /> New Community
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Communities</CardTitle>
            <CardDescription>Search and filter communities</CardDescription>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search communities..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={category} onValueChange={(v: string | null) => setCategory(v ?? "all")}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={privacy} onValueChange={(v: string | null) => setPrivacy(v ?? "all")}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by privacy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Privacy</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((community) => (
                <TableRow key={community.id}>
                  <TableCell className="font-medium">{community.name}</TableCell>
                  <TableCell>{community.category || "-"}</TableCell>
                  <TableCell>
                    {community.is_private ? (
                      <Badge className="bg-yellow-600">Private</Badge>
                    ) : (
                      <Badge variant="outline">Public</Badge>
                    )}
                  </TableCell>
                  <TableCell>{community.created_at || "-"}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => startEdit(community)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => remove(community.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Community" : "New Community"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={form.name || ""}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={form.description || ""}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Input
                  value={form.category || ""}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                />
              </div>
              <div className="space-y-2 flex items-end gap-2">
                <label className="text-sm font-medium">Private</label>
                <Switch
                  checked={!!form.is_private}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, is_private: v }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={submitting || !form.name}>
              {editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
