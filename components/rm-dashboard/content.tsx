"use client";

import { useEffect, useState } from "react";
import { salesService } from "@/lib/api/sales";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Building2, AlertTriangle, Users } from "lucide-react";
import { format, differenceInDays } from "date-fns";

interface Organization {
  id: number;
  name: string;
  type: string;
  subscription_status?: string;
  contract_end_date?: string;
  member_count?: number;
}

export function DashboardContent() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrgs() {
      try {
        const data = await salesService.getManagedOrganizations();
        setOrgs(data);
      } catch (error) {
        console.error("Failed to fetch organizations", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrgs();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-[50vh]">
      <p className="text-muted-foreground">Loading accounts...</p>
    </div>
  );

  const renewalsDue = orgs.filter(org => {
    if (!org.contract_end_date) return false;
    const days = differenceInDays(new Date(org.contract_end_date), new Date());
    return days >= 0 && days <= 60;
  });

  const totalMembers = orgs.reduce((sum, org) => sum + (org.member_count || 0), 0);
  const activeAccounts = orgs.filter(org => org.subscription_status === 'active').length;

  return (
    <div className="space-y-6 p-4 md:p-8">
      <h2 className="text-3xl font-bold tracking-tight">RM Dashboard</h2>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orgs.length}</div>
            <p className="text-xs text-muted-foreground">{activeAccounts} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members Managed</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
            <p className="text-xs text-muted-foreground">Across all accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Renewals Due</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${renewalsDue.length > 0 ? 'text-amber-500' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{renewalsDue.length}</div>
            <p className="text-xs text-muted-foreground">Within 60 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Renewal Alerts */}
      {renewalsDue.length > 0 && (
        <Alert variant="default" className="border-amber-500 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Renewal Actions Required</AlertTitle>
          <AlertDescription className="text-amber-700">
            You have {renewalsDue.length} accounts with contracts expiring soon. Please initiate renewal discussions.
          </AlertDescription>
        </Alert>
      )}

      {/* Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>My Accounts</CardTitle>
          <CardDescription>Organizations you manage.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Contract End</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orgs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">No accounts assigned.</TableCell>
                </TableRow>
              ) : (
                orgs.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell className="capitalize">{org.type}</TableCell>
                    <TableCell>
                      <Badge variant={org.subscription_status === 'active' ? 'default' : 'secondary'}>
                        {org.subscription_status || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {org.contract_end_date ? (
                        <span className={differenceInDays(new Date(org.contract_end_date), new Date()) <= 60 ? "text-amber-600 font-medium" : ""}>
                          {format(new Date(org.contract_end_date), "MMM d, yyyy")}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>{org.member_count || 0}</TableCell>
                    <TableCell>
                      <a href={`/sales/contacts?company=${encodeURIComponent(org.name)}`} className="text-primary hover:underline text-sm">
                        View Contacts
                      </a>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
