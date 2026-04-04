import { create } from "zustand";
import { secretaryService, SecretaryStats, CalendarEvent, Patient, Visitor } from "@/lib/api/secretary";

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  due_date: string | null;
}

export interface Person {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar: string | null;
  first_name?: string;
  last_name?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  url: string;
  icon?: string;
  author?: string;
  authorAvatar?: string | null;
  uploadedAt?: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

interface SecretaryState {
  stats: SecretaryStats | null;
  calendarEvents: CalendarEvent[];
  isLoading: boolean;
  tasks: Task[];
  people: Person[];
  visitors: Visitor[];
  patients: Patient[];
  documents: Document[];
  chartData: ChartDataPoint[];
  layoutDensity: "compact" | "default" | "comfortable" | "spacious";
  showAlertBanner: boolean;
  showStatsCards: boolean;
  showCalendar: boolean;
  showTasks: boolean;

  setLayoutDensity: (density: "compact" | "default" | "comfortable" | "spacious") => void;
  setShowCalendar: (show: boolean) => void;
  setShowTasks: (show: boolean) => void;

  fetchStats: () => Promise<void>;
  fetchCalendarEvents: (params?: Record<string, unknown>) => Promise<void>;
  fetchTasks: (params?: Record<string, unknown>) => Promise<void>;
  fetchPeople: (params?: Record<string, unknown>) => Promise<void>;
  fetchVisitors: (params?: Record<string, unknown>) => Promise<void>;
  fetchPatients: (params?: Record<string, unknown>) => Promise<void>;
  fetchChartData: (period?: string) => Promise<void>;
  fetchDocuments: (params?: Record<string, unknown>) => Promise<void>;
}

export const useSecretaryStore = create<SecretaryState>((set) => ({
  stats: null,
  calendarEvents: [],
  isLoading: false,
  tasks: [],
  people: [],
  visitors: [],
  patients: [],
  documents: [],
  chartData: [],
  layoutDensity: "default",
  showAlertBanner: true,
  showStatsCards: true,
  showCalendar: true,
  showTasks: true,

  setLayoutDensity: (density) => set({ layoutDensity: density }),
  setShowCalendar: (show) => set({ showCalendar: show }),
  setShowTasks: (show) => set({ showTasks: show }),

  fetchStats: async () => {
    try {
      const response = await secretaryService.getStats();
      const data = response.data || response;
      set({ stats: data.data || data || null });
    } catch (error) {
      console.error("Failed to fetch secretary stats:", error);
    }
  },

  fetchCalendarEvents: async (params) => {
    try {
      // Ensure start_date and end_date are strings if passed
      const apiParams = {
          ...params,
          start_date: params?.start_date as string,
          end_date: params?.end_date as string
      };
      const response = await secretaryService.getCalendarEvents(apiParams);
      const res = response.data || response;
      set({ calendarEvents: Array.isArray(res.data) ? res.data : (res || []) });
    } catch (error) {
      console.error("Failed to fetch secretary calendar events:", error);
    }
  },

  fetchTasks: async (params) => {
    try {
      const response = await secretaryService.getTasks(params);
      const res = response.data || response;
      const raw = Array.isArray(res.data) ? res.data : res || [];
      const items = Array.isArray(raw) ? raw.map((t: unknown) => {
        const obj = t as Record<string, unknown>;
        const statusRaw = obj?.status as string | undefined;
        const priorityRaw = obj?.priority as string | undefined;
        const status: Task["status"] =
          statusRaw === "todo" || statusRaw === "in_progress" || statusRaw === "review" || statusRaw === "done"
            ? statusRaw
            : "todo";
        const priority: Task["priority"] =
          priorityRaw === "low" || priorityRaw === "medium" || priorityRaw === "high" || priorityRaw === "urgent"
            ? priorityRaw
            : "medium";
        return {
          id: typeof obj?.id === "string" ? Number(obj.id) : ((obj?.id as number | undefined) ?? 0),
          title: (obj?.title as string | undefined) ?? "",
          description: (obj?.description as string | null | undefined) ?? null,
          status,
          priority,
          due_date: (obj?.due_date as string | null | undefined) ?? null,
        } as Task;
      }) : [];
      set({ tasks: items });
    } catch (error) {
      console.error("Failed to fetch secretary tasks:", error);
    }
  },

  fetchPeople: async (params) => {
    try {
      const response = await secretaryService.getPeople(params);
      const res = response.data || response;
      const raw = Array.isArray(res.data) ? res.data : res || [];
      const items = Array.isArray(raw) ? raw.map((p: unknown) => {
        const obj = p as Record<string, unknown>;
        const firstName = obj?.first_name as string | undefined;
        const lastName = obj?.last_name as string | undefined;
        const fullName = (obj?.name as string | undefined) ?? [firstName, lastName].filter(Boolean).join(" ") ?? "";
        return {
          id: typeof obj?.id === "string" ? Number(obj.id) : ((obj?.id as number | undefined) ?? 0),
          name: fullName,
          email: (obj?.email as string | undefined) ?? "",
          role: (obj?.role as string | undefined) ?? "",
          status: (obj?.status as string | undefined) ?? "",
          avatar: (obj?.avatar as string | null | undefined) ?? null,
          first_name: firstName,
          last_name: lastName,
        } as Person;
      }) : [];
      set({ people: items });
    } catch (error) {
      console.error("Failed to fetch secretary people:", error);
    }
  },

  fetchVisitors: async (params) => {
    try {
      const response = await secretaryService.getVisitors(params);
      const res = response.data || response;
      const visitorsData = res.data?.data || res.data || [];
      set({ visitors: Array.isArray(visitorsData) ? visitorsData : [] });
    } catch (error) {
      console.error("Failed to fetch secretary visitors:", error);
    }
  },

  fetchPatients: async (params) => {
    try {
      const response = await secretaryService.getPatients(params);
      const res = response.data || response;
      const patientsData = res.data?.data || res.data || [];
      set({ patients: Array.isArray(patientsData) ? patientsData : [] });
    } catch (error) {
      console.error("Failed to fetch secretary patients:", error);
    }
  },

  fetchChartData: async (period) => {
    try {
      const response = await secretaryService.getChartData(period);
      const res = response.data || response;
      const raw = Array.isArray(res.data) ? res.data : res || [];
      const points = Array.isArray(raw) ? raw.map((c: unknown) => {
        const obj = c as Record<string, unknown>;
        const name = (obj?.name as string | undefined) ?? "";
        const value = typeof obj?.value === "number" ? (obj.value as number) : Number((obj?.value as unknown) ?? (obj?.count as unknown) ?? 0);
        return { name, value } as ChartDataPoint;
      }) : [];
      set({ chartData: points });
    } catch (error) {
      console.error("Failed to fetch secretary chart data:", error);
    }
  },

  fetchDocuments: async (params) => {
    try {
      const response = await secretaryService.getDocuments(params);
      const res = response.data || response;
      const raw = Array.isArray(res.data) ? res.data : res || [];
      const docs = Array.isArray(raw) ? raw.map((d: unknown) => {
        const obj = d as Record<string, unknown>;
        return {
          id: String((obj?.id as string | number | undefined) ?? ""),
          name: (obj?.name as string | undefined) ?? "",
          type: (obj?.type as string | undefined) ?? "",
          size: (obj?.size as string | undefined) ?? "",
          date: (obj?.date as string | undefined) ?? (obj?.uploadedAt as string | undefined) ?? "",
          url: (obj?.url as string | undefined) ?? "",
          icon: obj?.icon as string | undefined,
          author: obj?.author as string | undefined,
          authorAvatar: (obj?.authorAvatar as string | null | undefined) ?? null,
          uploadedAt: obj?.uploadedAt as string | undefined,
        } as Document;
      }) : [];
      set({ documents: docs });
    } catch (error) {
      console.error("Failed to fetch secretary documents:", error);
    }
  },
}));
