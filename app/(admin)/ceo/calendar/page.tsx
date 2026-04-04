"use client";

/**
 * CEO Calendar
 *
 * Covers: board meetings, investor calls, all-hands, demo calls,
 * company milestones, 1:1 leadership sessions, and external partnerships.
 *
 * Route: /ceo/calendar
 * Layout: (admin)/layout.tsx → AdminSidebar + AdminHeader already provided.
 */

import { RoleCalendarContent } from "@/components/shared/role-calendar-content";
import type { CalendarEventType } from "@/components/shared/role-calendar-content";

const EVENT_TYPES: CalendarEventType[] = [
  { value: "board",      label: "Board Meeting",      badge: "bg-purple-100 text-purple-800", border: "border-l-purple-600" },
  { value: "investor",   label: "Investor Call",      badge: "bg-indigo-100 text-indigo-800", border: "border-l-indigo-600" },
  { value: "allhands",   label: "All-Hands",          badge: "bg-blue-100 text-blue-800",     border: "border-l-blue-600"   },
  { value: "demo",       label: "Demo Call",          badge: "bg-red-100 text-red-800",       border: "border-l-red-600"    },
  { value: "executive",  label: "Executive 1:1",      badge: "bg-slate-100 text-slate-800",   border: "border-l-slate-600"  },
  { value: "partner",    label: "Partnership Call",   badge: "bg-cyan-100 text-cyan-800",     border: "border-l-cyan-600"   },
  { value: "press",      label: "Press / Media",      badge: "bg-rose-100 text-rose-800",     border: "border-l-rose-500"   },
  { value: "strategy",   label: "Strategy Session",   badge: "bg-amber-100 text-amber-800",   border: "border-l-amber-600"  },
  { value: "milestone",  label: "Company Milestone",  badge: "bg-green-100 text-green-800",   border: "border-l-green-600"  },
  { value: "personal",   label: "Personal Block",     badge: "bg-gray-100 text-gray-700",     border: "border-l-gray-400"   },
];

const QUICK_SUGGESTIONS = [
  "Board meeting",
  "Investor call",
  "All-hands",
  "Demo call",
  "Executive 1:1",
  "Fundraise sync",
  "Press interview",
  "Strategy offsite",
  "Product review",
  "Partnership call",
];

export default function CEOCalendarPage() {
  return (
    <RoleCalendarContent
      heading="CEO Calendar"
      subheading="Board meetings, investor calls, company milestones, and leadership sessions."
      notifBasePath="/api/v1/admin"
      eventTypes={EVENT_TYPES}
      quickSuggestions={QUICK_SUGGESTIONS}
    />
  );
}
