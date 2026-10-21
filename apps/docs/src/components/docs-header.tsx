"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Logo, getWwwUrl, getDashboardUrl } from "@verixa/ui"
import { DOCS_SECTIONS } from "../lib/navigation"

interface SearchItem {
  title: string
  href: string
  category: string
  desc: string
}

const SEARCH_INDEX: SearchItem[] = [
  { title: "Authentication & Headers", href: "/authentication", category: "Get Started", desc: "Universal API Key & Bearer authentication" },
  { title: "Environments & Base URLs", href: "/environments", category: "Get Started", desc: "Sandbox vs Production endpoints" },
  { title: "BVN Verification", href: "/bvn", category: "KYC Identity", desc: "Bank Verification Number validation & biometric matching" },
  { title: "NIN Verification", href: "/nin", category: "KYC Identity", desc: "National Identification Number lookup & demography" },
  { title: "Phone Number Intelligence", href: "/phone", category: "KYC Identity", desc: "Phone to NIN/BVN linkage and SIM registry" },
  { title: "CAC Corporate & TIN", href: "/cac", category: "KYB Business", desc: "Corporate Affairs Commission company verification" },
  { title: "Bank Account (NUBAN)", href: "/nuban", category: "Banking", desc: "Real-time 10-digit NUBAN name resolution" },
  { title: "NUBAN KYC Status", href: "/nuban-kyc", category: "Banking", desc: "Bank account tier level and KYC compliance" },
  { title: "Biometrics & AML Screening", href: "/biometrics-aml", category: "Risk Intelligence", desc: "Facial matching and anti-money laundering checks" },
  { title: "Airtime & Mobile Data VTU", href: "/airtime-data", category: "VAS", desc: "Instant mobile recharge API across Nigerian telcos" },
  { title: "SMS & WhatsApp OTP", href: "/messaging", category: "VAS", desc: "High-deliverability 2FA & OTP delivery" },
  { title: "Smart Identity Cache", href: "/smart-cache", category: "Platform", desc: "Sub-15ms cached lookups with 50% discount" },
  { title: "Wallet Balance API", href: "/balance", category: "Platform", desc: "Prepaid wallet query endpoint" },
  { title: "Billing & Credits", href: "/billing-api", category: "Platform", desc: "Prepaid metering and NGX transactions" },
  { title: "Idempotency Keys", href: "/idempotency", category: "Platform", desc: "Prevent duplicate charges with Idempotency-Key" },
  { title: "Webhooks & Signatures", href: "/webhooks", category: "Platform", desc: "HMAC SHA-512 real-time webhook events" },
  { title: "Rate Limits", href: "/rate-limits", category: "Platform", desc: "Tier limits and burst rate governance" },
  { title: "Error Reference", href: "/errors", category: "Platform", desc: "Universal error codes and HTTP statuses" },
  { title: "Upcoming Roadmap", href: "/roadmap", category: "Platform", desc: "Upcoming API capabilities and release stages" },
]

export function DocsHeader() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  const mainSiteUrl = getWwwUrl("/")
  const dashboardUrl = getDashboardUrl("/dashboard")
  const getApiKeyUrl = getDashboardUrl("/register")

  // Keyboard shortcut Cmd+K / Ctrl+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      } else if (e.key === "Escape") {
        setSearchOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  React.useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50)
    } else {
      setQuery("")
    }
  }, [searchOpen])

  // Close mobile drawer on route change
  React.useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Lock body scroll when mobile menu is open
  React.useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileOpen])

  const filteredSearch = query.trim()
    ? SEARCH_INDEX.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.desc.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )
    : SEARCH_INDEX.slice(0, 6)

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 h-16 w-full max-w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-2xs">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-2 sm:gap-4 w-full">
          {/* Left Cluster: Logo & Back to Main Website */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0 min-w-0">
            <Link
              href="/"
              className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md shrink-0"
              title="Verixa Developer Documentation Home"
            >
              <Logo size="sm" badge="DOCS" badgeColor="emerald" />
            </Link>

            <span className="hidden sm:inline-block h-5 w-px bg-slate-200" aria-hidden="true" />

            {/* Back to Homepage / Main Website Link (Hidden on mobile to prevent overflow) */}
            <a
              href={mainSiteUrl}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/90 rounded-full border border-slate-200 transition-all shadow-2xs cursor-pointer select-none group"
              title="Return to Verixa Main Website Homepage"
            >
              <svg
                className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-900 group-hover:-translate-x-0.5 transition-all"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Main Website</span>
            </a>
          </div>

          {/* Center Cluster: Fast Documentation Search Bar */}
          <div className="hidden md:flex items-center flex-1 justify-center max-w-md mx-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center justify-between gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-500 hover:text-slate-700 text-xs transition-all shadow-2xs cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="truncate">Search API reference, endpoints...</span>
              </div>
              <kbd className="hidden sm:inline-flex items-center rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-mono text-slate-500 shrink-0">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Cluster: Console & API Keys CTA */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 ml-auto">
            {/* Search Trigger for Mobile/Tablet */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search Documentation"
              className="md:hidden p-2 rounded-full border border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Operational Status Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-mono text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>API OPERATIONAL</span>
            </div>

            {/* Developer Console Link */}
            <a
              href={dashboardUrl}
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
            >
              Console
            </a>

            {/* Primary Get API Key Button (Hidden on mobile top row, accessible in menu) */}
            <a
              href={getApiKeyUrl}
              className="hidden sm:inline-flex items-center justify-center rounded-full px-3.5 sm:px-4 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-xs active:scale-[0.99] whitespace-nowrap"
            >
              <span>Get API Key</span>
              <span className="ml-1 hidden sm:inline">&rarr;</span>
            </a>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle Navigation Menu"
              className="md:hidden p-2 rounded-full border border-slate-200 bg-slate-50 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileOpen && (
          <div className="md:hidden border-b border-slate-200 px-4 py-4 space-y-4 animate-in slide-in-from-top-3 duration-150 bg-white shadow-2xl max-h-[calc(100vh-4rem)] overflow-y-auto">
            {/* Prominent Back to Homepage Button in Mobile Menu */}
            <a
              href={mainSiteUrl}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold transition-all shadow-2xs"
            >
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>&larr; Back to Main Website (Homepage)</span>
            </a>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <a
                href={dashboardUrl}
                className="w-full text-center py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Developer Console
              </a>
              <a
                href={getApiKeyUrl}
                className="w-full text-center py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Get API Key &rarr;
              </a>
            </div>

            {/* Complete 21 API Endpoints Categorized Navigation */}
            <div className="pt-2 border-t border-slate-100 space-y-4">
              <div className="text-[11px] font-mono uppercase font-bold text-slate-400 px-1">
                API Reference &amp; Guides
              </div>
              {DOCS_SECTIONS.map((sec) => (
                <div key={sec.title} className="space-y-1">
                  <div className="text-[10px] font-mono uppercase font-semibold text-slate-400 px-1 pt-1">
                    {sec.title}
                  </div>
                  {sec.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center justify-between text-xs font-medium py-1.5 px-2 rounded transition-colors ${
                        pathname === link.href
                          ? "bg-slate-900 text-white font-semibold"
                          : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <span className="truncate">{link.label}</span>
                      {link.badge && (
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded ml-2 shrink-0 ${
                            pathname === link.href
                              ? "bg-white/20 text-white"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Instant Search Modal Dialog */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setSearchOpen(false)}
          />

          <div className="relative z-50 w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-2 text-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            {/* Search Input Bar (text-base sm:text-sm to prevent iOS zoom) */}
            <div className="flex items-center border-b border-slate-100 px-3 py-2.5">
              <svg className="w-5 h-5 text-slate-400 mr-2.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search BVN, NIN, CAC, webhooks, errors..."
                className="w-full bg-transparent text-base sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <kbd
                onClick={() => setSearchOpen(false)}
                className="inline-flex items-center rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 cursor-pointer"
              >
                ESC
              </kbd>
            </div>

            {/* Search Results List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredSearch.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No matching endpoints or guides found.
                </div>
              ) : (
                filteredSearch.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-slate-50 select-none group"
                  >
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-emerald-700">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        {item.desc}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shrink-0 ml-2">
                      {item.category}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
