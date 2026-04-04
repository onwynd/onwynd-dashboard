"use client";

import { useEffect } from "react";
import { useManagerStore } from "@/store/manager-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Clock, Star, Ticket, Loader2, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const iconMap: Record<string, React.ElementType> = {
  Users, Clock, Star, Ticket,
};

const trendIcon: Record<string, React.ElementType> = {
  up: ArrowUp, down: ArrowDown, neutral: Minus,
};

const trendColor: Record<string, string> = {
  up: "text-emerald-500",
  down: "text-rose-500",
  neutral: "text-muted-foreground",
};

function statusVariant(s: string): "default" | "secondary" | "destructive" | "outline" {
  if (s === "active") return "default";
  if (s === "offline") return "secondary";
  return "outline";
}

export default function ManagerDashboardPage() {
  const { stats, employees, fetchStats, fetchEmployees } = useManagerStore();
  const isLoading = stats.length === 0 && employees.length === 0;

  useEffect(() => {
    fetchStats();
    fetchEmployees({ per_page: 10 });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Team overview and performance at a glance.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = iconMap[stat.iconName] ?? Users;
              const TrendIcon = trendIcon[stat.trend] ?? Minus;
              return (
                <Card key={stat.title}>
                  <CardContent className="pt-4 flex items-start gap-4">
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground truncate">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      {stat.change && stat.change !== "—" && (
                        <div className={`flex items-center text-xs font-medium ${trendColor[stat.trend]}`}>
                          <TrendIcon className="w-3 h-3 mr-1" />
                          {stat.change}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Recent Team Members */}
          {employees.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Recent team activity</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.slice(0, 10).map((emp) => (
                      <TableRow key={emp.id}>
                        <TableCell className="font-medium">
                          {emp.first_name} {emp.last_name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{emp.email}</TableCell>
                        <TableCell>{emp.department ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(emp.is_active ? "active" : "offline")}>
                            {emp.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
