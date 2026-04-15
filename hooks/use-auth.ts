
// filepath: hooks/use-auth.ts
import { useState, useEffect } from "react";

export interface User {
  id: number | string;
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  email_verified_at: string | null;
  profile_photo: string | null;
  role: { slug: string; name: string };
  all_roles: string[];
  onboarding_steps_completed: string[];
  terms_accepted_at: string | null;
  [key: string]: any;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean; // Placeholder
}

interface SessionMeResponse {
  isAuthenticated: boolean;
  user: User | null;
  role: string | null;
  allRoles: string[];
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch("/api/auth/session/me", {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });

        if (!response.ok) {
          setUser(null);
          return;
        }

        const payload = (await response.json()) as SessionMeResponse;
        setUser(payload.isAuthenticated ? payload.user : null);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadSession();
  }, []);

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.all_roles?.includes(role) || user.role?.slug === role;
  };

  const hasPermission = (permission: string): boolean => {
    // This is a placeholder. In a real application, permissions would be
    // derived from the user's roles and fetched from the backend.
    if (!user) return false;
    if (hasRole("admin")) return true; // Admins can do anything
    return user.permissions?.includes(permission) ?? false;
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    hasRole,
    hasPermission,
  };
}
