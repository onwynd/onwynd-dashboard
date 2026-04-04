"use client";

import { useState, useEffect, useCallback } from "react";
import { adminService } from "@/lib/api/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import {
  Building2,
  RefreshCw,
  Search,
  Mail,
  CalendarPlus,
  ArrowRightLeft,
  Loader2,
} from "lucide-react";

type ContractInfo = {
  id: number;
  contract_type: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string | null;
  employee_count_limit: number | null;
  total_sessions_quota: number | null;
  sessions_used: number | null;
  contract_value: string | null;
  midpoint_notified_at: string | null;
  pre_renewal_notified_at: string | null;
  expiry_notified_at: string | null;
  activated_notified_at: string | null;
};

type Corporate = {
  id: number;
  name: string;
  contact_email: string | null;
  plan_tier: string | null;
  status: string | null;
  pilot_status: "active" | "expired" | "pending" | "paid";
  contracted_seats: number | null;
  current_seats: number | null;
  contract: ContractInfo | null;
};

type Pagination = {
  total: number;
  last_page: number;
  current_page: number;
  per_page: number;
};

const PILOT_STATUS_STYLES: Record<string, string> = {
  active:  "bg-green-100 text-green-700",
  expired: "bg-red-100 text-red-700",
  pending: "bg-yellow-100 text-yellow-700",
  paid:    "bg-blue-100 text-blue-700",
};

function EmailSentBadge({ label, sentAt }: { label: string; sentAt: string | null }) {
  if (!sentAt) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-400 border border-dashed border-gray-300">
        {label}
      </span>
    );
  }
  return (
    <span
      title={`Sent: ${new Date(sentAt).toLocaleString()}`}
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700 border border-green-200"
    >
      {label} ✓
    </span>
  );
}

export default function CorporatesPage() {
  const [corporates, setCorporates] = useState<Corporate[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    last_page: 1,
    current_page: 1,
    per_page: 20,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [search, setSearch] = useState("");

  // Extend pilot modal
  const [extendTarget, setExtendTarget] = useState<Corporate | null>(null);
  const [extendDays, setExtendDays] = useState("14");
  const [extendLoading, setExtendLoading] = useState(false);

  // Send email modal
  const [emailTarget, setEmailTarget] = useState<Corporate | null>(null);
  const [emailType, setEmailType] = useState<string>("");
  const [emailLoading, setEmailLoading] = useState(false);

  // Convert to paid modal
  const [convertTarget, setConvertTarget] = useState<Corporate | null>(null);
  const [planTier, setPlanTier] = useState<string>("");
  const [billingCycle, setBillingCycle] = useState<string>("");
  const [convertLoading, setConvertLoading] = useState(false);

  const fetchCorporates = useCallback(async (page = 1) => {
    setIsLoading(true);
    setIsError(false);
    try {
      const params: Record<string, unknown> = { page, per_page: pagination.per_page };
      if (search) params.search = search;
      const data = await adminService.getCorporates(params) as any;
      const list: Corporate[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setCorporates(list);
      if (data?.meta || data?.last_page) {
        const meta = data.meta ?? data;
        setPagination({
          total:        meta.total ?? list.length,
          last_page:    meta.last_page ?? 1,
          current_page: meta.current_page ?? page,
          per_page:     meta.per_page ?? 20,
        });
      }
    } catch {
      setIsError(true);
      toast({ title: "Error", description: "Failed to load corporate accounts.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [search, pagination.per_page]);

  useEffect(() => {
    fetchCorporates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Extend pilot ---
  const handleExtendSubmit = async () => {
    if (!extendTarget) return;
    const days = parseInt(extendDays, 10);
    if (isNaN(days) || days < 1 || days > 90) {
      toast({ title: "Invalid input", description: "Days must be between 1 and 90.", variant: "destructive" });
      return;
    }
    setExtendLoading(true);
    try {
      await adminService.extendCorporatePilot(extendTarget.id, days);
      toast({ title: "Pilot extended", description: `Added ${days} days for ${extendTarget.name}.` });
      setExtendTarget(null);
      fetchCorporates(pagination.current_page);
    } catch {
      toast({ title: "Error", description: "Failed to extend pilot.", variant: "destructive" });
    } finally {
      setExtendLoading(false);
    }
  };

  // --- Send email ---
  const handleEmailSubmit = async () => {
    if (!emailTarget || !emailType) {
      toast({ title: "Invalid input", description: "Please select an email type.", variant: "destructive" });
      return;
    }
    setEmailLoading(true);
    try {
      await adminService.sendCorporateLifecycleEmail(emailTarget.id, emailType);
      toast({ title: "Email queued", description: `"${emailType}" email queued for ${emailTarget.name}.` });
      setEmailTarget(null);
      setEmailType("");
      fetchCorporates(pagination.current_page);
    } catch {
      toast({ title: "Error", description: "Failed to send email.", variant: "destructive" });
    } finally {
      setEmailLoading(false);
    }
  };

  // --- Convert to paid ---
  const handleConvertSubmit = async () => {
    if (!convertTarget || !planTier || !billingCycle) {
      toast({ title: "Invalid input", description: "Please select plan tier and billing cycle.", variant: "destructive" });
      return;
    }
    setConvertLoading(true);
    try {
      await adminService.convertCorporateToPaid(convertTarget.id, planTier, billingCycle);
      toast({ title: "Converted", description: `${convertTarget.name} converted to paid plan.` });
      setConvertTarget(null);
      setPlanTier("");
      setBillingCycle("");
      fetchCorporates(pagination.current_page);
    } catch {
      toast({ title: "Error", description: "Failed to convert account.", variant: "destructive" });
    } finally {
      setConvertLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-5 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Corporate Accounts</h2>
          <p className="text-muted-foreground">
            Manage corporate pilot accounts — extend contracts, send lifecycle emails, convert to paid.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchCorporates(pagination.current_page)}
          disabled={isLoading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total",   value: pagination.total },
          { label: "Active",  value: corporates.filter((c) => c.pilot_status === "active").length },
          { label: "Expired", value: corporates.filter((c) => c.pilot_status === "expired").length },
          { label: "Paid",    value: corporates.filter((c) => c.pilot_status === "paid").length },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="pt-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
              </div>
              <Building2 className="h-7 w-7 opacity-20 text-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search company name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchCorporates()}
          />
        </div>
        <Button variant="secondary" size="sm" onClick={() => fetchCorporates()}>
          Search
        </Button>
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertTitle>Failed to load corporate accounts</AlertTitle>
          <AlertDescription>Please try refreshing the page.</AlertDescription>
        </Alert>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Corporate Accounts ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : corporates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Building2 className="w-12 h-12 opacity-20 mb-4" />
              <p>No corporate accounts found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pilot End</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>Emails Sent</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {corporates.map((corp) => (
                  <TableRow key={corp.id}>
                    {/* Company */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-indigo-50">
                          <Building2 className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium">{corp.name}</p>
                          {corp.contact_email && (
                            <p className="text-xs text-muted-foreground">{corp.contact_email}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Tier */}
                    <TableCell>
                      {corp.plan_tier ? (
                        <Badge variant="outline" className="capitalize text-xs">
                          {corp.plan_tier}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge
                        className={
                          PILOT_STATUS_STYLES[corp.pilot_status] ??
                          "bg-gray-100 text-gray-600"
                        }
                      >
                        {corp.pilot_status}
                      </Badge>
                    </TableCell>

                    {/* Pilot End */}
                    <TableCell className="text-sm">
                      {corp.contract?.end_date ? (
                        <span>{new Date(corp.contract.end_date).toLocaleDateString()}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* Seats */}
                    <TableCell className="text-sm">
                      {corp.contracted_seats != null ? (
                        <span>
                          {corp.current_seats ?? 0} / {corp.contracted_seats}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* Emails Sent */}
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <EmailSentBadge
                          label="Activated"
                          sentAt={corp.contract?.activated_notified_at ?? null}
                        />
                        <EmailSentBadge
                          label="Midpoint"
                          sentAt={corp.contract?.midpoint_notified_at ?? null}
                        />
                        <EmailSentBadge
                          label="Pre-Renewal"
                          sentAt={corp.contract?.pre_renewal_notified_at ?? null}
                        />
                        <EmailSentBadge
                          label="Expired"
                          sentAt={corp.contract?.expiry_notified_at ?? null}
                        />
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5"
                          onClick={() => {
                            setExtendTarget(corp);
                            setExtendDays("14");
                          }}
                        >
                          <CalendarPlus className="h-3.5 w-3.5" />
                          Extend
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5"
                          onClick={() => {
                            setEmailTarget(corp);
                            setEmailType("");
                          }}
                        >
                          <Mail className="h-3.5 w-3.5" />
                          Send Email
                        </Button>
                        {corp.pilot_status !== "paid" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5"
                            onClick={() => {
                              setConvertTarget(corp);
                              setPlanTier("");
                              setBillingCycle("");
                            }}
                          >
                            <ArrowRightLeft className="h-3.5 w-3.5" />
                            Convert
                          </Button>
                        )}
                      </div>
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
            onClick={() => fetchCorporates(pagination.current_page - 1)}
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
            onClick={() => fetchCorporates(pagination.current_page + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Extend Pilot Modal */}
      <Dialog open={!!extendTarget} onOpenChange={(open) => { if (!open) setExtendTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Extend Pilot — {extendTarget?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="extend-days">Number of days (1–90)</Label>
              <Input
                id="extend-days"
                type="number"
                min={1}
                max={90}
                value={extendDays}
                onChange={(e) => setExtendDays(e.target.value)}
              />
            </div>
            {extendTarget?.contract?.end_date && (
              <p className="text-sm text-muted-foreground">
                Current end date:{" "}
                <strong>{new Date(extendTarget.contract.end_date).toLocaleDateString()}</strong>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExtendTarget(null)} disabled={extendLoading}>
              Cancel
            </Button>
            <Button onClick={handleExtendSubmit} disabled={extendLoading}>
              {extendLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Extend Pilot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Email Modal */}
      <Dialog open={!!emailTarget} onOpenChange={(open) => { if (!open) { setEmailTarget(null); setEmailType(""); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Send Lifecycle Email — {emailTarget?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="email-type-select">Email type</Label>
              <Select value={emailType} onValueChange={(v) => v !== null && setEmailType(v)}>
                <SelectTrigger id="email-type-select">
                  <SelectValue placeholder="Select email type…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activated">Activated</SelectItem>
                  <SelectItem value="midpoint">Midpoint</SelectItem>
                  <SelectItem value="pre_renewal">Pre-Renewal</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {emailTarget?.contact_email && (
              <p className="text-sm text-muted-foreground">
                Will be sent to: <strong>{emailTarget.contact_email}</strong>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setEmailTarget(null); setEmailType(""); }}
              disabled={emailLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleEmailSubmit} disabled={emailLoading || !emailType}>
              {emailLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Convert to Paid Modal */}
      <Dialog
        open={!!convertTarget}
        onOpenChange={(open) => {
          if (!open) {
            setConvertTarget(null);
            setPlanTier("");
            setBillingCycle("");
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Convert to Paid — {convertTarget?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="plan-tier-select">Plan tier</Label>
              <Select value={planTier} onValueChange={(v) => v !== null && setPlanTier(v)}>
                <SelectTrigger id="plan-tier-select">
                  <SelectValue placeholder="Select plan…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">Starter (5–20 seats)</SelectItem>
                  <SelectItem value="growth">Growth (21–100 seats)</SelectItem>
                  <SelectItem value="enterprise">Enterprise (100+ seats)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="billing-cycle-select">Billing cycle</Label>
              <Select value={billingCycle} onValueChange={(v) => v !== null && setBillingCycle(v)}>
                <SelectTrigger id="billing-cycle-select">
                  <SelectValue placeholder="Select cycle…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setConvertTarget(null);
                setPlanTier("");
                setBillingCycle("");
              }}
              disabled={convertLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConvertSubmit}
              disabled={convertLoading || !planTier || !billingCycle}
            >
              {convertLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Convert to Paid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
