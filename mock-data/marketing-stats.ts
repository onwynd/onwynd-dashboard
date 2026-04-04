import { Share2, Users, TrendingUp, MousePointer } from "lucide-react";

export const marketingStats = [
  {
    title: "Total Reach",
    value: "2.4M",
    change: "+12.5%",
    changeType: "increase",
    icon: Share2,
    description: "Impressions across channels",
  },
  {
    title: "New Leads",
    value: "8,432",
    change: "+18.2%",
    changeType: "increase",
    icon: Users,
    description: "Signups from campaigns",
  },
  {
    title: "Conversion Rate",
    value: "3.2%",
    change: "-0.4%",
    changeType: "decrease",
    icon: TrendingUp,
    description: "Visitor to lead conversion",
  },
  {
    title: "Click Through Rate",
    value: "4.8%",
    change: "+1.2%",
    changeType: "increase",
    icon: MousePointer,
    description: "Average ad CTR",
  },
];
