
// filepath: components/closer-dashboard/content.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useCloserStore } from "@/store/closer-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Check, Ban, DollarSign } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function DashboardContent() {
  const router = useRouter();
  const { isAuthenticated, hasRole } = useAuth();
  const {
    dashboardData,
    closedDeals,
    loadingDashboard,
    loadingHistory,
    fetchDashboard,
    fetchHistory,
    markDealWon,
    markDealLost,
  } = useCloserStore();

  const [lossReason, setLossReason] = useState("");
  const [selectedDeal, setSelectedDeal] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push("/login");
    } else if (isAuthenticated === true && !hasRole("closer")) {
      router.push("/unauthorized");
    }
  }, [isAuthenticated, hasRole, router]);

  useEffect(() => {
    if (isAuthenticated && hasRole("closer")) {
      fetchDashboard();
      fetchHistory();
    }
  }, [isAuthenticated, hasRole, fetchDashboard, fetchHistory]);
  
  if (!isAuthenticated || !hasRole("closer")) {
    return <div className="w-full h-full flex items-center justify-center"><p>Loading...</p></div>;
  }

  const handleMarkAsLost = async () => {
    if (selectedDeal && lossReason) {
      await markDealLost(selectedDeal, lossReason);
      setSelectedDeal(null);
      setLossReason("");
    }
  };

  return (
    <div className="space-y-6">
      {loadingDashboard ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-[108px] w-full" />
          <Skeleton className="h-[108px] w-full" />
          <Skeleton className="h-[108px] w-full" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${dashboardData?.pipeline_value?.toLocaleString() ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Closed This Month</CardTitle>
              <Check className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${dashboardData?.closed_this_month?.toLocaleString() ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stale Deals</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.stale_deals_count ?? 0}</div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {loadingDashboard ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        dashboardData && dashboardData.action_required.length > 0 && (
          <Card className="border-amber-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <AlertTriangle /> Action Required
              </CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveTable>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Deal Name</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead>Stale Since</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dashboardData.action_required.map((deal) => (
                                <TableRow key={deal.id}>
                                    <TableCell>{deal.client_name || deal.name}</TableCell>
                                    <TableCell>${deal.value.toLocaleString()}</TableCell>
                                    <TableCell>{new Date(deal.last_contact_at || deal.stale_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex gap-2 justify-end">
                                            <Button size="sm" variant="outline" onClick={() => markDealWon(deal.id)} className="min-h-[44px]">Mark as Won</Button>
                                            <Dialog onOpenChange={(open) => !open && setSelectedDeal(null)}>
                                                <DialogTrigger asChild>
                                                    <Button size="sm" variant="destructive" onClick={() => setSelectedDeal(deal.id)} className="min-h-[44px]">Mark as Lost</Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Mark Deal as Lost</DialogTitle>
                                                        <DialogDescription>Provide a reason for this loss.</DialogDescription>
                                                    </DialogHeader>
                                                    <div className="grid gap-4 py-4">
                                                        <Label htmlFor="loss-reason">Reason</Label>
                                                        <Textarea id="loss-reason" value={lossReason} onChange={(e) => setLossReason(e.target.value)} />
                                                    </div>
                                                    <DialogFooter>
                                                        <Button onClick={handleMarkAsLost}>Confirm</Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ResponsiveTable>
            </CardContent>
          </Card>
        )
      )}

      <Card>
        <CardHeader>
          <CardTitle>Closed Deal History</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <ResponsiveTable>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deal Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Closed At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {closedDeals.map((deal) => (
                    <TableRow key={deal.id}>
                      <TableCell>{deal.client_name || deal.name}</TableCell>
                      <TableCell>
                        <Badge variant={(deal.status || deal.stage) === 'won' ? 'default' : 'destructive'}>
                          {(deal.status || deal.stage) === 'won' ? <Check className="mr-2 h-4 w-4" /> : <Ban className="mr-2 h-4 w-4" />}
                          {deal.status || deal.stage}
                        </Badge>
                      </TableCell>
                      <TableCell>${deal.value.toLocaleString()}</TableCell>
                      <TableCell>{new Date(deal.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ResponsiveTable>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
