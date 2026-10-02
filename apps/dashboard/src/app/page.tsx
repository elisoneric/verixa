"use client"

import * as React from "react"
import Link from "next/link"
import { Logo, Badge, Button } from "@verixa/ui"
import { useAuth } from "../lib/auth-context"
import { useTheme } from "../lib/theme-context"

export default function PublicLandingPage() {
  const { user, token } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-800 dark:selection:text-emerald-300">
      {/* Top Public Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <Logo size="md" />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-zinc-400">
            <a href="#services" className="hover:text-slate-900 dark:hover:text-white transition-colors">Services</a>
            <a href="#ninslip" className="hover:text-slate-900 dark:hover:text-white transition-colors">NIN Slip Engine</a>
            <a href="#pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</a>
            <a href="#compliance" className="hover:text-slate-900 dark:hover:text-white transition-colors">Compliance</a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Theme Switcher Button */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              className="flex items-center justify-center h-10 w-10 rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shadow-2xs cursor-pointer"
            >
              {theme === "light" ? (
                <svg className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            {token ? (
              <Link href="/dashboard">
                <Button variant="emerald" size="md" className="font-semibold h-10 px-5">
                  Open Dashboard &rarr;
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="md" className="font-semibold h-10 px-4">
                    Log In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="emerald" size="md" className="font-semibold h-10 px-5">
                    Create Account
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Official NIMC & BVN Verification Infrastructure
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Next-Gen Identity Verification &{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Official NIN Slips
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Real-time BVN & NIN verification, automated NIMC dual-slip generation, and intelligent caching built for Nigerian fintechs, real estate platforms, and enterprises.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register">
              <Button variant="emerald" size="lg" className="w-full sm:w-auto font-bold h-12 px-8 shadow-sm">
                Get Started Now &rarr;
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto font-semibold h-12 px-7">
                Sign In to Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Services Grid */}
      <section id="services" className="py-16 border-t border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Identity Services Built for Nigerian Scale
            </h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2">
              High-throughput APIs and manual web workspaces with 99.9% uptime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 shadow-xs space-y-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                NIN
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">NIN Advance Lookup</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Retrieve verified registry demographics, residential address, telephone, tracking ID, and official portrait photo.
              </p>
              <div className="pt-2 font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                ₦140 / call • ₦30 Cache
              </div>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 shadow-xs space-y-3">
              <div className="h-10 w-10 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                SLIP
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Automated NIN Slip Engine</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Generate high-resolution A4 dual-slip PDF and editable Word (.docx) slips adhering to official NIMC paper specifications.
              </p>
              <div className="pt-2 font-mono text-xs font-semibold text-sky-600 dark:text-sky-400">
                ₦270 / slip • ₦50 Cache
              </div>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 shadow-xs space-y-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                BVN
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">BVN & Bank Account Check</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Real-time NIBSS BVN identity validation and 10-digit NUBAN account name resolution across all Nigerian commercial banks.
              </p>
              <div className="pt-2 font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                From ₦20 / check
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transparent Pricing Table */}
      <section id="pricing" className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Transparent, Volume-Friendly Pricing
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-2">
              No hidden setup fees. Pay only for successful lookups with Smart Cache discounts.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-zinc-950/80 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 uppercase font-mono text-[11px]">
                <tr>
                  <th className="py-3.5 px-6">Service</th>
                  <th className="py-3.5 px-6">Live Query</th>
                  <th className="py-3.5 px-6">Smart Cache</th>
                  <th className="py-3.5 px-6">Turnaround</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-mono">
                <tr>
                  <td className="py-3.5 px-6 font-semibold font-sans text-slate-900 dark:text-white">NIN Advance Lookup</td>
                  <td className="py-3.5 px-6 text-emerald-600 font-bold">₦140</td>
                  <td className="py-3.5 px-6 text-slate-500">₦30</td>
                  <td className="py-3.5 px-6 text-slate-400">&lt; 180ms</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-semibold font-sans text-slate-900 dark:text-white">Official NIN Slip (PDF + Word)</td>
                  <td className="py-3.5 px-6 text-emerald-600 font-bold">₦270</td>
                  <td className="py-3.5 px-6 text-slate-500">₦50</td>
                  <td className="py-3.5 px-6 text-slate-400">&lt; 250ms</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-semibold font-sans text-slate-900 dark:text-white">BVN Basic Match</td>
                  <td className="py-3.5 px-6 text-emerald-600 font-bold">₦50</td>
                  <td className="py-3.5 px-6 text-slate-500">₦20</td>
                  <td className="py-3.5 px-6 text-slate-400">&lt; 150ms</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-semibold font-sans text-slate-900 dark:text-white">Bank Account NUBAN</td>
                  <td className="py-3.5 px-6 text-emerald-600 font-bold">₦20</td>
                  <td className="py-3.5 px-6 text-slate-500">₦10</td>
                  <td className="py-3.5 px-6 text-slate-400">&lt; 120ms</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Compliance Umbrella */}
      <section id="compliance" className="py-12 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-4">
          <Badge variant="verified" size="sm">REGULATORY COMPLIANCE</Badge>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Full NDPA & NDPC Regulatory Alignment
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-2xl mx-auto">
            Operating under licensed data protection compliance frameworks. All verifications require applicant consent, with automated audit trails and zero unauthorized storage.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-zinc-800/80 py-8 bg-slate-100 dark:bg-zinc-950 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Verixa Identity Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-slate-800 dark:hover:text-zinc-300">Customer Login</Link>
            <Link href="/register" className="hover:text-slate-800 dark:hover:text-zinc-300">Register</Link>
            <Link href="/admin" className="hover:text-slate-800 dark:hover:text-zinc-300">Operator Console</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
