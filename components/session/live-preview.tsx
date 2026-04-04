"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Play,
  Square,
  Circle,
  Download,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function LivePreview() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [active, setActive] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [recording, setRecording] = useState(false);
  const [recordUrl, setRecordUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, []);

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);
      setMicEnabled(true);
      setCamEnabled(true);
    } catch {
      setError("Could not access camera/microphone. Please check permissions.");
    }
  };

  const stop = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
    setRecording(false);
  };

  const toggleMic = () => {
    const tracks = streamRef.current?.getAudioTracks() ?? [];
    const next = !micEnabled;
    tracks.forEach((t) => (t.enabled = next));
    setMicEnabled(next);
  };

  const toggleCam = () => {
    const tracks = streamRef.current?.getVideoTracks() ?? [];
    const next = !camEnabled;
    tracks.forEach((t) => (t.enabled = next));
    setCamEnabled(next);
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const rec = new MediaRecorder(streamRef.current);
    recorderRef.current = rec;
    rec.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    rec.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setRecordUrl(URL.createObjectURL(blob));
      setRecording(false);
    };
    rec.start();
    setRecording(true);
  };

  const stopRecording = () => recorderRef.current?.stop();

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 text-sm">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Video preview */}
      <div className="relative rounded-xl overflow-hidden bg-zinc-900 aspect-video">
        <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />

        {!active && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-900 text-zinc-400">
            <VideoOff className="size-10 opacity-40" />
            <p className="text-sm">Preview not started</p>
          </div>
        )}

        {active && !camEnabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
            <VideoOff className="size-10 text-zinc-600" />
          </div>
        )}

        {/* Status badges */}
        <div className="absolute top-3 right-3 flex gap-2">
          {active && recording && (
            <Badge className="bg-red-600 text-white gap-1.5 animate-pulse">
              <Circle className="size-2 fill-white" />
              REC
            </Badge>
          )}
          {active && !micEnabled && (
            <Badge variant="destructive" className="gap-1">
              <MicOff className="size-3" />
              Muted
            </Badge>
          )}
        </div>

        {/* Bottom label */}
        {active && (
          <div className="absolute bottom-2 left-2">
            <span className="bg-black/60 text-white text-xs font-medium px-2 py-0.5 rounded-md backdrop-blur-sm">
              Local Preview
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {!active ? (
          <Button onClick={start} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
            <Play className="size-4" />
            Start Preview
          </Button>
        ) : (
          <Button variant="destructive" onClick={stop} className="gap-2">
            <Square className="size-4" />
            Stop
          </Button>
        )}

        <Button
          variant={micEnabled ? "secondary" : "destructive"}
          size="icon"
          onClick={toggleMic}
          disabled={!active}
          title={micEnabled ? "Mute" : "Unmute"}
          className="rounded-full size-9"
        >
          {micEnabled ? <Mic className="size-4" /> : <MicOff className="size-4" />}
        </Button>

        <Button
          variant={camEnabled ? "secondary" : "destructive"}
          size="icon"
          onClick={toggleCam}
          disabled={!active}
          title={camEnabled ? "Camera off" : "Camera on"}
          className="rounded-full size-9"
        >
          {camEnabled ? <Video className="size-4" /> : <VideoOff className="size-4" />}
        </Button>

        <div className="ml-auto">
          {active && !recording ? (
            <Button
              variant="outline"
              size="sm"
              onClick={startRecording}
              className="gap-2 border-red-300 text-red-600 hover:bg-red-50"
            >
              <Circle className="size-3 fill-red-500 text-red-500" />
              Record
            </Button>
          ) : active && recording ? (
            <Button
              variant="outline"
              size="sm"
              onClick={stopRecording}
              className="gap-2 animate-pulse"
            >
              <Square className="size-3" />
              Stop Recording
            </Button>
          ) : null}
        </div>
      </div>

      {/* Recorded video */}
      {recordUrl && (
        <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Recording Complete</p>
            <a
              href={recordUrl}
              download="session-recording.webm"
              className={cn(
                "inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg",
                "bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              )}
            >
              <Download className="size-3.5" />
              Download
            </a>
          </div>
          <video src={recordUrl} controls className="w-full rounded-lg bg-black" />
        </div>
      )}
    </div>
  );
}
