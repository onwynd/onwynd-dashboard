import { create } from "zustand";
import { pmService } from "@/lib/api/pm";

export interface PMTask {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "review" | "done";
  assignee: {
    name: string;
    avatar: string;
  };
  priority: "low" | "medium" | "high" | "critical";
  dueDate: string;
  points: number;
}

export interface PMStat {
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease" | "neutral";
  description: string;
  icon: string | React.ComponentType | object;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  quarter?: string;
  target_date?: string;
  assigned_to?: { name: string; avatar?: string } | null;
}

export interface RoadmapQuarter {
  quarter: string;
  features: Feature[];
}

export interface VelocityData {
  sprint: string;
  committed: number;
  completed: number;
}

interface PMState {
  stats: PMStat[];
  tasks: PMTask[];
  roadmapData: RoadmapQuarter[];
  velocityData: VelocityData[];
  features: Feature[];
  layoutDensity: "default" | "comfortable" | "compact";
  sprintFilter: string;
  setLayoutDensity: (density: "default" | "comfortable" | "compact") => void;
  setSprintFilter: (filter: string) => void;
  
  // API Actions
  fetchStats: () => Promise<void>;
  fetchTasks: (params?: Record<string, unknown>) => Promise<void>;
  fetchRoadmap: () => Promise<void>;
  fetchVelocity: (sprint?: string) => Promise<void>;
  fetchFeatures: (params?: Record<string, unknown>) => Promise<void>;
  createFeature: (data: unknown) => Promise<void>;
  updateFeature: (id: string, data: unknown) => Promise<void>;
  deleteFeature: (id: string) => Promise<void>;
}

const initialStats: PMStat[] = [];
const initialTasks: PMTask[] = [];
const initialRoadmap: RoadmapQuarter[] = [];
const initialVelocity: VelocityData[] = [];
const initialFeatures: Feature[] = [];

export const usePMStore = create<PMState>((set) => ({
  stats: initialStats,
  tasks: initialTasks,
  roadmapData: initialRoadmap,
  velocityData: initialVelocity,
  features: initialFeatures,
  layoutDensity: "default",
  sprintFilter: "current",
  setLayoutDensity: (density) => set({ layoutDensity: density }),
  setSprintFilter: (filter) => set({ sprintFilter: filter }),

  fetchStats: async () => {
    try {
      const response = await pmService.getStats();
      const data = Array.isArray(response) ? response : response.data || [];
      set({ stats: data });
    } catch (error) {
      console.error("Failed to fetch PM stats:", error);
    }
  },

  fetchTasks: async (params) => {
    try {
      const response = await pmService.getTasks(params);
      const data = Array.isArray(response) ? response : response.data || [];
      set({ tasks: data });
    } catch (error) {
      console.error("Failed to fetch PM tasks:", error);
    }
  },

  fetchRoadmap: async () => {
    try {
      const response = await pmService.getRoadmap();
      const data = Array.isArray(response) ? response : response.data || [];
      set({ roadmapData: data });
    } catch (error) {
      console.error("Failed to fetch roadmap:", error);
    }
  },

  fetchVelocity: async (sprint) => {
    try {
      const response = await pmService.getVelocity(sprint);
      const data = Array.isArray(response) ? response : response.data || [];
      set({ velocityData: data });
    } catch (error) {
      console.error("Failed to fetch velocity:", error);
    }
  },

  fetchFeatures: async (params) => {
    try {
      const response = await pmService.getFeaturesList(params);
      const data = Array.isArray(response) ? response : response.data || [];
      set({ features: data });
    } catch (error) {
      console.error("Failed to fetch features:", error);
    }
  },

  createFeature: async (data) => {
    try {
      await pmService.createFeature(data);
      // Refresh features after create
      const response = await pmService.getFeaturesList();
      const newData = Array.isArray(response) ? response : response.data || [];
      set({ features: newData });
    } catch (error) {
      console.error("Failed to create feature:", error);
      throw error;
    }
  },

  updateFeature: async (id, data) => {
    try {
      await pmService.updateFeature(id, data);
       // Refresh features after update
      const response = await pmService.getFeaturesList();
      const newData = Array.isArray(response) ? response : response.data || [];
      set({ features: newData });
    } catch (error) {
      console.error("Failed to update feature:", error);
      throw error;
    }
  },

  deleteFeature: async (id) => {
    try {
      await pmService.deleteFeature(id);
       // Refresh features after delete
      const response = await pmService.getFeaturesList();
      const newData = Array.isArray(response) ? response : response.data || [];
      set({ features: newData });
    } catch (error) {
      console.error("Failed to delete feature:", error);
      throw error;
    }
  },
}));
