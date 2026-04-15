"use client";

import { useState } from "react";
import { Copy, Check, Mail, MessageCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SessionModeId } from "@/lib/constants/groupSessionModes";

interface InviteSharePanelProps {
  inviteLink: string;
  paid: boolean;
  mode: SessionModeId;
  joined: number;
  total: number;
}

const MODE_SUBJECT: Record<SessionModeId, string> = {
  couples: "You've been invited to a couples therapy session",
  family: "Join our family therapy session",
  friends: "You're invited to a group therapy session",
  corporate: "Corporate wellness session invitation",
  university: "Student mental health session invitation",
};

const MODE_BODY: Record<SessionModeId, string> = {
  couples:
    "I've booked a couples therapy session for us on Onwynd. Please join via this link:",
  family:
    "I've booked a family therapy session on Onwynd. Please join via this link:",
  friends:
    "I've booked a group therapy session on Onwynd for our group. Join here:",
  corporate:
    "You're invited to a corporate wellness group session on Onwynd. Join here:",
  university:
    "You're invited to a student group session on Onwynd. Join here:",
};

export function InviteSharePanel({
  inviteLink,
  paid,
  mode,
  joined,
  total,
}: InviteSharePanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
    } catch {
      const el = document.createElement("input");
      el.value = inviteLink;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const subject = encodeURIComponent(MODE_SUBJECT[mode]);
  const body = encodeURIComponent(`${MODE_BODY[mode]}\n\n${inviteLink}`);
  const whatsappText = encodeURIComponent(`${MODE_BODY[mode]}\n\n${inviteLink}`);

  if (!paid) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-6 text-center">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
          <Lock size={18} className="text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">
          Complete payment to generate your invite link
        </p>
        <p className="text-xs text-muted-foreground">
          Your shareable link will appear here once payment is confirmed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-foreground mb-1">
          Share your invite link
        </p>
        <p className="text-xs text-muted-foreground">
          {joined} of {total} participants have joined
        </p>
      </div>

      {/* Link row */}
      <div className="flex gap-2">
        <Input
          readOnly
          value={inviteLink}
          className="text-xs font-mono bg-muted/50 select-all"
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleCopy}
          className="flex-shrink-0"
        >
          {copied ? (
            <Check size={15} style={{ color: "var(--teal)" }} />
          ) : (
            <Copy size={15} />
          )}
        </Button>
      </div>

      {/* Share buttons */}
      <div className="flex flex-wrap gap-2">
        <a
          href={`https://wa.me/?text=${whatsappText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
        >
          <MessageCircle size={15} style={{ color: "#25D366" }} />
          WhatsApp
        </a>
        <a
          href={`mailto:?subject=${subject}&body=${body}`}
          className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
        >
          <Mail size={15} className="text-muted-foreground" />
          Email
        </a>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="flex items-center gap-2"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied!" : "Copy link"}
        </Button>
      </div>
    </div>
  );
}
