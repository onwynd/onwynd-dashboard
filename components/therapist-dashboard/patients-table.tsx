"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  Loader2,
  AlertTriangle,
  RefreshCw,
  ShieldOff,
  Mail,
  UserPlus,
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTherapistStore, type Patient } from "@/store/therapist-store";
import { useLoadingTimeout } from "@/hooks/use-loading-timeout";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { therapistService } from "@/lib/api/therapist";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  active: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  inactive: {
    bg: "bg-slate-50 dark:bg-slate-950/30",
    text: "text-slate-600 dark:text-slate-400",
    border: "border-slate-200 dark:border-slate-800",
  },
  monitoring: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
  },
  critical: {
    bg: "bg-red-50 dark:bg-red-950/30",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
  },
  discharged: {
    bg: "bg-orange-50 dark:bg-orange-950/30",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-200 dark:border-orange-800",
  },
};

/** Mask an email address for privacy: j***@example.com */
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, 1);
  return `${visible}***@${domain}`;
}

interface PatientInvite {
  id: number;
  email: string;
  message: string | null;
  accepted_at: string | null;
  expires_at: string;
  created_at: string;
}

type ViewTab = "patients" | "invites";

export function PatientsTable() {
  const patients = useTherapistStore((state) => state.patients);
  const fetchPatients = useTherapistStore((state) => state.fetchPatients);
  const searchQuery = useTherapistStore((state) => state.searchQuery);
  const statusFilter = useTherapistStore((state) => state.statusFilter);
  const setSearchQuery = useTherapistStore((state) => state.setSearchQuery);
  const setStatusFilter = useTherapistStore((state) => state.setStatusFilter);
  const consentRequired = useTherapistStore((state) => state.consentRequired);
  const consentMessage = useTherapistStore((state) => state.consentMessage);
  const clearConsentRequired = useTherapistStore((state) => state.clearConsentRequired);

  const [viewTab, setViewTab] = useState<ViewTab>("patients");
  const [sortConfig, setSortConfig] = useState<{ key: keyof Patient; direction: "asc" | "desc" } | null>(null);

  // Invite dialog state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  // Pending invites
  const [invites, setInvites] = useState<PatientInvite[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(false);

  const { isLoading, isTimedOut, startLoading, stopLoading } = useLoadingTimeout({
    timeout: 30000,
    onTimeout: () => {
      toast({
        title: "Loading Timeout",
        description: "Patient data is taking longer than expected to load.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    startLoading();
    fetchPatients().finally(() => stopLoading());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadInvites = async () => {
    setLoadingInvites(true);
    try {
      const data = await therapistService.getPatientInvites();
      setInvites(Array.isArray(data) ? data : (data as any)?.data ?? []);
    } catch {
      toast({ title: "Error", description: "Could not load invites.", variant: "destructive" });
    } finally {
      setLoadingInvites(false);
    }
  };

  useEffect(() => {
    if (viewTab === "invites") loadInvites();
  }, [viewTab]);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const hasActiveFilters = statusFilter !== "all";

  const handleSort = (key: keyof Patient) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return current.direction === "asc" ? { key, direction: "desc" } : null;
      }
      return { key, direction: "asc" };
    });
  };

  const filteredPatients = useMemo(() => {
    const result = patients.filter((patient) => {
      const fullName = `${patient.first_name} ${patient.last_name ?? ""}`;
      const matchesSearch =
        fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (patient.email ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.uuid.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || (patient.status ?? "active").toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue === undefined || bValue === undefined) return 0;
        if (aValue! < bValue!) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue! > bValue!) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [patients, searchQuery, statusFilter, sortConfig]);

  const paginatedPatients = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredPatients.slice(startIndex, startIndex + pageSize);
  }, [filteredPatients, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const handleExport = () => {
    const headers = ["ID", "Name", "Email (masked)", "Status", "Joined"];
    const csvContent = [
      headers.join(","),
      ...filteredPatients.map((p) => [
        p.uuid,
        `"${p.first_name}${p.last_name ? " " + p.last_name : ""}"`,
        p.email ? maskEmail(p.email) : "protected",
        p.status || "active",
        format(new Date(p.created_at), "yyyy-MM-dd"),
      ].join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "patients_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Exported", description: "Patients list exported to CSV" });
  };

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) {
      toast({ title: "Email required", description: "Please enter an email address.", variant: "destructive" });
      return;
    }
    setIsInviting(true);
    try {
      await therapistService.invitePatient(inviteEmail.trim(), inviteMessage.trim() || undefined);
      toast({ title: "Invite sent", description: `An invitation has been sent to ${inviteEmail}.` });
      setInviteOpen(false);
      setInviteEmail("");
      setInviteMessage("");
      if (viewTab === "invites") loadInvites();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed to send invite.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsInviting(false);
    }
  };

  const handleRevokeInvite = async (invite: PatientInvite) => {
    if (!confirm(`Revoke invite to ${invite.email}?`)) return;
    try {
      await therapistService.revokePatientInvite(invite.id);
      toast({ title: "Revoked", description: `Invite to ${invite.email} has been revoked.` });
      setInvites((prev) => prev.filter((i) => i.id !== invite.id));
    } catch {
      toast({ title: "Error", description: "Could not revoke invite.", variant: "destructive" });
    }
  };

  const inviteStatus = (invite: PatientInvite) => {
    if (invite.accepted_at) return "accepted";
    if (new Date(invite.expires_at) < new Date()) return "expired";
    return "pending";
  };

  return (
    <>
      <div className="rounded-xl border bg-card overflow-hidden">
        {consentRequired && (
          <div className="px-5 pt-4">
            <Alert variant="info" className="border-blue-200">
              <AlertTitle>Consent Required</AlertTitle>
              <AlertDescription className="flex items-center justify-between gap-4">
                <span>{consentMessage || "This patient has not granted progress access. Ask them to enable \"Share Progress with Therapist\" in their settings."}</span>
                <Button variant="outline" size="sm" onClick={clearConsentRequired}>
                  Dismiss
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Users className="size-5 text-muted-foreground" />
              <button
                onClick={() => setViewTab("patients")}
                className={cn(
                  "text-sm font-medium transition-colors",
                  viewTab === "patients" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Patients
              </button>
              <Badge variant="secondary">{filteredPatients.length}</Badge>
            </div>
            <span className="text-muted-foreground/50">|</span>
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-muted-foreground" />
              <button
                onClick={() => setViewTab("invites")}
                className={cn(
                  "text-sm font-medium transition-colors",
                  viewTab === "invites" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Invites
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {viewTab === "patients" && (
              <>
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full sm:w-[220px] h-9"
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 gap-2">
                      <Filter className="size-4" />
                      Filter
                      {hasActiveFilters && <span className="size-1.5 rounded-full bg-primary" />}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Status</DropdownMenuLabel>
                    {["all", "active", "inactive", "monitoring", "critical", "discharged"].map((s) => (
                      <DropdownMenuCheckboxItem
                        key={s}
                        checked={statusFilter === s}
                        onCheckedChange={() => setStatusFilter(s)}
                      >
                        {s === "all" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" size="sm" className="h-9 gap-2" onClick={handleExport}>
                  <Download className="size-4" />
                  Export
                </Button>
              </>
            )}

            <Button
              size="sm"
              className="h-9 gap-2 bg-teal text-white hover:bg-teal-mid"
              onClick={() => setInviteOpen(true)}
            >
              <UserPlus className="size-4" />
              Invite Patient
            </Button>
          </div>
        </div>

        {/* Patients table */}
        {viewTab === "patients" && (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-[250px] cursor-pointer" onClick={() => handleSort("first_name")}>
                  <div className="flex items-center gap-2">
                    Patient Name
                    {sortConfig?.key === "first_name" &&
                      (sortConfig.direction === "asc" ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />)}
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    Email
                    <ShieldOff className="size-3 text-muted-foreground/60" />
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Joined</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-96 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Loading patients…</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : isTimedOut ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-96 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <AlertTriangle className="h-12 w-12 text-orange-500" />
                      <div className="text-center">
                        <h3 className="text-lg font-semibold">Loading Timeout</h3>
                        <p className="text-sm text-muted-foreground">Patient data is taking longer than expected.</p>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => fetchPatients()} variant="default">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Try Again
                        </Button>
                        <Button onClick={() => window.location.reload()} variant="outline">
                          Refresh Page
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Users className="size-8 opacity-40" />
                      <p className="text-sm">No patients yet. Invite someone to get started.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPatients.map((patient) => {
                  const status = (patient.status || "active").toLowerCase();
                  const colors = statusColors[status] || statusColors.active;

                  return (
                    <TableRow key={patient.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9 border">
                            <AvatarImage src={patient.profile_photo || ""} />
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {patient.first_name?.[0] ?? "?"}{patient.last_name?.[0] ?? ""}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">
                              {patient.first_name}{patient.last_name ? ` ${patient.last_name}` : ""}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ID: {patient.uuid.substring(0, 8)}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {patient.email ? (
                          <span className="text-muted-foreground text-sm font-mono">
                            {maskEmail(patient.email)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground/60 italic">
                            <ShieldOff className="size-3" /> Protected
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
                            colors.bg,
                            colors.text,
                            colors.border
                          )}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        {format(new Date(patient.created_at), "MMM d, yyyy")}
                      </TableCell>
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
                            <DropdownMenuItem onClick={() => { setInviteEmail(patient.email ?? ""); setInviteOpen(true); }}>
                              <Mail className="mr-2 h-4 w-4" />
                              Re-invite
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}

        {/* Invites tab */}
        {viewTab === "invites" && (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingInvites ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                  </TableCell>
                </TableRow>
              ) : invites.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Mail className="size-8 opacity-40" />
                      <p className="text-sm">No invites sent yet.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                invites.map((invite) => {
                  const s = inviteStatus(invite);
                  return (
                    <TableRow key={invite.id}>
                      <TableCell className="font-mono text-sm">{invite.email}</TableCell>
                      <TableCell>
                        {s === "accepted" && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                            <CheckCircle2 className="size-3.5" /> Accepted
                          </span>
                        )}
                        {s === "pending" && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                            <Clock className="size-3.5" /> Pending
                          </span>
                        )}
                        {s === "expired" && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-500">
                            <XCircle className="size-3.5" /> Expired
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(invite.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(invite.expires_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {s === "pending" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
                            onClick={() => handleRevokeInvite(invite)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}

        {/* Pagination for patients tab */}
        {viewTab === "patients" && filteredPatients.length > pageSize && (
          <div className="flex items-center justify-between px-5 py-3 border-t text-sm text-muted-foreground">
            <span>
              {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredPatients.length)} of{" "}
              {filteredPatients.length}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage * pageSize >= filteredPatients.length}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Invite Patient dialog */}
      <Dialog
        open={inviteOpen}
        onOpenChange={(o) => {
          if (!o) {
            setInviteOpen(false);
            setInviteEmail("");
            setInviteMessage("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite a Patient</DialogTitle>
            <DialogDescription>
              Send a personal invitation link. The recipient will be guided to create their Onwynd account and
              will be automatically connected to you for scheduling.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="invite-email">
                Email address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="patient@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendInvite()}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invite-message">
                Personal message{" "}
                <span className="text-xs text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="invite-message"
                placeholder="e.g. I'd love to work with you on your journey. Looking forward to our first session."
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setInviteOpen(false);
                setInviteEmail("");
                setInviteMessage("");
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-teal text-white hover:bg-teal-mid"
              onClick={handleSendInvite}
              disabled={isInviting}
            >
              {isInviting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Mail className="w-4 h-4 mr-2" />
              )}
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
