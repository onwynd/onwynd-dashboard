import { create } from "zustand";
import client from "@/lib/api/client";

interface DepartmentHealth {
  department: string;
  status: "healthy" | "warning" | "critical";
  metric?: string;
  value?: string | number;
}

interface PresidentState {
  isLoading: boolean;
  error: string | null;
  totalRevenue: number | null;
  activeUsers: number | null;
  sessionsThisMonth: number | null;
  companyOkrHealth: string | null;
  openAlerts: number | null;
  employeeCount: number | null;
  departmentHealth: DepartmentHealth[];
  recentAlerts: { id: string | number; message: string; priority: "high" | "medium" | "low"; created_at: string }[];
  fetchAll: () => Promise<void>;
}

export const usePresidentStore = create<PresidentState>((set) => ({
  isLoading: false,
  error: null,
  totalRevenue: null,
  activeUsers: null,
  sessionsThisMonth: null,
  companyOkrHealth: null,
  openAlerts: null,
  employeeCount: null,
  departmentHealth: [],
  recentAlerts: [],

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await client.get("/api/v1/president/overview");
      const d = res.data?.data ?? res.data ?? {};
      set({
        totalRevenue: d.total_revenue ?? null,
        activeUsers: d.active_users ?? null,
        sessionsThisMonth: d.sessions_this_month ?? null,
        companyOkrHealth: d.company_okr_health ?? null,
        openAlerts: d.open_alerts ?? null,
        employeeCount: d.employee_count ?? null,
        departmentHealth: Array.isArray(d.department_health) ? d.department_health : [],
        recentAlerts: Array.isArray(d.recent_alerts) ? d.recent_alerts : [],
      });
    } catch {
      set({ error: "Failed to load overview data." });
    } finally {
      set({ isLoading: false });
    }
  },
}));
