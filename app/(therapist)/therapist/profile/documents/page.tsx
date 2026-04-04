"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// The rejection email links to /therapist/profile/documents — redirect to the unified profile page
export default function DocumentsPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/therapist/profile"); }, [router]);
  return null;
}
