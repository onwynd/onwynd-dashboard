
// filepath: components/builder-dashboard/content.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useBuilderStore } from "@/store/builder-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function DashboardContent() {
  const router = useRouter();
  const { isAuthenticated, hasRole } = useAuth();
  const { organizations, loading, fetchOrganizations } = useBuilderStore();

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push("/login");
    } else if (isAuthenticated === true && !hasRole("builder")) {
      router.push("/unauthorized");
    }
  }, [isAuthenticated, hasRole, router]);

  useEffect(() => {
    if (isAuthenticated && hasRole("builder")) {
      fetchOrganizations();
    }
  }, [isAuthenticated, hasRole, fetchOrganizations]);

  if (!isAuthenticated || !hasRole("builder")) {
    return <div className="w-full h-full flex items-center justify-center"><p>Loading...</p></div>;
  }

  const renewalsDue = organizations.filter(org => {
      const renewalDate = new Date(org.renewal_date);
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.setDate(now.getDate() + 30));
      return renewalDate <= thirtyDaysFromNow;
  });

  return (
    <div className="space-y-6">
      {renewalsDue.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Renewals Due Soon</AlertTitle>
          <AlertDescription>
            {renewalsDue.length} organization(s) have renewals coming up in the next 30 days.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Managed Organizations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
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
                    <TableHead>Organization</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Renewal Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organizations.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell className="font-medium">{org.name}</TableCell>
                      <TableCell>{org.members_count}</TableCell>
                      <TableCell>{new Date(org.renewal_date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Link href="/sales/contacts">
                            <Button variant="outline" size="sm" className="min-h-[44px]">View Contacts</Button>
                        </Link>
                      </TableCell>
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
