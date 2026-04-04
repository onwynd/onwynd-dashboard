"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Room,
  RoomEvent,
  Track,
  createLocalAudioTrack,
  createLocalVideoTrack,
} from "livekit-client";
import type { LocalAudioTrack, LocalVideoTrack } from "livekit-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  MonitorX,
  PhoneOff,
  Phone,
  Loader2,
  Users,
  AlertCircle,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type UIOptions = {
  layout?: "grid" | "speaker";
  toolbarPosition?: "top" | "bottom";
  showMic?: boolean;
  showCam?: boolean;
  showScreenShare?: boolean;
  showLeave?: boolean;
  themeClass?: string;
};

interface LiveKitRoomProps {
  host: string;
  token: string;
  options?: UIOptions;
}

interface Participant {
  id: string;
  name: string;
}

export function LiveKitRoom({ host, token, options }: LiveKitRoomProps) {
  const roomRef = useRef<Room | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const participantVideoElsRef = useRef<Map<string, HTMLElement[]>>(new Map());

  const [joined, setJoined] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [screenEnabled, setScreenEnabled] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activeSpeakerIds, setActiveSpeakerIds] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      roomRef.current?.disconnect();
    };
  }, []);

  const join = useCallback(async () => {
    if (joined) return;
    setStatus("connecting");
    setError(null);

    const room = new Room();
    try {
      await room.connect(host, token);
    } catch {
      setStatus("error");
      setError("Failed to connect. Please check your token and try again.");
      return;
    }
    roomRef.current = room;

    let audioTrack: LocalAudioTrack | null = null;
    let videoTrack: LocalVideoTrack | null = null;

    try {
      audioTrack = await createLocalAudioTrack();
      await room.localParticipant.publishTrack(audioTrack);
    } catch {
      setMicEnabled(false);
    }

    try {
      videoTrack = await createLocalVideoTrack();
      await room.localParticipant.publishTrack(videoTrack);
    } catch {
      setCamEnabled(false);
    }

    if (localVideoRef.current && videoTrack) {
      videoTrack.attach(localVideoRef.current);
    }

    room.on(RoomEvent.TrackSubscribed, (track, _pub, participant) => {
      if (!containerRef.current) return;

      if (track.kind === Track.Kind.Video) {
        const el = document.createElement("video");
        el.autoplay = true;
        el.playsInline = true;
        el.setAttribute("data-participant-id", participant.identity);
        el.className =
          "w-full h-full object-cover rounded-xl bg-zinc-900";
        track.attach(el);

        const wrapper = document.createElement("div");
        wrapper.className =
          "relative rounded-xl overflow-hidden bg-zinc-900 aspect-video";
        wrapper.setAttribute("data-wrapper-id", participant.identity);

        const label = document.createElement("div");
        label.className =
          "absolute bottom-2 left-2 bg-black/60 text-white text-xs font-medium px-2 py-0.5 rounded-md backdrop-blur-sm";
        label.textContent = participant.name ?? participant.identity;

        wrapper.appendChild(el);
        wrapper.appendChild(label);
        containerRef.current.appendChild(wrapper);

        const arr = participantVideoElsRef.current.get(participant.identity) ?? [];
        participantVideoElsRef.current.set(participant.identity, [...arr, wrapper]);
      } else if (track.kind === Track.Kind.Audio) {
        const el = document.createElement("audio");
        el.autoplay = true;
        track.attach(el);
        document.body.appendChild(el);
        const arr = participantVideoElsRef.current.get(participant.identity) ?? [];
        participantVideoElsRef.current.set(participant.identity, [...arr, el]);
      }
    });

    room.on(RoomEvent.TrackUnsubscribed, (track, _pub, participant) => {
      const arr = participantVideoElsRef.current.get(participant.identity) ?? [];
      for (const el of arr) {
        if (el.tagName.toLowerCase() === "div") {
          const vid = el.querySelector("video");
          if (vid) track.detach(vid as HTMLVideoElement);
          el.remove();
        } else if (el.tagName.toLowerCase() === "audio") {
          track.detach(el as HTMLAudioElement);
          el.remove();
        }
      }
      participantVideoElsRef.current.set(participant.identity, []);
    });

    room.on(RoomEvent.ParticipantConnected, (p) => {
      setParticipants((prev) => {
        if (prev.find((x) => x.id === p.identity)) return prev;
        return [...prev, { id: p.identity, name: p.name ?? p.identity }];
      });
    });

    room.on(RoomEvent.ParticipantDisconnected, (p) => {
      setParticipants((prev) => prev.filter((x) => x.id !== p.identity));
      const arr = participantVideoElsRef.current.get(p.identity) ?? [];
      for (const el of arr) el.remove();
      participantVideoElsRef.current.delete(p.identity);
    });

    room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
      const ids = speakers.map((s) => s.identity);
      setActiveSpeakerIds(ids);

      if (options?.layout === "speaker" && containerRef.current && ids[0]) {
        const wrappers = participantVideoElsRef.current.get(ids[0]) ?? [];
        for (const el of wrappers) {
          if (el.parentElement === containerRef.current) {
            containerRef.current.insertBefore(el, containerRef.current.firstChild);
          }
        }
      }
    });

    setJoined(true);
    setStatus("connected");
  }, [host, token, joined, options?.layout]);

  const leave = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    room.disconnect();
    roomRef.current = null;
    setJoined(false);
    setParticipants([]);
    setActiveSpeakerIds([]);
    setStatus("idle");
    if (containerRef.current) containerRef.current.innerHTML = "";
    participantVideoElsRef.current.clear();
  }, []);

  const toggleMic = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;
    const next = !micEnabled;
    room.localParticipant.setMicrophoneEnabled(next);
    setMicEnabled(next);
  }, [micEnabled]);

  const toggleCam = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;
    const next = !camEnabled;
    room.localParticipant.setCameraEnabled(next);
    setCamEnabled(next);
  }, [camEnabled]);

  const toggleScreen = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;
    const next = !screenEnabled;
    room.localParticipant.setScreenShareEnabled(next);
    setScreenEnabled(next);
  }, [screenEnabled]);

  const gridClass =
    options?.layout === "speaker"
      ? "grid grid-cols-1 gap-3"
      : "grid grid-cols-1 sm:grid-cols-2 gap-3";

  const toolbar = (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      {!joined ? (
        <Button
          onClick={join}
          disabled={status === "connecting"}
          className="bg-green-600 hover:bg-green-700 text-white gap-2 px-6"
        >
          {status === "connecting" ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Connecting…
            </>
          ) : (
            <>
              <Phone className="size-4" />
              Join Session
            </>
          )}
        </Button>
      ) : (
        <>
          {options?.showMic !== false && (
            <Button
              variant={micEnabled ? "secondary" : "destructive"}
              size="icon"
              onClick={toggleMic}
              title={micEnabled ? "Mute microphone" : "Unmute microphone"}
              className="rounded-full size-11"
            >
              {micEnabled ? <Mic className="size-5" /> : <MicOff className="size-5" />}
            </Button>
          )}
          {options?.showCam !== false && (
            <Button
              variant={camEnabled ? "secondary" : "destructive"}
              size="icon"
              onClick={toggleCam}
              title={camEnabled ? "Turn off camera" : "Turn on camera"}
              className="rounded-full size-11"
            >
              {camEnabled ? <Video className="size-5" /> : <VideoOff className="size-5" />}
            </Button>
          )}
          {options?.showScreenShare && (
            <Button
              variant={screenEnabled ? "default" : "secondary"}
              size="icon"
              onClick={toggleScreen}
              title={screenEnabled ? "Stop sharing" : "Share screen"}
              className="rounded-full size-11"
            >
              {screenEnabled ? <MonitorX className="size-5" /> : <MonitorUp className="size-5" />}
            </Button>
          )}
          {options?.showLeave !== false && (
            <Button
              variant="destructive"
              onClick={leave}
              className="rounded-full gap-2 px-5"
            >
              <PhoneOff className="size-4" />
              Leave
            </Button>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className={cn("flex flex-col gap-4", options?.themeClass)}>
      {/* Status bar */}
      {status !== "idle" && (
        <div className="flex items-center gap-2">
          <div
            className={cn("size-2 rounded-full", {
              "bg-yellow-400 animate-pulse": status === "connecting",
              "bg-green-500": status === "connected",
              "bg-red-500": status === "error",
            })}
          />
          <span className="text-xs text-muted-foreground capitalize">{status}</span>
          {status === "connected" && participants.length > 0 && (
            <Badge variant="secondary" className="ml-auto gap-1 text-xs">
              <Users className="size-3" />
              {participants.length} participant{participants.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 text-sm">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {options?.toolbarPosition !== "bottom" && toolbar}

      {/* Local preview */}
      <div className="relative rounded-xl overflow-hidden bg-zinc-900 aspect-video">
        <video
          ref={localVideoRef}
          className="w-full h-full object-cover"
          muted
          playsInline
        />
        {!camEnabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
            <VideoOff className="size-10 text-zinc-600" />
          </div>
        )}
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
          <span className="bg-black/60 text-white text-xs font-medium px-2 py-0.5 rounded-md backdrop-blur-sm">
            You (local)
          </span>
          {!micEnabled && (
            <span className="bg-red-600/90 text-white rounded-full p-1">
              <MicOff className="size-3" />
            </span>
          )}
        </div>
      </div>

      {/* Remote participants grid */}
      {joined && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users className="size-4 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">
              Remote Participants
            </p>
          </div>

          {participants.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-muted/30 flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
              <Users className="size-8 opacity-40" />
              <p className="text-sm">Waiting for others to join…</p>
            </div>
          ) : (
            <>
              {/* Active speakers indicator */}
              {activeSpeakerIds.length > 0 && (
                <div className="flex items-center gap-1.5 mb-2">
                  <Volume2 className="size-3.5 text-green-500 animate-pulse" />
                  <span className="text-xs text-green-600 font-medium">
                    {participants.find((p) => p.id === activeSpeakerIds[0])?.name ?? "Someone"} is speaking
                  </span>
                </div>
              )}
              {/* Participant list */}
              <ul className="flex flex-wrap gap-2 mb-3">
                {participants.map((p) => (
                  <li key={p.id}>
                    <Badge
                      variant={activeSpeakerIds.includes(p.id) ? "default" : "secondary"}
                      className={cn(
                        "gap-1 transition-all",
                        activeSpeakerIds.includes(p.id) && "ring-2 ring-green-400 ring-offset-1"
                      )}
                    >
                      {activeSpeakerIds.includes(p.id) && (
                        <Volume2 className="size-3 text-green-400" />
                      )}
                      {p.name}
                    </Badge>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Video tiles will be appended here by the track subscription handler */}
          <div ref={containerRef} className={gridClass} />
        </div>
      )}

      {options?.toolbarPosition === "bottom" && (
        <div className="pt-2 border-t">{toolbar}</div>
      )}
    </div>
  );
}
