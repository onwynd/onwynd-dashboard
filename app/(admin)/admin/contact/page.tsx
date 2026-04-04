"use client";

import { useEffect, useState, useCallback } from "react";
import {
  adminContactService,
  type ContactSubmission,
  type ContactFilters,
  type ContactStats,
} from "@/lib/api/admin-contact.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Loader2,
  Trash2,
  Filter,
  MoreHorizontal,
  Eye,
  CheckCircle2,
  MessageSquare,
  RefreshCw,
  Mail,
  Search,
  StickyNote,
  AlertTriangle,
  Inbox,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

type Status = ContactSubmission["status"];

function statusBadge(status: Status) {
  const map: Record<Status, string> = {
    new: "bg-blue-100 text-blue-700 hover:bg-blue-100",
    open: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
    replied: "bg-purple-100 text-purple-700 hover:bg-purple-100",
    resolved: "bg-green-100 text-green-700 hover:bg-green-100",
    spam: "bg-red-100 text-red-700 hover:bg-red-100",
  };
  const labels: Record<Status, string> = {
    new: "New",
    open: "Open",
    replied: "Replied",
    resolved: "Resolved",
    spam: "Spam",
  };
  return <Badge className={map[status] ?? ""}>{labels[status] ?? status}</Badge>;
}

function subjectLabel(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function AdminContactPage() {
  const [items, setItems] = useState<ContactSubmission[]>([]);
  const [stats, setStats] = useState<ContactStats | null>(null);
  const [pagination, setPagination] = useState({ total: 0, last_page: 1, current_page: 1, per_page: 25 });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ContactFilters["status"]>("all");
  const [subjectFilter, setSubjectFilter] = useState<ContactFilters["subject"]>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ContactSubmission | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);

  const fetchItems = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const data = await adminContactService.getSubmissions({
        status: statusFilter,
        subject: subjectFilter,
        search: search || undefined,
        page,
        per_page: 25,
      });
      setItems(data.submissions ?? []);
      setStats(data.stats ?? null);
      setPagination(data.pagination ?? { total: 0, last_page: 1, current_page: 1, per_page: 25 });
    } catch {
      toast({ title: "Error", description: "Failed to fetch contact submissions", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, subjectFilter, search]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openDetail = async (item: ContactSubmission) => {
    setSelected(item);
    setNoteText("");
    setDetailLoading(true);
    try {
      const full = await adminContactService.getSubmission(item.id);
      setSelected(full);
      // refresh list so status change (new→open) is reflected
      fetchItems(pagination.current_page);
    } catch {
      // fall back to list data
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusChange = async (id: number, status: Status) => {
    try {
      const updated = await adminContactService.updateStatus(id, status);
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: updated.status } : i)));
      if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status: updated.status } : prev);
      toast({ title: "Updated", description: `Status set to ${status}.` });
    } catch {
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    }
  };

  const handleAddNote = async () => {
    if (!selected || !noteText.trim()) return;
    setNoteLoading(true);
    try {
      const updated = await adminContactService.addNote(selected.id, noteText.trim());
      setSelected(updated);
      setNoteText("");
      toast({ title: "Note added" });
    } catch {
      toast({ title: "Error", description: "Failed to add note.", variant: "destructive" });
    } finally {
      setNoteLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this submission permanently?")) return;
    try {
      await adminContactService.deleteSubmission(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      if (selected?.id === id) setSelected(null);
      toast({ title: "Deleted" });
    } catch {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Contact Inbox</h2>
          <p className="text-muted-foreground">Manage inbound messages from the contact form.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchItems(pagination.current_page)}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {(
            [
              { label: "Total", value: stats.total, icon: Inbox, color: "text-foreground" },
              { label: "New", value: stats.new, icon: Mail, color: "text-blue-600" },
              { label: "Open", value: stats.open, icon: MessageSquare, color: "text-yellow-600" },
              { label: "Replied", value: stats.replied, icon: CheckCircle2, color: "text-purple-600" },
              { label: "Resolved", value: stats.resolved, icon: CheckCircle2, color: "text-green-600" },
              { label: "Spam", value: stats.spam, icon: AlertTriangle, color: "text-red-600" },
            ] as const
          ).map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="pt-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-xl font-bold">{value}</p>
                </div>
                <Icon className={`h-6 w-6 opacity-20 ${color}`} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search name, email or ticket…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ContactFilters["status"])}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="replied">Replied</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="spam">Spam</SelectItem>
          </SelectContent>
        </Select>
        <Select value={subjectFilter} onValueChange={(v) => setSubjectFilter(v as ContactFilters["subject"])}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="support">Support</SelectItem>
            <SelectItem value="partnerships">Partnerships</SelectItem>
            <SelectItem value="press">Press</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submissions ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Inbox className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No submissions found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} className={item.status === "new" ? "font-medium" : ""}>
                    <TableCell className="text-xs text-muted-foreground font-mono">{item.ticket_id}</TableCell>
                    <TableCell className="text-sm">
                      <div>{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.email}</div>
                    </TableCell>
                    <TableCell className="text-sm">{subjectLabel(item.subject)}</TableCell>
                    <TableCell className="max-w-[220px] truncate text-sm text-muted-foreground">
                      {item.message}
                    </TableCell>
                    <TableCell>{statusBadge(item.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDetail(item)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {item.status !== "open" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(item.id, "open")}>
                              <MessageSquare className="mr-2 h-4 w-4 text-yellow-600" />
                              Mark Open
                            </DropdownMenuItem>
                          )}
                          {item.status !== "replied" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(item.id, "replied")}>
                              <Mail className="mr-2 h-4 w-4 text-purple-600" />
                              Mark Replied
                            </DropdownMenuItem>
                          )}
                          {item.status !== "resolved" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(item.id, "resolved")}>
                              <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                              Mark Resolved
                            </DropdownMenuItem>
                          )}
                          {item.status !== "spam" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(item.id, "spam")}>
                              <AlertTriangle className="mr-2 h-4 w-4 text-red-600" />
                              Mark as Spam
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.current_page <= 1}
            onClick={() => fetchItems(pagination.current_page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.current_page} of {pagination.last_page}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.current_page >= pagination.last_page}
            onClick={() => fetchItems(pagination.current_page + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contact Submission</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              {detailLoading && (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}

              {/* Header info */}
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <p className="font-semibold text-base">{selected.name}</p>
                  <p className="text-sm text-muted-foreground">{selected.email}</p>
                  {selected.phone && <p className="text-sm text-muted-foreground">{selected.phone}</p>}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {statusBadge(selected.status)}
                  <Badge variant="outline">{subjectLabel(selected.subject)}</Badge>
                  <span className="text-xs text-muted-foreground font-mono">{selected.ticket_id}</span>
                </div>
              </div>

              {/* Message */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">Message</p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap bg-muted/40 rounded-lg p-3">
                  {selected.message}
                </p>
              </div>

              {/* Internal notes */}
              {selected.internal_notes && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wide flex items-center gap-1.5">
                    <StickyNote className="h-3.5 w-3.5" />
                    Internal Notes
                  </p>
                  <p className="text-sm whitespace-pre-wrap bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-3">
                    {selected.internal_notes}
                  </p>
                </div>
              )}

              {/* Add note */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">Add Note</p>
                <Textarea
                  placeholder="Internal note visible only to admins…"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={3}
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  disabled={!noteText.trim() || noteLoading}
                  onClick={handleAddNote}
                >
                  {noteLoading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                  Save Note
                </Button>
              </div>

              {/* Status actions */}
              <div className="flex gap-2 flex-wrap pt-1 border-t">
                {selected.status !== "replied" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(selected.id, "replied")}
                  >
                    <Mail className="mr-2 h-3.5 w-3.5" />
                    Mark Replied
                  </Button>
                )}
                {selected.status !== "resolved" && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(selected.id, "resolved")}
                  >
                    <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                    Mark Resolved
                  </Button>
                )}
                {selected.status !== "spam" && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => { handleStatusChange(selected.id, "spam"); setSelected(null); }}
                  >
                    <AlertTriangle className="mr-2 h-3.5 w-3.5" />
                    Spam
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive ml-auto"
                  onClick={() => { handleDelete(selected.id); }}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Received {new Date(selected.created_at).toLocaleString()}
                {selected.replied_at && ` · Replied ${new Date(selected.replied_at).toLocaleString()}`}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
