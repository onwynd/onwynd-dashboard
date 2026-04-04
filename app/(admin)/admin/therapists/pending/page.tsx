"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PendingTherapistsPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/admin/therapists"); }, [router]);
  return null;
}
