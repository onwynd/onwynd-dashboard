import { create } from "zustand";
import { productService } from "@/lib/api/product";

export interface ProductStat {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  iconName: string;
}

export interface ProductItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: "active" | "draft" | "archived";
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

interface ProductState {
  stats: ProductStat[];
  products: ProductItem[];
  chartData: ChartDataPoint[];
  layoutDensity: "compact" | "default" | "comfortable";
  showAlertBanner: boolean;
  showStatsCards: boolean;
  showChart: boolean;
  showTable: boolean;
  
  setLayoutDensity: (density: "compact" | "default" | "comfortable") => void;
  setShowAlertBanner: (show: boolean) => void;
  setShowStatsCards: (show: boolean) => void;
  setShowChart: (show: boolean) => void;
  setShowTable: (show: boolean) => void;
  
  // API Actions
  fetchStats: () => Promise<void>;
  fetchProducts: (params?: Record<string, unknown>) => Promise<void>;
  fetchChartData: (period: string) => Promise<void>;
}

const initialStats: ProductStat[] = [];

export const useProductStore = create<ProductState>((set) => ({
  stats: initialStats,
  products: [],
  chartData: [],
  layoutDensity: "default",
  showAlertBanner: true,
  showStatsCards: true,
  showChart: true,
  showTable: true,
  
  setLayoutDensity: (density) => set({ layoutDensity: density }),
  setShowAlertBanner: (show) => set({ showAlertBanner: show }),
  setShowStatsCards: (show) => set({ showStatsCards: show }),
  setShowChart: (show) => set({ showChart: show }),
  setShowTable: (show) => set({ showTable: show }),
  
  fetchStats: async () => {
    try {
      const data = await productService.getStats();
      set({ stats: data });
    } catch (error) {
      console.error("Failed to fetch product stats:", error);
    }
  },

  fetchProducts: async (params) => {
    try {
      const data = await productService.getProducts(params);
      set({ products: data });
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  },

  fetchChartData: async (period) => {
    try {
      const data = await productService.getPerformance(period);
      set({ chartData: data });
    } catch (error) {
      console.error("Failed to fetch product chart data:", error);
    }
  },
}));
