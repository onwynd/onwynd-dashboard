import { create } from "zustand";
import client from "@/lib/api/client";

interface CfoState {
  isLoading: boolean;
  error: string | null;
  totalRevenue: number | null;
  mrr: number | null;
  grossMargin: number | null;
  burnRate: number | null;
  cashRunwayMonths: number | null;
  outstandingInvoices: number | null;
  revenueSeries: { name: string; revenue: number; expenses: number }[];
  recentTransactions: {
    id: number | string;
    description: string;
    amount: number;
    type: "credit" | "debit";
    date: string;
    category?: string;
  }[];
  invoiceAging: { label: string; count: number; value: number }[];
  payrollSummary: { total: number | null; due_date?: string; headcount?: number };
  fetchAll: () => Promise<void>;
}

export const useCfoStore = create<CfoState>((set) => ({
  isLoading: false,
  error: null,
  totalRevenue: null,
  mrr: null,
  grossMargin: null,
  burnRate: null,
  cashRunwayMonths: null,
  outstandingInvoices: null,
  revenueSeries: [],
  recentTransactions: [],
  invoiceAging: [],
  payrollSummary: { total: null },

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await client.get("/api/v1/finance/overview");
      const d = res.data?.data ?? res.data ?? {};
      set({
        totalRevenue: d.total_revenue ?? null,
        mrr: d.mrr ?? null,
        grossMargin: d.gross_margin ?? null,
        burnRate: d.burn_rate ?? null,
        cashRunwayMonths: d.cash_runway_months ?? null,
        outstandingInvoices: d.outstanding_invoices ?? null,
        revenueSeries: Array.isArray(d.revenue_series) ? d.revenue_series : [],
        recentTransactions: Array.isArray(d.recent_transactions) ? d.recent_transactions : [],
        invoiceAging: Array.isArray(d.invoice_aging) ? d.invoice_aging : [],
        payrollSummary: d.payroll_summary ?? { total: null },
      });
    } catch {
      set({ error: "Failed to load financial data." });
    } finally {
      set({ isLoading: false });
    }
  },
}));
