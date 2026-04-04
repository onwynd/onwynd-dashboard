import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "University Portal" };

export default function UniversityIndexPage() {
  redirect("/university/dashboard");
}
