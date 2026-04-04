"use client";

/**
 * TherapistHeartbeat
 *
 * Keeps the therapist's is_online flag alive on the backend while the
 * dashboard is open. Fires POST /api/v1/me/heartbeat every 90 seconds.
 * On beforeunload (tab close / navigation away) it immediately dispatches
 * the logout heartbeat so the therapist is marked offline without waiting
 * for the 5-minute mark-offline cron.
 *
 * Renders nothing — purely a side-effect component.
 */

import { useEffect, useRef } from "react";
import client from "@/lib/api/client";

const HEARTBEAT_INTERVAL_MS = 90_000; // 90 seconds

async function pingHeartbeat(): Promise<void> {
  try {
    await client.post("/api/v1/me/heartbeat");
  } catch {
    // Silently swallow — heartbeat is best-effort.
    // The mark-offline cron will catch it within 5 minutes if this fails.
  }
}

async function goOffline(): Promise<void> {
  try {
    await client.post("/api/v1/therapist/status/offline");
  } catch {
    // Best-effort — heartbeat timeout will mark offline anyway
  }
}

export function TherapistHeartbeat() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Fire immediately on mount so the therapist is online the moment they
    // open any dashboard page — no 90-second delay on first load.
    pingHeartbeat();

    intervalRef.current = setInterval(pingHeartbeat, HEARTBEAT_INTERVAL_MS);

    const handleUnload = () => {
      goOffline();
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  return null;
}
