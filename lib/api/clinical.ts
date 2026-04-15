
// filepath: lib/api/clinical.ts
import client from "./client";
import { safeApiCall } from "./safeApiCall";

export interface SessionReview {
  id: string;
  uuid: string;
  session_id: string;
  user_id: string;
  therapist_id: string;
  review_status: "pending" | "approved" | "flagged" | "escalated";
  risk_level: string;
  created_at: string;
  updated_at: string;
}

export interface DistressQueueItem {
  id: string;
  session_id: string;
  member_id: string;
  organization_id: number | null;
  risk_level: "low" | "medium" | "high" | "severe" | "critical";
  flagged_at: string;
  message_preview: string;
  resources_shown: boolean;
  type: "ai_conversation";
}

export interface TherapistInvite {
  id: number;
  email: string;
  notes: string | null;
  expires_at: string;
  created_at: string;
  accepted_at?: string | null;
  invited_by?: { first_name: string; last_name: string } | null;
}

export const clinicalService = {
  async getPendingTherapists(params?: Record<string, any>) {
    return safeApiCall(() => client.get("/api/v1/admin/therapists/pending", { params }));
  },

  // Clinical Advisor therapist review operations
  async getTherapists(params?: Record<string, any>) {
    return safeApiCall(() => client.get("/api/v1/admin/therapists", { params }));
  },

  async approveTherapist(therapistId: string, notes?: string) {
    return safeApiCall(() => client.post(`/api/v1/admin/therapists/${therapistId}/approve`, { notes }));
  },

  async rejectTherapist(therapistId: string, reason: string) {
    return safeApiCall(() => client.post(`/api/v1/admin/therapists/${therapistId}/reject`, { reason }));
  },

  async inviteTherapist(email: string, notes?: string) {
    return safeApiCall(() => client.post("/api/v1/admin/therapists/invite", { email, notes }));
  },

  async getTherapistInvites(params?: Record<string, any>) {
    return safeApiCall(() => client.get("/api/v1/admin/therapists/invites", { params }));
  },

  async revokeTherapistInvite(inviteId: string | number) {
    return safeApiCall(() => client.delete(`/api/v1/admin/therapists/invites/${inviteId}`));
  },

  // Session Reviews (Audit)
  async getReviews(params?: Record<string, any>) {
    return safeApiCall(() => client.get("/api/v1/clinical-advisor/reviews", { params }));
  },

  async getReview(id: string) {
    return safeApiCall(() => client.get(`/api/v1/clinical-advisor/reviews/${id}`));
  },

  async approveReview(id: string, notes?: string) {
    return safeApiCall(() => client.post(`/api/v1/clinical-advisor/reviews/${id}/approve`, { notes }));
  },

  async flagReview(id: string, reason: string, priority: string = "normal") {
    return safeApiCall(() => client.post(`/api/v1/clinical-advisor/reviews/${id}/flag`, { reason, priority }));
  },

  async escalateReview(id: string, reason: string) {
    return safeApiCall(() => client.post(`/api/v1/clinical-advisor/reviews/${id}/escalate`, { reason }));
  },

  // Distress Queue (Real-time AI monitoring)
  async getDistressQueue(page = 1) {
    return safeApiCall(() => client.get("/api/v1/clinical-advisor/distress-queue", {
      params: { page },
    }));
  },

  async resolveDistressItem(id: string, resolution_type: string, notes?: string) {
    return safeApiCall(() => client.patch(`/api/v1/clinical-advisor/distress-queue/${id}/resolve`, {
      resolution_type,
      notes,
    }));
  },

  // Meeting Invites
  async sendMeetingInvite(therapistId: string) {
    return safeApiCall(() => client.post(`/api/v1/clinical-advisor/therapists/${therapistId}/meeting-invite`));
  },

  // Therapist Profile Management for Clinical Advisors
  async getTherapistProfile() {
    return safeApiCall(() => client.get("/api/v1/clinical-advisor/therapist-profile"));
  },

  async createTherapistProfile(data: Record<string, any>) {
    return safeApiCall(() => client.post("/api/v1/clinical-advisor/therapist-profile", data));
  },

  async updateTherapistProfile(data: Record<string, any>) {
    return safeApiCall(() => client.put("/api/v1/clinical-advisor/therapist-profile", data));
  },

  async toggleTherapistMode(isAvailable: boolean) {
    return safeApiCall(() => client.post("/api/v1/clinical-advisor/toggle-therapist-mode", { is_available: isAvailable }));
  },

  async getTherapistStatus() {
    return safeApiCall(() => client.get("/api/v1/clinical-advisor/therapist-status"));
  },
};
