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

type Course = {
  id: number | string;
  title: string;
  slug?: string;
  uuid?: string;
  description?: string;
  level?: string;
  duration_minutes?: number;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
};

const levels = ["beginner", "intermediate", "advanced"];

const emptyForm: Partial<Course> = {
  title: "",
  description: "",
  level: "beginner",
  duration_minutes: 0,
  is_published: false,
};

export default function AdminCoursesPage() {
  const [items, setItems] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("all");
  const [published, setPublished] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState<Partial<Course>>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      const params: Record<string, unknown> = {};
      if (search) params.search = search;
      if (level !== "all") params.level = level;
      if (published !== "all") params.is_published = published === "published";
      const res = await adminService.getCourses(params);
      const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : res?.data?.data || res?.data || [];
      setItems(rows as Course[]);
    } finally {
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return items.filter((r) => {
      if (search && !(r.title || "").toLowerCase().includes(search.toLowerCase())) return false;
      if (level !== "all" && r.level !== level) return false;
      if (published !== "all" && String(r.is_published ? "published" : "draft") !== published) return false;
      return true;
    });
  }, [items, search, level, published]);

  function startCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }
  function startEdit(c: Course) {
    setEditing(c);
    setForm({
      title: c.title,
      description: c.description,
      level: c.level || "beginner",
      duration_minutes: c.duration_minutes || 0,
      is_published: !!c.is_published,
    });
    setOpen(true);
  }

  async function save() {
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        description: form.description,
        level: form.level,
        duration_minutes: Number(form.duration_minutes || 0),
        is_published: !!form.is_published,
      };
      if (editing) {
        await adminService.updateCourse(editing.id, payload);
      } else {
        await adminService.createCourse(payload);
      }
      setOpen(false);
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: string | number) {
    await adminService.deleteCourse(id);
    await load();
  }

  function handleExport() {
    const headers = ["id", "title", "level", "is_published", "created_at"];
    const dataRows = filtered.map((r) => [
      String(r.id ?? ""),
      String(r.title ?? ""),
      String(r.level ?? ""),
      r.is_published ? "published" : "draft",
      String(r.created_at ?? ""),
    ]);
    const csv = [headers.join(","), ...dataRows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "admin-courses.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function handleDownloadTemplate() {
    downloadImportTemplate('courses');
    toast({ title: "Template Downloaded", description: "Courses import template downloaded successfully" });
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Courses</h2>
          <p className="text-sm text-muted-foreground">Manage courses and publishing status</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <FileText className="h-4 w-4 mr-2" /> Template
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          <Button onClick={startCreate}>
            <Plus className="h-4 w-4 mr-2" /> New Course
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Courses</CardTitle>
            <CardDescription>Search and filter courses</CardDescription>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={level} onValueChange={(v: string | null) => setLevel(v ?? "all")}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {levels.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={published} onValueChange={(v: string | null) => setPublished(v ?? "all")}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>{course.level || "-"}</TableCell>
                  <TableCell>
                    {course.is_published ? (
                      <Badge className="bg-green-600">Published</Badge>
                    ) : (
                      <Badge variant="outline">Draft</Badge>
                    )}
                  </TableCell>
                  <TableCell>{course.created_at || "-"}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => startEdit(course)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => remove(course.id)}>
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
            <DialogTitle>{editing ? "Edit Course" : "New Course"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={form.title || ""}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
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
                <label className="text-sm font-medium">Level</label>
                <Select
                  value={form.level || "beginner"}
                  onValueChange={(v: string | null) => setForm((f) => ({ ...f, level: v || "beginner" }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration (minutes)</label>
                <Input
                  type="number"
                  value={String(form.duration_minutes ?? 0)}
                  onChange={(e) => setForm((f) => ({ ...f, duration_minutes: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2 flex items-end gap-2">
                <label className="text-sm font-medium">Published</label>
                <Switch
                  checked={!!form.is_published}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, is_published: v }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={submitting || !form.title}>
              {editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
