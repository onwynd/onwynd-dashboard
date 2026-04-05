"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleCalendarContent } from "@/components/shared/role-calendar-content";
import { SessionsOverviewPanel } from "@/components/shared/sessions-overview-panel";
import type { CalendarEventType } from "@/components/shared/role-calendar-content";
import { CalendarDays, Activity } from "lucide-react";

const EVENT_TYPES: CalendarEventType[] = [
  { value: "session",    label: "Session",          badge: "bg-teal-100 text-teal-700",    border: "border-l-teal-500"    },
  { value: "review",     label: "Clinical Review",  badge: "bg-purple-100 text-purple-700", border: "border-l-purple-500" },
  { value: "supervision",label: "Supervision",      badge: "bg-blue-100 text-blue-700",    border: "border-l-blue-500"    },
  { value: "crisis",     label: "Crisis Call",      badge: "bg-red-100 text-red-700",      border: "border-l-red-500"     },
  { value: "meeting",    label: "Team Meeting",     badge: "bg-amber-100 text-amber-700",  border: "border-l-amber-500"   },
];

const QUICK_SUGGESTIONS = [
  "Clinical supervision", "Case review", "Crisis debrief",
  "Team standup", "Therapist check-in",
];

export default function ClinicalCalendarPage() {
  return (
    <Tabs defaultValue="my-calendar" className="w-full flex flex-col">
      {/* Tab bar — floats at the top of the content area */}
      <div className="px-4 sm:px-6 pt-4 border-b">
        <TabsList>
          <TabsTrigger value="my-calendar" className="gap-1.5">
            <CalendarDays className="h-4 w-4" />
            My Calendar
          </TabsTrigger>
          <TabsTrigger value="sessions" className="gap-1.5">
            <Activity className="h-4 w-4" />
            Sessions Overview
          </TabsTrigger>
        </TabsList>
      </div>

      {/* My Calendar — RoleCalendarContent owns its own heading */}
      <TabsContent value="my-calendar" className="mt-0 flex-1">
        <RoleCalendarContent
          heading="Clinical Calendar"
          subheading="Your reviews, supervision sessions, and personal appointments."
          notifBasePath="/api/v1"
          eventTypes={EVENT_TYPES}
          quickSuggestions={QUICK_SUGGESTIONS}
        />
      </TabsContent>

      {/* Sessions Overview */}
      <TabsContent value="sessions" className="mt-0 p-4 sm:p-6">
        <div className="mb-5">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="h-6 w-6 text-teal" />
            Sessions Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            All therapy sessions across the platform — live, scheduled, and completed.
          </p>
        </div>
        <SessionsOverviewPanel />
      </TabsContent>
    </Tabs>
  );
}
