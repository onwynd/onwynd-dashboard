import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "NGO Portal" };

export default function NgoIndexPage() {
  redirect("/ngo/dashboard");
}
