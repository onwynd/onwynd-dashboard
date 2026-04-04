import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { template: "%s | Onwynd", default: "Create Account — Onwynd" },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  // Full-screen signup pages — no padding/max-width wrapper
  return <>{children}</>;
}
