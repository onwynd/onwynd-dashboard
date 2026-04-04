import { create } from "zustand";
import { managerService } from "@/lib/api/manager";
import { toast } from "@/components/ui/use-toast";

export type LayoutDensity = "default" | "compact" | "comfortable";

export interface Employee {
  id: number;
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  role_id: number;
  is_active: boolean;
  is_online: boolean;
  last_seen_at: string | null;
  profile_photo: string | null;
  department?: string;
  job_title?: string;
  status?: string; // Optional for compatibility if needed, but better to derive from is_active
}

export interface StatCard {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  iconName: string;
}

export interface FinancialFlowData {
  month: string;
  moneyIn: number;
  moneyOut: number;
  moneyInChange: number;
  moneyOutChange: number;
}

export interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  category: string;
  status: string;
  price: number;
}

export interface ScheduleEvent {
  id: number;
  title: string;
  start: string;
  end: string;
  type: string;
  attendees: number[];
}

interface ManagerStatsResponse {
  team_overview?: {
    total_members?: number;
  };
  performance_metrics?: {
    average_response_time?: string | number;
    customer_satisfaction?: number;
    tickets_resolved_today?: number;
  };
}

interface DashboardState {
  stats: StatCard[];
  employees: Employee[];
  inventory: InventoryItem[];
  schedule: ScheduleEvent[];
  financialFlow: FinancialFlowData[];
  searchQuery: string;
  departmentFilter: string;
  statusFilter: string;
  setSearchQuery: (query: string) => void;
  setDepartmentFilter: (filter: string) => void;
  setStatusFilter: (filter: string) => void;
  clearFilters: () => void;
  
  showAlertBanner: boolean;
  showStatsCards: boolean;
  showChart: boolean;
  showTable: boolean;
  layoutDensity: LayoutDensity;
  setShowAlertBanner: (show: boolean) => void;
  setShowStatsCards: (show: boolean) => void;
  setShowChart: (show: boolean) => void;
  setShowTable: (show: boolean) => void;
  setLayoutDensity: (density: LayoutDensity) => void;
  resetLayout: () => void;
  
  fetchEmployees: (params?: Record<string, unknown>) => Promise<void>;
  fetchInventory: (params?: Record<string, unknown>) => Promise<void>;
  fetchSchedule: (params?: Record<string, unknown>) => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchFinancialFlow: (period?: string) => Promise<void>;
  
  addEmployee: (data: Partial<Employee>) => Promise<void>;
  updateEmployee: (id: number, data: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: number) => Promise<void>;
}

export const useManagerStore = create<DashboardState>((set) => ({
  stats: [],
  employees: [],
  inventory: [],
  schedule: [],
  financialFlow: [],
  
  searchQuery: "",
  departmentFilter: "all",
  statusFilter: "all",
  setSearchQuery: (query) => set({ searchQuery: query }),
  setDepartmentFilter: (filter) => set({ departmentFilter: filter }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),
  clearFilters: () =>
    set({
      searchQuery: "",
      departmentFilter: "all",
      statusFilter: "all",
    }),
    
  showAlertBanner: true,
  showStatsCards: true,
  showChart: true,
  showTable: true,
  layoutDensity: "default",
  setShowAlertBanner: (show) => set({ showAlertBanner: show }),
  setShowStatsCards: (show) => set({ showStatsCards: show }),
  setShowChart: (show) => set({ showChart: show }),
  setShowTable: (show) => set({ showTable: show }),
  setLayoutDensity: (density) => set({ layoutDensity: density }),
  resetLayout: () =>
    set({
      showAlertBanner: true,
      showStatsCards: true,
      showChart: true,
      showTable: true,
    }),
    
  fetchEmployees: async (params) => {
    try {
      const data = await managerService.getTeamMembers(params);
      set({ employees: data as Employee[] || [] });
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      toast({
        title: "Error",
        description: "Failed to load employees. Please try again.",
        variant: "destructive",
      });
    }
  },

  fetchInventory: async (params) => {
    try {
      const data = await managerService.getInventory(params);
      set({ inventory: data as InventoryItem[] || [] });
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
      toast({
        title: "Error",
        description: "Failed to load inventory. Please try again.",
        variant: "destructive",
      });
    }
  },

  fetchSchedule: async (params) => {
    try {
      const data = await managerService.getSchedule(params);
      set({ schedule: data as ScheduleEvent[] || [] });
    } catch (error) {
      console.error("Failed to fetch schedule:", error);
      toast({
        title: "Error",
        description: "Failed to load schedule. Please try again.",
        variant: "destructive",
      });
    }
  },
  
  fetchStats: async () => {
    try {
      const data = await managerService.getStats();
      const statsData = data as ManagerStatsResponse;
      const team = statsData?.team_overview || {};
      const perf = statsData?.performance_metrics || {};
      const cards: StatCard[] = [
        {
          title: "Team Members",
          value: String(team.total_members ?? 0),
          change: "0%",
          trend: "neutral",
          iconName: "Users",
        },
        {
          title: "Avg Response Time",
          value: String(perf.average_response_time ?? "0 mins"),
          change: "—",
          trend: "neutral",
          iconName: "Clock",
        },
        {
          title: "Customer Satisfaction",
          value: String(perf.customer_satisfaction ?? 0),
          change: "—",
          trend: "up",
          iconName: "Star",
        },
        {
          title: "Tickets Resolved Today",
          value: String(perf.tickets_resolved_today ?? 0),
          change: "—",
          trend: "up",
          iconName: "Ticket",
        },
      ];
      set({ stats: cards });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      toast({
        title: "Error",
        description: "Failed to load statistics. Please try again.",
        variant: "destructive",
      });
    }
  },
  
  fetchFinancialFlow: async (period) => {
    try {
      const response = await managerService.getFinancialFlow(period);
      const arrUnknown = Array.isArray(response)
        ? (response as unknown[])
        : Array.isArray((response as { data?: unknown[] })?.data)
        ? ((response as { data?: unknown[] }).data as unknown[])
        : [];
      const flow: FinancialFlowData[] = arrUnknown.map((it) => {
        const obj = it as Record<string, unknown>;
        return {
          month: String((obj?.month as string | undefined) ?? (obj?.label as string | undefined) ?? ""),
          moneyIn: Number((obj?.moneyIn as number | string | undefined) ?? (obj?.in as number | string | undefined) ?? 0),
          moneyOut: Number((obj?.moneyOut as number | string | undefined) ?? (obj?.out as number | string | undefined) ?? 0),
          moneyInChange: Number((obj?.moneyInChange as number | string | undefined) ?? (obj?.inChange as number | string | undefined) ?? 0),
          moneyOutChange: Number((obj?.moneyOutChange as number | string | undefined) ?? (obj?.outChange as number | string | undefined) ?? 0),
        } as FinancialFlowData;
      });
      set({ financialFlow: flow });
    } catch (error) {
      console.error("Failed to fetch financial flow:", error);
      set({ financialFlow: [] });
      toast({
        title: "Error",
        description: "Failed to load financial data. Please try again.",
        variant: "destructive",
      });
    }
  },

  addEmployee: async (data) => {
    try {
      const newEmployee = await managerService.createTeamMember(data);
      set((state) => ({ employees: [...state.employees, newEmployee as Employee] }));
    } catch (error) {
      console.error("Failed to add employee:", error);
      toast({
        title: "Error",
        description: "Failed to add employee. Please try again.",
        variant: "destructive",
      });
    }
  },

  updateEmployee: async (id, data) => {
    try {
      const updated = await managerService.updateTeamMember(id, data);
      set((state) => ({
        employees: state.employees.map((emp) => (emp.id === id ? updated as Employee : emp)),
      }));
    } catch (error) {
      console.error("Failed to update employee:", error);
      toast({
        title: "Error",
        description: "Failed to update employee. Please try again.",
        variant: "destructive",
      });
    }
  },

  deleteEmployee: async (id) => {
    try {
      await managerService.deleteTeamMember(id);
      set((state) => ({
        employees: state.employees.filter((emp) => emp.id !== id),
      }));
    } catch (error) {
      console.error("Failed to delete employee:", error);
      toast({
        title: "Error",
        description: "Failed to delete employee. Please try again.",
        variant: "destructive",
      });
    }
  },
}));
