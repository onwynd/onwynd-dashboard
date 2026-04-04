import type { Metadata } from "next";
import { FinancialStatements } from "@/components/shared/financial-statements";

export const metadata: Metadata = { title: "Financial Statements" };

export default function AdminFinanceStatementsPage() {
  return <FinancialStatements />;
}
