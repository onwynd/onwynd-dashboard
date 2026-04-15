import type { AuthSessionState } from "@/lib/auth/session";
import type { User } from "@/hooks/use-auth";

interface SessionSyncResponse {
  success: boolean;
  data: AuthSessionState;
}

export async function syncServerSession(token: string, user: User | null = null): Promise<AuthSessionState> {
  const response = await fetch("/api/auth/session", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ token, user }),
  });

  if (!response.ok) {
    throw new Error("Unable to synchronize session");
  }

  const payload = (await response.json()) as SessionSyncResponse;
  return payload.data;
}

export async function clearServerSession(): Promise<void> {
  await fetch("/api/auth/session", {
    method: "DELETE",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });
}
