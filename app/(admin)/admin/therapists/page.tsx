"use client";

import { useEffect, useState, useCallback } from "react";
import { adminService } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import Cookies from "js-cookie";
import {
  Stethoscope,
  Search,
  MoreHorizontal,
  Check,
  X,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Users,
  Star,
  Lock,
  Mail,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { TableBodyShimmer } from "@/components/shared/shimmer-skeleton";

interface TherapistProfile {
  id: number;
  status: "pending" | "approved" | "rejected" | null;
  is_verified: boolean;
  specializations: string[] | null;
  experience_years: number | null;
  license_number: string | null;
  certificate_url: string | null;
  rejection_reason: string | null;
  rejected_at: string | null;
  verified_at: string | null;
  rating_average: string | null;
  total_sessions: number;
  is_home_featured?: boolean;
  home_featured_until?: string | null;
}

interface Therapist {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  therapist_profile: TherapistProfile | null;
}

interface Counts {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  verified: number;
  rejected: number;
  no_profile: number;
}

interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

type VerificationTab = "all" | "pending" | "approved" | "rejected";
type StatusTab = "all" | "active" | "inactive";

interface TherapistInvite {
  id: number;
  email: string;
  notes: string | null;
  expires_at: string;
  created_at: string;
  invited_by?: { first_name: string; last_name: string } | null;
}

function VerificationBadge({ profile }: { profile: TherapistProfile | null }) {
  if (!profile)
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
        No Profile
      </span>
    );

  const cfg: Record<string, string> = {
    pending:  "bg-amber-50 text-amber-700",
    approved: "bg-teal/10 text-teal",
    rejected: "bg-red-50 text-red-700",
  };

  const labels: Record<string, string> = {
    pending:  "Pending",
    approved: "Verified",
    rejected: "Rejected",
  };

  const key = profile.status ?? "";
  const style = cfg[key] ?? "bg-gray-100 text-gray-600";

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {key === "approved" && <ShieldCheck className="w-3 h-3" />}
      {labels[key] ?? key}
    </span>
  );
}

function ActiveBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
      Active
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
      Inactive
    </span>
  );
}

export default function TherapistsPage() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [counts, setCounts] = useState<Counts>({
    total: 0, active: 0, inactive: 0, pending: 0, verified: 0, rejected: 0, no_profile: 0,
  });
  const [pagination, setPagination] = useState<Pagination>({
    current_page: 1, last_page: 1, per_page: 20, total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(false);

  useEffect(() => {
    const role = Cookies.get("user_role");
    if (role === "coo" || role === "cgo") setIsReadOnly(true);
  }, []);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [verificationTab, setVerificationTab] = useState<VerificationTab>("all");
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [page, setPage] = useState(1);

  const [rejectTarget, setRejectTarget] = useState<Therapist | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [detailTarget, setDetailTarget] = useState<Therapist | null>(null);

  // Invite state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteNotes, setInviteNotes] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [invites, setInvites] = useState<TherapistInvite[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(false);
  const [showInvites, setShowInvites] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = { page };
      if (search) params.search = search;
      if (statusTab !== "all") params.status = statusTab;
      if (verificationTab !== "all") params.verification_status = verificationTab;

      const res = verificationTab === 'pending'
        ? await adminService.getPendingTherapists()
        : await adminService.getTherapists(params);
      const unwrapped = (res as any)?.data ?? res;
      const data = (unwrapped as any)?.therapists ?? unwrapped;
      const items = (data as any)?.data ?? (Array.isArray(data) ? data : []);
      setTherapists(items);
      setCounts((res as { counts?: Counts }).counts ?? counts);
      const d = data as { current_page?: number; last_page?: number; per_page?: number; total?: number };
      if (d.current_page) {
        setPagination({
          current_page: d.current_page,
          last_page: d.last_page ?? 1,
          per_page: d.per_page ?? 20,
          total: d.total ?? 0,
        });
      }
    } catch {
      toast({ title: "Error", description: "Failed to load therapists", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, statusTab, verificationTab]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = () => { setSearch(searchInput); setPage(1); };

  const handleApprove = async (t: Therapist) => {
    try {
      await adminService.approveTherapist(String(t.id));
      toast({ title: "Approved", description: `${t.name}'s documents have been approved.` });
      load();
    } catch {
      toast({ title: "Error", description: "Approval failed", variant: "destructive" });
    }
  };

  const openRejectDialog = (t: Therapist) => {
    setRejectTarget(t);
    setRejectReason(t.therapist_profile?.rejection_reason ?? "");
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      toast({ title: "Reason required", description: "Please provide a rejection reason.", variant: "destructive" });
      return;
    }
    setIsRejecting(true);
    try {
      await adminService.rejectTherapist(String(rejectTarget.id), rejectReason.trim());
      toast({ title: "Rejected", description: `${rejectTarget.name}'s documents have been rejected.` });
      setRejectTarget(null);
      setRejectReason("");
      load();
    } catch {
      toast({ title: "Error", description: "Rejection failed", variant: "destructive" });
    } finally {
      setIsRejecting(false);
    }
  };

  const handleToggleActive = async (t: Therapist) => {
    try {
      if (t.is_active) {
        await adminService.deactivateTherapist(t.id);
        toast({ title: "Deactivated", description: `${t.name} has been deactivated.` });
      } else {
        await adminService.activateTherapist(t.id);
        toast({ title: "Activated", description: `${t.name} has been activated.` });
      }
      load();
    } catch {
      toast({ title: "Error", description: "Action failed", variant: "destructive" });
    }
  };

  const handleToggleHomepageFeatured = async (t: Therapist) => {
    const isFeatured = Boolean(t.therapist_profile?.is_home_featured);
    try {
      await adminService.setTherapistHomepageFeatured(t.id, !isFeatured, 3);
      toast({
        title: !isFeatured ? "Pinned to Homepage" : "Removed from Homepage",
        description: !isFeatured
          ? `${t.name} will stay featured for about 3 hours.`
          : `${t.name} is no longer featured.`,
      });
      load();
    } catch {
      toast({
        title: "Error",
        description: "Failed to update homepage featured status",
        variant: "destructive",
      });
    }
  };

  const handleViewDocument = async (t: Therapist) => {
    try {
      const blob = await adminService.viewTherapistDocument(t.id, "certificate");
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch {
      toast({ title: "Not found", description: "No certificate document on file.", variant: "destructive" });
    }
  };

  const loadInvites = async () => {
    setInvitesLoading(true);
    try {
      const res = await adminService.getTherapistInvites();
      const data = (res as any)?.data ?? res;
      setInvites(Array.isArray(data) ? data : (data as any)?.data ?? []);
    } catch {
      toast({ title: "Error", description: "Failed to load invites", variant: "destructive" });
    } finally {
      setInvitesLoading(false);
    }
  };

  const handleToggleInvites = () => {
    if (!showInvites) loadInvites();
    setShowInvites((v) => !v);
  };

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) {
      toast({ title: "Email required", description: "Enter the therapist's email address.", variant: "destructive" });
      return;
    }
    setIsInviting(true);
    try {
      await adminService.inviteTherapist(inviteEmail.trim(), inviteNotes.trim() || undefined);
      toast({ title: "Invite sent", description: `Invite email sent to ${inviteEmail.trim()}.` });
      setInviteOpen(false);
      setInviteEmail("");
      setInviteNotes("");
      if (showInvites) loadInvites();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to send invite";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsInviting(false);
    }
  };

  const handleRevokeInvite = async (invite: TherapistInvite) => {
    try {
      await adminService.revokeTherapistInvite(invite.id);
      toast({ title: "Revoked", description: `Invite for ${invite.email} has been revoked.` });
      loadInvites();
    } catch {
      toast({ title: "Error", description: "Failed to revoke invite", variant: "destructive" });
    }
  };

  const statCards = [
    { label: "Total",        value: counts.total,    icon: Users,       color: "text-gray-600",    bg: "bg-gray-50"     },
    { label: "Active",       value: counts.active,   icon: UserCheck,   color: "text-emerald-600", bg: "bg-emerald-50"  },
    { label: "Inactive",     value: counts.inactive, icon: UserX,       color: "text-gray-400",    bg: "bg-gray-100"    },
    { label: "Pending Docs", value: counts.pending,  icon: Clock,       color: "text-amber-600",   bg: "bg-amber-50"    },
    { label: "Verified",     value: counts.verified, icon: ShieldCheck, color: "text-teal",        bg: "bg-teal/10"     },
    { label: "Rejected",     value: counts.rejected, icon: ShieldAlert, color: "text-red-500",     bg: "bg-red-50"      },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Therapist Management"
        subtitle="Manage therapist applications, verification status, and accounts"
      >
        {isReadOnly ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
            <Lock className="w-3 h-3" /> Read-Only
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleInvites}
              className="h-8 text-xs gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              Pending Invites
              <ChevronDown className={`w-3 h-3 transition-transform ${showInvites ? "rotate-180" : ""}`} />
            </Button>
            <Button
              size="sm"
              onClick={() => setInviteOpen(true)}
              className="h-8 text-xs gap-1.5 bg-teal text-white hover:bg-teal-mid"
            >
              <Mail className="w-3.5 h-3.5" />
              Invite Therapist
            </Button>
          </div>
        )}
      </PageHeader>

      {/* Pending invites panel */}
      {showInvites && (
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">Pending Therapist Invites</p>
            {invitesLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
          </div>
          {invites.length === 0 && !invitesLoading ? (
            <div className="py-8 text-center text-sm text-gray-400">No pending invites</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Email</TableHead>
                  <TableHead className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Invited By</TableHead>
                  <TableHead className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Expires</TableHead>
                  <TableHead className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Notes</TableHead>
                  <TableHead className="px-4 py-2.5 w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((inv) => (
                  <TableRow key={inv.id} className="hover:bg-gray-50/60">
                    <TableCell className="px-4 py-2.5 text-sm font-medium text-gray-800">{inv.email}</TableCell>
                    <TableCell className="px-4 py-2.5 text-sm text-gray-500">
                      {inv.invited_by ? `${inv.invited_by.first_name} ${inv.invited_by.last_name}`.trim() : "—"}
                    </TableCell>
                    <TableCell className="px-4 py-2.5 text-sm text-gray-500">
                      {new Date(inv.expires_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </TableCell>
                    <TableCell className="px-4 py-2.5 text-sm text-gray-400 max-w-xs truncate">{inv.notes ?? "—"}</TableCell>
                    <TableCell className="px-4 py-2.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleRevokeInvite(inv)}
                        title="Revoke invite"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-xl border border-gray-100 bg-white shadow-sm p-4 flex flex-col gap-2 card-hover-lift">
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-gray-500 font-medium shrink-0">Documents:</span>
          <Tabs value={verificationTab} onValueChange={(v: string | null) => { setVerificationTab((v ?? "") as VerificationTab); setPage(1); }}>
            <TabsList className="h-8">
              <TabsTrigger value="all"      className="text-xs px-3">All</TabsTrigger>
              <TabsTrigger value="pending"  className="text-xs px-3">
                Pending
                {counts.pending > 0 && (
                  <span className="ml-1.5 rounded-full bg-amber-500 text-white text-[10px] px-1.5 py-0.5 leading-none">
                    {counts.pending}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved" className="text-xs px-3">Verified</TabsTrigger>
              <TabsTrigger value="rejected" className="text-xs px-3">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-gray-500 font-medium shrink-0">Account:</span>
          <Tabs value={statusTab} onValueChange={(v: string | null) => { setStatusTab((v ?? "") as StatusTab); setPage(1); }}>
            <TabsList className="h-8">
              <TabsTrigger value="all"      className="text-xs px-3">All</TabsTrigger>
              <TabsTrigger value="active"   className="text-xs px-3">Active</TabsTrigger>
              <TabsTrigger value="inactive" className="text-xs px-3">Inactive</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex-1" />
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input
                placeholder="Search name or email…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="h-8 pl-8 w-64 text-sm"
              />
            </div>
            <Button size="sm" variant="outline" onClick={handleSearch} className="h-8">
              <Search className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Name</TableHead>
                <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Email</TableHead>
                <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Specialty</TableHead>
                <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Account</TableHead>
                <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Verification</TableHead>
                <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Homepage</TableHead>
                <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Sessions</TableHead>
                <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Registered</TableHead>
                <TableHead className="px-4 py-3 w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableBodyShimmer rows={6} cols={9} />
              ) : therapists.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9}>
                    <div className="flex flex-col items-center justify-center py-16">
                      <Stethoscope className="w-12 h-12 text-gray-200 mb-4" />
                      <p className="text-sm font-medium text-gray-600">No therapists found</p>
                      <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                therapists.map((t, idx) => {
                  const profile = t.therapist_profile;
                  const specialties = profile?.specializations ?? [];
                  const isPending = profile?.status === "pending";

                  return (
                    <TableRow
                      key={t.id}
                      className={[
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/40",
                        "hover:bg-teal/5 transition-colors",
                        isPending ? "border-l-4 border-amber-400" : "",
                      ].join(" ")}
                    >
                      <TableCell className="px-4 py-3 font-medium text-gray-900">{t.name}</TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-500">{t.email}</TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-600">
                        {specialties.length > 0
                          ? `${specialties.slice(0, 2).join(", ")}${specialties.length > 2 ? ` +${specialties.length - 2}` : ""}`
                          : <span className="text-gray-300">—</span>}
                      </TableCell>
                      <TableCell className="px-4 py-3"><ActiveBadge active={t.is_active} /></TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <VerificationBadge profile={profile} />
                          {profile?.status === "rejected" && profile.rejection_reason && (
                            <button
                              onClick={() => setDetailTarget(t)}
                              className="text-[10px] text-red-400 hover:text-red-600 hover:underline text-left"
                            >
                              View reason
                            </button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {profile?.is_home_featured ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                            <Star className="w-3 h-3" />
                            Featured
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-600">{profile?.total_sessions ?? 0}</TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-400">
                        {new Date(t.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {!isReadOnly && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />

                              {profile?.status === "pending" && (
                                <>
                                  <DropdownMenuItem onClick={() => handleApprove(t)} className="text-teal">
                                    <Check className="w-4 h-4 mr-2" /> Approve Documents
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openRejectDialog(t)} className="text-red-600">
                                    <X className="w-4 h-4 mr-2" /> Reject Documents
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              {profile?.status === "approved" && (
                                <>
                                  <DropdownMenuItem onClick={() => openRejectDialog(t)} className="text-red-600">
                                    <X className="w-4 h-4 mr-2" /> Revoke Verification
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              {profile?.status === "rejected" && (
                                <>
                                  <DropdownMenuItem onClick={() => handleApprove(t)} className="text-teal">
                                    <Check className="w-4 h-4 mr-2" /> Re-approve Documents
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openRejectDialog(t)}>
                                    <FileText className="w-4 h-4 mr-2" /> Update Rejection Reason
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}

                              {profile?.certificate_url && (
                                <DropdownMenuItem onClick={() => handleViewDocument(t)}>
                                  <FileText className="w-4 h-4 mr-2" /> View Certificate
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuItem
                                onClick={() => handleToggleActive(t)}
                                className={t.is_active ? "text-red-600" : "text-teal"}
                              >
                                {t.is_active
                                  ? <><UserX className="w-4 h-4 mr-2" /> Deactivate Account</>
                                  : <><UserCheck className="w-4 h-4 mr-2" /> Activate Account</>}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleToggleHomepageFeatured(t)}
                                className={profile?.is_home_featured ? "text-amber-700" : "text-teal"}
                              >
                                <Star className="w-4 h-4 mr-2" />
                                {profile?.is_home_featured
                                  ? "Unfeature from Homepage"
                                  : "Feature on Homepage (3h)"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {pagination.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50">
            <span className="text-sm text-gray-400">
              Page {pagination.current_page} of {pagination.last_page} · {pagination.total} therapists
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline" size="icon" className="h-8 w-8"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline" size="icon" className="h-8 w-8"
                disabled={page >= pagination.last_page}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Invite Therapist dialog */}
      <Dialog open={inviteOpen} onOpenChange={(o) => { if (!o) { setInviteOpen(false); setInviteEmail(""); setInviteNotes(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Therapist</DialogTitle>
            <DialogDescription>
              Send a personalised invitation link to a therapist. The link expires in 7 days.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="invite-email">Email address <span className="text-red-500">*</span></Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="therapist@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendInvite()}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invite-notes">Personal note <span className="text-xs text-gray-400">(optional)</span></Label>
              <Textarea
                id="invite-notes"
                placeholder="e.g. We'd love to have you on the platform. Looking forward to working with you!"
                value={inviteNotes}
                onChange={(e) => setInviteNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setInviteOpen(false); setInviteEmail(""); setInviteNotes(""); }}>
              Cancel
            </Button>
            <Button
              className="bg-teal text-white hover:bg-teal-mid"
              onClick={handleSendInvite}
              disabled={isInviting}
            >
              {isInviting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Mail className="w-4 h-4 mr-2" />
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject / Revoke dialog */}
      <Dialog
        open={!!rejectTarget}
        onOpenChange={(o) => { if (!o) { setRejectTarget(null); setRejectReason(""); } }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {rejectTarget?.therapist_profile?.status === "approved" ? "Revoke Verification" : "Reject Documents"}
            </DialogTitle>
            <DialogDescription>
              {rejectTarget?.name} will be notified via email with your reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="reject-reason">Reason for rejection</Label>
            <Textarea
              id="reject-reason"
              placeholder="e.g. License number is expired. Please upload a valid certificate."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectTarget(null); setRejectReason(""); }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isRejecting}>
              {isRejecting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {rejectTarget?.therapist_profile?.status === "approved" ? "Revoke" : "Reject & Notify"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection reason detail dialog */}
      <Dialog open={!!detailTarget} onOpenChange={(o) => { if (!o) setDetailTarget(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rejection Details — {detailTarget?.name}</DialogTitle>
            <DialogDescription>
              Rejected on{" "}
              {detailTarget?.therapist_profile?.rejected_at
                ? new Date(detailTarget.therapist_profile.rejected_at).toLocaleDateString("en-GB", {
                    day: "2-digit", month: "short", year: "numeric",
                  })
                : "—"}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-red-50 border border-red-100 p-4 text-sm text-red-800 leading-relaxed">
            {detailTarget?.therapist_profile?.rejection_reason ?? "No reason provided."}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailTarget(null)}>Close</Button>
            {!isReadOnly && (
              <>
                <Button
                  className="bg-teal text-white hover:bg-teal-mid"
                  onClick={() => { setDetailTarget(null); if (detailTarget) handleApprove(detailTarget); }}
                >
                  <Check className="w-4 h-4 mr-2" /> Re-approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => { if (detailTarget) { setDetailTarget(null); openRejectDialog(detailTarget); } }}
                >
                  Update Reason
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
