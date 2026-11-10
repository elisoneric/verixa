import * as React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { Logo, Badge, Button } from "@verixa/ui"
import { AuthNavButtons } from "../components/auth-nav-buttons"

export const metadata: Metadata = {
  title: {
    absolute: "Verixa ID | Low-Cost NIN & BVN Verification APIs Nigeria",
  },
  description:
    "Low-cost, high-reliability NIN & BVN verification APIs for Nigerian businesses. Instant automated standard NIN slip and NIMC plastic card generation, and free NUBAN bank account resolution.",
  alternates: {
    canonical: "https://verixaid.com",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://verixaid.com",
    title: "Verixa ID | Low-Cost NIN & BVN Verification APIs Nigeria",
    description:
      "Low-cost NIN & BVN verification APIs with instant slip generation and free bank account resolution.",
    siteName: "Verixa ID",
  },
}

export default function PublicLandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-800">
      {/* Top Public Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <Logo size="md" />
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <Link href="/nin-verification-api" className="hover:text-slate-900 transition-colors">NIN API</Link>
            <Link href="/bvn-verification-api" className="hover:text-slate-900 transition-colors">BVN API</Link>
            <Link href="/nin-slip-generator" className="hover:text-slate-900 transition-colors">Slip Generator</Link>
            <Link href="/pricing" className="hover:text-slate-900 transition-colors">Pricing</Link>
            <a href="https://docs.verixaid.com" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">API Docs</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <AuthNavButtons />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Built for fintechs, digital lenders, betting platforms, and businesses that require secure, authorized identity verification.
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Identity Verification APIs Built for Business
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Verify identity information, validate customer details, and streamline digital onboarding with reliable NIN, BVN, and bank account verification APIs.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register">
              <Button
                variant="emerald"
                size="lg"
                className="w-full sm:w-auto font-bold h-12 px-8 shadow-md !bg-emerald-600 hover:!bg-emerald-500 !text-white border border-emerald-600 transition-all cursor-pointer"
              >
                Get Started Free &rarr;
              </Button>
            </Link>
            <a href="https://docs.verixaid.com" target="_blank" rel="noreferrer">
              <Button variant="outline" size="lg" className="w-full sm:w-auto font-semibold h-12 px-7">
                API Documentation
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Core Services Grid */}
      <section id="services" className="py-16 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Identity Services Built for Scale
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              High-throughput REST APIs and self-service consoles with 99.9% uptime.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 shadow-xs space-y-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                NIN
              </div>
              <h3 className="text-base font-bold text-slate-900">NIN Verification API</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Verify national identification records with instant demographic lookup and facial portrait data.
              </p>
              <div className="pt-2 font-mono text-sm font-bold text-emerald-600">
                Starts from ₦120 on API
              </div>
              <Link href="/nin-verification-api" className="text-xs font-semibold text-emerald-700 hover:underline inline-block pt-1">
                Explore NIN API &rarr;
              </Link>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 shadow-xs space-y-3">
              <div className="h-10 w-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                SLIP
              </div>
              <h3 className="text-base font-bold text-slate-900">Automated Slip Generator</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generate high-resolution printable NIN slips and digital NIMC cards instantly with official styling.
              </p>
              <div className="pt-2 font-mono text-sm font-bold text-sky-600">
                Starts from ₦250 for NIN Slip
              </div>
              <Link href="/nin-slip-generator" className="text-xs font-semibold text-sky-700 hover:underline inline-block pt-1">
                Explore Slip Generator &rarr;
              </Link>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 shadow-xs space-y-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                BVN
              </div>
              <h3 className="text-base font-bold text-slate-900">BVN Validation API</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Real-time BVN identity validation, date of birth verification, biometric face match, and name matching.
              </p>
              <div className="pt-2 font-mono text-sm font-bold text-indigo-600">
                Starts from ₦100 on API
              </div>
              <Link href="/bvn-verification-api" className="text-xs font-semibold text-indigo-700 hover:underline inline-block pt-1">
                Explore BVN API &rarr;
              </Link>
            </div>

            <div className="p-6 rounded-xl border border-emerald-200 bg-emerald-50/50 shadow-xs space-y-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold">
                BANK
              </div>
              <h3 className="text-base font-bold text-slate-900">NUBAN Resolution</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Instant 10-digit NUBAN account name resolution across all commercial banks and digital wallets.
              </p>
              <div className="pt-2 font-mono text-sm font-bold text-emerald-600">
                100% Free
              </div>
              <Link href="/pricing" className="text-xs font-semibold text-emerald-700 hover:underline inline-block pt-1">
                View Pricing &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Transparent Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-300 bg-white text-slate-700 text-xs font-mono uppercase mb-3">
              Transparent Pricing
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Pay As You Verify, Scale Without Barriers
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-xl mx-auto">
              Transparent rates with zero subscription lock-in. Funding via Online Payment (instant checkout) or Dedicated Virtual Account (DVA) bank transfer.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-mono text-[11px]">
                <tr>
                  <th className="py-3.5 px-5">Method & Endpoint</th>
                  <th className="py-3.5 px-5">Identity Service</th>
                  <th className="py-3.5 px-5">Rate Schedule</th>
                  <th className="py-3.5 px-5">Response Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-5 font-mono text-xs">
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mr-2">POST</span>
                    <span className="text-slate-700">/api/v1/verifications/nin</span>
                  </td>
                  <td className="py-3.5 px-5 font-semibold font-sans text-slate-900">NIN Verification</td>
                  <td className="py-3.5 px-5 font-sans text-emerald-700 font-bold">Starts from ₦120 on API</td>
                  <td className="py-3.5 px-5 text-slate-500 font-sans">&lt; 180ms</td>
                </tr>
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-5 font-mono text-xs">
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mr-2">POST</span>
                    <span className="text-slate-700">/api/v1/verifications/bvn</span>
                  </td>
                  <td className="py-3.5 px-5 font-semibold font-sans text-slate-900">BVN Validation</td>
                  <td className="py-3.5 px-5 font-sans text-emerald-700 font-bold">Starts from ₦100 on API</td>
                  <td className="py-3.5 px-5 text-slate-500 font-sans">&lt; 150ms</td>
                </tr>
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-5 font-mono text-xs">
                    <span className="text-sky-700 font-bold bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 mr-2">POST</span>
                    <span className="text-slate-700">/api/v1/slips/nin</span>
                  </td>
                  <td className="py-3.5 px-5 font-semibold font-sans text-slate-900">Standard NIN Slip (A4)</td>
                  <td className="py-3.5 px-5 font-sans text-sky-700 font-bold">Starts from ₦250 for NIN Slip</td>
                  <td className="py-3.5 px-5 text-slate-500 font-sans">&lt; 350ms</td>
                </tr>
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-5 font-mono text-xs">
                    <span className="text-sky-700 font-bold bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 mr-2">POST</span>
                    <span className="text-slate-700">/api/v1/slips/nin/card</span>
                  </td>
                  <td className="py-3.5 px-5 font-semibold font-sans text-slate-900">NIMC Card (ID-1)</td>
                  <td className="py-3.5 px-5 font-sans text-sky-700 font-bold">₦300 / card</td>
                  <td className="py-3.5 px-5 text-slate-500 font-sans">&lt; 300ms</td>
                </tr>
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-5 font-mono text-xs">
                    <span className="text-purple-700 font-bold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 mr-2">POST</span>
                    <span className="text-slate-700">/api/v1/slips/nin/premium</span>
                  </td>
                  <td className="py-3.5 px-5 font-semibold font-sans text-slate-900">NIMC Card Premium (A4 Sheet)</td>
                  <td className="py-3.5 px-5 font-sans text-purple-700 font-bold">₦120 on API / ₦350 UI</td>
                  <td className="py-3.5 px-5 text-slate-500 font-sans">&lt; 350ms</td>
                </tr>
                <tr className="bg-emerald-50/40 hover:bg-emerald-50/70 transition-colors">
                  <td className="py-3.5 px-5 font-mono text-xs">
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mr-2">POST</span>
                    <span className="text-slate-700">/api/v1/bank/resolve</span>
                  </td>
                  <td className="py-3.5 px-5 font-semibold font-sans text-slate-900">NUBAN Resolution</td>
                  <td className="py-3.5 px-5 font-sans text-emerald-700 font-bold">100% Free (₦0)</td>
                  <td className="py-3.5 px-5 text-slate-500 font-sans">&lt; 120ms</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 py-8 bg-white text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Verixa ID. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link href="/nin-verification-api" className="hover:text-slate-800">NIN API</Link>
            <Link href="/bvn-verification-api" className="hover:text-slate-800">BVN API</Link>
            <Link href="/nin-slip-generator" className="hover:text-slate-800">Slip Generator</Link>
            <Link href="/pricing" className="hover:text-slate-800">Pricing</Link>
            <Link href="/login" className="hover:text-slate-800">Sign In</Link>
            <Link href="/register" className="hover:text-slate-800">Create Account</Link>
            <Link href="/terms" className="hover:text-slate-800">Terms</Link>
            <Link href="/privacy" className="hover:text-slate-800">Privacy</Link>
            <a href="https://docs.verixaid.com" target="_blank" rel="noreferrer" className="hover:text-slate-800">Documentation</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
