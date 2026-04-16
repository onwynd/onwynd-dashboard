"use client";

import { useEffect, useState, useCallback } from "react";
import { hrService } from "@/lib/api/hr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Search, Eye, UserPlus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { format, parseISO } from "date-fns";

interface Application {
  uuid: string;
  applicant_name?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  position?: string;
  status: string;
  applied_at?: string;
  created_at?: string;
  resume_url?: string;
}

const ROLE_OPTIONS = [
  { value: "hr",             label: "HR" },
  { value: "finance",        label: "Finance" },
  { value: "tech",           label: "Tech / Engineering" },
  { value: "marketing",      label: "Marketing" },
  { value: "sales",          label: "Sales" },
  { value: "product",        label: "Product Manager" },
  { value: "legal",          label: "Legal" },
  { value: "compliance",     label: "Compliance" },
  { value: "support",        label: "Support" },
  { value: "secretary",      label: "Secretary" },
  { value: "employee",       label: "General Employee" },
  { value: "clinical",       label: "Clinical Advisor" },
  { value: "therapist",      label: "Therapist" },
];

const statusVariant = (status: string) => {
  switch (status) {
    case "accepted":
    case "hired":    return "default" as const;
    case "rejected": return "destructive" as const;
    case "reviewing":
    case "shortlisted":
    case "interviewed": return "secondary" as const;
    default:         return "outline" as const;
  }
};

function applicantName(app: Application): string {
  if (app.applicant_name) return app.applicant_name;
  return `${app.first_name ?? ""} ${app.last_name ?? ""}`.trim() || app.email;
}

export default function HRRecruitmentPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Onboard dialog
  const [onboarding, setOnboarding] = useState<Application | null>(null);
  const [onboardRole, setOnboardRole] = useState("employee");
  const [onboardDept, setOnboardDept] = useState("");
  const [sendInvite, setSendInvite] = useState(true);
  const [onboardSaving, setOnboardSaving] = useState(false);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await hrService.getJobApplications();
      const data = (res as any)?.data ?? res;
      const list = Array.isArray(data) ? data : (data as any)?.data ?? [];
      setApplications(Array.isArray(list) ? list : []);
    } catch {
      toast({ description: "Failed to load applications", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const handleStatusChange = async (uuid: string, status: string) => {
    try {
      await hrService.updateJobApplication(uuid, { status });
      setApplications((prev) => prev.map((a) => a.uuid === uuid ? { ...a, status } : a));
      toast({ description: "Application updated" });
    } catch {
      toast({ description: "Failed to update application", variant: "destructive" });
    }
  };

  const handleOnboard = async () => {
    if (!onboarding) return;
    setOnboardSaving(true);
    try {
      await hrService.onboardApplicant(onboarding.uuid, {
        role: onboardRole,
        department: onboardDept || undefined,
        send_invite: sendInvite,
      });
      setApplications((prev) =>
        prev.map((a) => a.uuid === onboarding.uuid ? { ...a, status: "hired" } : a)
      );
      toast({ title: "Onboarded!", description: `${applicantName(onboarding)} now has a dashboard account.` });
      setOnboarding(null);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to onboard applicant.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setOnboardSaving(false);
    }
  };

  const filtered = applications.filter((a) => {
    const name = applicantName(a);
    const matchesSearch = !search ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase()) ||
      a.position?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = {
    total:     applications.length,
    pending:   applications.filter((a) => a.status === "pending").length,
    reviewing: applications.filter((a) => a.status === "reviewing").length,
    accepted:  applications.filter((a) => ["accepted", "hired"].includes(a.status)).length,
  };

  const appliedAt = (app: Application) => {
    const raw = app.applied_at ?? app.created_at;
    if (!raw) return "—";
    try { return format(parseISO(raw), "MMM d, yyyy"); } catch { return raw; }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recruitment</h1>
        <p className="text-muted-foreground">Review and manage job applications.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{counts.total}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Pending</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">{counts.pending}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Reviewing</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{counts.reviewing}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Accepted / Hired</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{counts.accepted}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
          <CardDescription>All job applications submitted through the careers portal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search applicants..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="interviewed">Interviewed</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No applications found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((app) => (
                      <TableRow key={app.uuid}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{applicantName(app)}</p>
                            <p className="text-xs text-muted-foreground">{app.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{app.position ?? "—"}</TableCell>
                        <TableCell className="text-sm">{appliedAt(app)}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(app.status)}>{app.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {app.resume_url && (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={app.resume_url} target="_blank" rel="noopener noreferrer" className="gap-1">
                                  <Eye className="h-3.5 w-3.5" /> CV
                                </a>
                              </Button>
                            )}
                            {["accepted", "hired", "offered"].includes(app.status) && app.status !== "hired" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 text-teal border-teal hover:bg-teal/10"
                                onClick={() => {
                                  setOnboarding(app);
                                  setOnboardRole("employee");
                                  setOnboardDept("");
                                  setSendInvite(true);
                                }}
                              >
                                <UserPlus className="h-3.5 w-3.5" /> Onboard
                              </Button>
                            )}
                            {app.status !== "hired" && (
                              <Select
                                value={app.status}
                                onValueChange={(v) => v && handleStatusChange(app.uuid, v)}
                              >
                                <SelectTrigger className="h-7 w-[130px] text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="reviewing">Reviewing</SelectItem>
                                  <SelectItem value="shortlisted">Shortlist</SelectItem>
                                  <SelectItem value="interviewed">Interviewed</SelectItem>
                                  <SelectItem value="accepted">Accept</SelectItem>
                                  <SelectItem value="rejected">Reject</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                            {app.status === "hired" && (
                              <span className="text-xs text-green-700 font-medium">✓ Hired</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Onboard dialog */}
      <Dialog open={!!onboarding} onOpenChange={(open) => !open && setOnboarding(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Onboard {onboarding ? applicantName(onboarding) : ""}</DialogTitle>
            <DialogDescription>
              Create a dashboard account for this applicant. They will receive an invite email to set their password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Assign Role</Label>
              <Select value={onboardRole} onValueChange={(v) => v !== null && setOnboardRole(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Department <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input
                placeholder="e.g. Engineering, Finance…"
                value={onboardDept}
                onChange={(e) => setOnboardDept(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Send invite email</Label>
                <p className="text-xs text-muted-foreground">Applicant gets a link to set their password.</p>
              </div>
              <Switch checked={sendInvite} onCheckedChange={setSendInvite} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOnboarding(null)}>Cancel</Button>
            <Button onClick={handleOnboard} disabled={onboardSaving}>
              {onboardSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
