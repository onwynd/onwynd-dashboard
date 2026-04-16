
// filepath: lib/api/therapist.ts
import client from "./client";
import { safeApiCall } from "./safeApiCall";

export interface TherapistStat {
    title: string;
    value: string;
    subtitle: string;
}

export interface FinancialFlowEntry {
    month: string;
    moneyIn: number;
    moneyOut: number;
}

export interface CommissionTier {
  min: number;
  max: number | null;
  therapist_keep_percent: number;
  label?: string;
}

export interface CommissionSettings {
  tiers: CommissionTier[] | Record<string, CommissionTier[]>;
  founding_discount_percent?: number;
  founding_duration_months?: number;
}

export interface Patient {
    id: string | number;
    uuid: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_photo?: string | null;
    status?: string | null;
    is_active?: boolean;
    department?: string | null;
    created_at: string;
}

export interface TherapistProfile {
    id: string;
    name: string;
    status: 'pending_approval' | 'approved' | 'suspended' | 'rejected';
    specialization: string;
    bio: string;
    availability: Record<string, any>; // TODO: Define availability structure
    bank_details: Record<string, any>; // TODO: Define bank details structure
    onboarding_steps_completed: string[];
    onboarding_completed: boolean;
    terms_accepted_at: string | null;
    founding_therapist: boolean;
    commission_rate: number;
    // Allow other fields from the API response
    [key: string]: any;
}

export const therapistService = {
  async getDashboard() {
    return safeApiCall(() => client.get("/api/v1/therapist/dashboard"));
  },

  async getStats() {
    return safeApiCall(() => client.get("/api/v1/therapist/stats"));
  },

  async getFinancialFlow(period: string = "monthly") {
    return safeApiCall(() => client.get("/api/v1/therapist/financial-flow", { params: { period } }));
  },

  async getPatients(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/therapist/patients", { params }));
  },

  async createPatient(data: Partial<Patient>) {
    return safeApiCall(() => client.post("/api/v1/therapist/patients", data));
  },

  async updatePatient(id: number | string, data: Partial<Patient>) {
    return safeApiCall(() => client.put(`/api/v1/therapist/patients/${id}`, data));
  },

  async deletePatient(id: number | string) {
    return safeApiCall(() => client.delete(`/api/v1/therapist/patients/${id}`));
  },

  async importPatients(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return safeApiCall(() => client.post("/api/v1/therapist/patients/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }));
  },

  async getProfile() {
    return safeApiCall(() => client.get("/api/v1/therapist/profile"));
  },

  async getCommissionSettings() {
    return safeApiCall(() => client.get("/api/v1/public/commission"));
  },

  async updateProfile(data: Partial<TherapistProfile>) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
          if (value instanceof File) {
              formData.append(key, value);
          } else if (Array.isArray(value)) {
              value.forEach(item => formData.append(`${key}[]`, item));
          } else if (value !== null && value !== undefined) {
              formData.append(key, String(value));
          }
      });
      return safeApiCall(() => client.put('/api/v1/therapist/profile', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
      }));
  },

  async uploadCertificate(file: File) {
    const formData = new FormData();
    formData.append("certificate", file);
    return safeApiCall(() => client.post("/api/v1/therapist/certificate", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }));
  },

  async getSessions(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/therapist/sessions", { params }));
  },

  async getSession(id: string | number) {
    return safeApiCall(() => client.get(`/api/v1/therapist/sessions/${id}`));
  },

  async confirmSession(id: string | number) {
    return safeApiCall(() => client.post(`/api/v1/therapist/sessions/${id}/confirm`));
  },

  async updateReferralStatus(id: string | number, status: string) {
    return safeApiCall(() => client.patch(`/api/v1/therapist/referrals/${id}`, { status }));
  },

  async getEarnings(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/therapist/earnings", { params }));
  },

  async getNotes(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/therapist/notes", { params }));
  },

  async createNote(data: Record<string, unknown>) {
    return safeApiCall(() => client.post("/api/v1/therapist/notes", data));
  },

  async updateNote(id: number | string, data: Record<string, unknown>) {
    return safeApiCall(() => client.put(`/api/v1/therapist/notes/${id}`, data));
  },

  async deleteNote(id: number | string) {
    return safeApiCall(() => client.delete(`/api/v1/therapist/notes/${id}`));
  },

  async getNotifications(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/therapist/notifications", { params }));
  },

  async getUnreadNotificationCount() {
    return safeApiCall(() => client.get("/api/v1/therapist/notifications/unread-count"));
  },

  async markNotificationRead(id?: string | number) {
    if (id) {
      return safeApiCall(() => client.patch(`/api/v1/therapist/notifications/${id}/read`));
    }
    return safeApiCall(() => client.patch("/api/v1/therapist/notifications/read-all"));
  },

  async getAvailability() {
    return safeApiCall(() => client.get("/api/v1/therapist/availability"));
  },

  async createAvailability(data: Record<string, unknown>) {
    return safeApiCall(() => client.post("/api/v1/therapist/availability", data));
  },

  async updateAvailability(id: string | number, data: Record<string, unknown>) {
    return safeApiCall(() => client.put(`/api/v1/therapist/availability/${id}`, data));
  },

  async deleteAvailability(id: string | number) {
    return safeApiCall(() => client.delete(`/api/v1/therapist/availability/${id}`));
  },

  async acceptTerms() {
    return safeApiCall(() => client.patch("/api/v1/therapist/terms/accept"));
  },
  
  async updateOnboardingStep(step: string) {
      return safeApiCall(() => client.patch('/api/v1/therapist/onboarding', { step }));
  },

  async getBankAccount() {
    return safeApiCall(() => client.get("/api/v1/therapist/bank-details"));
  },

  async saveBankAccount(data: Record<string, unknown>) {
    return safeApiCall(() => client.put("/api/v1/therapist/bank-details", data));
  },

  async invitePatient(email: string, message?: string) {
    return safeApiCall(() => client.post("/api/v1/therapist/patient-invites", { email, message }));
  },

  async getPatientInvites() {
    return safeApiCall(() => client.get("/api/v1/therapist/patient-invites"));
  },

  async revokePatientInvite(id: number) {
    return safeApiCall(() => client.delete(`/api/v1/therapist/patient-invites/${id}`));
  },

  async requestPayout(amount: number) {
    return safeApiCall(() => client.post("/api/v1/therapist/earnings/payout", { amount }));
  },

  async getPayouts(params?: Record<string, unknown>) {
    return safeApiCall(() => client.get("/api/v1/therapist/earnings/payouts", { params }));
  },
};
