export interface StatCard {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: "dollar-sign" | "briefcase" | "trending-up" | "percent";
}

export const salesStats: StatCard[] = [
  {
    id: "1",
    title: "Total Revenue",
    value: "$124,500",
    change: "+15.2%",
    isPositive: true,
    icon: "dollar-sign",
  },
  {
    id: "2",
    title: "New Deals",
    value: "45",
    change: "+8%",
    isPositive: true,
    icon: "briefcase",
  },
  {
    id: "3",
    title: "Pipeline Value",
    value: "$1.2M",
    change: "+24%",
    isPositive: true,
    icon: "trending-up",
  },
  {
    id: "4",
    title: "Win Rate",
    value: "42%",
    change: "+2.5%",
    isPositive: true,
    icon: "percent",
  },
];
