"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminService } from "@/lib/api/admin";
import { exportToCsv } from "@/lib/export-utils";
import { Download, RefreshCw, Filter } from "lucide-react";

type ReportRow = Record<string, unknown>;

export default function AdminReportsPage() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "ytd">("30d");
  const [isLoading, setIsLoading] = useState(false);
  const [financial, setFinancial] = useState<ReportRow[]>([]);
  const [userGrowth, setUserGrowth] = useState<ReportRow[]>([]);

  async function loadReports(p: typeof period = period) {
    setIsLoading(true);
    try {
      const [fin, users] = await Promise.all([
        adminService.getFinancialReport({ period: p }),
        adminService.getUserGrowthReport({ period: p }),
      ]);
      const finRows = Array.isArray(fin) ? fin : [];
      const usrRows = Array.isArray(users) ? users : [];
      setFinancial(finRows);
      setUserGrowth(usrRows);
    } catch (e) {
      console.error("Failed to load reports", e);
      setFinancial([]);
      setUserGrowth([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const financialHeaders = useMemo(() => {
    if (!financial.length) return [];
    return Object.keys(financial[0]);
  }, [financial]);

  const userGrowthHeaders = useMemo(() => {
    if (!userGrowth.length) return [];
    return Object.keys(userGrowth[0]);
  }, [userGrowth]);

  function handleExportFinancial() {
    exportToCsv(`financial-report-${period}.csv`, financial);
  }
  function handleExportUserGrowth() {
    exportToCsv(`user-growth-report-${period}.csv`, userGrowth);
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Advanced Reports</h2>
          <p className="text-sm text-muted-foreground">Financial and user growth analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={(v: string | null) => { setPeriod((v ?? "") as typeof period); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => loadReports()} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Financial Report</CardTitle>
              <CardDescription>Revenue, expenses, net income and more</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleExportFinancial} disabled={!financial.length}>
                <Download className="h-4 w-4 mr-2" /> Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="overflow-auto">
            <div className="pb-3 flex items-center gap-2 text-muted-foreground text-sm">
              <Filter className="h-4 w-4" /> Period: {period.toUpperCase()}
            </div>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    {financialHeaders.map((h) => (
                      <TableHead key={h} className="whitespace-nowrap">{String(h)}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financial.map((row, idx) => (
                    <TableRow key={idx}>
                      {financialHeaders.map((h) => (
                        <TableCell key={h} className="whitespace-nowrap">
                          {String((row as Record<string, unknown>)[h] ?? "")}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  {!financial.length && (
                    <TableRow>
                      <TableCell colSpan={Math.max(1, financialHeaders.length)} className="text-center py-6">
                        {isLoading ? "Loading..." : "No data found for the selected period."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>User Growth Report</CardTitle>
              <CardDescription>Signups, active users, churn and cohorts</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleExportUserGrowth} disabled={!userGrowth.length}>
                <Download className="h-4 w-4 mr-2" /> Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="overflow-auto">
            <div className="pb-3 flex items-center gap-2 text-muted-foreground text-sm">
              <Filter className="h-4 w-4" /> Period: {period.toUpperCase()}
            </div>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    {userGrowthHeaders.map((h) => (
                      <TableHead key={h} className="whitespace-nowrap">{String(h)}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userGrowth.map((row, idx) => (
                    <TableRow key={idx}>
                      {userGrowthHeaders.map((h) => (
                        <TableCell key={h} className="whitespace-nowrap">
                          {String((row as Record<string, unknown>)[h] ?? "")}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  {!userGrowth.length && (
                    <TableRow>
                      <TableCell colSpan={Math.max(1, userGrowthHeaders.length)} className="text-center py-6">
                        {isLoading ? "Loading..." : "No data found for the selected period."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

