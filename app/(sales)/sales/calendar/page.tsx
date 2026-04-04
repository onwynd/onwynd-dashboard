"use client";

/**
 * Sales Calendar — role-aware for Finder / Closer / Builder
 *
 * Reads the user's role from the "user_role" cookie and adapts:
 *   finder  → outreach, discovery, intro demo, prospect meetings
 *   closer  → deal calls, contract signing, negotiation, proposal review
 *   builder → onboarding, check-ins, QBR, training, relationship reviews
 *   default → general sales calendar (all types)
 *
 * Route: /sales/calendar
 * Layout: (sales)/layout.tsx → DashboardSidebar (sales) + DashboardHeader provided.
 */

import { useMemo } from "react";
import Cookies from "js-cookie";
import { RoleCalendarContent } from "@/components/shared/role-calendar-content";
import type { CalendarEventType } from "@/components/shared/role-calendar-content";

// ── per-role configs ──────────────────────────────────────────────────────────

const FINDER_TYPES: CalendarEventType[] = [
  { value: "outreach",    label: "Outreach Call",      badge: "bg-orange-100 text-orange-800", border: "border-l-orange-500" },
  { value: "discovery",   label: "Discovery Call",     badge: "bg-blue-100 text-blue-800",     border: "border-l-blue-500"   },
  { value: "introdemo",   label: "Intro Demo",         badge: "bg-red-100 text-red-800",       border: "border-l-red-500"    },
  { value: "prospectmtg", label: "Prospect Meeting",   badge: "bg-green-100 text-green-800",   border: "border-l-green-500"  },
  { value: "followup",    label: "Follow-up Call",     badge: "bg-amber-100 text-amber-800",   border: "border-l-amber-500"  },
  { value: "linkedin",    label: "LinkedIn / Social",  badge: "bg-sky-100 text-sky-800",       border: "border-l-sky-500"    },
  { value: "research",    label: "Account Research",   badge: "bg-slate-100 text-slate-700",   border: "border-l-slate-400"  },
  { value: "collab",      label: "Team Collaboration", badge: "bg-purple-100 text-purple-800", border: "border-l-purple-500" },
];

const FINDER_SUGGESTIONS = [
  "Cold outreach call", "Discovery call", "Intro demo", "Prospect meeting",
  "Account research", "Follow-up call", "LinkedIn outreach", "Weekly pipeline sync",
];

const CLOSER_TYPES: CalendarEventType[] = [
  { value: "closingcall",  label: "Closing Call",       badge: "bg-red-100 text-red-800",       border: "border-l-red-600"    },
  { value: "negotiation",  label: "Negotiation",        badge: "bg-orange-100 text-orange-800", border: "border-l-orange-600" },
  { value: "proposal",     label: "Proposal Review",    badge: "bg-blue-100 text-blue-800",     border: "border-l-blue-600"   },
  { value: "contract",     label: "Contract Signing",   badge: "bg-green-100 text-green-800",   border: "border-l-green-600"  },
  { value: "demodepth",    label: "Deep-Dive Demo",     badge: "bg-purple-100 text-purple-800", border: "border-l-purple-600" },
  { value: "stakeholder",  label: "Stakeholder Call",   badge: "bg-indigo-100 text-indigo-800", border: "border-l-indigo-600" },
  { value: "legal",        label: "Legal / Compliance", badge: "bg-rose-100 text-rose-800",     border: "border-l-rose-600"   },
  { value: "followup",     label: "Post-Close Follow-up",badge: "bg-amber-100 text-amber-800",  border: "border-l-amber-500"  },
];

const CLOSER_SUGGESTIONS = [
  "Closing call", "Proposal review", "Contract signing", "Negotiation session",
  "Stakeholder meeting", "Deep-dive demo", "Legal review", "Post-close handoff",
];

const BUILDER_TYPES: CalendarEventType[] = [
  { value: "onboarding",   label: "Client Onboarding",     badge: "bg-green-100 text-green-800",   border: "border-l-green-600"  },
  { value: "checkin",      label: "Check-in Call",          badge: "bg-blue-100 text-blue-800",     border: "border-l-blue-600"   },
  { value: "qbr",          label: "QBR (Quarterly Review)", badge: "bg-purple-100 text-purple-800", border: "border-l-purple-600" },
  { value: "training",     label: "Training Session",       badge: "bg-orange-100 text-orange-800", border: "border-l-orange-600" },
  { value: "healthreview", label: "Account Health Review",  badge: "bg-amber-100 text-amber-800",   border: "border-l-amber-600"  },
  { value: "expansion",    label: "Expansion Discussion",   badge: "bg-indigo-100 text-indigo-800", border: "border-l-indigo-600" },
  { value: "escalation",   label: "Escalation Call",        badge: "bg-red-100 text-red-800",       border: "border-l-red-500"    },
  { value: "intro",        label: "Intro / Kick-off",       badge: "bg-cyan-100 text-cyan-800",     border: "border-l-cyan-500"   },
  { value: "renewal",      label: "Renewal Discussion",     badge: "bg-rose-100 text-rose-800",     border: "border-l-rose-500"   },
  { value: "internal",     label: "Internal Sync",          badge: "bg-slate-100 text-slate-700",   border: "border-l-slate-400"  },
];

const BUILDER_SUGGESTIONS = [
  "Client onboarding", "Monthly check-in", "QBR", "Training session",
  "Account health review", "Expansion call", "Renewal discussion",
  "Escalation call", "Kick-off meeting",
];

const DEFAULT_TYPES: CalendarEventType[] = [
  { value: "meeting",   label: "Client Meeting",    badge: "bg-blue-100 text-blue-800",   border: "border-l-blue-500"   },
  { value: "call",      label: "Sales Call",        badge: "bg-green-100 text-green-800", border: "border-l-green-500"  },
  { value: "demo",      label: "Demo",              badge: "bg-red-100 text-red-800",     border: "border-l-red-500"    },
  { value: "internal",  label: "Internal",          badge: "bg-gray-100 text-gray-700",   border: "border-l-gray-400"   },
];

const DEFAULT_SUGGESTIONS = ["Sales call", "Client meeting", "Demo", "Pipeline review"];

// ── config map ────────────────────────────────────────────────────────────────

interface RoleConfig {
  heading: string;
  subheading: string;
  eventTypes: CalendarEventType[];
  quickSuggestions: string[];
}

const ROLE_CONFIGS: Record<string, RoleConfig> = {
  finder: {
    heading: "Finder Calendar",
    subheading: "Outreach calls, discovery sessions, prospect meetings, and follow-ups.",
    eventTypes: FINDER_TYPES,
    quickSuggestions: FINDER_SUGGESTIONS,
  },
  closer: {
    heading: "Closer Calendar",
    subheading: "Closing calls, contract signings, negotiations, and proposal reviews.",
    eventTypes: CLOSER_TYPES,
    quickSuggestions: CLOSER_SUGGESTIONS,
  },
  builder: {
    heading: "Builder Calendar",
    subheading: "Client onboarding, check-ins, QBRs, and relationship management.",
    eventTypes: BUILDER_TYPES,
    quickSuggestions: BUILDER_SUGGESTIONS,
  },
};

// ── page ─────────────────────────────────────────────────────────────────────

export default function SalesCalendarPage() {
  const role = Cookies.get("user_role") ?? "sales";
  const config = useMemo<RoleConfig>(
    () => ROLE_CONFIGS[role] ?? {
      heading: "Sales Calendar",
      subheading: "Client meetings, calls, demos, and deal milestones.",
      eventTypes: DEFAULT_TYPES,
      quickSuggestions: DEFAULT_SUGGESTIONS,
    },
    [role]
  );

  return (
    <RoleCalendarContent
      heading={config.heading}
      subheading={config.subheading}
      notifBasePath="/api/v1/sales"
      eventTypes={config.eventTypes}
      quickSuggestions={config.quickSuggestions}
    />
  );
}
