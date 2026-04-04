"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Stethoscope,
  Building2,
  ArrowRight,
  ShieldCheck,
  Brain,
  Users,
  BarChart3,
} from "lucide-react";

export default function Home() {
  const [officeClickCount, setOfficeClickCount] = useState(0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background/95 backdrop-blur-sm px-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold" style={{ color: "var(--teal)" }}>
            OnWynd
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="#for-therapists" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            For Therapists
          </Link>
          <Link href="#for-corporates" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            For Corporates
          </Link>
          <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Log In
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" style={{ backgroundColor: "var(--teal)" }} className="text-white hover:opacity-90">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="w-full py-16 md:py-24 lg:py-32" style={{ background: "var(--teal-light)" }}>
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            <div className="flex flex-col items-center space-y-6 text-center">
              <Badge
                variant="secondary"
                className="px-3 py-1 text-xs font-medium"
                style={{ backgroundColor: "var(--amber-light)", color: "var(--amber-warm)" }}
              >
                Mental Health, Reimagined
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl" style={{ color: "var(--navy)" }}>
                Comprehensive Care for
                <br />
                <span style={{ color: "var(--teal)" }}>Mind & Wellbeing</span>
              </h1>
              <p className="mx-auto max-w-[680px] text-muted-foreground md:text-lg leading-relaxed">
                OnWynd connects licensed therapists and organisations on a single hybrid platform — delivering measurable mental health outcomes at scale.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link href="/login">
                  <Button size="lg" style={{ backgroundColor: "var(--teal)" }} className="text-white hover:opacity-90 gap-2">
                    Access Dashboard <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="gap-2">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Portal Login Cards ─────────────────────────────────────── */}
        <section className="w-full py-16 md:py-24" id="portals">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold md:text-3xl mb-3" style={{ color: "var(--navy)" }}>
                Choose Your Portal
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Access the platform designed for your role — each experience is tailored to your needs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* ── Therapist Card ── */}
              <Card
                id="for-therapists"
                className="relative border shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="absolute top-3 right-3">
                  <Badge
                    className="text-xs"
                    style={{ backgroundColor: "var(--amber-light)", color: "var(--amber-warm)" }}
                  >
                    Providers
                  </Badge>
                </div>
                <CardHeader className="pb-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: "var(--amber-light)" }}
                  >
                    <Stethoscope className="h-5 w-5" style={{ color: "var(--amber-warm)" }} />
                  </div>
                  <CardTitle className="text-lg">Therapist</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    Manage your caseload, conduct virtual sessions, review assessments, and grow your practice.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Users className="h-4 w-4 shrink-0" style={{ color: "var(--amber-warm)" }} />
                      Client management
                    </li>
                    <li className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 shrink-0" style={{ color: "var(--amber-warm)" }} />
                      Session scheduling
                    </li>
                    <li className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 shrink-0" style={{ color: "var(--amber-warm)" }} />
                      Clinical notes & reports
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <Link href="/login" className="w-full">
                    <Button
                      className="w-full gap-2"
                      style={{ backgroundColor: "var(--amber-warm)", color: "#fff" }}
                    >
                      Therapist Login <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/therapist-signup" className="w-full">
                    <Button variant="ghost" className="w-full text-sm" size="sm">
                      Join as therapist
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* ── Institutional / Corporate Card ── */}
              <Card
                id="for-corporates"
                className="relative border shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <CardHeader className="pb-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: "#EEF2FF" }}
                  >
                    <Building2 className="h-5 w-5" style={{ color: "#4F46E5" }} />
                  </div>
                  <CardTitle className="text-lg">Institutional / Corporate</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    Deliver employee wellness programmes, track workforce mental health KPIs, and manage organisational benefits.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Users className="h-4 w-4 shrink-0" style={{ color: "#4F46E5" }} />
                      Employee management
                    </li>
                    <li className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 shrink-0" style={{ color: "#4F46E5" }} />
                      Wellness analytics
                    </li>
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 shrink-0" style={{ color: "#4F46E5" }} />
                      Compliance & reporting
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <Link href="/login" className="w-full">
                    <Button
                      className="w-full gap-2 text-white"
                      style={{ backgroundColor: "#4F46E5" }}
                    >
                      Corporate Login <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/institutional-signup" className="w-full">
                    <Button variant="ghost" className="w-full text-sm" size="sm">
                      Register your organisation
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* ── Features ──────────────────────────────────────────────── */}
        <section id="features" className="w-full py-16 md:py-24" style={{ backgroundColor: "var(--teal-light)" }}>
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold md:text-3xl mb-3" style={{ color: "var(--navy)" }}>
                Why OnWynd?
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                A fully integrated platform for every step of the mental health journey.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[
                {
                  icon: <Brain className="h-6 w-6" style={{ color: "var(--teal)" }} />,
                  title: "AI-Powered Insights",
                  desc: "Personalised wellness recommendations driven by evidence-based models.",
                },
                {
                  icon: <ShieldCheck className="h-6 w-6" style={{ color: "var(--teal)" }} />,
                  title: "HIPAA Compliant",
                  desc: "End-to-end encryption and strict data privacy across all user interactions.",
                },
                {
                  icon: <Users className="h-6 w-6" style={{ color: "var(--teal)" }} />,
                  title: "Expert Network",
                  desc: "Access licensed, vetted therapists across specialisms and modalities.",
                },
                {
                  icon: <BarChart3 className="h-6 w-6" style={{ color: "var(--teal)" }} />,
                  title: "Measurable Outcomes",
                  desc: "Track progress with validated clinical assessments and outcome metrics.",
                },
              ].map((f) => (
                <div key={f.title} className="bg-background rounded-xl p-5 border">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: "var(--teal-light)" }}
                  >
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-sm mb-1" style={{ color: "var(--navy)" }}>
                    {f.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t py-8 px-4 md:px-6">
        <div className="container mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xl font-bold" style={{ color: "var(--teal)" }}>
            OnWynd
          </span>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} OnWynd. All rights reserved.
          </p>
          <nav className="flex gap-5 items-center">
            <Link className="text-xs text-muted-foreground hover:text-foreground transition-colors" href="#">
              Terms
            </Link>
            <Link className="text-xs text-muted-foreground hover:text-foreground transition-colors" href="#">
              Privacy
            </Link>
            <Link className="text-xs text-muted-foreground hover:text-foreground transition-colors" href="#">
              Contact
            </Link>
            {/* Onwynd Office — hidden, revealed on hover for internal staff only */}
            <Link
              href="/login"
              aria-label="Office"
              title="Onwynd Office"
              className="text-[10px] text-transparent hover:text-muted-foreground/40 transition-colors duration-300 select-none"
              tabIndex={-1}
            >
              ·
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

// local Calendar icon
function CalendarIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}
