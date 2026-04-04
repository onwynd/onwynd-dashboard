"use client";

import { useEffect, useState, useCallback } from "react";
import { adminService } from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import {
  Loader2,
  Plus,
  Trash2,
  Filter,
  Briefcase,
  MoreHorizontal,
  Pencil,
  ToggleLeft,
  RefreshCw,
  MapPin,
  CalendarClock,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface JobPosting {
  id: number;
  uuid: string;
  title: string;
  slug: string;
  department: string;
  location: string;
  type: string;
  salary_range: string | null;
  experience_level: string | null;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  benefits: string[];
  is_active: boolean;
  posted_at: string | null;
  application_deadline: string | null;
  max_applicants: number | null;
  created_at: string;
}

const initialForm = {
  title: "",
  department: "",
  location: "",
  type: "full-time",
  salary_range: "",
  experience_level: "mid",
  description: "",
  responsibilities: "",
  qualifications: "",
  benefits: "",
  is_active: true,
  application_deadline: "",
  max_applicants: "",
};

const JOB_TYPES = ["full-time", "part-time", "contract", "internship", "remote"];
const EXPERIENCE_LEVELS = ["entry", "mid", "senior", "lead", "executive"];

function typeBadge(type: string) {
  const colors: Record<string, string> = {
    "full-time": "bg-green-100 text-green-700",
    "part-time": "bg-blue-100 text-blue-700",
    "contract": "bg-yellow-100 text-yellow-700",
    "internship": "bg-purple-100 text-purple-700",
    "remote": "bg-cyan-100 text-cyan-700",
  };
  return (
    <Badge className={`${colors[type] ?? "bg-gray-100 text-gray-700"} hover:opacity-90 capitalize`}>
      {type}
    </Badge>
  );
}

export default function CareersPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = {};
      if (statusFilter !== "all") params.is_active = statusFilter === "active";
      if (typeFilter !== "all") params.type = typeFilter;
      if (search.trim()) params.search = search.trim();
      const data = await adminService.getCareers(params);
      // API returns a Laravel paginator: { current_page, data: [...], total, ... }
      const list: JobPosting[] = Array.isArray(data)
        ? data
        : Array.isArray((data as { data?: JobPosting[] })?.data)
          ? (data as { data: JobPosting[] }).data
          : [];
      setJobs(list);
    } catch {
      toast({ title: "Error", description: "Failed to fetch job postings", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, typeFilter, search]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const openCreate = () => {
    setEditingJob(null);
    setForm(initialForm);
    setIsDialogOpen(true);
  };

  const openEdit = (job: JobPosting) => {
    setEditingJob(job);
    setForm({
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      salary_range: job.salary_range ?? "",
      experience_level: job.experience_level ?? "mid",
      description: job.description,
      responsibilities: (job.responsibilities ?? []).join("\n"),
      qualifications: (job.qualifications ?? []).join("\n"),
      benefits: (job.benefits ?? []).join("\n"),
      is_active: job.is_active,
      application_deadline: job.application_deadline
        ? new Date(job.application_deadline).toISOString().split("T")[0]
        : "",
      max_applicants: job.max_applicants?.toString() ?? "",
    });
    setIsDialogOpen(true);
  };

  const parseLines = (text: string): string[] =>
    text.split("\n").map((l) => l.trim()).filter(Boolean);

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.department.trim() || !form.location.trim() || !form.description.trim()) {
      toast({ title: "Validation Error", description: "Title, department, location and description are required.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        department: form.department,
        location: form.location,
        type: form.type,
        salary_range: form.salary_range || undefined,
        experience_level: form.experience_level || undefined,
        description: form.description,
        responsibilities: parseLines(form.responsibilities),
        qualifications: parseLines(form.qualifications),
        benefits: parseLines(form.benefits),
        is_active: form.is_active,
        application_deadline: form.application_deadline || undefined,
        max_applicants: form.max_applicants ? Number(form.max_applicants) : undefined,
      };

      if (editingJob) {
        await adminService.updateCareer(editingJob.id, payload);
        toast({ title: "Success", description: "Job posting updated." });
      } else {
        await adminService.createCareer(payload);
        toast({ title: "Success", description: "Job posting created." });
      }
      setIsDialogOpen(false);
      fetchJobs();
    } catch {
      toast({ title: "Error", description: "Failed to save job posting.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (job: JobPosting) => {
    if (!confirm(`Delete "${job.title}"? This cannot be undone.`)) return;
    try {
      await adminService.deleteCareer(job.id);
      toast({ title: "Success", description: "Job posting deleted." });
      fetchJobs();
    } catch {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  const handleToggle = async (job: JobPosting) => {
    try {
      await adminService.toggleCareer(job.id);
      toast({ title: job.is_active ? "Deactivated" : "Activated", description: `"${job.title}" updated.` });
      fetchJobs();
    } catch {
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Career Postings</h2>
          <p className="text-muted-foreground">Manage job openings displayed on the careers page.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Job Posting
        </Button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Input
            placeholder="Search by title, department, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchJobs()}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={(v: string | null) => setStatusFilter(v ?? "all")}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={(v: string | null) => setTypeFilter(v ?? "all")}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {JOB_TYPES.map((t) => (
                <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="icon" onClick={fetchJobs} title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Postings ({jobs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No job postings found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium max-w-[180px] truncate">{job.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{job.department}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {job.location}
                      </div>
                    </TableCell>
                    <TableCell>{typeBadge(job.type)}</TableCell>
                    <TableCell className="text-sm capitalize text-muted-foreground">
                      {job.experience_level ?? "—"}
                    </TableCell>
                    <TableCell>
                      {job.is_active ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {job.posted_at ? new Date(job.posted_at).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {job.application_deadline ? (
                        <span className={new Date(job.application_deadline) < new Date() ? "text-destructive" : "text-muted-foreground"}>
                          <CalendarClock className="inline h-3 w-3 mr-1" />
                          {new Date(job.application_deadline).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(job)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggle(job)}>
                            <ToggleLeft className="mr-2 h-4 w-4" />
                            {job.is_active ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(job)}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingJob ? "Edit Job Posting" : "New Job Posting"}</DialogTitle>
            <DialogDescription>
              {editingJob ? "Update the job posting details." : "Create a new job posting visible on the careers page."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="job-title">Job Title *</Label>
                <Input
                  id="job-title"
                  placeholder="e.g. Senior Frontend Engineer"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Input
                  id="department"
                  placeholder="e.g. Engineering"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="e.g. Lagos, Nigeria"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-type">Job Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v: string | null) => setForm({ ...form, type: v ?? form.type })}
                >
                  <SelectTrigger id="job-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_TYPES.map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Experience Level</Label>
                <Select
                  value={form.experience_level}
                  onValueChange={(v: string | null) => setForm({ ...form, experience_level: v ?? form.experience_level })}
                >
                  <SelectTrigger id="experience">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE_LEVELS.map((l) => (
                      <SelectItem key={l} value={l} className="capitalize">{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="salary">Salary Range</Label>
                <Input
                  id="salary"
                  placeholder="e.g. $80,000 – $120,000 / year"
                  value={form.salary_range}
                  onChange={(e) => setForm({ ...form, salary_range: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Application Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={form.application_deadline}
                  onChange={(e) => setForm({ ...form, application_deadline: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-applicants">Max Applicants</Label>
                <Input
                  id="max-applicants"
                  type="number"
                  min={1}
                  placeholder="Leave blank for unlimited"
                  value={form.max_applicants}
                  onChange={(e) => setForm({ ...form, max_applicants: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Full job description"
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsibilities">Responsibilities</Label>
              <p className="text-xs text-muted-foreground">One item per line</p>
              <Textarea
                id="responsibilities"
                placeholder="Design and implement features&#10;Collaborate with cross-functional teams"
                rows={4}
                value={form.responsibilities}
                onChange={(e) => setForm({ ...form, responsibilities: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualifications">Qualifications</Label>
              <p className="text-xs text-muted-foreground">One item per line</p>
              <Textarea
                id="qualifications"
                placeholder="3+ years of React experience&#10;Strong TypeScript skills"
                rows={4}
                value={form.qualifications}
                onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="benefits">Benefits</Label>
              <p className="text-xs text-muted-foreground">One item per line</p>
              <Textarea
                id="benefits"
                placeholder="Health insurance&#10;Remote work options"
                rows={3}
                value={form.benefits}
                onChange={(e) => setForm({ ...form, benefits: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
              <Label>Active (visible on careers page)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingJob ? "Save Changes" : "Create Posting"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
