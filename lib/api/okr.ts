import client from "./client";
import { parseApiResponse } from "./utils";
import type {
  BindableMetrics,
  CheckInInput,
  CreateInitiativeInput,
  CreateKeyResultInput,
  CreateObjectiveInput,
  OkrCompanyHealthResponse,
  OkrInitiative,
  OkrKeyResult,
  OkrObjective,
  OkrObjectivesResponse,
  OkrOwner,
} from "@/types/okr";

export const okrService = {
  async getObjectives(quarter?: string): Promise<OkrObjectivesResponse> {
    const response = await client.get("/api/v1/okr/objectives", {
      params: quarter ? { quarter } : undefined,
    });
    return parseApiResponse<OkrObjectivesResponse>(response);
  },

  async getCompanyHealth(quarter?: string): Promise<OkrCompanyHealthResponse> {
    const response = await client.get("/api/v1/okr/company-health", {
      params: quarter ? { quarter } : undefined,
    });
    return parseApiResponse<OkrCompanyHealthResponse>(response);
  },

  async getKeyResult(id: number): Promise<{ key_result: OkrKeyResult }> {
    const response = await client.get(`/api/v1/okr/key-results/${id}`);
    return parseApiResponse<{ key_result: OkrKeyResult }>(response);
  },

  async getBindableMetrics(): Promise<BindableMetrics> {
    const response = await client.get("/api/v1/okr/bindable-metrics");
    return parseApiResponse<BindableMetrics>(response);
  },

  async getTeamMembers(): Promise<OkrOwner[]> {
    const response = await client.get("/api/v1/okr/team-members");
    return parseApiResponse<OkrOwner[]>(response);
  },

  async createObjective(data: CreateObjectiveInput): Promise<OkrObjective> {
    const response = await client.post("/api/v1/okr/objectives", data);
    return parseApiResponse<OkrObjective>(response);
  },

  async updateObjective(
    id: number,
    data: Partial<CreateObjectiveInput> & { status?: string },
  ): Promise<OkrObjective> {
    const response = await client.put(`/api/v1/okr/objectives/${id}`, data);
    return parseApiResponse<OkrObjective>(response);
  },

  async deleteObjective(id: number): Promise<unknown> {
    const response = await client.delete(`/api/v1/okr/objectives/${id}`);
    return parseApiResponse<unknown>(response);
  },

  async createKeyResult(data: CreateKeyResultInput): Promise<OkrKeyResult> {
    const response = await client.post("/api/v1/okr/key-results", data);
    return parseApiResponse<OkrKeyResult>(response);
  },

  async updateKeyResult(
    id: number,
    data: Partial<CreateKeyResultInput>,
  ): Promise<OkrKeyResult> {
    const response = await client.put(`/api/v1/okr/key-results/${id}`, data);
    return parseApiResponse<OkrKeyResult>(response);
  },

  async deleteKeyResult(id: number): Promise<unknown> {
    const response = await client.delete(`/api/v1/okr/key-results/${id}`);
    return parseApiResponse<unknown>(response);
  },

  async checkIn(
    krId: number,
    data: CheckInInput,
  ): Promise<{ key_result: OkrKeyResult; health_changed: boolean }> {
    const response = await client.post(
      `/api/v1/okr/key-results/${krId}/check-in`,
      data,
    );
    return parseApiResponse<{ key_result: OkrKeyResult; health_changed: boolean }>(
      response,
    );
  },

  async createInitiative(data: CreateInitiativeInput): Promise<OkrInitiative> {
    const response = await client.post("/api/v1/okr/initiatives", data);
    return parseApiResponse<OkrInitiative>(response);
  },

  async updateInitiative(
    id: number,
    data: Partial<CreateInitiativeInput> & { status?: string },
  ): Promise<OkrInitiative> {
    const response = await client.put(`/api/v1/okr/initiatives/${id}`, data);
    return parseApiResponse<OkrInitiative>(response);
  },

  async deleteInitiative(id: number): Promise<unknown> {
    const response = await client.delete(`/api/v1/okr/initiatives/${id}`);
    return parseApiResponse<unknown>(response);
  },
};
