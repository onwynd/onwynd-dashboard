"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { therapyService } from "@/lib/api/therapy";
import { therapistService } from "@/lib/api/therapist";
import { LivePreview } from "@/components/session/live-preview";
import { Whiteboard } from "@/components/session/whiteboard";
import { LiveKitRoom } from "@/components/session/livekit-room";
import {
  ShieldCheck,
  Video,
  PencilLine,
  KeyRound,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Server,
  DoorOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SessionRoomPage() {
  const params = useParams();
  const sessionId = params?.id as string;
  const [sessionUuid, setSessionUuid] = useState<string | null>(null);

  const [consent, setConsent] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<{ token: string; host: string; room: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [issuingToken, setIssuingToken] = useState(false);
  const [copied, setCopied] = useState(false);

  const recordConsent = async (checked: boolean) => {
    setConsent(checked);
    setError(null);
    try {
      await therapyService.recordConsent(sessionId, checked);
    } catch {
      setError("Failed to record consent. Please try again.");
    }
  };

  const issueToken = async () => {
    if (!consent) {
      setError("You must accept consent before joining the session.");
      return;
    }
    setError(null);
    setIssuingToken(true);
    try {
      let effectiveUuid = sessionUuid;
      if (!effectiveUuid) {
        const session = await therapistService.getSession(sessionId) as any;
        effectiveUuid = session?.uuid ?? null;
        if (effectiveUuid) {
          setSessionUuid(effectiveUuid);
        }
      }

      if (!effectiveUuid) {
        throw new Error("Missing session UUID");
      }

      const data = await therapyService.joinSessionVideo(effectiveUuid) as any;
      setTokenInfo({
        token: data.token,
        host: data.url ?? data.host,
        room: data.room_name ?? data.room,
      });
    } catch {
      setError("Failed to obtain session token. Ensure session is confirmed and access is authorized.");
    } finally {
      setIssuingToken(false);
    }
  };

  const copyToken = async () => {
    if (!tokenInfo?.token) return;
    await navigator.clipboard.writeText(tokenInfo.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 max-w-5xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Therapy Session Room</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Session ID: <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{sessionId}</span>
          </p>
        </div>
        {tokenInfo && (
          <Badge className="gap-1.5 bg-green-600 hover:bg-green-600 text-white">
            <div className="size-2 rounded-full bg-white animate-pulse" />
            Live
          </Badge>
        )}
      </div>

      {/* Consent card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
              <ShieldCheck className="size-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-base">Consent & Access</CardTitle>
              <CardDescription className="text-xs">
                Consent is required before joining the live session
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Consent checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <Checkbox
              checked={consent}
              onCheckedChange={(v) => recordConsent(Boolean(v))}
              className="mt-0.5"
            />
            <div className="space-y-1">
              <p className="text-sm font-medium group-hover:text-foreground transition-colors">
                I consent to participate in this therapy session
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                By checking this box, you agree to allow recording when enabled and understand
                that this session is confidential and protected under applicable privacy laws.
              </p>
            </div>
          </label>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 text-sm">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button
              onClick={issueToken}
              disabled={!consent || issuingToken || Boolean(tokenInfo)}
              className="gap-2"
            >
              {issuingToken ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Getting Token…
                </>
              ) : (
                <>
                  <KeyRound className="size-4" />
                  Get Session Token
                </>
              )}
            </Button>
            {tokenInfo && (
              <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                <Check className="size-4" />
                Token issued
              </span>
            )}
          </div>

          {/* Token info */}
          {tokenInfo && (
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Server className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">Host:</span>
                <code className="font-mono text-xs bg-background border rounded px-2 py-0.5">
                  {tokenInfo.host}
                </code>
              </div>
              <div className="flex items-center gap-2">
                <DoorOpen className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">Room:</span>
                <code className="font-mono text-xs bg-background border rounded px-2 py-0.5">
                  {tokenInfo.room}
                </code>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <KeyRound className="size-4" />
                    Token
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToken}
                    className="h-6 gap-1 text-xs"
                  >
                    {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <code className="block font-mono text-xs bg-background border rounded px-3 py-2 break-all leading-relaxed text-muted-foreground">
                  {tokenInfo.token}
                </code>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audio / Video Preview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
              <Video className="size-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-base">Audio / Video Preview</CardTitle>
              <CardDescription className="text-xs">
                Test your camera and microphone before joining
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <LivePreview />
        </CardContent>
      </Card>

      {/* Whiteboard */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
              <PencilLine className="size-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <CardTitle className="text-base">Shared Whiteboard</CardTitle>
              <CardDescription className="text-xs">
                Draw, annotate and collaborate during the session
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Whiteboard />
        </CardContent>
      </Card>

      {/* LiveKit Room */}
      {tokenInfo && (
        <Card className={cn("overflow-hidden")}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-green-100 dark:bg-green-950 flex items-center justify-center">
                <Video className="size-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-base">Live Session Room</CardTitle>
                <CardDescription className="text-xs">
                  Real-time video session powered by LiveKit
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <LiveKitRoom
              host={tokenInfo.host}
              token={tokenInfo.token}
              options={{
                layout: "speaker",
                toolbarPosition: "bottom",
                showMic: true,
                showCam: true,
                showScreenShare: true,
                showLeave: true,
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
