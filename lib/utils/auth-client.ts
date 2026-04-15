// filepath: lib/utils/auth-client.ts
"use client";

export function getClientUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getClientRole(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)user_role=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function hasRole(role: string): boolean {
  return getClientRole() === role;
}
