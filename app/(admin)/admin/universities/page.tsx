"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import client from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Building2, Settings, GraduationCap, RefreshCw, Search, Users, Globe } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

type University = {
  id: number;
  name: string;
  type: "university" | "corporate";
  domain?: string | null;
  contact_email?: string | null;
  country?: string | null;
  city?: string | null;
  total_employees?: number | null;
  onboarded_count?: number;
  status?: string | null;
  funding_model?: "model_a" | "model_b" | null;
  billing_cycle?: "monthly" | "semester" | "annual" | null;
};

const BASE = "/api/v1/institutional/universities";

export default function UniversitiesPage() {
  const [orgs, setOrgs] = useState<University[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [pagination, setPagination] = useState({ total: 0, last_page: 1, current_page: 1, per_page: 100 });
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");

  const fetchOrgs = useCallback(async (page = 1) => {
    setIsLoading(true);
    setIsError(false);
    try {
      const params: Record<string, string | number> = { page, per_page: 100 };
      if (typeFilter !== "all") params.type = typeFilter;
      if (countryFilter !== "all") params.country = countryFilter;
      if (search) params.search = search;
      const res = await client.get(BASE, { params });
      const data = res.data.data ?? res.data;
      // New API shape: { organizations: [...], pagination: {...}, countries: [...] }
      // Fallback for old shape: direct array or paginator
      if (data?.organizations) {
        setOrgs(data.organizations);
        setPagination(data.pagination ?? { total: data.organizations.length, last_page: 1, current_page: 1, per_page: 100 });
        setCountries(data.countries ?? []);
      } else {
        // Legacy paginator shape
        const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
        setOrgs(list);
      }
    } catch {
      setIsError(true);
      toast({ title: "Error", description: "Failed to load institutions", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [typeFilter, countryFilter, search]);

  useEffect(() => { fetchOrgs(); }, [fetchOrgs]);

  const adoptionRate = (org: University) => {
    if (!org.total_employees || org.total_employees === 0) return null;
    return Math.round(((org.onboarded_count ?? 0) / org.total_employees) * 100);
  };

  return (
    <div className="flex-1 space-y-5 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Universities & Institutions</h2>
          <p className="text-muted-foreground">Manage university and corporate partner accounts — worldwide.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchOrgs(pagination.current_page)} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />Refresh
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total",        value: pagination.total,                                    icon: Building2 },
          { label: "Universities", value: orgs.filter((o) => o.type === "university").length, icon: GraduationCap },
          { label: "Corporate",    value: orgs.filter((o) => o.type === "corporate").length,  icon: Building2 },
          { label: "Countries",    value: countries.length,                                   icon: Globe },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="pt-4 flex items-center justify-between">
              <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-2xl font-bold">{value}</p></div>
              <Icon className="h-7 w-7 opacity-20 text-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search name, email, city…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchOrgs()} />
        </div>
        <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value ?? "all")}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="university">Universities</SelectItem>
            <SelectItem value="corporate">Corporate</SelectItem>
          </SelectContent>
        </Select>
        {countries.length > 0 && (
          <Select value={countryFilter} onValueChange={(value) => setCountryFilter(value ?? "all")}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Country" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertTitle>Failed to load institutions</AlertTitle>
          <AlertDescription>Please try again later.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader><CardTitle>Institutions ({pagination.total})</CardTitle></CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : orgs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <GraduationCap className="w-12 h-12 opacity-20 mb-4" />
              <p>No institutions found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institution</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Country / City</TableHead>
                  <TableHead>Staff / Students</TableHead>
                  <TableHead>Onboarded</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orgs.map((u) => {
                  const rate = adoptionRate(u);
                  return (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${u.type === "university" ? "bg-emerald-50" : "bg-indigo-50"}`}>
                            {u.type === "university"
                              ? <GraduationCap className="w-4 h-4 text-emerald-600" />
                              : <Building2 className="w-4 h-4 text-indigo-600" />}
                          </div>
                          <div>
                            <p className="font-medium">{u.name}</p>
                            {u.contact_email && <p className="text-xs text-muted-foreground">{u.contact_email}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize text-xs">{u.type}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {u.country ? (
                          <div><p className="font-medium">{u.country}</p>{u.city && <p className="text-xs text-muted-foreground">{u.city}</p>}</div>
                        ) : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-sm">
                        {u.total_employees ? (
                          <div className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-muted-foreground" />{u.total_employees.toLocaleString()}</div>
                        ) : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="space-y-1">
                          <span className="font-medium">{(u.onboarded_count ?? 0).toLocaleString()}</span>
                          {rate !== null && (
                            <div className="flex items-center gap-1.5">
                              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(rate, 100)}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground">{rate}%</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {u.status ? (
                          <Badge className={u.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>
                            {u.status}
                          </Badge>
                        ) : <span className="text-muted-foreground text-xs">—</span>}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="outline" className="gap-1.5">
                          <Link href={`/admin/universities/${u.id}/config`}>
                            <Settings className="h-3.5 w-3.5" />Configure
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {pagination.last_page > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={pagination.current_page <= 1} onClick={() => fetchOrgs(pagination.current_page - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {pagination.current_page} of {pagination.last_page}</span>
          <Button variant="outline" size="sm" disabled={pagination.current_page >= pagination.last_page} onClick={() => fetchOrgs(pagination.current_page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
