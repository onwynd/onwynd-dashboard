"use client";

import { useEffect } from "react";
import { PayoutsTable } from "@/components/finance-dashboard/payouts-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinanceStore } from "@/store/finance-store";
import { Loader2 } from "lucide-react";

export default function PayoutsPage() {
  const stats = useFinanceStore((s) => s.stats);
  const isLoading = useFinanceStore((s) => s.isLoading);
  const fetchStats = useFinanceStore((s) => s.fetchStats);
  const fetchPayouts = useFinanceStore((s) => s.fetchPayouts);

  useEffect(() => {
    fetchStats();
    fetchPayouts();
  }, [fetchStats, fetchPayouts]);

  const pendingStat = stats.find((s) => s.title?.toLowerCase().includes("pending"));
  const processedStat = stats.find((s) => s.title?.toLowerCase().includes("processed") || s.title?.toLowerCase().includes("completed"));
  const failedStat = stats.find((s) => s.title?.toLowerCase().includes("failed") || s.title?.toLowerCase().includes("returned"));

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Payouts</h1>
        <p className="text-muted-foreground">
          Process and manage payouts to therapists, partners, and employees.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold text-amber-600">{pendingStat?.value ?? "₦0"}</div>
                <p className="text-xs text-muted-foreground">
                  {pendingStat?.change ?? ""} {pendingStat?.description ?? ""}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed Today</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">{processedStat?.value ?? "₦0"}</div>
                <p className="text-xs text-muted-foreground">
                  {processedStat?.change ?? ""} {processedStat?.description ?? ""}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed/Returned</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold text-red-600">{failedStat?.value ?? "₦0"}</div>
                <p className="text-xs text-muted-foreground">
                  {failedStat?.change ?? ""} {failedStat?.description ?? "No issues"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payout Requests</CardTitle>
          <CardDescription>
            Approve or reject payout requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PayoutsTable />
        </CardContent>
      </Card>
    </div>
  );
}
