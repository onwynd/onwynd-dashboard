import { create } from "zustand";
import client from "@/lib/api/client";

interface AuditEvent {
  id: number | string;
  timestamp: string;
  user_name?: string;
  action: string;
  ip_address?: string;
  severity: "low" | "medium" | "high" | "critical";
  resource?: string;
}

interface AuditState {
  isLoading: boolean;
  error: string | null;
  eventsToday: number | null;
  flaggedEvents: number | null;
  complianceScore: number | null;
  activeViolations: number | null;
  usersAudited: number | null;
  securityEvents: number | null;
  riskLevel: "low" | "medium" | "high";
  recentEvents: AuditEvent[];
  complianceChecks: { label: string; status: "pass" | "fail" | "warn"; description?: string }[];
  fetchAll: () => Promise<void>;
}

export const useAuditStore = create<AuditState>((set) => ({
  isLoading: false,
  error: null,
  eventsToday: null,
  flaggedEvents: null,
  complianceScore: null,
  activeViolations: null,
  usersAudited: null,
  securityEvents: null,
  riskLevel: "low",
  recentEvents: [],
  complianceChecks: [],

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await client.get("/api/v1/audit/overview");
      const d = res.data?.data ?? res.data ?? {};
      set({
        eventsToday: d.events_today ?? null,
        flaggedEvents: d.flagged_events ?? null,
        complianceScore: d.compliance_score ?? null,
        activeViolations: d.active_violations ?? null,
        usersAudited: d.users_audited ?? null,
        securityEvents: d.security_events ?? null,
        riskLevel: d.risk_level ?? "low",
        recentEvents: Array.isArray(d.recent_events) ? d.recent_events : [],
        complianceChecks: Array.isArray(d.compliance_checks) ? d.compliance_checks : [],
      });
    } catch {
      set({ error: "Failed to load audit data." });
    } finally {
      set({ isLoading: false });
    }
  },
}));
