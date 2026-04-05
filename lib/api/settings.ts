import  client  from './client';

export interface AppSettings {
  general: {
    siteName: string;
    supportEmail: string;
    maintenanceMode: boolean;
    baseCurrency: string;
  };
  navigation?: {
    disabled_routes: Record<string, string[]>;
  };
  financial?: {
    commission_rate: number;        // percentage e.g. 20 = 20%
    platform_booking_fee: number;   // flat fee in base currency
    minimum_payout_amount: number;  // minimum therapist payout
    vat_rate: number;               // VAT % applied to (session fee + platform fee), 0 = exempt
  };
  currency?: {
    default_currency: string;
    exchange_rate_eur: string;
    exchange_rate_gbp: string;
  };
  ai: {
    openaiKey: string;
    anthropicKey: string;
    model: string;
    temperature: number;
    isLive: boolean;
    deepseekKey?: string;
    groqKey?: string;
  };
  features: {
    eprescriptions: boolean;
    secure_documents: boolean;
    ai_chat: boolean;
    video_calls: boolean;
    gamification: boolean;
    klump_gateway?: boolean;
    ai_companion_hard_limit_windows?: boolean;
    ai_companion_hard_limit_duration?: number;
    [key: string]: boolean | number | string | undefined;
  };
  security: {
    passwordPolicy: string;
    mfaEnabled: boolean;
    sessionTimeout: number;
    require_2fa?: boolean | string;
    password_expiry_days?: string;
    max_login_attempts?: string;
    session_timeout_minutes?: string;
  };
  env: {
    paystackPublicKey: string;
    paystackSecretKey: string;
    flutterwavePublicKey: string;
    flutterwaveSecretKey: string;
    stripePublicKey: string;
    stripeSecretKey: string;
    klumpPublicKey: string;
    klumpSecretKey: string;
    sentryDsn: string;
  };
  branding?: {
    theme: string;
    font: string;
    web_colors?: {
      forest?: string; healing?: string; breath?: string; pale?: string;
      clay?: string; warm_clay?: string; bone?: string; ink?: string;
    };
  };
  mail?: {
    mail_provider: 'zoho_imap' | 'gmail' | 'aapanel';
    mail_imap_host?: string;
    mail_imap_port?: number;
    mail_imap_username?: string;
    mail_imap_password?: string;
    mail_google_client_id?: string;
    mail_google_client_secret?: string;
    mail_google_refresh_token?: string;
    mail_google_account?: string;
    mail_aapanel_host?: string;
    mail_aapanel_port?: number;
    mail_aapanel_username?: string;
    mail_aapanel_password?: string;
  };
  gateways?: Record<string, boolean | string>; // {name}_enabled, {name}_mode, {name}_{mode}_{public|secret}_key
}

/**
 * Canonical SubscriptionPlan interface — matches what the backend SubscriptionPlanController
 * actually returns (both d2c and b2b plans). All currency/interval fields are present.
 */
export interface SubscriptionPlan {
  id: string | number;
  uuid?: string;
  name: string;
  slug?: string;
  description?: string;
  plan_type?: 'd2c' | 'b2b_corporate' | 'b2b_university' | 'b2b_faith_ngo' | string;
  /** Generic price in base currency (legacy alias) */
  price?: number;
  /** Naira price */
  price_ngn?: number;
  /** USD price */
  price_usd?: number;
  setup_fee_ngn?: number;
  setup_fee_usd?: number;
  currency?: string;
  /** Billing interval — use this as the canonical field name */
  billing_interval: 'monthly' | 'quarterly' | 'yearly' | 'one_time';
  /** Legacy alias for billing_interval — some pages may return this from older API calls */
  interval?: string;
  features?: string[] | Record<string, unknown> | null;
  max_sessions?: number;
  trial_days?: number;
  is_active: boolean;
  is_popular?: boolean;
  is_recommended?: boolean;
  best_for?: string;
  sort_order?: number;
  daily_activity_limit?: number | null;
  ai_message_limit?: number | null;
  total_subscribers?: number;
  active_subscribers?: number;
}

export interface QuotaDefaults {
  free_daily_activities: number;
  free_ai_messages: number;
  /** Messages allowed for users within their first new_user_days */
  new_user_ai_messages: number;
  /** How many days a user is considered "new" */
  new_user_days: number;
  /** Extra messages granted when high-distress signals are detected */
  distress_extension_messages: number;
  /** Hard cap applied when abuse/spam patterns are detected */
  abuse_cap_messages: number;
  /** Default grace period (days) for corporate/institutional orgs after subscription expiry */
  corporate_grace_period_days?: number;
}

export interface QuotaOverview {
  global_defaults: QuotaDefaults;
  plans: Array<{
    id: string | number;
    name: string;
    slug?: string;
    billing_interval?: string;
    // features shape can vary; we treat it as unknown map
    features?: Record<string, unknown> | string[] | null;
  }>;
  stats: {
    ai_429_today?: number;
    ai_messages_today?: number;
    activities_today?: number;
  };
}

export interface DeviceFingerprintEntry {
  user_id: number;
  name: string;
  email: string;
  role?: string | null;
  device_count: number;
  fingerprints: string[];
  last_seen_at?: string | null;
  online: boolean;
}

export interface DeviceFingerprintResponse {
  devices: DeviceFingerprintEntry[];
  summary: {
    total_users: number;
    multi_device_users: number;
  };
}

type PlanCreatePayload = Omit<SubscriptionPlan, 'id'> & {
  daily_activity_limit?: number | null;
  ai_message_limit?: number | null;
};

type PlanUpdatePayload = Partial<SubscriptionPlan> & {
  daily_activity_limit?: number | null;
  ai_message_limit?: number | null;
};

export const settingsService = {
  async getSettings() {
    const response = await client.get('/api/v1/admin/settings');
    return response.data.data ?? response.data;
  },

  async getPlatformBranding(): Promise<{ theme: string; font: string }> {
    const response = await client.get('/api/v1/admin/platform/branding', { suppressErrorToast: true });
    return response.data.data ?? response.data;
  },

  async updateSettings(section: keyof AppSettings, data: unknown) {
    const response = await client.put(`/api/v1/admin/settings/${section}`, data);
    return response.data.data ?? response.data;
  },

  async getSubscriptionPlans() {
    const response = await client.get('/api/v1/admin/subscription-plans');
    return response.data.data ?? response.data;
  },

  async createSubscriptionPlan(data: PlanCreatePayload) {
    const response = await client.post('/api/v1/admin/subscription-plans', data);
    return response.data.data ?? response.data;
  },

  async updateSubscriptionPlan(id: string, data: PlanUpdatePayload) {
    const response = await client.put(`/api/v1/admin/subscription-plans/${id}`, data);
    return response.data.data ?? response.data;
  },

  async deleteSubscriptionPlan(id: string) {
    const response = await client.delete(`/api/v1/admin/subscription-plans/${id}`);
    return response.data.data ?? response.data;
  },

  async getQuotaDefaults(): Promise<QuotaDefaults> {
    const response = await client.get('/api/v1/admin/quota-settings');
    return response.data.data;
  },

  async updateQuotaDefaults(payload: QuotaDefaults): Promise<QuotaDefaults> {
    const response = await client.put('/api/v1/admin/quota-settings', payload);
    return response.data.data;
  },

  async getQuotaOverview(): Promise<QuotaOverview> {
    const response = await client.get('/api/v1/admin/quota/overview');
    return response.data.data;
  },

  async getDeviceFingerprints(): Promise<DeviceFingerprintResponse> {
    const response = await client.get('/api/v1/admin/security/devices');
    return response.data.data ?? response.data;
  },
};
