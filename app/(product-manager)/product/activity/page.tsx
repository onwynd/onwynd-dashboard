"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Search } from "lucide-react";
import { pmService } from "@/lib/api/pm";
import { downloadCSV } from "@/lib/export-utils";

interface Activity {
  user: string;
  action: string;
  target: string;
  time: string;
}

export default function PMActivityPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    async function fetchActivity() {
      try {
        const response = await pmService.getReports();
        const data = response?.data ?? response ?? [];
        const items = Array.isArray(data) ? data : [];
        const mapped: Activity[] = items.map((item: Record<string, unknown>) => ({
          user: (item.user as string) ?? (item.user_name as string) ?? "System",
          action: (item.action as string) ?? (item.description as string) ?? "updated",
          target: (item.target as string) ?? (item.subject as string) ?? (item.title as string) ?? "",
          time: (item.time as string) ?? (item.created_at as string) ?? "",
        }));
        setActivities(mapped);
      } catch {
        setActivities([]);
      }
    }
    fetchActivity();
  }, []);

  const filteredActivities = activities.filter(activity =>
    activity.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.action.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = () => {
    const headers = ["User", "Action", "Target", "Time"];
    const rows = filteredActivities.map((a) => ({
      User: a.user,
      Action: a.action,
      Target: a.target,
      Time: a.time,
    }));
    downloadCSV("activity_log.csv", headers, rows);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Live Activity</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search activity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Feed</CardTitle>
          <CardDescription>
            Real-time updates across the product development lifecycle.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {filteredActivities.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No activity found.</p>
            ) : (
              filteredActivities.map((activity, index) => (
                <div key={index} className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{activity.user.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      <span className="font-bold">{activity.user}</span> {activity.action} <span className="font-bold">{activity.target}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
