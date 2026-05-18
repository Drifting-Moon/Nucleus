"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  CheckCircle2,
  ShieldCheck,
  Users,
  Award,
  Calendar,
  LineChart,
  AlertTriangle,
  FileSpreadsheet,
  ArrowRight,
  Database,
  Mail,
  Lock,
  Check,
  Copy,
  ExternalLink,
  Laptop,
  Terminal,
} from "lucide-react";

export default function MarketingLandingPage() {
  const [copiedRole, setCopiedRole] = useState<string | null>(null);

  const handleCopyCredentials = (email: string, role: string) => {
    navigator.clipboard.writeText(email);
    setCopiedRole(role);
    toast.success(`Copied ${role} email to clipboard!`, {
      description: email,
    });
    setTimeout(() => setCopiedRole(null), 2000);
  };

  const credentials = [
    {
      role: "Admin",
      name: "Test Admin",
      email: "admin@test.com",
      password: "password123",
      badgeColor: "bg-red-500/10 text-red-400 border-red-500/20",
    },
    {
      role: "Manager",
      name: "Test Manager",
      email: "manager@test.com",
      password: "password123",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    {
      role: "Employee",
      name: "Test Employee",
      email: "employee@test.com",
      password: "password123",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
  ];

  const capabilities = [
    {
      num: "01",
      title: "Goal sheet engine",
      description: "Employees draft up to 8 goals with enforced weightage rules. Once submitted, the sheet is handed off — no edits until the manager acts.",
      icon: Lock,
    },
    {
      num: "02",
      title: "Manager review queue",
      description: "Pending submissions surface automatically. Managers edit targets inline, reject with a note, or approve and lock in one click.",
      icon: ShieldCheck,
    },
    {
      num: "03",
      title: "Top-down KPI cascade",
      description: "HR pushes a single departmental KPI to fifty employees at once. Recipients own their weightage. The title and target stay untouched.",
      icon: Users,
    },
    {
      num: "04",
      title: "Four ways to measure success",
      description: "Revenue targets score differently than safety incidents. Nucleus applies the right formula automatically — higher-is-better, lower-is-better, date-based, or zero-only.",
      icon: Award,
    },
    {
      num: "05",
      title: "Window-locked progress capture",
      description: "Check-in forms only open when Admin sets the window. Outside the window, the form doesn't exist. No workarounds, no late entries.",
      icon: Calendar,
    },
    {
      num: "06",
      title: "Org-wide performance lens",
      description: "Quarter-on-quarter score trends, thrust area distribution, manager review rates, and completion heatmaps. All live from the same database employees write to.",
      icon: LineChart,
    },
    {
      num: "07",
      title: "Nobody falls through the cracks",
      description: "Set a threshold. If an employee hasn't submitted by day N, the system notifies them. If still pending, it escalates to their manager. Then HR. Automatic. Logged.",
      icon: AlertTriangle,
    },
    {
      num: "08",
      title: "Every change, signed and timestamped",
      description: "Admin unlocks a goal to fix a target. That change is logged — who, what field, old value, new value, exactly when. Exportable. Defensible.",
      icon: FileSpreadsheet,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#8A8A8A] font-sans selection:bg-[#4A6FA5]/30 selection:text-white antialiased">
      {/* Editorial Google Fonts */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap");
        .font-serif-premium {
          font-family: "Playfair Display", Georgia, serif;
        }
        .font-sans-premium {
          font-family: "Inter", system-ui, sans-serif;
        }
      `}</style>

      {/* FIXED NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#0F0F0F]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 md:py-4">
          <Link href="/" className="flex flex-col select-none group">
            <span className="font-sans-premium text-base font-bold tracking-tight text-[#F5F0E8] transition group-hover:text-white">
              N · Nucleus
            </span>
            <span className="text-[9px] font-sans-premium font-semibold tracking-widest text-[#4A6FA5] uppercase -mt-0.5">
              GOAL PORTAL
            </span>
          </Link>

          <div className="hidden items-center gap-8 font-sans-premium text-xs font-medium tracking-wide md:flex">
            <a href="#features" className="text-[#8A8A8A] hover:text-[#F5F0E8] transition">
              Features
            </a>
            <a href="#architecture" className="text-[#8A8A8A] hover:text-[#F5F0E8] transition">
              Architecture
            </a>
            <a href="#brd" className="text-[#8A8A8A] hover:text-[#F5F0E8] transition">
              BRD Coverage
            </a>
            <a
              href="https://github.com/Drifting-Moon/Nucleus"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[#8A8A8A] hover:text-[#F5F0E8] transition"
            >
              GitHub <ExternalLink className="size-3 opacity-60" />
            </a>
          </div>

          <Link
            href="/login"
            className="flex items-center gap-1.5 rounded bg-[#4A6FA5] hover:bg-[#3D5C8A] px-4 py-2 font-sans-premium text-xs font-semibold tracking-wide text-white transition active:scale-[0.98]"
          >
            Sign In <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative flex min-h-screen items-center justify-center pt-24 pb-16 overflow-hidden">
        {/* Subtle Radial Slate Glow */}
        <div className="absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#4A6FA5]/8 opacity-70 blur-[140px] pointer-events-none" />

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-12 items-center">
          {/* Left HTML/CSS Mockup Frame */}
          <div className="lg:col-span-6 w-full flex justify-center">
            <div className="w-full max-w-lg rounded-lg border border-white/[0.08] bg-[#161616] shadow-2xl overflow-hidden font-sans-premium">
              {/* Chrome Top Bar */}
              <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#1C1C1C] px-4 py-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
                </div>
                <div className="flex h-5 w-60 items-center justify-center rounded bg-[#0F0F0F]/60 text-[9px] font-medium tracking-wide text-white/40 border border-white/[0.03]">
                  nucleus.vercel.app/employee
                </div>
                <div className="w-8" />
              </div>

              {/* Inside Dashboard Mockup */}
              <div className="p-5 space-y-5 bg-[#121212]">
                <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-[#F5F0E8] tracking-tight">Goal Sheet</h4>
                      <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-emerald-400">
                        Approved
                      </span>
                      <span className="rounded bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-violet-400 flex items-center gap-0.5">
                        🔒 Locked
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-[#8A8A8A]">FY 2026–27 · Test Employee</p>
                  </div>

                  {/* Circular Progress (HTML CSS representation) */}
                  <div className="relative flex items-center justify-center h-12 w-12 rounded-full border border-white/[0.06] bg-[#161616]">
                    <div className="absolute inset-1 rounded-full border border-dashed border-[#4A6FA5]/40" />
                    <span className="text-[10px] font-mono font-bold text-[#F5F0E8]">100%</span>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded border border-white/[0.05] bg-[#161616] p-2.5 text-center">
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-[#8A8A8A]">Goals</span>
                    <p className="mt-0.5 text-xs font-bold text-[#F5F0E8]">5 of 8 max</p>
                  </div>
                  <div className="rounded border border-white/[0.05] bg-[#161616] p-2.5 text-center">
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-[#8A8A8A]">Weight</span>
                    <p className="mt-0.5 text-xs font-bold text-[#4A6FA5]">100% balanced</p>
                  </div>
                  <div className="rounded border border-white/[0.05] bg-[#161616] p-2.5 text-center">
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-[#8A8A8A]">Q1 Score</span>
                    <p className="mt-0.5 text-xs font-bold text-emerald-400">94 weighted</p>
                  </div>
                </div>

                {/* Three Goal Rows */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between rounded border border-white/[0.04] bg-[#161616] p-3 hover:border-white/[0.08] transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-[#8b5cf6]/10 px-1 py-0.2 text-[8px] font-bold uppercase tracking-wider text-[#8b5cf6]">
                          Business
                        </span>
                        <span className="text-[9px] text-white/30">W: 40%</span>
                      </div>
                      <p className="text-[11px] font-medium text-[#F5F0E8] tracking-tight">
                        Increase platform uptime from 99.9% to 99.99%
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-bold text-emerald-400 uppercase tracking-wide">
                        Completed
                      </span>
                      <span className="font-mono text-xs font-semibold text-[#F5F0E8]">98</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded border border-white/[0.04] bg-[#161616] p-3 hover:border-white/[0.08] transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-[#06b6d4]/10 px-1 py-0.2 text-[8px] font-bold uppercase tracking-wider text-[#06b6d4]">
                          Customer
                        </span>
                        <span className="text-[9px] text-white/30">W: 30%</span>
                      </div>
                      <p className="text-[11px] font-medium text-[#F5F0E8] tracking-tight">
                        Reduce standard SLA response time to under 15 mins
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-[#4A6FA5]/10 px-1.5 py-0.5 text-[8px] font-bold text-[#4A6FA5] uppercase tracking-wide">
                        On Track
                      </span>
                      <span className="font-mono text-xs font-semibold text-[#F5F0E8]">92</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded border border-white/[0.04] bg-[#161616] p-3 hover:border-white/[0.08] transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-[#f59e0b]/10 px-1 py-0.2 text-[8px] font-bold uppercase tracking-wider text-[#f59e0b]">
                          Operations
                        </span>
                        <span className="text-[9px] text-white/30">W: 30%</span>
                      </div>
                      <p className="text-[11px] font-medium text-[#F5F0E8] tracking-tight">
                        Automate pipeline builds & deployment validation
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-bold text-emerald-400 uppercase tracking-wide">
                        Completed
                      </span>
                      <span className="font-mono text-xs font-semibold text-[#F5F0E8]">94</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Text */}
          <div className="space-y-8 lg:col-span-6">
            <h1 className="font-serif-premium text-5xl md:text-7xl font-bold tracking-tight text-[#F5F0E8] leading-[1.1] select-none">
              Performance, <br />
              without the <br />
              paperwork.
            </h1>

            <p className="max-w-xl font-sans-premium text-sm leading-relaxed text-[#8A8A8A]">
              Nucleus replaces the spreadsheet, the email chain, and the end-of-year scramble. One system. Three roles. Zero ambiguity.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded bg-[#4A6FA5] hover:bg-[#3D5C8A] px-5 py-3 font-sans-premium text-xs font-semibold tracking-wide text-white transition active:scale-[0.98]"
              >
                Explore the portal <ArrowRight className="size-4" />
              </Link>
              <a
                href="https://github.com/Drifting-Moon/Nucleus"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded border border-white/10 hover:border-white/20 hover:bg-white/5 px-5 py-3 font-sans-premium text-xs font-semibold tracking-wide text-[#F5F0E8] transition"
              >
                View on GitHub
              </a>
            </div>

            {/* Quick Access Credentials */}
            <div className="space-y-3 pt-6 border-t border-white/[0.05]">
              <span className="text-[10px] font-sans-premium font-bold tracking-widest text-[#4A6FA5] uppercase">
                DEMO ACCESS · ALL THREE ROLE JOURNEYS READY
              </span>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {credentials.map((cred) => (
                  <button
                    key={cred.role}
                    onClick={() => handleCopyCredentials(cred.email, cred.role)}
                    className="group relative flex flex-col items-start rounded border border-white/[0.06] bg-[#161616] p-3 text-left transition hover:border-[#4A6FA5]/40 hover:bg-[#1C1C1C] active:scale-[0.98] outline-none"
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${cred.badgeColor}`}>
                        {cred.role}
                      </span>
                      <Copy className="size-3 text-[#8A8A8A] opacity-0 transition group-hover:opacity-100" />
                    </div>
                    <span className="mt-2 font-sans-premium text-xs font-bold text-[#F5F0E8]">
                      {cred.name}
                    </span>
                    <span className="mt-1 font-mono text-[10px] text-[#8A8A8A] group-hover:text-[#F5F0E8] transition truncate w-full">
                      {cred.email}
                    </span>
                    <span className="mt-0.5 font-mono text-[10px] text-[#8A8A8A] opacity-60">
                      pass: {cred.password}
                    </span>

                    {copiedRole === cred.role && (
                      <span className="absolute right-2 bottom-2 rounded bg-[#4A6FA5] px-1.5 py-0.5 text-[9px] font-semibold text-white tracking-wide transition">
                        Copied!
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CAPABILITIES GRID (SECTION 3) */}
      <section id="features" className="py-24 border-t border-white/[0.06] bg-[#0C0C0C]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="font-serif-premium text-4xl md:text-5xl font-bold tracking-tight text-[#F5F0E8]">
              Built to spec. <br className="hidden sm:inline" /> Tested end-to-end.
            </h2>
            <p className="mx-auto max-w-2xl font-sans-premium text-sm leading-relaxed text-[#8A8A8A]">
              Not a prototype. Not a mock. Every flow below works against a live Postgres database with real auth, real role separation, and real audit logs.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.num}
                  className="group relative flex flex-col justify-between rounded border border-white/[0.06] bg-[#161616] p-6 hover:border-[#4A6FA5]/40 transition"
                >
                  <span className="absolute top-4 right-4 font-mono text-xs text-white/20 select-none">
                    {item.num}
                  </span>
                  <div>
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-[#0F0F0F] border border-white/[0.05]">
                      <IconComp className="size-4 text-[#4A6FA5]" />
                    </div>
                    <h3 className="mt-6 font-sans-premium text-sm font-bold text-[#F5F0E8]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-[#8A8A8A]">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ARCHITECTURE (SECTION 4) */}
      <section id="architecture" className="py-24 border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
            {/* Left half architecture diagram */}
            <div className="lg:col-span-7 w-full flex justify-center items-center">
              <div className="w-full rounded border border-white/[0.08] bg-[#161616] p-6 hover:border-white/[0.12] transition">
                <img
                  src="/nucleus_architecture_diagram1.svg"
                  alt="Nucleus Architecture Diagram"
                  className="w-full h-auto object-contain select-none"
                />
              </div>
            </div>

            {/* Right half info */}
            <div className="space-y-6 lg:col-span-5">
              <h2 className="font-serif-premium text-4xl md:text-5xl font-bold tracking-tight text-[#F5F0E8] leading-tight">
                Same region. <br />
                Same millisecond. <br />
                No compromises.
              </h2>
              <p className="font-sans-premium text-sm leading-relaxed text-[#8A8A8A]">
                Vercel functions and Supabase Postgres both run in Singapore. There is no ocean between your request and your data. Connection pooling handles serverless cold connections. RLS handles authorisation. Nothing else needed.
              </p>

              {/* Cost Rows */}
              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-3 rounded border border-white/[0.04] bg-[#161616]/40 p-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                    <Check className="size-3" />
                  </div>
                  <div className="flex-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-[#F5F0E8]">
                      Vercel Hobby <span className="text-[#8A8A8A]/60">· Serverless & Edge</span>
                    </span>
                    <span className="font-mono text-emerald-400 font-semibold">$0/mo</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded border border-white/[0.04] bg-[#161616]/40 p-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                    <Check className="size-3" />
                  </div>
                  <div className="flex-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-[#F5F0E8]">
                      Supabase Free <span className="text-[#8A8A8A]/60">· 500MB DB & 50k MAU</span>
                    </span>
                    <span className="font-mono text-emerald-400 font-semibold">$0/mo</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded border border-white/[0.04] bg-[#161616]/40 p-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                    <Check className="size-3" />
                  </div>
                  <div className="flex-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-[#F5F0E8]">
                      Resend Free <span className="text-[#8A8A8A]/60">· 3k Lifecycle Emails</span>
                    </span>
                    <span className="font-mono text-emerald-400 font-semibold">$0/mo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BRD COVERAGE CHECKLIST (SECTION 5) */}
      <section id="brd" className="py-24 border-t border-white/[0.06] bg-[#0C0C0C]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="font-serif-premium text-4xl md:text-5xl font-bold tracking-tight text-[#F5F0E8]">
              The spec was the checklist. We didn&apos;t miss one.
            </h2>
            <p className="mx-auto max-w-2xl font-sans-premium text-sm leading-relaxed text-[#8A8A8A]">
              Every line of the problem statement has a corresponding feature, a corresponding route, and a corresponding test. Below is the mapping.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 max-w-4xl mx-auto">
            {/* Column 1: Core Goal Flows */}
            <div className="space-y-6">
              <h3 className="font-sans-premium text-xs font-bold tracking-widest text-[#4A6FA5] uppercase border-b border-white/[0.05] pb-2">
                PHASE 1 · CORE GOAL LIFECYCLE
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                    <Check className="size-2.5" />
                  </div>
                  <div>
                    <span className="font-sans-premium text-xs font-bold text-[#F5F0E8] block">Weightage Validation Enforced</span>
                    <span className="text-[11px] text-[#8A8A8A] mt-0.5 block">Submissions locked at database level unless weightage sums exactly to 100%.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                    <Check className="size-2.5" />
                  </div>
                  <div>
                    <span className="font-sans-premium text-xs font-bold text-[#F5F0E8] block">Max 8 Goals Constraint</span>
                    <span className="text-[11px] text-[#8A8A8A] mt-0.5 block">Strict array limitations to prevent team fatigue and over-extension.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                    <Check className="size-2.5" />
                  </div>
                  <div>
                    <span className="font-sans-premium text-xs font-bold text-[#F5F0E8] block">Four Target Types (UoMs)</span>
                    <span className="text-[11px] text-[#8A8A8A] mt-0.5 block">Clean structural configurations for Numeric, Percentage, Zero-based, and Timeline-based targets.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                    <Check className="size-2.5" />
                  </div>
                  <div>
                    <span className="font-sans-premium text-xs font-bold text-[#F5F0E8] block">Manager Approval Pipelines</span>
                    <span className="text-[11px] text-[#8A8A8A] mt-0.5 block">Worksheets editable by managers and open to rework adjustments before final lock.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                    <Check className="size-2.5" />
                  </div>
                  <div>
                    <span className="font-sans-premium text-xs font-bold text-[#F5F0E8] block">Admin Shared Goals</span>
                    <span className="text-[11px] text-[#8A8A8A] mt-0.5 block">Seamless deployment of forced departmental goals to sub-teams.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                    <Check className="size-2.5" />
                  </div>
                  <div>
                    <span className="font-sans-premium text-xs font-bold text-[#F5F0E8] block">Timeline Windows Settings</span>
                    <span className="text-[11px] text-[#8A8A8A] mt-0.5 block">Configurable dates for when quarterly entries open and close.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Analytics & Governance */}
            <div className="space-y-6">
              <h3 className="font-sans-premium text-xs font-bold tracking-widest text-[#4A6FA5] uppercase border-b border-white/[0.05] pb-2">
                PHASE 2 · GOVERNANCE & ANALYTICS
              </h3>
              <div className="space-y-4">
                {/* 5.2 Email & Microsoft Teams Integration */}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                    <Check className="size-2.5" />
                  </div>
                  <div>
                    <span className="font-sans-premium text-xs font-bold text-[#F5F0E8] block">Event-Driven Email Alerts (Sec 5.2)</span>
                    <span className="text-[11px] text-[#8A8A8A] mt-0.5 block">Automated notifications for goal submissions, approvals, rejections, and window reminders.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                    <Check className="size-2.5" />
                  </div>
                  <div>
                    <span className="font-sans-premium text-xs font-bold text-[#F5F0E8] block">Microsoft Teams Notifications (Sec 5.2)</span>
                    <span className="text-[11px] text-[#8A8A8A] mt-0.5 block">Adaptive cards and automated notifications triggered for managers on goal sheet updates.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                    <Check className="size-2.5" />
                  </div>
                  <div>
                    <span className="font-sans-premium text-xs font-bold text-[#F5F0E8] block">Teams Deep-Link Navigation (Sec 5.2)</span>
                    <span className="text-[11px] text-[#8A8A8A] mt-0.5 block">Seamless navigation directly from Teams notification cards directly to the target goal sheet.</span>
                  </div>
                </div>

                {/* 5.3 Escalation Module */}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                    <Check className="size-2.5" />
                  </div>
                  <div>
                    <span className="font-sans-premium text-xs font-bold text-[#F5F0E8] block">Configurable Escalation Rules (Sec 5.3)</span>
                    <span className="text-[11px] text-[#8A8A8A] mt-0.5 block">Auto-triggers if employee hasn&apos;t submitted in N days, manager hasn&apos;t approved, or check-ins miss windows.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                    <Check className="size-2.5" />
                  </div>
                  <div>
                    <span className="font-sans-premium text-xs font-bold text-[#F5F0E8] block">Interval-Based Escalation Chains (Sec 5.3)</span>
                    <span className="text-[11px] text-[#8A8A8A] mt-0.5 block">Automated progression hierarchy routing notifications from employee ➔ manager ➔ skip-level / HR.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                    <Check className="size-2.5" />
                  </div>
                  <div>
                    <span className="font-sans-premium text-xs font-bold text-[#F5F0E8] block">Centralized Escalation Resolvers (Sec 5.3)</span>
                    <span className="text-[11px] text-[#8A8A8A] mt-0.5 block">Audit-ready console visible to Admin and HR to track, manage, and resolve outstanding escalations.</span>
                  </div>
                </div>

                {/* 5.4 Analytics Module */}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                    <Check className="size-2.5" />
                  </div>
                  <div>
                    <span className="font-sans-premium text-xs font-bold text-[#F5F0E8] block">Dynamic QoQ Achievement Trends (Sec 5.4)</span>
                    <span className="text-[11px] text-[#8A8A8A] mt-0.5 block">Interactive charts plotting Quarter-on-Quarter score trends at individual, team, and department levels.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                    <Check className="size-2.5" />
                  </div>
                  <div>
                    <span className="font-sans-premium text-xs font-bold text-[#F5F0E8] block">Live Completion Status Heatmaps (Sec 5.4)</span>
                    <span className="text-[11px] text-[#8A8A8A] mt-0.5 block">Real-time status grids tracking organization-wide goal submission and review completion rates.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                    <Check className="size-2.5" />
                  </div>
                  <div>
                    <span className="font-sans-premium text-xs font-bold text-[#F5F0E8] block">Goal Distribution & Thrust Areas (Sec 5.4)</span>
                    <span className="text-[11px] text-[#8A8A8A] mt-0.5 block">Breakdown analytics analyzing active goals by Thrust Area, Unit-of-Measure (UoM) type, and status.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                    <Check className="size-2.5" />
                  </div>
                  <div>
                    <span className="font-sans-premium text-xs font-bold text-[#F5F0E8] block">Manager Effectiveness Console (Sec 5.4)</span>
                    <span className="text-[11px] text-[#8A8A8A] mt-0.5 block">Comparison dashboards showing check-in completion and manager review rates across L1 leaders.</span>
                  </div>
                </div>

                {/* Other Governance Specs */}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                    <Check className="size-2.5" />
                  </div>
                  <div>
                    <span className="font-sans-premium text-xs font-bold text-[#F5F0E8] block">Comprehensive Field Audit Trails</span>
                    <span className="text-[11px] text-[#8A8A8A] mt-0.5 block">Robust Postgres tracking of target, weightage, and achievement changes.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                    <Check className="size-2.5" />
                  </div>
                  <div>
                    <span className="font-sans-premium text-xs font-bold text-[#F5F0E8] block">Secure CSV Data Export</span>
                    <span className="text-[11px] text-[#8A8A8A] mt-0.5 block">One-click audit trail downloads filtered by employee, manager, or cycle.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.06] bg-[#0B0B0B] py-8 text-xs font-sans-premium tracking-wide">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row text-center md:text-left">
          <div className="space-y-1">
            <p className="font-bold text-[#F5F0E8]">Nucleus · AtomQuest Hackathon 2026</p>
            <p className="text-[#8A8A8A]/60">Goal setting that actually survives contact with the organisation.</p>
          </div>
          <div className="text-[#8A8A8A]">
            Next.js · Supabase · Vercel · Resend
          </div>
          <div className="font-mono text-[#8A8A8A]/50 flex items-center gap-1.5">
            <span>pnpm build ✓</span>
            <span>·</span>
            <span>pnpm lint ✓</span>
            <span>·</span>
            <span className="text-emerald-500 font-bold">tests passing ✓</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
