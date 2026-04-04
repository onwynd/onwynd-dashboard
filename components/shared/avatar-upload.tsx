"use client";

/**
 * AvatarUpload
 * Drop-in replacement for <Avatar> that lets any user click to update their
 * profile picture. Uploads to PUT /api/v1/account/profile (multipart/form-data,
 * field name: "avatar"), then refreshes localStorage via authService.getUser().
 */

import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import client from "@/lib/api/client";
import { authService } from "@/lib/api/auth";

interface AvatarUploadProps {
  src?: string;
  fallback: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP = {
  sm: "h-9 w-9",
  md: "h-14 w-14",
  lg: "h-20 w-20",
};

export function AvatarUpload({ src, fallback, size = "md", className }: AvatarUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(src);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    setUploading(true);
    try {
      const form = new FormData();
      form.append("avatar", file);
      await client.put("/api/v1/account/profile", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Refresh localStorage user (fetches from /api/v1/auth/me)
      await authService.getUser();
      // Tell every SidebarUserBlock / other consumers to re-read localStorage
      window.dispatchEvent(new CustomEvent("profile-avatar-updated"));
    } catch {
      // Revert preview on failure
      setPreview(src);
    } finally {
      setUploading(false);
      // Reset input so the same file can be re-selected
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <button
      type="button"
      className={cn("relative group shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-teal", className)}
      onClick={() => fileRef.current?.click()}
      aria-label="Change profile picture"
      disabled={uploading}
    >
      <Avatar className={cn(SIZE_MAP[size], "ring-2 ring-teal/20")}>
        <AvatarImage src={preview} alt="Profile" />
        <AvatarFallback className="bg-teal/10 text-teal font-semibold text-xs">
          {fallback}
        </AvatarFallback>
      </Avatar>

      {/* Overlay */}
      <span className={cn(
        "absolute inset-0 rounded-full flex items-center justify-center transition-opacity",
        "bg-black/40 opacity-0 group-hover:opacity-100",
        uploading && "opacity-100",
      )}>
        {uploading
          ? <Loader2 className="h-4 w-4 text-white animate-spin" />
          : <Camera className="h-4 w-4 text-white" />
        }
      </span>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </button>
  );
}
