import client from "@/lib/api/client";

export type AudienceType = "staff" | "therapists" | "customers" | "investors";

export type MarketingStat = {
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease" | "neutral";
  iconName: string;
  description: string;
};

export type MarketingChartData = {
  date: string;
  facebook: number;
  google: number;
  linkedin: number;
};

export type LeadSource = {
  name: string;
  value: number;
  color: string;
};

export type Campaign = {
  id: number;
  name: string;
  type: string;
  status: "active" | "paused" | "completed" | "draft";
  budget: number;
  start_date: string;
  end_date: string | null;
  created_at: string;
  metrics?: {
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
  };
};

export type Lead = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  company: string | null;
  status: "new" | "contacted" | "qualified" | "lost";
  source: string | null;
  assigned_to: number | null;
  created_at: string;
};

type ApiSuccess<T> = { success: boolean; data: T };
type ApiSuccessPaginated<T> = { success: boolean; data: { data: T[] } };
type ListResponse<T> = ApiSuccess<T[]> | ApiSuccessPaginated<T>;

export async function sendBroadcast(payload: {
  subject: string;
  html: string;
  audience: AudienceType[];
  event_id?: number;
}): Promise<{ success: boolean; data: { sent: number } }> {
  const res = await client.post("/api/v1/marketing/broadcast/send", payload);
  return res.data;
}

export async function previewBroadcast(payload: {
  audience: AudienceType[];
}): Promise<{ success: boolean; data: { count: number } }> {
  const res = await client.post("/api/v1/marketing/broadcast/preview", payload);
  return res.data;
}

export type AmbassadorIndividualTier = {
  tier: string;
  amount: number;
  description: string;
};

export type AmbassadorB2BDeal = {
  title: string;
  seats: string;
  amount: number;
  recurring: string;
};

export type AmbassadorCap = {
  title: string;
  value: string;
  desc: string;
  note: string;
};

export type AmbassadorSettings = {
  currency: "NGN" | "USD";
  individual: AmbassadorIndividualTier[];
  b2b: AmbassadorB2BDeal[];
  caps?: AmbassadorCap[];
};

export async function getAmbassadorSettings(): Promise<{
  success: boolean;
  data: AmbassadorSettings;
}> {
  const res = await client.get("/api/v1/marketing/ambassador-settings");
  return res.data;
}

export async function upsertAmbassadorSettings(payload: AmbassadorSettings) {
  const res = await client.post("/api/v1/marketing/ambassador-settings", payload);
  return res.data as { success: boolean; data: AmbassadorSettings };
}

export type MarketingEvent = {
  id: number;
  name: string;
  event_date: string;
  audience: AudienceType[] | null;
  description?: string | null;
  template_html?: string | null;
  active: boolean;
};

export async function listEvents(): Promise<{ success: boolean; data: MarketingEvent[] }> {
  const res = await client.get("/api/v1/marketing/events/");
  return res.data;
}

export async function createEvent(payload: Partial<MarketingEvent>): Promise<{ success: boolean; data: MarketingEvent }> {
  const res = await client.post("/api/v1/marketing/events/", payload);
  return res.data;
}

export async function updateEvent(id: number, payload: Partial<MarketingEvent>): Promise<{ success: boolean; data: MarketingEvent }> {
  const res = await client.put(`/api/v1/marketing/events/${id}`, payload);
  return res.data;
}

export async function deleteEvent(id: number): Promise<{ success: boolean; data: { deleted: boolean } }> {
  const res = await client.delete(`/api/v1/marketing/events/${id}`);
  return res.data;
}

export async function getStats(): Promise<ApiSuccess<MarketingStat[]>> {
  const res = await client.get("/api/v1/marketing/analytics");
  return res.data as ApiSuccess<MarketingStat[]>;
}

export async function getChartData(period: string): Promise<ApiSuccess<MarketingChartData[]>> {
  const res = await client.get("/api/v1/marketing/chart", { params: { period } });
  return res.data as ApiSuccess<MarketingChartData[]>;
}

export async function getLeadSources(period: string): Promise<ApiSuccess<LeadSource[]>> {
  const res = await client.get("/api/v1/marketing/lead-sources", { params: { period } });
  return res.data as ApiSuccess<LeadSource[]>;
}

export async function getCampaigns(params?: Record<string, unknown>): Promise<ApiSuccess<Campaign[]>> {
  const res = await client.get("/api/v1/marketing/campaigns", { params });
  const payload = res.data as ListResponse<Campaign>;
  const campaigns = (payload as ApiSuccessPaginated<Campaign>)?.data?.data || (payload as ApiSuccess<Campaign[]>)?.data || [];
  return { success: true, data: campaigns };
}

export async function createCampaign(payload: Partial<{ name: string; type: string; status: string; budget: number; start_date?: string | null; end_date?: string | null }>): Promise<ApiSuccess<Campaign>> {
  const res = await client.post("/api/v1/marketing/campaigns", payload);
  return res.data as ApiSuccess<Campaign>;
}

export async function updateCampaign(id: number, payload: Partial<{ name: string; type: string; status: string; budget: number; start_date?: string | null; end_date?: string | null }>): Promise<ApiSuccess<Campaign>> {
  const res = await client.put(`/api/v1/marketing/campaigns/${id}`, payload);
  return res.data as ApiSuccess<Campaign>;
}

export async function deleteCampaign(id: number): Promise<ApiSuccess<{ deleted: boolean }>> {
  const res = await client.delete(`/api/v1/marketing/campaigns/${id}`);
  return res.data as ApiSuccess<{ deleted: boolean }>;
}

export async function getLeads(params?: Record<string, unknown>): Promise<ApiSuccess<Lead[]>> {
  const res = await client.get("/api/v1/marketing/leads", { params });
  const payload = res.data as ListResponse<Lead>;
  const leads = (payload as ApiSuccessPaginated<Lead>)?.data?.data || (payload as ApiSuccess<Lead[]>)?.data || [];
  return { success: true, data: leads };
}

export async function createLead(payload: Partial<{ first_name: string; last_name: string; email: string; company?: string | null; status?: string; source?: string | null; assigned_to?: number | null }>): Promise<ApiSuccess<Lead>> {
  const res = await client.post("/api/v1/marketing/leads", payload);
  return res.data as ApiSuccess<Lead>;
}

export async function updateLead(id: number, payload: Partial<{ first_name: string; last_name: string; email: string; company?: string | null; status?: string; source?: string | null; assigned_to?: number | null }>): Promise<ApiSuccess<Lead>> {
  const res = await client.put(`/api/v1/marketing/leads/${id}`, payload);
  return res.data as ApiSuccess<Lead>;
}

export async function deleteLead(id: number): Promise<ApiSuccess<{ deleted: boolean }>> {
  const res = await client.delete(`/api/v1/marketing/leads/${id}`);
  return res.data as ApiSuccess<{ deleted: boolean }>;
}

export const marketingService = {
  // Ambassador settings
  getAmbassadorSettings,
  upsertAmbassadorSettings,
  // Broadcast and events
  sendBroadcast,
  previewBroadcast,
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  // Analytics
  getStats,
  getChartData,
  getLeadSources,
  getCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getLeads,
  createLead,
  updateLead,
  deleteLead,
};
