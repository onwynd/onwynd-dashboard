
// filepath: components/finder-dashboard/content.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useFinderStore } from "@/store/finder-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, PlusCircle } from "lucide-react";
import Link from "next/link";
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

export function DashboardContent() {
  const router = useRouter();
  const { isAuthenticated, hasRole, hasPermission } = useAuth();
  const { leads, stats, loadingLeads, loadingStats, fetchLeads, fetchStats, deleteLead } = useFinderStore();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push("/login");
    } else if (isAuthenticated === true && !hasRole("finder")) {
      router.push("/unauthorized");
    }
  }, [isAuthenticated, hasRole, router]);

  useEffect(() => {
    if (isAuthenticated && hasRole("finder")) {
      fetchLeads();
      fetchStats();
    }
  }, [isAuthenticated, hasRole, fetchLeads, fetchStats]);

  if (!isAuthenticated || !hasRole("finder")) {
    return <div className="w-full h-full flex items-center justify-center"><p>Loading...</p></div>;
  }

  const handleDeleteConfirm = (id: string) => {
    setDeleteTarget(id);
  };

  const handleDeleteExecute = async () => {
    if (deleteTarget) {
      await deleteLead(deleteTarget);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {loadingStats ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-[108px] w-full" />
          <Skeleton className="h-[108px] w-full" />
          <Skeleton className="h-[108px] w-full" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Leads Generated</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats?.leads_generated ?? 0}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats?.conversion_rate ?? 0}%</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${stats?.earnings?.toLocaleString() ?? 0}</div>
                </CardContent>
            </Card>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Leads</CardTitle>
          <Link href="/sales/leads">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Lead
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loadingLeads ? (
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <ResponsiveTable>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.slice(0, 10).map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.phone}</TableCell>
                      <TableCell><Badge>{lead.status}</Badge></TableCell>
                      <TableCell>{new Date(lead.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {hasPermission("view_client_contact") && (
                            <Link href="/sales/leads">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </Link>
                          )}
                          <Link href="/sales/leads">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleDeleteConfirm(lead.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ResponsiveTable>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the lead
              and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteExecute} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
