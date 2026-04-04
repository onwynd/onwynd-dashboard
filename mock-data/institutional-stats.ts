export type InstitutionalStat = {
  id: string;
  title: string;
  value: string;
  icon: string;
};

export const institutionalStats: InstitutionalStat[] = [
  {
    id: "1",
    title: "Total Referrals",
    value: "156",
    icon: "users",
  },
  {
    id: "2",
    title: "Active Patients",
    value: "89",
    icon: "activity",
  },
  {
    id: "3",
    title: "Revenue Share",
    value: "$12,450",
    icon: "wallet",
  },
  {
    id: "4",
    title: "Pending Approvals",
    value: "12",
    icon: "clock",
  },
];
