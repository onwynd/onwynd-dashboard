"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useCEOStore } from "@/store/ceo-store";
import {
  Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip,
  CartesianGrid, BarChart, Bar, Legend,
} from "recharts";
import { Users, TrendingUp, UserPlus, UserMinus } from "lucide-react";
import type { Metadata } from "next";

export default function CEOAnalyticsPage() {
  const isLoading = useCEOStore((s) => s.isLoading);
  const period = useCEOStore((s) => s.period);
  const setPeriod = useCEOStore((s) => s.setPeriod);
  const userGrowth = useCEOStore((s) => s.userGrowthSeries);
  const kpis = useCEOStore((s) => s.kpis);
  const fetchAll = useCEOStore((s) => s.fetchAll);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => { fetchAll(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const userKpi = kpis.find((k) => k.id === "users");
  const newKpi = kpis.find((k) => k.id === "new");
  const churnKpi = kpis.find((k) => k.id === "churn");

  const totalGrowth = userGrowth.length > 1
    ? userGrowth[userGrowth.length - 1].value - userGrowth[0].value
    : 0;

  const cards = [
    { title: "Active Users", value: userKpi?.value ?? "—", icon: Users, color: "text-blue-500" },
    { title: "New Signups", value: newKpi?.value ?? "—", icon: UserPlus, color: "text-emerald-500" },
    { title: "Churn Rate", value: churnKpi?.value ?? "—", icon: UserMinus, color: "text-red-500" },
    { title: "Net Growth", value: totalGrowth > 0 ? `+${totalGrowth}` : String(totalGrowth), icon: TrendingUp, color: "text-violet-500" },
  ];

  return (
    <div className="space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">User Growth</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track signups, churn, and overall platform growth.</p>
        </div>
        <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <SelectTrigger className="w-36 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="3months">3 months</SelectItem>
            <SelectItem value="6months">6 months</SelectItem>
            <SelectItem value="12months">12 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardContent className="p-5 flex items-center gap-4">
              <c.icon className={`size-8 shrink-0 ${c.color}`} />
              <div>
                <p className="text-xs text-muted-foreground">{c.title}</p>
                {isLoading ? <Skeleton className="h-6 w-16 mt-1" /> : (
                  <p className="text-xl font-bold">{c.value}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Growth trend chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">User Growth Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {!mounted || isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : userGrowth.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No data for this period.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowth}>
                  <defs>
                    <linearGradient id="ugGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" name="Users" stroke="#6366f1" fill="url(#ugGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bar chart for period comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Period Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            {!mounted || isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : userGrowth.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No data for this period.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Users" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
