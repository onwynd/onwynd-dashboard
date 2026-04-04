import client from './client';

interface AxiosLikeError {
  response?: {
    status?: number;
    data?: Record<string, unknown>;
  };
}

export interface Soundscape {
  id: string | number;
  uuid: string;
  title: string;
  description: string;
  category: string;
  preview_url: string;
  full_url?: string;
  duration_minutes: number;
  is_free_preview: boolean;
  tags: string[];
}

export interface SoundscapeResponse {
  data: Soundscape[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
  };
}

export interface StartSessionResponse {
  success: boolean;
  data: {
    session_id: string;
    started_at: string;
  };
  message: string;
}

export interface UpsellResponse {
  error: string;
  upsell: {
    message: string;
    subscribe_url: string;
    cta: string;
    description: string;
    price: string;
    benefits: string[];
  };
}

export const mindfulnessService = {
  async getSoundscapes(page: number = 1, perPage: number = 20): Promise<SoundscapeResponse> {
    try {
      const response = await client.get(`/api/v1/patient/mindful/soundscapes`, {
        params: { page, per_page: perPage }
      });
      return response.data.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosLikeError;
      if (axiosError.response?.status === 429 && axiosError.response?.data?.upsell) {
        throw {
          response: {
            status: 429,
            data: axiosError.response?.data
          }
        };
      }
      throw error;
    }
  },

  async startSession(resourceId: string | number): Promise<StartSessionResponse> {
    try {
      const response = await client.post(`/api/v1/patient/mindful/sessions/start`, {
        resource_id: resourceId
      });
      return response.data.data ?? response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosLikeError;
      if (axiosError.response?.status === 429 && axiosError.response?.data?.upsell) {
        throw {
          response: {
            status: 429,
            data: axiosError.response?.data
          }
        };
      }
      throw error;
    }
  }
};