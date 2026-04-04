"use client";

import { useEffect, useState } from "react";
import { hrService } from "@/lib/api/hr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Users, DollarSign, Calendar, UserPlus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface HRStats {
  total_employees: number;
  active_employees: number;
  pending_leave: number;
  approved_leave_month: number;
  new_hires_this_month: number;
  total_payroll_month: number;
}

interface ChartPoint { month: string; amount: number; }

export default function HRReportsPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<HRStats | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [period, setPeriod] = useState("6");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [s, c] = await Promise.all([
          hrService.getStats(),
          hrService.getChartData(period),
        ]);
        setStats(typeof s === 'object' && s !== null ? s as HRStats : null);
        const raw = Array.isArray(c) ? c : [];
        setChartData(raw);
      } catch (error) {
        console.error('Failed to fetch HR data:', error);
        toast({
          title: "Error",
          description: "Failed to load HR statistics. Please try again.",
          variant: "destructive",
        });
        setStats(null);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (stats === null) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">HR Reports</h1>
          <p className="text-muted-foreground">Workforce analytics and payroll overview.</p>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground mb-2">Failed to load HR statistics</div>
            <div className="text-sm text-muted-foreground">Please try refreshing the page or contact support if the issue persists.</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">HR Reports</h1>
        <p className="text-muted-foreground">Workforce analytics and payroll overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_employees ?? 0}</div>
            <p className="text-xs text-muted-foreground">{stats?.active_employees ?? 0} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{(stats?.total_payroll_month ?? 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month&apos;s total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Leave Requests</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats?.pending_leave ?? 0}</div>
            <p className="text-xs text-muted-foreground">{stats?.approved_leave_month ?? 0} approved this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">New Hires</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.new_hires_this_month ?? 0}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payroll Trend</CardTitle>
              <CardDescription>Monthly payroll expenditure over time.</CardDescription>
            </div>
            <Select value={period} onValueChange={(v: string | null) => v && setPeriod(v)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 months</SelectItem>
                <SelectItem value="6">6 months</SelectItem>
                <SelectItem value="12">12 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
              No payroll data available yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [`₦${Number(v ?? 0).toLocaleString()}`, "Payroll"]} />
                <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
