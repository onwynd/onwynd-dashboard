"use client";

import { useCallback, useEffect, useState } from "react";
import { adminService } from "@/lib/api/admin";
import { PageHeader } from "@/components/shared/page-header";
import { TableBodyShimmer } from "@/components/shared/shimmer-skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  RefreshCw,
  ShieldBan,
  XCircle,
} from "lucide-react";

interface LocationFlagRow {
  therapist_id: number;
  mismatch_count: number;
  last_detected_at: string | null;
  last_ip: string | null;
  stored_country: string | null;
  detected_country: string | null;
  therapist: {
    user: {
      id: number;
      name: string;
      email: string;
    } | null;
  } | null;
}

interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

type ActionType = "dismiss" | "reverify" | "suspend" | "update_country";

interface ActionState {
  therapistId: number;
  therapistName: string;
  action: ActionType;
  note: string;
  newCountry: string;
}

function MismatchBadge({ count }: { count: number }) {
  if (count >= 10) {
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200 font-semibold">
        {count} mismatches
      </Badge>
    );
  }
  if (count >= 3) {
    return (
      <Badge className="bg-amber-100 text-amber-700 border-amber-200 font-semibold">
        {count} mismatches
      </Badge>
    );
  }
  return (
    <Badge className="bg-gray-100 text-gray-600 border-gray-200 font-semibold">
      {count} mismatch{count !== 1 ? "es" : ""}
    </Badge>
  );
}

export default function LocationFlagsPage() {
  const [flags, setFlags] = useState<LocationFlagRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    current_page: 1,
    last_page: 1,
    per_page: 25,
    total: 0,
  });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [actionState, setActionState] = useState<ActionState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getLocationFlags({ page });
      const rows: LocationFlagRow[] = data?.data ?? (Array.isArray(data) ? data : []);
      setFlags(rows);
      if (data?.current_page) {
        setPagination({
          current_page: data.current_page,
          last_page: data.last_page ?? 1,
          per_page: data.per_page ?? 25,
          total: data.total ?? 0,
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load location flags.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const openAction = (row: LocationFlagRow, action: ActionType) => {
    const name = row.therapist?.user?.name ?? `Therapist #${row.therapist_id}`;
    setActionState({
      therapistId: row.therapist_id,
      therapistName: name,
      action,
      note: "",
      newCountry: row.stored_country ?? "",
    });
  };

  const handleConfirm = async () => {
    if (!actionState) return;
    setIsSubmitting(true);
    try {
      const { therapistId, action, note, newCountry } = actionState;
      await adminService.resolveLocationFlag(
        therapistId,
        action,
        note.trim() || undefined,
        action === "update_country" ? newCountry.trim() || undefined : undefined,
      );
      const labels: Record<ActionType, string> = {
        dismiss: "Flag dismissed.",
        reverify: "Re-verification request sent.",
        suspend: "Account suspended.",
        update_country: "Country updated and flag resolved.",
      };
      toast({ title: "Success", description: labels[action] });
      setActionState(null);
      load();
    } catch {
      toast({
        title: "Error",
        description: "Action failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const actionMeta: Record<
    ActionType,
    { label: string; description: string; confirmLabel: string; variant: "default" | "destructive" | "outline" }
  > = {
    dismiss: {
      label: "Dismiss",
      description: "Mark all open location mismatches for this therapist as resolved without taking further action.",
      confirmLabel: "Dismiss Flag",
      variant: "outline",
    },
    reverify: {
      label: "Request Re-verify",
      description:
        "Send the therapist a re-verification request email and resolve the flag. The therapist must confirm their location.",
      confirmLabel: "Send & Resolve",
      variant: "default",
    },
    suspend: {
      label: "Suspend",
      description:
        "Suspend the therapist account due to the location discrepancy and notify them. This sets account_flagged = true.",
      confirmLabel: "Suspend Account",
      variant: "destructive",
    },
    update_country: {
      label: "Update Country",
      description:
        "Update the stored country of operation on the therapist profile to match what was detected, then resolve the flag.",
      confirmLabel: "Update & Resolve",
      variant: "default",
    },
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Location Mismatch Flags"
        subtitle="Therapists whose login location doesn't match their registered country of practice"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => load()}
          className="h-8 text-xs gap-1.5"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          Refresh
        </Button>
      </PageHeader>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {!isLoading && flags.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <MapPin className="w-12 h-12 text-gray-200 mb-4" />
            <p className="text-sm font-medium text-gray-600">No open location flags</p>
            <p className="text-xs text-gray-400 mt-1">All location mismatches have been resolved.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Therapist
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Email
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Stored Country
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Detected Country
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Mismatches
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Last Detected
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableBodyShimmer rows={6} cols={7} />
                ) : (
                  flags.map((row, idx) => {
                    const user = row.therapist?.user;
                    return (
                      <TableRow
                        key={row.therapist_id}
                        className={[
                          idx % 2 === 0 ? "bg-white" : "bg-gray-50/40",
                          "hover:bg-amber-50/30 transition-colors",
                        ].join(" ")}
                      >
                        <TableCell className="px-4 py-3 font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            {user?.name ?? <span className="text-gray-400">Unknown</span>}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-500">
                          {user?.email ?? "—"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm">
                          <span className="font-mono text-gray-700">
                            {row.stored_country ?? <span className="text-gray-300">—</span>}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm">
                          <span className="font-mono text-amber-700 font-medium">
                            {row.detected_country ?? <span className="text-gray-300">—</span>}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <MismatchBadge count={row.mismatch_count} />
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-400">
                          {row.last_detected_at
                            ? new Date(row.last_detected_at).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs px-2.5 gap-1 text-gray-600"
                              onClick={() => openAction(row, "dismiss")}
                            >
                              <XCircle className="w-3 h-3" />
                              Dismiss
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs px-2.5 gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                              onClick={() => openAction(row, "reverify")}
                            >
                              <RefreshCw className="w-3 h-3" />
                              Re-verify
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs px-2.5 gap-1 text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => openAction(row, "suspend")}
                            >
                              <ShieldBan className="w-3 h-3" />
                              Suspend
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {pagination.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50">
            <span className="text-sm text-gray-400">
              Page {pagination.current_page} of {pagination.last_page} · {pagination.total} flags
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page >= pagination.last_page}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Action confirmation dialog */}
      <Dialog
        open={!!actionState}
        onOpenChange={(open) => {
          if (!open) setActionState(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          {actionState && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {actionMeta[actionState.action].label} — {actionState.therapistName}
                </DialogTitle>
                <DialogDescription>
                  {actionMeta[actionState.action].description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {actionState.action === "update_country" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="new-country">
                      New Country Code <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="new-country"
                      placeholder="e.g. NG, US, GB"
                      maxLength={10}
                      value={actionState.newCountry}
                      onChange={(e) =>
                        setActionState((s) => s && { ...s, newCountry: e.target.value.toUpperCase() })
                      }
                    />
                    <p className="text-xs text-gray-400">
                      ISO 3166-1 alpha-2 country code (e.g. NG, US, GB)
                    </p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="action-note">
                    Note <span className="text-xs text-gray-400">(optional)</span>
                  </Label>
                  <Textarea
                    id="action-note"
                    placeholder="Add an internal note about this resolution…"
                    rows={3}
                    value={actionState.note}
                    onChange={(e) =>
                      setActionState((s) => s && { ...s, note: e.target.value })
                    }
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setActionState(null)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant={actionMeta[actionState.action].variant}
                  onClick={handleConfirm}
                  disabled={
                    isSubmitting ||
                    (actionState.action === "update_country" && !actionState.newCountry.trim())
                  }
                  className={
                    actionMeta[actionState.action].variant === "default"
                      ? "bg-teal text-white hover:bg-teal-mid"
                      : undefined
                  }
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {actionMeta[actionState.action].confirmLabel}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
