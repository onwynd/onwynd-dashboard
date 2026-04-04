export interface Campaign {
  id: string;
  name: string;
  status: "active" | "paused" | "completed" | "draft";
  platform: "facebook" | "google" | "linkedin" | "twitter" | "email";
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  startDate: string;
  endDate?: string;
}

export const marketingCampaigns: Campaign[] = [
  {
    id: "CMP-101",
    name: "Summer Wellness Promo",
    status: "active",
    platform: "facebook",
    spend: 1250.00,
    impressions: 45000,
    clicks: 1200,
    conversions: 85,
    startDate: "2024-03-01T00:00:00Z",
  },
  {
    id: "CMP-102",
    name: "Corporate Mental Health",
    status: "active",
    platform: "linkedin",
    spend: 3400.00,
    impressions: 12000,
    clicks: 450,
    conversions: 22,
    startDate: "2024-02-15T00:00:00Z",
  },
  {
    id: "CMP-103",
    name: "Search - Therapy Keywords",
    status: "active",
    platform: "google",
    spend: 2100.00,
    impressions: 28000,
    clicks: 3100,
    conversions: 145,
    startDate: "2024-01-10T00:00:00Z",
  },
  {
    id: "CMP-104",
    name: "Newsletter - March",
    status: "completed",
    platform: "email",
    spend: 150.00,
    impressions: 15000,
    clicks: 2800,
    conversions: 110,
    startDate: "2024-03-05T00:00:00Z",
    endDate: "2024-03-07T00:00:00Z",
  },
];
