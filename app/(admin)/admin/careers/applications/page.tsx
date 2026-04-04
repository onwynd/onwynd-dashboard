"use client";

import { useEffect, useState, useCallback } from "react";
import { adminService } from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogDescription,
  DialogFooter,
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Loader2,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Trash2,
  FileText,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending:     "bg-yellow-100 text-yellow-800",
  reviewing:   "bg-blue-100 text-blue-800",
  shortlisted: "bg-purple-100 text-purple-800",
  interviewed: "bg-indigo-100 text-indigo-800",
  offered:     "bg-cyan-100 text-cyan-800",
  hired:       "bg-green-100 text-green-800",
  rejected:    "bg-red-100 text-red-800",
  withdrawn:   "bg-gray-100 text-gray-700",
};

const ALL_STATUSES = ["pending","reviewing","shortlisted","interviewed","offered","hired","rejected","withdrawn"];

interface Application {
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  location?: string;
  cover_letter?: string;
  resume_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  experience?: Record<string, unknown>;
  status: string;
  hr_notes?: string;
  created_at: string;
  job_posting?: { title: string; department: string; slug: string };
  reviewer?: { first_name: string; last_name: string };
}

export default function JobApplicationsPage() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Application | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [hrNotes, setHrNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {};
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;
      const data = await adminService.getJobApplications(params);
      setApplications(Array.isArray(data) ? data : []);
    } catch {
      toast({ title: "Error", description: "Failed to load applications", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, toast]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const openDetail = async (app: Application) => {
    try {
      const full = await adminService.getJobApplication(app.uuid);
      const validFull = full && typeof full === 'object' && 'uuid' in full ? full as Application : null;
      setSelected(validFull ?? app);
      setHrNotes(validFull?.hr_notes ?? "");
      setNewStatus(validFull?.status ?? app.status);
      setDetailOpen(true);
    } catch {
      setSelected(app);
      setHrNotes(app.hr_notes ?? "");
      setNewStatus(app.status);
      setDetailOpen(true);
    }
  };

  const handleUpdate = async () => {
    if (!selected) return;
    setUpdateLoading(true);
    try {
      await adminService.updateJobApplication(selected.uuid, {
        status: newStatus,
        hr_notes: hrNotes,
      });
      toast({ title: "Updated", description: "Application updated successfully." });
      setDetailOpen(false);
      fetchApplications();
    } catch {
      toast({ title: "Error", description: "Failed to update application.", variant: "destructive" });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async (uuid: string) => {
    if (!confirm("Delete this application? This cannot be undone.")) return;
    try {
      await adminService.deleteJobApplication(uuid);
      toast({ title: "Deleted", description: "Application removed." });
      fetchApplications();
    } catch {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Job Applications</h1>
          <p className="text-muted-foreground">Review and manage all job applications.</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(v: string | null) => setStatusFilter(v ?? "all")}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {ALL_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applications ({applications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : applications.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-muted-foreground">
              <FileText className="mb-3 h-10 w-10" />
              <p>No applications found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.uuid}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{app.first_name} {app.last_name}</p>
                        <p className="text-xs text-muted-foreground">{app.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{app.job_posting?.title ?? "—"}</TableCell>
                    <TableCell>{app.job_posting?.department ?? "—"}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[app.status] ?? "bg-gray-100"}`}>
                        {app.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(app.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDetail(app)}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(app.uuid)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
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

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application — {selected?.first_name} {selected?.last_name}</DialogTitle>
            <DialogDescription>
              Applied for: {selected?.job_posting?.title} · {selected?.job_posting?.department}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />{selected.email}
                </div>
                {selected.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />{selected.phone}
                  </div>
                )}
                {selected.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />{selected.location}
                  </div>
                )}
              </div>

              {/* Links */}
              <div className="flex flex-wrap gap-3">
                {selected.resume_url && (
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL}/storage/${selected.resume_url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                  >
                    <FileText className="h-4 w-4" /> View Resume
                  </a>
                )}
                {selected.linkedin_url && (
                  <a href={selected.linkedin_url} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
                    <ExternalLink className="h-4 w-4" /> LinkedIn
                  </a>
                )}
                {selected.portfolio_url && (
                  <a href={selected.portfolio_url} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
                    <ExternalLink className="h-4 w-4" /> Portfolio
                  </a>
                )}
              </div>

              {/* Cover letter */}
              {selected.cover_letter && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cover Letter</p>
                  <p className="rounded-md border p-3 text-sm whitespace-pre-wrap">{selected.cover_letter}</p>
                </div>
              )}

              {/* Status update */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Update Status</label>
                <Select value={newStatus} onValueChange={(v: string | null) => setNewStatus(v ?? "")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* HR Notes */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">HR Notes (internal)</label>
                <Textarea
                  placeholder="Add internal notes about this applicant..."
                  value={hrNotes}
                  onChange={(e) => setHrNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={updateLoading}>
              {updateLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
