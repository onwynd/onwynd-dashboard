"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Megaphone, MapPin, Users, Calendar } from "lucide-react";

type OutreachEvent = {
  id: number;
  title: string;
  location: string;
  date: string;
  reach: number;
  type: "community" | "digital" | "school" | "workplace" | "faith";
  status: "upcoming" | "completed" | "cancelled";
};

// Mock data — replace with API when outreach endpoints are ready
const mockEvents: OutreachEvent[] = [
  { id: 1, title: "World Mental Health Day Community Walk", location: "Lagos Island", date: "2026-10-10", reach: 200, type: "community", status: "upcoming" },
  { id: 2, title: "School Awareness Drive – Surulere", location: "Surulere, Lagos", date: "2026-04-05", reach: 350, type: "school", status: "upcoming" },
  { id: 3, title: "Social Media Wellness Campaign", location: "Online", date: "2026-03-01", reach: 4500, type: "digital", status: "completed" },
  { id: 4, title: "Faith Community Wellness Seminar", location: "Ikeja, Lagos", date: "2026-02-14", reach: 120, type: "faith", status: "completed" },
  { id: 5, title: "Workplace Stress Workshop – Fintech Sector", location: "Victoria Island", date: "2026-03-20", reach: 80, type: "workplace", status: "completed" },
];

const typeColors: Record<OutreachEvent["type"], string> = {
  community: "bg-teal/10 text-teal border-teal/30",
  digital:   "bg-purple-50 text-purple-700 border-purple-200",
  school:    "bg-blue-50 text-blue-700 border-blue-200",
  workplace: "bg-amber-50 text-amber-700 border-amber-200",
  faith:     "bg-green-50 text-green-700 border-green-200",
};

function statusVariant(s: string): "default" | "secondary" | "destructive" | "outline" {
  if (s === "completed") return "default";
  if (s === "upcoming") return "secondary";
  return "destructive";
}

export default function OutreachPage() {
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed">("all");
  const filtered = mockEvents.filter((e) => filter === "all" || e.status === filter);
  const totalReach = mockEvents.reduce((s, e) => s + e.reach, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Outreach</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track community outreach events, campaigns, and their reach.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Events", value: String(mockEvents.length), icon: Megaphone, color: "text-teal" },
          { label: "Total Reach", value: totalReach.toLocaleString(), icon: Users, color: "text-blue-600" },
          { label: "Upcoming", value: String(mockEvents.filter(e => e.status === "upcoming").length), icon: Calendar, color: "text-purple-600" },
          { label: "Locations", value: String(new Set(mockEvents.map(e => e.location)).size), icon: MapPin, color: "text-amber-600" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-5 flex items-center gap-3">
                <Icon className={`h-8 w-8 ${s.color}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle>Outreach Events</CardTitle>
              <CardDescription>Community events, campaigns, and awareness drives.</CardDescription>
            </div>
            <div className="flex rounded-lg border overflow-hidden">
              {(["all", "upcoming", "completed"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                    filter === f ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-10 text-center">No events found.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Reach</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium text-sm">{e.title}</TableCell>
                      <TableCell>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${typeColors[e.type]}`}>
                          {e.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{e.location}</TableCell>
                      <TableCell className="text-sm">{e.date}</TableCell>
                      <TableCell className="text-sm font-medium">{e.reach.toLocaleString()}</TableCell>
                      <TableCell><Badge variant={statusVariant(e.status)}>{e.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
