"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import client from "@/lib/api/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Building2, User, Stethoscope } from "lucide-react";
import type { Center, Agent, Therapist } from "@/components/shared/map-view";
import type { AxiosResponse } from "axios";

// Dynamically import the map to avoid SSR issues
const MapView = dynamic(() => import("@/components/shared/map-view"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] items-center justify-center rounded-lg border bg-muted">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
});

export default function MapPage() {
  const [centers, setCenters] = useState<Center[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res: AxiosResponse<{ data?: { centers?: Center[]; agents?: Agent[]; therapists?: Therapist[] } }> =
          await client.get("/api/v1/map/data");
        const data = res.data?.data ?? {};
        setCenters(data.centers ?? []);
        setAgents(data.agents ?? []);
        setTherapists(data.therapists ?? []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalPins = centers.length + agents.length + therapists.length;

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Live Map</h1>
          <p className="text-muted-foreground">Physical centers, agents, and verified therapists.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <Building2 className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{centers.length}</p>
              <p className="text-xs text-muted-foreground">Physical Centers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <User className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{agents.length}</p>
              <p className="text-xs text-muted-foreground">Active Agents (24h)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <Stethoscope className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">{therapists.length}</p>
              <p className="text-xs text-muted-foreground">Verified Therapists</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <MapPin className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{totalPins}</p>
              <p className="text-xs text-muted-foreground">Total Pins</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map */}
      {loading ? (
        <div className="flex h-[600px] items-center justify-center rounded-lg border bg-muted">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <MapView centers={centers} agents={agents} therapists={therapists} />
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-blue-600" />
          <span>Physical Center</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-green-500" />
          <span>Sales Agent (live position)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-purple-600" />
          <span>Verified Therapist</span>
        </div>
      </div>
    </div>
  );
}
