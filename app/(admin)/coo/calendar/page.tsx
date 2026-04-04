"use client";

/**
 * COO / CGO Calendar
 *
 * Covers: operations syncs, vendor calls, team reviews, process planning,
 * marketing cadence, support escalations, and cross-functional sessions.
 *
 * Route: /coo/calendar
 * Layout: (admin)/coo/layout.tsx → COOSidebar + DashboardHeader already provided.
 */

import { RoleCalendarContent } from "@/components/shared/role-calendar-content";
import type { CalendarEventType } from "@/components/shared/role-calendar-content";

const EVENT_TYPES: CalendarEventType[] = [
  { value: "opssync",   label: "Ops Sync",             badge: "bg-blue-100 text-blue-800",   border: "border-l-blue-600"   },
  { value: "teamreview",label: "Team Review",           badge: "bg-purple-100 text-purple-800",border: "border-l-purple-600"},
  { value: "vendor",    label: "Vendor / Partner Call", badge: "bg-orange-100 text-orange-800",border: "border-l-orange-600"},
  { value: "planning",  label: "Planning Session",      badge: "bg-amber-100 text-amber-800", border: "border-l-amber-600"  },
  { value: "crossfunc", label: "Cross-Functional Sync", badge: "bg-cyan-100 text-cyan-800",   border: "border-l-cyan-600"   },
  { value: "support",   label: "Support Escalation",    badge: "bg-rose-100 text-rose-800",   border: "border-l-rose-500"   },
  { value: "marketing", label: "Marketing Cadence",     badge: "bg-green-100 text-green-800", border: "border-l-green-600"  },
  { value: "process",   label: "Process Review",        badge: "bg-slate-100 text-slate-800", border: "border-l-slate-500"  },
  { value: "kpi",       label: "KPI Review",            badge: "bg-indigo-100 text-indigo-800",border: "border-l-indigo-600"},
  { value: "personal",  label: "Personal Block",        badge: "bg-gray-100 text-gray-700",   border: "border-l-gray-400"   },
];

const QUICK_SUGGESTIONS = [
  "Ops sync",
  "Weekly team review",
  "Vendor call",
  "Sprint planning",
  "Marketing cadence",
  "Support escalation review",
  "Cross-functional sync",
  "KPI review",
  "Process improvement session",
];

export default function COOCalendarPage() {
  return (
    <RoleCalendarContent
      heading="Operations Calendar"
      subheading="Team reviews, vendor calls, ops syncs, and cross-functional planning."
      notifBasePath="/api/v1/admin"
      eventTypes={EVENT_TYPES}
      quickSuggestions={QUICK_SUGGESTIONS}
    />
  );
}
