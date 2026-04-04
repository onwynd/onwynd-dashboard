import { create } from "zustand";
import { financeService } from "@/lib/api/finance";
import { parseApiResponse } from "@/lib/api/utils";
import { Invoice } from "@/components/finance-dashboard/invoices-table";
import { Payout } from "@/components/finance-dashboard/payouts-table";

export interface FinanceStat {
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease" | "neutral";
  iconName: string;
  description: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  status: "completed" | "pending" | "failed";
  category: string;
  date: string;
  merchant?: string;
}

export interface RevenueData {
  name: string;
  revenue: number;
  expenses: number;
}

export interface ExpenseBreakdownItem {
  name: string;
  value: number;
  color: string;
}

export type ExpenseBreakdown = Record<string, ExpenseBreakdownItem[]>;

export interface BackendInvoice {
  id: string;
  invoice_number: string;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  user_name?: string;
  user_email?: string;
  amount: string | number;
  currency?: string;
  status: "paid" | "pending" | "overdue" | "cancelled";
  due_date: string;
  created_at: string;
}

export interface BackendPayout {
  id: string;
  user?: {
    first_name: string;
    last_name: string;
  };
  user_name?: string;
  amount: string | number;
  currency?: string;
  status: "completed" | "pending" | "failed";
  method?: string;
  processed_at?: string;
  created_at: string;
  reference?: string;
}

interface FinanceState {
  stats: FinanceStat[];
  transactions: Transaction[];
  revenueData: RevenueData[];
  expenseBreakdown: ExpenseBreakdown;
  invoices: Invoice[];
  payouts: Payout[];
  isLoading: boolean;
  processing: boolean;
  layoutDensity: "default" | "comfortable" | "compact";
  dateRange: string;
  setLayoutDensity: (density: "default" | "comfortable" | "compact") => void;
  setDateRange: (range: string) => void;
  fetchStats: () => Promise<void>;
  fetchTransactions: (params?: Record<string, unknown>) => Promise<void>;
  fetchRevenueData: (period: string) => Promise<void>;
  fetchExpenseBreakdown: (period: string) => Promise<void>;
  fetchInvoices: (params?: Record<string, unknown>) => Promise<void>;
  fetchPayouts: (params?: Record<string, unknown>) => Promise<void>;
  processBatch: (ids: (string | number)[]) => Promise<unknown>;
  processOne: (id: string | number, action?: 'approve' | 'reject', reason?: string) => Promise<unknown>;
}

export const useFinanceStore = create<FinanceState>((set) => ({
  stats: [],
  transactions: [],
  revenueData: [],
  expenseBreakdown: {},
  invoices: [],
  payouts: [],
  isLoading: false,
  processing: false,
  layoutDensity: "default",
  dateRange: "Last 30 days",
  setLayoutDensity: (density) => set({ layoutDensity: density }),
  setDateRange: (range) => set({ dateRange: range }),
  fetchStats: async () => {
    set({ isLoading: true });
    try {
      const response = await financeService.getStats();
      const data = parseApiResponse(response);
      if (response.success && data) {
        set({ stats: data as FinanceStat[] });
      }
    } catch (error) {
      console.error("Failed to fetch finance stats:", error);
      set({ stats: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTransactions: async (params) => {
    set({ isLoading: true });
    try {
      const response = await financeService.getTransactions(params);
      const data = parseApiResponse(response);
      if (response.success && data) {
        set({ transactions: Array.isArray(data) ? data : [] });
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      set({ transactions: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchRevenueData: async (period) => {
    set({ isLoading: true });
    try {
      const response = await financeService.getRevenueData(period);
      const data = parseApiResponse(response);
      if (response.success && data) {
        set({ revenueData: data as RevenueData[] });
      }
    } catch (error) {
      console.error("Failed to fetch revenue data:", error);
      set({ revenueData: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchExpenseBreakdown: async (period) => {
    set({ isLoading: true });
    try {
      const response = await financeService.getExpenseBreakdown(period);
      const data = parseApiResponse(response);
      if (response.success && data) {
        set({ expenseBreakdown: data as ExpenseBreakdown });
      }
    } catch (error) {
      console.error("Failed to fetch expense breakdown:", error);
      set({ expenseBreakdown: {} });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchInvoices: async (params) => {
    set({ isLoading: true });
    try {
      const response = await financeService.getInvoices(params);
      const data = parseApiResponse(response);
      if (response.success && data) {
        // Handle pagination response (data.data) or simple array (data)
        const invoices = Array.isArray(data) ? data : [];
        
        // Transform backend data to match frontend interface if needed
        const transformedData = invoices.map((inv: BackendInvoice) => ({
          id: typeof inv.id === 'string' ? Number(inv.id) : inv.id,
          invoice_number: inv.invoice_number,
          user_name: inv.user?.first_name ? `${inv.user.first_name} ${inv.user.last_name}` : inv.user_name || 'Unknown',
          user_email: inv.user?.email || inv.user_email || '',
          amount: typeof inv.amount === 'string' ? parseFloat(inv.amount) : inv.amount,
          currency: inv.currency || 'NGN',
          status: inv.status,
          due_date: inv.due_date,
          created_at: inv.created_at
        }));

        set({ invoices: transformedData });
      }
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      set({ invoices: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPayouts: async (params) => {
    set({ isLoading: true });
    try {
      const response = await financeService.getPayouts(params);
      const data = parseApiResponse(response);
      if (response.success && data) {
        // Handle pagination response (data.data) or simple array (data)
        const payouts = Array.isArray(data) ? data : [];
        
        // Transform backend data to match frontend interface if needed
        const transformedData = payouts.map((payout: BackendPayout) => ({
          id: typeof payout.id === 'string' ? Number(payout.id) : payout.id,
          user_name: payout.user?.first_name ? `${payout.user.first_name} ${payout.user.last_name}` : payout.user_name || 'Unknown',
          amount: typeof payout.amount === 'string' ? parseFloat(payout.amount) : payout.amount,
          currency: payout.currency || 'NGN',
          status: payout.status,
          bank_name: payout.method || 'Bank Transfer',
          account_number: payout.reference || '',
          created_at: payout.processed_at || payout.created_at
        }));

        set({ payouts: transformedData });
      }
    } catch (error) {
      console.error("Failed to fetch payouts:", error);
      set({ payouts: [] });
    } finally {
      set({ isLoading: false });
    }
  },
  
  processBatch: async (ids) => {
    set({ processing: true });
    try {
      const response = await financeService.batchProcessPayouts(ids);
      if (response && response.success === false) {
        throw new Error("Batch processing failed");
      }
      return response;
    } catch (error) {
      console.error("Failed to process payout batch:", error);
      throw error;
    } finally {
      set({ processing: false });
    }
  },
  
  processOne: async (id, action = 'approve', reason) => {
    try {
      const response = await financeService.processPayout(id, action, reason);
      if (response && response.success === false) {
        throw new Error("Payout processing failed");
      }
      return response;
    } catch (error) {
      console.error("Failed to process payout:", error);
      throw error;
    }
  },
}));
