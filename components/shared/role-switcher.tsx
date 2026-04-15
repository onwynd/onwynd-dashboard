"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, SwitchCamera } from "lucide-react";
import { ROLE_LABELS, getDashboardPathForRole } from "@/lib/auth/role-routing";

export function RoleSwitcher() {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [allRoles, setAllRoles] = useState<string[]>([]);
  const [primaryRole, setPrimaryRole] = useState<string | null>(null);

  useEffect(() => {
    const role = Cookies.get('user_role');
    const allRolesRaw = Cookies.get('user_all_roles');

    if (role) {
      setPrimaryRole(role);
      setActiveRole(role);
    }

    if (allRolesRaw) {
      try {
        const parsed = JSON.parse(decodeURIComponent(allRolesRaw)) as unknown;
        setAllRoles(Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : []);
      } catch {
        setAllRoles(role ? [role] : []);
      }
    }
  }, []);

  if (allRoles.length <= 1) return null;

  const handleRoleSwitch = async (role: string) => {
    await fetch("/api/auth/session/switch-role", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ role }),
    });
    setActiveRole(role);
    router.refresh();
    const path = getDashboardPathForRole(role);
    router.push(path);
  };

  return (
    <div className="flex flex-col">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1 px-2 text-xs font-medium">
            <SwitchCamera className="h-3.5 w-3.5" />
            <span>{ROLE_LABELS[activeRole || ''] || activeRole}</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          {allRoles.map((role) => (
            <DropdownMenuItem
              key={role}
              onClick={() => handleRoleSwitch(role)}
              className={activeRole === role ? "bg-accent font-semibold" : ""}
            >
              {ROLE_LABELS[role] || role}
              {role === primaryRole && <span className="ml-auto text-[10px] uppercase opacity-50">(Primary)</span>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {activeRole !== primaryRole && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-50 border-b border-amber-200 px-4 py-1.5 flex items-center justify-between text-[11px] shadow-sm animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-amber-800 font-medium">
              Viewing as <strong>{ROLE_LABELS[activeRole || ''] || activeRole}</strong>
            </span>
          </div>
          <button 
            onClick={() => handleRoleSwitch(primaryRole || 'patient')}
            className="text-amber-700 underline hover:text-amber-900 transition-colors"
          >
            Switch back to {ROLE_LABELS[primaryRole || ''] || 'Primary Role'}
          </button>
        </div>
      )}
    </div>
  );
}
