"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useCEOStore } from "@/store/ceo-store";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { Megaphone, Target } from "lucide-react";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6"];

export default function CEOLeadsPage() {
  const isLoading = useCEOStore((s) => s.isLoading);
  const period = useCEOStore((s) => s.period);
  const setPeriod = useCEOStore((s) => s.setPeriod);
  const leadSources = useCEOStore((s) => s.leadSources);
  const fetchAll = useCEOStore((s) => s.fetchAll);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { fetchAll(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const total = leadSources.reduce((sum, s) => sum + s.value, 0);
  const sorted = [...leadSources].sort((a, b) => b.value - a.value);
  const top = sorted[0];

  return (
    <div className="space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Lead Sources</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Acquisition breakdown by channel.</p>
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

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <Megaphone className="size-8 text-indigo-500 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Total Leads</p>
              {isLoading ? <Skeleton className="h-6 w-16 mt-1" /> : <p className="text-xl font-bold">{total}</p>}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <Target className="size-8 text-emerald-500 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Top Channel</p>
              {isLoading ? <Skeleton className="h-6 w-24 mt-1" /> : <p className="text-xl font-bold">{top?.name ?? "—"}</p>}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <Target className="size-8 text-amber-500 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Channels</p>
              {isLoading ? <Skeleton className="h-6 w-12 mt-1" /> : <p className="text-xl font-bold">{leadSources.length}</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {!mounted || isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : leadSources.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No data for this period.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={leadSources} cx="50%" cy="50%" outerRadius={100} dataKey="value" nameKey="name" label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                      {leadSources.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bar chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {!mounted || isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : leadSources.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No data for this period.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sorted} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} tickLine={false} width={80} />
                    <Tooltip />
                    <Bar dataKey="value" name="Leads" radius={[0, 4, 4, 0]}>
                      {sorted.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">Channel</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs">Leads</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs">Share</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    <td className="px-4 py-3"><Skeleton className="h-3 w-24" /></td>
                    <td className="px-4 py-3 text-right"><Skeleton className="h-3 w-10 ml-auto" /></td>
                    <td className="px-4 py-3 text-right"><Skeleton className="h-3 w-10 ml-auto" /></td>
                  </tr>
                ))
              ) : sorted.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground text-sm">No lead source data.</td></tr>
              ) : sorted.map((s, i) => (
                <tr key={s.name} className="border-b hover:bg-muted/20">
                  <td className="px-4 py-3 flex items-center gap-2">
                    <span className="size-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    {s.name}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{s.value}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{total > 0 ? ((s.value / total) * 100).toFixed(1) : 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
