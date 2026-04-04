/**
 * Admin Feedback Service
 * Handles feedback management for admin dashboard
 */

import client from "./client";

export interface FeedbackItem {
  id: number;
  user_id: number | null;
  type: "bug" | "feature" | "general";
  message: string;
  rating: number | null;
  name: string | null;
  email: string | null;
  status: "pending" | "reviewed" | "resolved";
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface FeedbackResponse {
  feedback: FeedbackItem[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
  summary: {
    total: number;
    pending: number;
    reviewed: number;
    resolved: number;
    by_type: {
      bug: number;
      feature: number;
      general: number;
    };
    average_rating: number;
  };
}

export interface FeedbackFilters {
  status?: "pending" | "reviewed" | "resolved" | "all";
  type?: "bug" | "feature" | "general" | "all";
  start_date?: string;
  end_date?: string;
  page?: number;
  per_page?: number;
}

export const adminFeedbackService = {
  async getFeedback(filters: FeedbackFilters = {}): Promise<FeedbackResponse> {
    const params: Record<string, string | number> = {};

    if (filters.status && filters.status !== "all") {
      params.status = filters.status;
    }
    if (filters.type && filters.type !== "all") {
      params.type = filters.type;
    }
    if (filters.start_date) {
      params.start_date = filters.start_date;
    }
    if (filters.end_date) {
      params.end_date = filters.end_date;
    }
    if (filters.page) {
      params.page = filters.page;
    }
    if (filters.per_page) {
      params.per_page = filters.per_page;
    }

    const response = await client.get("/api/v1/admin/feedback", { params });
    return response.data.data ?? response.data;
  },

  async getFeedbackById(id: number): Promise<{ feedback: FeedbackItem }> {
    const response = await client.get(`/api/v1/admin/feedback/${id}`);
    return response.data.data ?? response.data;
  },

  async updateFeedbackStatus(
    id: number,
    status: "pending" | "reviewed" | "resolved"
  ): Promise<{ feedback: FeedbackItem }> {
    const response = await client.put(`/api/v1/admin/feedback/${id}/status`, {
      status,
    });
    return response.data.data ?? response.data;
  },

  async deleteFeedback(id: number): Promise<void> {
    await client.delete(`/api/v1/admin/feedback/${id}`);
  },
};
