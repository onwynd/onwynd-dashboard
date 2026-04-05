import { create } from "zustand";
import { hrService } from "@/lib/api/hr";

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
  department?: string; // Optional if not in users table directly
  job_title?: string; // Optional
}

export interface Payroll {
  id: number;
  uuid: string;
  amount: number;
  pay_date: string;
  period_start: string;
  period_end: string;
  status: "pending" | "processed" | "paid";
  reference_number: string | null;
}

export interface LeaveRequest {
  id: number;
  uuid: string;
  leave_type: "vacation" | "sick" | "personal" | "maternity" | "paternity" | "unpaid";
  start_date: string;
  end_date: string;
  reason: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled";
}

export interface FinancialFlowData {
  month: string;
  moneyIn: number;
  moneyOut: number;
  moneyInChange: number;
  moneyOutChange: number;
}

export interface HRStat {
  title: string;
  value: string;
  subtitle: string;
  iconName?: string;
}

// Initial empty stats
const initialStats: HRStat[] = [
  {
    title: "Total Employees",
    value: "0",
    subtitle: "Active: 0, Inactive: 0",
    iconName: "users"
  },
  {
    title: "Upcoming Payroll",
    value: "$0",
    subtitle: "Processing in 0 days",
    iconName: "file-text"
  },
  {
    title: "Attendance Rate",
    value: "0%",
    subtitle: "Last 30 Days",
    iconName: "calendar"
  },
];

interface HRState {
  stats: HRStat[];
  employees: Employee[];
  payrolls: Payroll[];
  leaveRequests: LeaveRequest[];
  financialFlow: FinancialFlowData[];
  layoutDensity: "compact" | "default" | "comfortable";
  showAlertBanner: boolean;
  showStatsCards: boolean;
  showChart: boolean;
  showTable: boolean;
  searchQuery: string;
  departmentFilter: string;
  statusFilter: string;
  setLayoutDensity: (density: "compact" | "default" | "comfortable") => void;
  setShowAlertBanner: (show: boolean) => void;
  setShowStatsCards: (show: boolean) => void;
  setShowChart: (show: boolean) => void;
  setShowTable: (show: boolean) => void;
  setSearchQuery: (query: string) => void;
  setDepartmentFilter: (filter: string) => void;
  setStatusFilter: (filter: string) => void;
  clearFilters: () => void;

  // API Actions
  fetchStats: () => Promise<void>;
  fetchEmployees: (params?: Record<string, unknown>) => Promise<void>;
  fetchPayrolls: (params?: Record<string, unknown>) => Promise<void>;
  fetchLeaveRequests: (params?: Record<string, unknown>) => Promise<void>;
  fetchFinancialFlow: (period: string) => Promise<void>;
}

export const useHRStore = create<HRState>((set) => ({
  stats: initialStats,
  employees: [],
  payrolls: [],
  leaveRequests: [],
  financialFlow: [],
  layoutDensity: "default",
  showAlertBanner: true,
  showStatsCards: true,
  showChart: true,
  showTable: true,
  searchQuery: "",
  departmentFilter: "all",
  statusFilter: "all",
  setLayoutDensity: (density) => set({ layoutDensity: density }),
  setShowAlertBanner: (show) => set({ showAlertBanner: show }),
  setShowStatsCards: (show) => set({ showStatsCards: show }),
  setShowChart: (show) => set({ showChart: show }),
  setShowTable: (show) => set({ showTable: show }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setDepartmentFilter: (filter) => set({ departmentFilter: filter }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),
  clearFilters: () => set({ searchQuery: "", departmentFilter: "all", statusFilter: "all" }),

  fetchStats: async () => {
    try {
      const data = await hrService.getStats();
      set({ stats: data as HRStat[] | undefined });
    } catch {
      set({ stats: [] });
    }
  },

  fetchEmployees: async (params) => {
    try {
      const data = await hrService.getEmployees(params);
      if (Array.isArray(data)) {
        set({ employees: data });
      } else if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        set({ employees: data as any });
      } else {
        set({ employees: [] });
      }
    } catch {
      set({ employees: [] });
    }
  },

  fetchPayrolls: async (params) => {
    try {
      const data = await hrService.getPayrolls(params);
      if (Array.isArray(data)) {
        set({ payrolls: data });
      } else if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        set({ payrolls: data as any });
      } else {
        set({ payrolls: [] });
      }
    } catch {
      set({ payrolls: [] });
    }
  },

  fetchLeaveRequests: async (params) => {
    try {
      const data = await hrService.getLeaveRequests(params);
      if (Array.isArray(data)) {
        set({ leaveRequests: data });
      } else if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        set({ leaveRequests: data as any });
      } else {
        set({ leaveRequests: [] });
      }
    } catch {
      set({ leaveRequests: [] });
    }
  },

  fetchFinancialFlow: async (period) => {
    try {
      const data = await hrService.getChartData(period);
      set({ financialFlow: data as FinancialFlowData[] | undefined });
    } catch {
      set({ financialFlow: [] });
    }
  },
}));
