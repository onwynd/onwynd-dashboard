"use client";

import { useEffect } from "react";
import type React from "react";
import { usePMStore } from "@/store/pm-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Hammer, Rocket, ListTodo, CheckCircle, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const { stats, fetchStats, velocityData, fetchVelocity, tasks, fetchTasks } = usePMStore();

  useEffect(() => {
    fetchStats();
    fetchVelocity();
    fetchTasks();
  }, [fetchStats, fetchVelocity, fetchTasks]);

  const getIcon = (iconName: string | React.ComponentType | object): React.ReactNode => {
    if (typeof iconName === 'object') return iconName as React.ReactNode;
    if (typeof iconName === 'function') {
      const Comp = iconName as React.ComponentType<{ className?: string }>;
      return <Comp className="h-4 w-4 text-muted-foreground" />;
    }
    switch (iconName) {
      case 'Rocket': return <Rocket className="h-4 w-4 text-muted-foreground" />;
      case 'ListTodo': return <ListTodo className="h-4 w-4 text-muted-foreground" />;
      case 'Hammer': return <Hammer className="h-4 w-4 text-muted-foreground" />;
      case 'Activity': return <Activity className="h-4 w-4 text-muted-foreground" />;
      case 'CheckCircle': return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
      case 'Clock': return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'Tool': return <Hammer className="h-4 w-4 text-muted-foreground" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Product Dashboard</h1>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.length > 0 ? (
          stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className="h-4 w-4 text-muted-foreground">{getIcon(stat.icon)}</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.change && <span className={stat.changeType === 'increase' ? 'text-green-500' : stat.changeType === 'decrease' ? 'text-red-500' : ''}>{stat.change} </span>}
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          // Loading skeletons
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-[70px] bg-muted/20" />
              <CardContent className="h-[80px] bg-muted/10" />
            </Card>
          ))
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Sprint Velocity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    {velocityData && velocityData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={velocityData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="sprint" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="committed" fill="#8884d8" name="Committed Points" />
                                <Bar dataKey="completed" fill="#82ca9d" name="Completed Points" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground bg-muted/20 rounded-md">
                            No velocity data available
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
        <Card className="col-span-3">
             <CardHeader>
                <CardTitle>Recent Activity (Latest Features)</CardTitle>
            </CardHeader>
             <CardContent>
                <div className="space-y-4">
                    {tasks.length > 0 ? (
                        tasks.map((task, i) => (
                            <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                <div className="flex items-center">
                                    <div className={`w-2 h-2 rounded-full mr-2 ${task.status === 'done' ? 'bg-green-500' : task.status === 'in_progress' ? 'bg-blue-500' : 'bg-yellow-500'}`}></div>
                                    <div>
                                        <div className="text-sm font-medium">{task.title}</div>
                                        <div className="text-xs text-muted-foreground">{task.dueDate ? `Due: ${task.dueDate}` : 'No due date'}</div>
                                    </div>
                                </div>
                                <div className="text-xs font-medium capitalize px-2 py-1 rounded bg-muted">
                                    {task.status.replace('_', ' ')}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-sm text-muted-foreground text-center py-4">No recent activity</div>
                    )}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
