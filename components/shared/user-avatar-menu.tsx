"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, BarChart2, LogOut, LifeBuoy, Sparkles, Camera } from "lucide-react";
import { authService } from "@/lib/api/auth";
import client from "@/lib/api/client";
import Cookies from "js-cookie";

interface StoredUser {
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar?: string;
  profile_photo?: string;
  role?: { name?: string; slug?: string } | string;
}

// Map role slugs → their dashboard base path
const ROLE_BASE: Record<string, string> = {
  admin:              "/admin",
  therapist:          "/therapist",
  hr:                 "/hr",
  manager:            "/manager",
  finance:            "/finance",
  tech_team:          "/tech",
  support:            "/support",
  product_manager:    "/pm",
  sales:              "/sales",
  marketing:          "/marketing",
  clinical_advisor:   "/clinical",
  legal_advisor:      "/legal",
  ambassador:         "/ambassador",
  secretary:          "/secretary",
  compliance:         "/compliance",
  partner:            "/partner",
  ceo:                "/ceo",
  coo:                "/coo",
  cgo:                "/coo",
  closer:             "/sales",
  relationship_manager: "/sales",
  employee:           "/employee",
  // ── health personnel ──────────────────────────────────────────────────────
  health_personnel:   "/health-personnel",
};

export function UserAvatarMenu() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [roleSlug, setRoleSlug] = useState<string>("admin");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const loadUser = () => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    const slug = Cookies.get("user_role") ?? "admin";
    setRoleSlug(slug);
  };

  useEffect(() => {
    loadUser();
    window.addEventListener("profile-avatar-updated", loadUser);
    return () => window.removeEventListener("profile-avatar-updated", loadUser);
  }, []);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const form = new FormData();
      form.append("avatar", file);
      await client.put("/api/v1/account/profile", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await authService.getUser();
      window.dispatchEvent(new CustomEvent("profile-avatar-updated"));
    } finally {
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  const base = ROLE_BASE[roleSlug] ?? `/${roleSlug.replace(/_/g, "-")}`;

  const displayName =
    user?.name ||
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    "User";

  const initials =
    displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  const avatarSrc = user?.avatar || user?.profile_photo || undefined;
  const email = user?.email ?? "";

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoChange}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="rounded-full ring-2 ring-transparent hover:ring-primary/40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="User menu"
          >
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarImage src={avatarSrc} alt={displayName} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel className="pb-1">
            <p className="text-sm font-semibold leading-tight">{displayName}</p>
            {email && (
              <p className="text-xs text-muted-foreground font-normal truncate mt-0.5">
                {email}
              </p>
            )}
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => photoInputRef.current?.click()}>
            <Camera className="mr-2 h-4 w-4" />
            Change photo
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href={`${base}/settings?tab=general`}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href={`${base}/settings`}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href={`${base}/analytics`}>
              <BarChart2 className="mr-2 h-4 w-4" />
              Analytics &amp; Reports
            </Link>
          </DropdownMenuItem>

          {roleSlug === "admin" && (
            <DropdownMenuItem asChild>
              <Link href="/admin/assistant">
                <Sparkles className="mr-2 h-4 w-4" />
                AI Assistant
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem asChild>
            <Link href={`${base}/support`}>
              <LifeBuoy className="mr-2 h-4 w-4" />
              Support
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isLoggingOut ? "Signing out…" : "Sign out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
