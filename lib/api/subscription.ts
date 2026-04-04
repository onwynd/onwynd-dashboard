import client from './client';
// Re-export canonical type so all pages import from one place
export type { SubscriptionPlan } from './settings';

export interface Subscription {
  id: string | number;
  plan_id: string | number;
  plan?: { name: string; slug?: string };
  status: 'active' | 'cancelled' | 'expired' | 'pending' | 'trialing';
  start_date: string;
  end_date?: string;
  next_billing_date?: string;
  cancelled_at?: string;
}

export const subscriptionService = {
  async getPlans() {
    const response = await client.get('/api/v1/subscriptions/plans');
    return response.data.data ?? response.data;
  },

  async getCurrentSubscription() {
    const response = await client.get('/api/v1/subscriptions/current');
    return response.data.data ?? response.data;
  },

  async subscribe(planId: string | number) {
    const response = await client.post('/api/v1/subscriptions/subscribe', { plan_id: planId });
    return response.data.data ?? response.data;
  },

  async cancelSubscription() {
    const response = await client.post('/api/v1/subscriptions/cancel');
    return response.data.data ?? response.data;
  },

  async resumeSubscription() {
    const response = await client.post('/api/v1/subscriptions/resume');
    return response.data.data ?? response.data;
  },

  async changePlan(planId: string | number) {
    const response = await client.post('/api/v1/subscriptions/change-plan', { plan_id: planId });
    return response.data.data ?? response.data;
  },

  async getPayments() {
    const response = await client.get('/api/v1/subscriptions/payments');
    return response.data.data ?? response.data;
  },
};
