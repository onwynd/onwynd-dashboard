import client from "./client";
import { parseApiResponse } from "./utils";

export const managerService = {
  // Team Management
  getTeamMembers: async (params?: unknown) => {
    const response = await client.get("/api/v1/manager/team", { params });
    return parseApiResponse(response);
  },
  
  createTeamMember: async (data: unknown) => {
    const response = await client.post("/api/v1/manager/team", data);
    return parseApiResponse(response);
  },
  
  updateTeamMember: async (id: number | string, data: unknown) => {
    const response = await client.put(`/api/v1/manager/team/${id}`, data);
    return parseApiResponse(response);
  },
  
  deleteTeamMember: async (id: number | string) => {
    const response = await client.delete(`/api/v1/manager/team/${id}`);
    return parseApiResponse(response);
  },

  // Inventory Management
  getInventory: async (params?: unknown) => {
    const response = await client.get("/api/v1/manager/inventory", { params });
    return parseApiResponse(response);
  },
  
  createInventoryItem: async (data: unknown) => {
    const response = await client.post("/api/v1/manager/inventory", data);
    return parseApiResponse(response);
  },
  
  updateInventoryItem: async (id: number | string, data: unknown) => {
    const response = await client.put(`/api/v1/manager/inventory/${id}`, data);
    return parseApiResponse(response);
  },
  
  deleteInventoryItem: async (id: number | string) => {
    const response = await client.delete(`/api/v1/manager/inventory/${id}`);
    return parseApiResponse(response);
  },

  // Schedule Management
  getSchedule: async (params?: unknown) => {
    const response = await client.get("/api/v1/manager/schedules", { params });
    return parseApiResponse(response);
  },
  
  createScheduleEvent: async (data: unknown) => {
    const response = await client.post("/api/v1/manager/schedules", data);
    return parseApiResponse(response);
  },
  
  updateScheduleEvent: async (id: number | string, data: unknown) => {
    const response = await client.put(`/api/v1/manager/schedules/${id}`, data);
    return parseApiResponse(response);
  },
  
  deleteScheduleEvent: async (id: number | string) => {
    const response = await client.delete(`/api/v1/manager/schedules/${id}`);
    return parseApiResponse(response);
  },

  // Reports
  getReports: async (params?: unknown) => {
    const response = await client.get("/api/v1/manager/reports", { params });
    return parseApiResponse(response);
  },

  getStats: async () => {
    const response = await client.get("/api/v1/manager/dashboard");
    return parseApiResponse(response);
  },

  getFinancialFlow: async (period?: string) => {
    const response = await client.get("/api/v1/manager/reports", { params: { period } });
    return parseApiResponse(response);
  },

  // Sounds
  getSounds: async (category?: string) => {
    const params = category ? { category } : {};
    const response = await client.get("/api/v1/manager/sounds", { params });
    return parseApiResponse(response);
  },
  uploadSound: async (file: File, category?: string) => {
    const form = new FormData();
    form.append("file", file);
    if (category) {
      form.append("category", category);
    }
    const response = await client.post("/api/v1/manager/sounds", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return parseApiResponse(response);
  },
  deleteSound: async (filename: string, category?: string) => {
    const params = category ? { category } : {};
    const response = await client.delete(`/api/v1/manager/sounds/${encodeURIComponent(filename)}`, { params });
    return parseApiResponse(response);
  },

  // Subscription Upgrade Request
  requestSubscriptionUpgrade: async (data: {
    user_id: number | string;
    plan_uuid: string;
    billing_interval?: "monthly" | "annual" | "yearly" | "year";
    include_in_revenue?: boolean;
    comped?: boolean;
    reason?: string;
  }) => {
    const response = await client.post("/api/v1/manager/subscription-upgrade/requests", data);
    return parseApiResponse(response);
  },
};
