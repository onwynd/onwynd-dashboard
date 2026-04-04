"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Building2, UserCheck, Stethoscope, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Fix Leaflet default icon in Next.js
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const centerIcon = new L.DivIcon({
  html: `<div style="background:#1d4ed8;width:14px;height:14px;border-radius:50%;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  className: "",
});

const agentIcon = new L.DivIcon({
  html: `<div style="background:#16a34a;width:14px;height:14px;border-radius:50%;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  className: "",
});

const therapistIcon = new L.DivIcon({
  html: `<div style="background:#7c3aed;width:14px;height:14px;border-radius:50%;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  className: "",
});

export interface Center {
  uuid: string;
  name: string;
  address_line1: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  email: string;
  latitude: number;
  longitude: number;
}

export interface Agent {
  user_id: number;
  name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  location_updated_at: string;
}

export interface Therapist {
  user_id: number;
  name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  specializations: string[];
  rating: number | null;
  hourly_rate: number | null;
  currency: string | null;
}

interface MapViewProps {
  centers: Center[];
  agents: Agent[];
  therapists?: Therapist[];
  height?: number;
}

function AutoFit({ centers, agents, therapists = [] }: MapViewProps) {
  const map = useMap();

  useEffect(() => {
    const allPoints: [number, number][] = [
      ...centers.map((c) => [c.latitude, c.longitude] as [number, number]),
      ...agents.map((a) => [a.latitude, a.longitude] as [number, number]),
      ...therapists.map((t) => [t.latitude, t.longitude] as [number, number]),
    ];

    if (allPoints.length > 0) {
      map.fitBounds(L.latLngBounds(allPoints), { padding: [40, 40] });
    }
  }, [centers, agents, therapists, map]);

  return null;
}

function StarRating({ rating }: { rating: number }) {
  const clampedRating = Math.max(0, Math.min(5, rating));
  const full = Math.floor(clampedRating);
  const half = clampedRating - full >= 0.5;
  const empty = Math.max(0, 5 - full - (half ? 1 : 0));
  
  return (
    <span className="text-amber-400">
      {"★".repeat(full)}
      {half ? "½" : ""}
      {"☆".repeat(empty)}
      <span className="text-muted-foreground ml-1 text-xs">{rating.toFixed(1)}</span>
    </span>
  );
}

export default function MapView({ centers, agents, therapists = [], height = 560 }: MapViewProps) {
  const [mounted, setMounted] = useState(false);
  const defaultCenter: [number, number] = [9.082, 8.6753];

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalMarkers = centers.length + agents.length + therapists.length;

  return (
    <div className="overflow-hidden rounded-xl border shadow-sm bg-card">
      {/* Legend / summary bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b bg-muted/40">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-4" />
          <span className="font-medium text-foreground">{totalMarkers}</span> locations
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {centers.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <div className="size-3 rounded-full bg-blue-600 border-2 border-white shadow" />
              <span className="flex items-center gap-1 text-muted-foreground">
                <Building2 className="size-3" />
                Centers ({centers.length})
              </span>
            </div>
          )}
          {agents.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <div className="size-3 rounded-full bg-green-600 border-2 border-white shadow" />
              <span className="flex items-center gap-1 text-muted-foreground">
                <UserCheck className="size-3" />
                Agents ({agents.length})
              </span>
            </div>
          )}
          {therapists.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <div className="size-3 rounded-full bg-violet-600 border-2 border-white shadow" />
              <span className="flex items-center gap-1 text-muted-foreground">
                <Stethoscope className="size-3" />
                Therapists ({therapists.length})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div style={{ height }}>
        {mounted ? (
          <MapContainer
            center={defaultCenter}
            zoom={6}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {centers.map((c) => (
              <Marker key={c.uuid} position={[c.latitude, c.longitude]} icon={centerIcon}>
                <Popup maxWidth={240}>
                  <div className="space-y-1.5 py-1">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="size-4 text-blue-600 shrink-0" />
                      <p className="font-semibold text-blue-700 text-sm leading-tight">{c.name}</p>
                    </div>
                    <p className="text-xs text-gray-600">{c.address_line1}</p>
                    <p className="text-xs text-gray-600">{c.city}, {c.state}, {c.country}</p>
                    <div className="pt-1 border-t space-y-0.5">
                      {c.phone && <p className="text-xs text-gray-500">📞 {c.phone}</p>}
                      {c.email && <p className="text-xs text-gray-500 break-all">✉ {c.email}</p>}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {agents.map((a) => (
              <Marker
                key={`agent-${a.user_id}`}
                position={[a.latitude, a.longitude]}
                icon={agentIcon}
              >
                <Popup maxWidth={220}>
                  <div className="space-y-1.5 py-1">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="size-4 text-green-600 shrink-0" />
                      <p className="font-semibold text-green-700 text-sm leading-tight">{a.name}</p>
                    </div>
                    <p className="text-xs text-gray-600">{a.city}, {a.state}</p>
                    <p className="text-xs text-gray-400">
                      Last seen: {new Date(a.location_updated_at).toLocaleString()}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {therapists.map((t) => (
              <Marker
                key={`therapist-${t.user_id}`}
                position={[t.latitude, t.longitude]}
                icon={therapistIcon}
              >
                <Popup maxWidth={240}>
                  <div className="space-y-1.5 py-1">
                    <div className="flex items-center gap-1.5">
                      <Stethoscope className="size-4 text-violet-600 shrink-0" />
                      <p className="font-semibold text-violet-700 text-sm leading-tight">{t.name}</p>
                    </div>
                    <p className="text-xs text-gray-600">{t.city}, {t.state}</p>

                    {t.specializations?.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {t.specializations.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="inline-block text-[10px] bg-violet-100 text-violet-700 rounded px-1.5 py-0.5 font-medium"
                          >
                            {s}
                          </span>
                        ))}
                        {t.specializations.length > 3 && (
                          <span className="text-[10px] text-gray-400">
                            +{t.specializations.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t">
                      {t.hourly_rate != null && (
                        <p className="text-xs font-semibold text-violet-600">
                          {t.currency ?? "NGN"} {t.hourly_rate.toLocaleString()}/hr
                        </p>
                      )}
                      {t.rating != null && <StarRating rating={Number(t.rating)} />}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            <AutoFit centers={centers} agents={agents} therapists={therapists} />
          </MapContainer>
        ) : (
          <div
            className="flex flex-col items-center justify-center gap-3 text-muted-foreground"
            style={{ height }}
          >
            <MapPin className="size-10 animate-pulse opacity-40" />
            <p className="text-sm">Loading map…</p>
          </div>
        )}
      </div>
    </div>
  );
}
