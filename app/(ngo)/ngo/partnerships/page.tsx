"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Globe, Building2, GraduationCap, Heart } from "lucide-react";

type PartnerType = "corporate" | "university" | "government" | "ngo" | "faith";
type PartnerStatus = "active" | "pending" | "inactive";

type Partner = {
  id: number;
  name: string;
  type: PartnerType;
  contactEmail: string;
  since: string;
  status: PartnerStatus;
  contribution: string;
};

const mockPartners: Partner[] = [
  { id: 1, name: "Lagos State Ministry of Health", type: "government", contactEmail: "partnerships@health.lag.gov", since: "2024-06-01", status: "active", contribution: "Referral pipeline & co-funding" },
  { id: 2, name: "University of Lagos", type: "university", contactEmail: "counselling@unilag.edu.ng", since: "2025-01-15", status: "active", contribution: "Campus outreach & research" },
  { id: 3, name: "Zenith Bank Wellness Initiative", type: "corporate", contactEmail: "csr@zenithbank.com", since: "2025-09-01", status: "active", contribution: "Programme sponsorship" },
  { id: 4, name: "Global Mental Health Alliance", type: "ngo", contactEmail: "africa@gmha.org", since: "2026-01-01", status: "pending", contribution: "Technical support & grant access" },
  { id: 5, name: "Redeemed Christian Church of God", type: "faith", contactEmail: "welfare@rccg.org", since: "2025-03-10", status: "active", contribution: "Faith community outreach" },
];

const typeIcon: Record<PartnerType, React.ReactNode> = {
  corporate:  <Building2 className="h-4 w-4 text-amber-600" />,
  university: <GraduationCap className="h-4 w-4 text-blue-600" />,
  government: <Globe className="h-4 w-4 text-green-600" />,
  ngo:        <Heart className="h-4 w-4 text-teal" />,
  faith:      <Heart className="h-4 w-4 text-purple-600" />,
};

function statusVariant(s: PartnerStatus): "default" | "secondary" | "destructive" | "outline" {
  if (s === "active") return "default";
  if (s === "pending") return "outline";
  return "secondary";
}

export default function PartnershipsPage() {
  const active = mockPartners.filter((p) => p.status === "active").length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Partnerships</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your strategic partners — government bodies, universities, corporates, and other NGOs.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Partners", value: String(mockPartners.length) },
          { label: "Active", value: String(active) },
          { label: "Pending", value: String(mockPartners.filter(p => p.status === "pending").length) },
          { label: "Partner Types", value: String(new Set(mockPartners.map(p => p.type)).size) },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Partner Directory</CardTitle>
          <CardDescription>All current and pending strategic partnerships.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partner</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Since</TableHead>
                  <TableHead>Contribution</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPartners.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium text-sm">{p.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 capitalize text-sm">
                        {typeIcon[p.type]}
                        {p.type}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.contactEmail}</TableCell>
                    <TableCell className="text-sm">{p.since}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.contribution}</TableCell>
                    <TableCell><Badge variant={statusVariant(p.status)}>{p.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
