import client from "./client";
import type {
  GroupSession,
  CreateGroupSessionPayload,
  InviteParticipantPayload,
  GroupSessionJoinResult,
} from "@/types/groupSession";

export const groupSessionApi = {
  /** List scheduled group sessions (optionally filter by type) */
  async getSessions(sessionType?: string): Promise<GroupSession[]> {
    const params = sessionType ? { session_type: sessionType } : undefined;
    const response = await client.get("/api/v1/group-sessions", { params });
    return response.data?.data ?? response.data;
  },

  /** Get a single group session by UUID */
  async getSession(uuid: string): Promise<GroupSession> {
    const response = await client.get(`/api/v1/group-sessions/${uuid}`);
    return response.data?.data ?? response.data;
  },

  /** Create a new group session */
  async createSession(
    payload: CreateGroupSessionPayload
  ): Promise<GroupSession> {
    const response = await client.post("/api/v1/group-sessions", payload);
    return response.data?.data ?? response.data;
  },

  /** Invite a participant by email — returns the generated invite token */
  async inviteParticipant(
    uuid: string,
    payload: InviteParticipantPayload
  ): Promise<{ invite_token: string; invite_link?: string }> {
    const response = await client.post(
      `/api/v1/group-sessions/${uuid}/invite`,
      payload
    );
    return response.data?.data ?? response.data;
  },

  /** Join a session (open groups or via invite token) */
  async joinSession(
    uuid: string,
    inviteToken?: string
  ): Promise<GroupSessionJoinResult> {
    const response = await client.post(
      `/api/v1/group-sessions/${uuid}/join`,
      inviteToken ? { invite_token: inviteToken } : {}
    );
    return response.data?.data ?? response.data;
  },

  /** Get session summary (post-session or pre-join via invite) */
  async getSessionSummary(
    uuid: string,
    inviteToken?: string
  ): Promise<{
    session: GroupSession;
    is_guest: boolean;
    summary_notes: string;
    next_steps: string[];
  }> {
    const params = inviteToken ? { invite_token: inviteToken } : undefined;
    const response = await client.get(
      `/api/v1/group-sessions/${uuid}/summary`,
      { params }
    );
    return response.data?.data ?? response.data;
  },

  /** End a session (therapist / clinical advisor only) */
  async endSession(uuid: string): Promise<void> {
    await client.post(`/api/v1/group-sessions/${uuid}/end`);
  },

  /** Get LiveKit video join token for a group session */
  async getVideoToken(
    uuid: string,
    inviteToken?: string
  ): Promise<{ token: string; url: string; room_name: string; role: string }> {
    const params = inviteToken ? { invite_token: inviteToken } : undefined;
    const response = await client.get(
      `/api/v1/group-sessions/${uuid}/video/join`,
      { params }
    );
    return response.data?.data ?? response.data;
  },
};
