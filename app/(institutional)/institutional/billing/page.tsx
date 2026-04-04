"use client";

// DB10: Institution admin billing page

import { useEffect, useState } from "react";
import { institutionalService } from "@/lib/api/institutional";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Calendar, Package, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import client from "@/lib/api/client";

interface BillingRecord {
  id: number | string;
  amount: number;
  currency: string;
  status: string;
  description?: string;
  created_at: string;
  due_date?: string;
  paid_at?: string;
}

interface SubscriptionInfo {
  plan_name: string;
  seats: number;
  status: string;
  current_period_end?: string;
  amount: number;
  currency: string;
}

function fmtNgn(n: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(n ?? 0);
}

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (["paid", "active", "succeeded"].includes(status)) return "default";
  if (status === "pending") return "secondary";
  if (["failed", "cancelled", "overdue"].includes(status)) return "destructive";
  return "outline";
}

export default function InstitutionalBillingPage() {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [invoices, setInvoices] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBillingData = async () => {
    setLoading(true);
    try {
      const [orgRes, invoicesRes] = await Promise.allSettled([
        institutionalService.getOrganization(),
        client.get("/api/v1/institutional/billing/invoices").then((r) => r.data?.data ?? r.data),
      ]);

      if (orgRes.status === "fulfilled" && orgRes.value) {
        const org = orgRes.value as Record<string, unknown>;
        const sub = (org.subscription ?? org.active_subscription) as Record<string, unknown> | undefined;
        if (sub) {
          setSubscription({
            plan_name: String(sub.plan_name ?? sub.name ?? "—"),
            seats: Number(sub.seats ?? sub.seat_count ?? 0),
            status: String(sub.status ?? "active"),
            current_period_end: sub.current_period_end as string | undefined,
            amount: Number(sub.amount ?? sub.price ?? 0),
            currency: String(sub.currency ?? "NGN"),
          });
        }
      }

      if (invoicesRes.status === "fulfilled") {
        const list = invoicesRes.value;
        setInvoices(Array.isArray(list) ? list : []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBillingData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex-1 space-y-6 p-6 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Billing & Subscription</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your organisation&apos;s subscription and view invoices.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchBillingData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Subscription summary */}
          {subscription ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
              <Card>
                <CardContent className="p-5 flex items-start gap-3">
                  <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Current Plan</p>
                    <p className="text-lg font-bold">{subscription.plan_name}</p>
                    <Badge variant={statusVariant(subscription.status)} className="text-xs mt-1">
                      {subscription.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5 flex items-start gap-3">
                  <div className="size-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Billing Amount</p>
                    <p className="text-lg font-bold">{fmtNgn(subscription.amount, subscription.currency)}</p>
                    <p className="text-xs text-muted-foreground">{subscription.seats} seats</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5 flex items-start gap-3">
                  <div className="size-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Next Renewal</p>
                    <p className="text-lg font-bold">
                      {subscription.current_period_end
                        ? format(new Date(subscription.current_period_end), "dd MMM yyyy")
                        : "—"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>No active subscription found.</p>
              </CardContent>
            </Card>
          )}

          {/* Invoices */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
              <CardDescription>All billing records for your organisation.</CardDescription>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No invoices available.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Paid At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(new Date(inv.created_at), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell>{inv.description ?? "Subscription"}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {fmtNgn(inv.amount, inv.currency)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(inv.status)}>{inv.status}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {inv.paid_at ? format(new Date(inv.paid_at), "dd MMM yyyy") : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
