"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTherapistStore } from "@/store/therapist-store";
import { Plus, Pencil, Search, Filter, Trash2 } from "lucide-react";

type Category = "assessment" | "progress" | "goals" | "general";

export default function NotesPage() {
  const { notes, fetchNotes, createNote, updateNote, deleteNote } = useTherapistStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"all" | Category>("all");
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [form, setForm] = useState<{ clientName: string; category: Category; content: string; tags: string }>({
    clientName: "",
    category: "general",
    content: "",
    tags: "",
  });

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return notes.filter((n) => {
      const matchCategory = category === "all" ? true : (n.category || "general") === category;
      const text = `${n.clientName ?? ""} ${n.content ?? ""} ${(n.tags || []).join(" ")}`.toLowerCase();
      const matchSearch = text.includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [notes, search, category]);

  function openCreate() {
    setEditingId(null);
    setForm({ clientName: "", category: "general", content: "", tags: "" });
    setIsOpen(true);
  }
  function openEdit(id: string | number) {
    const n = notes.find((x) => String(x.id) === String(id));
    if (!n) return;
    setEditingId(id);
    setForm({
      clientName: n.clientName || "",
      category: (n.category as Category) || "general",
      content: n.content || "",
      tags: (n.tags || []).join(", "),
    });
    setIsOpen(true);
  }

  async function saveNote() {
    const payload = {
      clientName: form.clientName,
      category: form.category,
      content: form.content,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };
    if (editingId) {
      await updateNote(editingId, payload);
    } else {
      await createNote(payload);
    }
    setIsOpen(false);
  }

  async function handleDelete(id: string | number) {
    await deleteNote(id);
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clinical Notes</h2>
          <p className="text-sm text-muted-foreground">Manage client notes securely</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> New Note
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-base">Notes</CardTitle>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={category} onValueChange={(v: string | null) => setCategory((v ?? "") as typeof category)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="assessment">Assessment</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                  <SelectItem value="goals">Goals</SelectItem>
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
                  <TableHead>Client</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead className="w-[160px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((n) => (
                  <TableRow key={String(n.id)}>
                    <TableCell className="font-medium">{n.clientName || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">{n.category || "general"}</Badge>
                    </TableCell>
                    <TableCell>
                      {(n.tags || []).map((t, i) => (
                        <Badge key={`${n.id}-${i}`} variant="outline" className="mr-1">{t}</Badge>
                      ))}
                    </TableCell>
                    <TableCell className="max-w-xl truncate">{n.content}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(n.id!)}>
                          <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDelete(n.id!)}>
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!filtered.length && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      No notes found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <span />
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Note" : "New Note"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Client Name</label>
                <Input
                  value={form.clientName}
                  onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
                  placeholder="e.g. Jane Doe"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Category</label>
                <Select
                  value={form.category}
                  onValueChange={(v: string | null) => setForm((f) => ({ ...f, category: (v ?? "") as Category }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="assessment">Assessment</SelectItem>
                    <SelectItem value="progress">Progress</SelectItem>
                    <SelectItem value="goals">Goals</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Content</label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Write the clinical note here..."
                rows={6}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Tags (comma separated)</label>
              <Input
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                placeholder="e.g. anxiety, session-12, follow-up"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveNote}>
                {editingId ? "Save Changes" : "Create Note"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
