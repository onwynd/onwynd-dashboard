import { DollarSign, TrendingUp, CreditCard, Activity } from "lucide-react";

export const financeStats = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    change: "+20.1%",
    changeType: "increase",
    icon: DollarSign,
    description: "from last month",
  },
  {
    title: "Net Profit",
    value: "$12,234.00",
    change: "+10.5%",
    changeType: "increase",
    icon: TrendingUp,
    description: "from last month",
  },
  {
    title: "Pending Invoices",
    value: "$2,345.00",
    change: "-5.2%",
    changeType: "decrease",
    icon: CreditCard,
    description: "from last month",
  },
  {
    title: "Expenses",
    value: "$8,997.89",
    change: "+4.3%",
    changeType: "increase",
    icon: Activity,
    description: "from last month",
  },
];
