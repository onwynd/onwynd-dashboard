"use client";

import { useEffect, useState } from "react";
import { AvatarUpload } from "@/components/shared/avatar-upload";
import { RoleBadge, type RoleSlug } from "@/components/shared/role-badge";
import Cookies from "js-cookie";
import { cn } from "@/lib/utils";

interface StoredUser {
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar?: string;
  profile_photo?: string;
}

interface SidebarUserBlockProps {
  /** Override the role shown; defaults to reading from the user_role cookie */
  roleOverride?: RoleSlug;
  /** Additional class on the wrapper */
  className?: string;
  /** Show the user info in collapsed (icon-only) mode */
  collapsed?: boolean;
}

export function SidebarUserBlock({ roleOverride, className }: SidebarUserBlockProps) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [roleSlug, setRoleSlug] = useState<string>("admin");

  const loadUser = () => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    const slug = roleOverride ?? Cookies.get("user_role") ?? "admin";
    setRoleSlug(slug);
  };

  useEffect(() => {
    loadUser();
    window.addEventListener("profile-avatar-updated", loadUser);
    return () => window.removeEventListener("profile-avatar-updated", loadUser);
  }, [roleOverride]); // eslint-disable-line react-hooks/exhaustive-deps

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

  return (
    <div className={cn("flex items-center gap-3 min-w-0", className)}>
      <AvatarUpload
        src={avatarSrc}
        fallback={initials}
        size="sm"
      />
      <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
        <span className="text-sm font-medium truncate leading-tight">{displayName}</span>
        <RoleBadge role={roleSlug as RoleSlug} className="mt-0.5 self-start" />
      </div>
    </div>
  );
}
