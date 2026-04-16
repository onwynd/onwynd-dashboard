"use client";

import { useState, useEffect, useCallback } from "react";
import { adminService } from "@/lib/api/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import {
  Tag,
  RefreshCw,
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
  Loader2,
  Trash2,
  ToggleLeft,
} from "lucide-react";
import client from "@/lib/api/client";

// --- Types ---

type PromoCode = {
  id: number;
  uuid: string;
  code: string;
  description: string | null;
  type: "percentage" | "fixed";
  discount_value: string;
  currency: string | null;
  max_uses: number | null;
  uses_count: number;
  usages_count?: number;
  max_uses_per_user: number | null;
  valid_from: string | null;
  valid_until: string | null;
  applies_to: string;
  is_active: boolean;
  created_at: string;
};

type DailyUsageRow = {
  date: string;
  count: number;
  discount_total: number;
};

type PromoStats = {
  code: string;
  type: string;
  value: number;
  total_uses: number;
  max_uses: number | null;
  uses_remaining: number | null;
  total_discount_given: number;
  unique_users: number;
  revenue_after_discount: number;
  daily_usage: DailyUsageRow[];
  is_active: boolean;
  expires_at: string | null;
};

function formatNGN(kobo: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

// --- Stats Panel ---

function StatsPanel({ uuid }: { uuid: string }) {
  const [stats, setStats] = useState<PromoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    adminService
      .getPromoCodeStats(uuid)
      .then((res) => setStats(((res as any)?.data ?? res) as unknown as PromoStats ?? null))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [uuid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <p className="py-4 text-sm text-red-500 text-center">Failed to load stats.</p>
    );
  }

  const usagePercent =
    stats.max_uses != null && stats.max_uses > 0
      ? Math.min(100, Math.round((stats.total_uses / stats.max_uses) * 100))
      : null;

  return (
    <div className="p-4 space-y-4 bg-muted/30 rounded-b-lg border-t">
      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Total Discount Given</p>
          <p className="font-semibold">{formatNGN(stats.total_discount_given)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Unique Users</p>
          <p className="font-semibold">{stats.unique_users.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Revenue After Discount</p>
          <p className="font-semibold">{formatNGN(stats.revenue_after_discount)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Uses Remaining</p>
          <p className="font-semibold">
            {stats.uses_remaining != null ? stats.uses_remaining.toLocaleString() : "Unlimited"}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {stats.max_uses != null && usagePercent !== null && (
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>
              {stats.total_uses.toLocaleString()} / {stats.max_uses.toLocaleString()} uses
            </span>
            <span>{usagePercent}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Daily usage table */}
      {stats.daily_usage.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Daily Usage
          </p>
          <div className="max-h-48 overflow-y-auto rounded border">
            <table className="w-full text-xs">
              <thead className="bg-muted">
                <tr>
                  <th className="px-3 py-1.5 text-left font-medium">Date</th>
                  <th className="px-3 py-1.5 text-right font-medium">Uses</th>
                  <th className="px-3 py-1.5 text-right font-medium">Discount Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.daily_usage.map((row) => (
                  <tr key={row.date} className="border-t hover:bg-muted/50">
                    <td className="px-3 py-1.5">{row.date}</td>
                    <td className="px-3 py-1.5 text-right">{row.count}</td>
                    <td className="px-3 py-1.5 text-right">{formatNGN(row.discount_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Main Page ---

const EMPTY_FORM = {
  code: "",
  description: "",
  type: "percentage" as "percentage" | "fixed",
  discount_value: "",
  currency: "NGN",
  max_uses: "",
  max_uses_per_user: "",
  valid_from: "",
  valid_until: "",
  applies_to: "all",
  is_active: true,
};

export default function PromoCodesPage() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [pagination, setPagination] = useState({ total: 0, last_page: 1, current_page: 1, per_page: 20 });
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // Expanded stats rows
  const [expandedUuid, setExpandedUuid] = useState<string | null>(null);

  // Create / Edit dialog
  const [showForm, setShowForm] = useState(false);
  const [editCode, setEditCode] = useState<PromoCode | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formLoading, setFormLoading] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<PromoCode | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toggle loading state per uuid
  const [toggleLoadingUuid, setToggleLoadingUuid] = useState<string | null>(null);

  const fetchCodes = useCallback(async (page = 1) => {
    setIsLoading(true);
    setIsError(false);
    try {
      const params: Record<string, unknown> = { page, per_page: pagination.per_page };
      if (activeFilter !== "all") params.is_active = activeFilter === "active";
      const response = await client.get("/api/v1/admin/promo-codes", { params });
      const data = response.data?.data ?? response.data;
      const list: PromoCode[] = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      setCodes(list);
      const meta = data?.meta ?? (data?.last_page ? data : null);
      if (meta) {
        setPagination({
          total:        meta.total ?? list.length,
          last_page:    meta.last_page ?? 1,
          current_page: meta.current_page ?? page,
          per_page:     meta.per_page ?? 20,
        });
      }
    } catch {
      setIsError(true);
      toast({ title: "Error", description: "Failed to load promotional codes.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, pagination.per_page]);

  useEffect(() => {
    fetchCodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

  const filteredCodes = search
    ? codes.filter(
        (c) =>
          c.code.toLowerCase().includes(search.toLowerCase()) ||
          (c.description ?? "").toLowerCase().includes(search.toLowerCase()),
      )
    : codes;

  // Open create form
  const openCreate = () => {
    setEditCode(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  };

  // Open edit form
  const openEdit = (code: PromoCode) => {
    setEditCode(code);
    setForm({
      code: code.code,
      description: code.description ?? "",
      type: code.type,
      discount_value: code.discount_value,
      currency: code.currency ?? "NGN",
      max_uses: code.max_uses != null ? String(code.max_uses) : "",
      max_uses_per_user: code.max_uses_per_user != null ? String(code.max_uses_per_user) : "",
      valid_from: code.valid_from ? code.valid_from.slice(0, 10) : "",
      valid_until: code.valid_until ? code.valid_until.slice(0, 10) : "",
      applies_to: code.applies_to,
      is_active: code.is_active,
    });
    setShowForm(true);
  };

  const handleFormSubmit = async () => {
    if (!form.code || !form.type || !form.discount_value) {
      toast({ title: "Validation", description: "Code, type and discount value are required.", variant: "destructive" });
      return;
    }
    setFormLoading(true);
    try {
      const payload: Record<string, unknown> = {
        code:              form.code,
        description:       form.description || null,
        type:              form.type,
        discount_value:    parseFloat(form.discount_value),
        currency:          form.currency,
        max_uses:          form.max_uses ? parseInt(form.max_uses, 10) : null,
        max_uses_per_user: form.max_uses_per_user ? parseInt(form.max_uses_per_user, 10) : null,
        valid_from:        form.valid_from || null,
        valid_until:       form.valid_until || null,
        applies_to:        form.applies_to,
        is_active:         form.is_active,
      };

      if (editCode) {
        await client.put(`/api/v1/admin/promo-codes/${editCode.uuid}`, payload);
        toast({ title: "Updated", description: `Promo code ${form.code} updated.` });
      } else {
        await client.post("/api/v1/admin/promo-codes", payload);
        toast({ title: "Created", description: `Promo code ${form.code} created.` });
      }
      setShowForm(false);
      fetchCodes(pagination.current_page);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to save promo code.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await client.delete(`/api/v1/admin/promo-codes/${deleteTarget.uuid}`);
      toast({ title: "Deleted", description: `Promo code ${deleteTarget.code} deleted.` });
      setDeleteTarget(null);
      fetchCodes(pagination.current_page);
    } catch {
      toast({ title: "Error", description: "Failed to delete promo code.", variant: "destructive" });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggle = async (code: PromoCode) => {
    setToggleLoadingUuid(code.uuid);
    try {
      await client.post(`/api/v1/admin/promo-codes/${code.uuid}/toggle`);
      setCodes((prev) =>
        prev.map((c) => (c.uuid === code.uuid ? { ...c, is_active: !c.is_active } : c)),
      );
    } catch {
      toast({ title: "Error", description: "Failed to toggle promo code.", variant: "destructive" });
    } finally {
      setToggleLoadingUuid(null);
    }
  };

  const toggleExpand = (uuid: string) => {
    setExpandedUuid((prev) => (prev === uuid ? null : uuid));
  };

  return (
    <div className="flex-1 space-y-5 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Promotional Codes</h2>
          <p className="text-muted-foreground">
            Manage discount codes — view usage stats, toggle active state, create and delete codes.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchCodes(pagination.current_page)} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            New Code
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total",    value: pagination.total },
          { label: "Active",   value: codes.filter((c) => c.is_active).length },
          { label: "Inactive", value: codes.filter((c) => !c.is_active).length },
          { label: "Showing",  value: filteredCodes.length },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="pt-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
              </div>
              <Tag className="h-7 w-7 opacity-20 text-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search code or description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={activeFilter} onValueChange={(v) => setActiveFilter(v ?? "all")}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertTitle>Failed to load promotional codes</AlertTitle>
          <AlertDescription>Please try refreshing.</AlertDescription>
        </Alert>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Promotional Codes ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredCodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Tag className="w-12 h-12 opacity-20 mb-4" />
              <p>No promotional codes found.</p>
            </div>
          ) : (
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-6"></TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Uses</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCodes.map((code) => (
                    <>
                      <TableRow
                        key={code.uuid}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleExpand(code.uuid)}
                      >
                        {/* Expand toggle */}
                        <TableCell className="px-3">
                          {expandedUuid === code.uuid ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>

                        {/* Code */}
                        <TableCell>
                          <div>
                            <p className="font-mono font-semibold text-sm">{code.code}</p>
                            {code.description && (
                              <p className="text-xs text-muted-foreground">{code.description}</p>
                            )}
                          </div>
                        </TableCell>

                        {/* Type */}
                        <TableCell>
                          <Badge variant="outline" className="capitalize text-xs">
                            {code.type}
                          </Badge>
                        </TableCell>

                        {/* Value */}
                        <TableCell className="text-sm font-medium">
                          {code.type === "percentage"
                            ? `${parseFloat(code.discount_value)}%`
                            : new Intl.NumberFormat("en-NG", {
                                style: "currency",
                                currency: code.currency ?? "NGN",
                                minimumFractionDigits: 0,
                              }).format(parseFloat(code.discount_value))}
                        </TableCell>

                        {/* Uses */}
                        <TableCell className="text-sm">
                          <span>
                            {(code.usages_count ?? code.uses_count).toLocaleString()}
                            {code.max_uses != null && (
                              <span className="text-muted-foreground"> / {code.max_uses.toLocaleString()}</span>
                            )}
                          </span>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Badge
                            className={
                              code.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }
                          >
                            {code.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>

                        {/* Expires */}
                        <TableCell className="text-sm">
                          {code.valid_until ? (
                            <span
                              className={
                                new Date(code.valid_until) < new Date()
                                  ? "text-red-500"
                                  : "text-foreground"
                              }
                            >
                              {new Date(code.valid_until).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Never</span>
                          )}
                        </TableCell>

                        {/* Actions */}
                        <TableCell
                          className="text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="gap-1.5 text-xs"
                              disabled={toggleLoadingUuid === code.uuid}
                              onClick={() => handleToggle(code)}
                              title={code.is_active ? "Deactivate" : "Activate"}
                            >
                              {toggleLoadingUuid === code.uuid ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <ToggleLeft className="h-3.5 w-3.5" />
                              )}
                              {code.is_active ? "Disable" : "Enable"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                              onClick={() => openEdit(code)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => setDeleteTarget(code)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Expandable stats row */}
                      {expandedUuid === code.uuid && (
                        <TableRow key={`${code.uuid}-stats`}>
                          <TableCell colSpan={8} className="p-0">
                            <StatsPanel uuid={code.uuid} />
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
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
            onClick={() => fetchCodes(pagination.current_page - 1)}
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
            onClick={() => fetchCodes(pagination.current_page + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!open) setShowForm(false); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editCode ? `Edit ${editCode.code}` : "New Promotional Code"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="form-code">Code *</Label>
              <Input
                id="form-code"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="SUMMER20"
                disabled={!!editCode}
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="form-description">Description</Label>
              <Input
                id="form-description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional description"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Type *</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm((f) => ({ ...f, type: v as "percentage" | "fixed" }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="form-discount-value">
                {form.type === "percentage" ? "Discount %" : "Discount Amount"} *
              </Label>
              <Input
                id="form-discount-value"
                type="number"
                min={0.01}
                step={0.01}
                value={form.discount_value}
                onChange={(e) => setForm((f) => ({ ...f, discount_value: e.target.value }))}
                placeholder={form.type === "percentage" ? "20" : "5000"}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="form-max-uses">Max Uses</Label>
              <Input
                id="form-max-uses"
                type="number"
                min={1}
                value={form.max_uses}
                onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))}
                placeholder="Unlimited"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="form-max-uses-per-user">Max Uses / User</Label>
              <Input
                id="form-max-uses-per-user"
                type="number"
                min={1}
                value={form.max_uses_per_user}
                onChange={(e) => setForm((f) => ({ ...f, max_uses_per_user: e.target.value }))}
                placeholder="Unlimited"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="form-valid-from">Valid From</Label>
              <Input
                id="form-valid-from"
                type="date"
                value={form.valid_from}
                onChange={(e) => setForm((f) => ({ ...f, valid_from: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="form-valid-until">Valid Until</Label>
              <Input
                id="form-valid-until"
                type="date"
                value={form.valid_until}
                onChange={(e) => setForm((f) => ({ ...f, valid_until: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Applies To</Label>
              <Select
                value={form.applies_to}
                onValueChange={(v) => setForm((f) => ({ ...f, applies_to: v ?? "" }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="session">Session</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3 pt-5">
              <Switch
                id="form-is-active"
                checked={form.is_active}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, is_active: checked }))}
              />
              <Label htmlFor="form-is-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)} disabled={formLoading}>
              Cancel
            </Button>
            <Button onClick={handleFormSubmit} disabled={formLoading}>
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editCode ? "Save Changes" : "Create Code"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.code}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the promotional code. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
