import client from './client';
import type { AxiosRequestConfig } from 'axios';
import { getApiPrefixForRole } from '@/lib/auth/role-routing';

type ApiRequestConfig = AxiosRequestConfig & {
  suppressErrorToast?: boolean;
};

function isAxiosErrorLike(err: unknown): err is { response?: { status?: number } } {
  return typeof err === 'object' && err !== null && 'response' in (err as Record<string, unknown>);
}

export const dashboardService = {
  async getStats() {
    const prefix = this._getPrefix();
    try {
      const response = await client.get(`/api/v1${prefix}/dashboard`);
      const data = response.data.data;
      
      return [
        {
          id: 'wellness',
          title: 'Wellness Score',
          value: data.wellness?.wellness_score || '0',
          change: '0%', 
          trend: 'neutral' as const,
          iconName: 'activity'
        },
        {
          id: 'streak',
          title: 'Day Streak',
          value: data.engagement?.current_streak || '0',
          change: '0',
          trend: 'neutral' as const,
          iconName: 'flame'
        },
        {
          id: 'sessions',
          title: 'Sessions Done',
          value: data.therapy?.sessions_completed || '0',
          change: '+0',
          trend: 'neutral' as const,
          iconName: 'users'
        },
        {
          id: 'mood',
          title: 'Current Mood',
          value: data.wellness?.current_mood || 'Neutral',
          change: '',
          trend: 'neutral' as const,
          iconName: 'smile'
        }
      ];
    } catch (e) {
      console.error(e);
      // try patient route as fallback if we weren't already using it
      if (prefix !== '/patient') {
        try {
          const response2 = await client.get(`/api/v1/patient/dashboard`, {
            suppressErrorToast: true,
          });
          const data2 = response2.data.data;
          return [
            {
              id: 'wellness',
              title: 'Wellness Score',
              value: data2.wellness?.wellness_score || '0',
              change: '0%', 
              trend: 'neutral' as const,
              iconName: 'activity'
            },
            {
              id: 'streak',
              title: 'Day Streak',
              value: data2.engagement?.current_streak || '0',
              change: '0',
              trend: 'neutral' as const,
              iconName: 'flame'
            },
            {
              id: 'sessions',
              title: 'Sessions Done',
              value: data2.therapy?.sessions_completed || '0',
              change: '+0',
              trend: 'neutral' as const,
              iconName: 'users'
            },
            {
              id: 'mood',
              title: 'Current Mood',
              value: data2.wellness?.current_mood || 'Neutral',
              change: '',
              trend: 'neutral' as const,
              iconName: 'smile'
            }
          ];
        } catch (e2) {
          console.error('fallback to patient failed', e2);
        }
      }
      return [];
    }
  },

  async getChartData(period: string) {
    const prefix = this._getPrefix();
    try {
        const response = await client.get(`/api/v1${prefix}/dashboard?period=${period}`);
        const historyRaw = response.data?.data?.history as unknown;
        const history = Array.isArray(historyRaw) ? historyRaw : [];
        return history.map((h) => {
            const item = h as { date?: string | number | Date; value?: number };
            const name = item.date ? new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }) : '';
            const value = typeof item.value === 'number' ? item.value : 0;
            return { name, value };
        }).reverse();
    } catch (e) {
        // ignore server 500 errors silently
        if (!isAxiosErrorLike(e) || e.response?.status !== 500) {
          console.error(e);
        }
        if (prefix !== '/patient') {
            try {
                const resp2 = await client.get(`/api/v1/patient/dashboard?period=${period}`, {
                    suppressErrorToast: true,
                });
                const historyRaw = resp2.data?.data?.history as unknown;
                const history = Array.isArray(historyRaw) ? historyRaw : [];
                return history.map((h) => {
                    const item = h as { date?: string | number | Date; value?: number };
                    const name = item.date ? new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }) : '';
                    const value = typeof item.value === 'number' ? item.value : 0;
                    return { name, value };
                }).reverse();
            } catch (e2) {
                console.error('fallback chart data failed', e2);
            }
        }
        return [];
    }
  },

  // helper to derive prefix based on user_role cookie; falls back to patient
  _getPrefix() {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/(?:^|; )user_role=([^;]+)/);
      const role = match?.[1];
      return getApiPrefixForRole(role);
    }
    return '/patient';
  },

  async getPeople(params?: Record<string, unknown>) {
    try {
      const prefix = this._getPrefix();
      const config: ApiRequestConfig = { params };
      if (prefix === '/patient') {
        // expected to not exist for patient role, don't toast
        config.suppressErrorToast = true;
      }
      const response = await client.get(`/api/v1${prefix}/people`, config);
      return response.data;
    } catch {
      return [];
    }
  },

  async getDocuments(params?: Record<string, unknown>) {
    try {
      const prefix = this._getPrefix();
      const config: ApiRequestConfig = { params };
      if (prefix === '/patient') {
        config.suppressErrorToast = true;
      }
      const response = await client.get(`/api/v1${prefix}/documents`, config);
      return response.data;
    } catch {
      return [];
    }
  },

  getRevenueFlow: async (period: string) => {
    try {
      const response = await client.get(`/api/v1/admin/dashboard/revenue-flow`, { params: { period } });
      return response.data;
    } catch {
      return [];
    }
  },

  getLeadSources: async (period: string) => {
    try {
      const response = await client.get(`/api/v1/admin/dashboard/lead-sources`, { params: { period } });
      return response.data;
    } catch {
      return [];
    }
  }
};
