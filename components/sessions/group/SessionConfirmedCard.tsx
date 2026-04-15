"use client";

import Link from "next/link";
import { CalendarPlus, Share2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSessionMode } from "@/lib/constants/groupSessionModes";
import type { GroupSession } from "@/types/groupSession";
import { InviteSharePanel } from "./InviteSharePanel";
import { useState } from "react";

interface SessionConfirmedCardProps {
  session: GroupSession;
  therapistName: string;
}

function generateIcs(session: GroupSession, therapistName: string): string {
  const start = new Date(session.scheduled_at);
  const end = new Date(
    start.getTime() + (session.duration_minutes ?? 60) * 60 * 1000
  );
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Onwynd//Group Session//EN",
    "BEGIN:VEVENT",
    `UID:group-${session.uuid}@onwynd.com`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${session.title}`,
    `DESCRIPTION:Group session with ${therapistName} on Onwynd.`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function downloadIcs(session: GroupSession, therapistName: string) {
  const ics = generateIcs(session, therapistName);
  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `onwynd-session-${session.uuid}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

export function SessionConfirmedCard({
  session,
  therapistName,
}: SessionConfirmedCardProps) {
  const [showShare, setShowShare] = useState(false);

  const modeId =
    (session.mode as string) ??
    (session.session_type === "couple" ? "couples" : session.session_type);
  const modeConfig = getSessionMode(
    modeId as Parameters<typeof getSessionMode>[0]
  );

  const scheduledDate = new Date(session.scheduled_at).toLocaleDateString(
    "en-US",
    { weekday: "long", month: "long", day: "numeric", year: "numeric" }
  );
  const scheduledTime = new Date(session.scheduled_at).toLocaleTimeString(
    "en-US",
    { hour: "numeric", minute: "2-digit" }
  );

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Celebration header */}
      <div
        className="px-6 py-6 text-center"
        style={{ background: "linear-gradient(135deg, var(--teal-light), var(--amber-light))" }}
      >
        <div className="text-4xl mb-2">{modeConfig.icon}</div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
          {modeConfig.label} · Confirmed
        </p>
        <h2 className="text-xl font-bold text-foreground">{session.title}</h2>
      </div>

      {/* Details */}
      <div className="px-6 py-5 space-y-3 border-b border-border">
        <Detail label="Therapist" value={therapistName} />
        <Detail label="Date" value={`${scheduledDate} at ${scheduledTime}`} />
        <Detail
          label="Mode"
          value={`${modeConfig.label} · ${session.current_participants}/${session.max_participants} participants`}
        />
      </div>

      {/* Actions */}
      <div className="px-6 py-5 flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => downloadIcs(session, therapistName)}
          className="flex items-center gap-2"
        >
          <CalendarPlus size={14} />
          Add to Calendar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowShare((v) => !v)}
          className="flex items-center gap-2"
        >
          <Share2 size={14} />
          {showShare ? "Hide share" : "Share with participants"}
        </Button>
        <Link href={`/sessions/group/${session.uuid}`}>
          <Button
            size="sm"
            className="flex items-center gap-2 w-full"
            style={{ backgroundColor: "var(--teal)", color: "#fff" }}
          >
            <Eye size={14} />
            View Session
          </Button>
        </Link>
      </div>

      {/* Inline share panel */}
      {showShare && session.invite_link && (
        <div className="px-6 pb-6">
          <InviteSharePanel
            inviteLink={session.invite_link}
            paid
            mode={modeConfig.id}
            joined={session.current_participants}
            total={session.max_participants}
          />
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs font-semibold text-muted-foreground w-20 flex-shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}
