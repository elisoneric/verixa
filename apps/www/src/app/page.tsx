"use client"

import * as React from "react"
import Link from "next/link"
import { Button, Badge, CodeBlock, Logo, AppLink } from "@verixa/ui"

export default function HomePage() {
  const [activeApiTab, setActiveApiTab] = React.useState<"bvn" | "nin" | "nuban">("bvn")
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const apiSamples = {
    bvn: {
      endpoint: "POST /v1/verify/bvn",
      curl: `curl -X POST https://api.verixaid.com/v1/verify/bvn \\
  -H "Authorization: Bearer vrx_live_9f83a8f1e2..." \\
  -H "Idempotency-Key: 7b3e6d1a-4c2e-48a9..." \\
  -H "Content-Type: application/json" \\
  -d '{"bvn": "22123456789", "firstName": "CHIDERA"}'`,
      response: `{
  "status": "verified",
  "data": {
    "bvn": "22123456789",
    "first_name": "CHIDERA",
    "last_name": "OLUTOLA",
    "date_of_birth": "1988-04-14",
    "phone_number": "08039218492",
    "gender": "male"
  },
  "meta": {
    "request_id": "vx_req_8f19a02d",
    "latency_ms": 142
  }
}`,
    },
    nin: {
      endpoint: "POST /v1/verify/nin",
      curl: `curl -X POST https://api.verixaid.com/v1/verify/nin \\
  -H "Authorization: Bearer vrx_live_9f83a8f1e2..." \\
  -H "Idempotency-Key: 3a9f182c-1d4e-4f7b..." \\
  -H "Content-Type: application/json" \\
  -d '{"nin": "11234567890"}'`,
      response: `{
  "status": "verified",
  "data": {
    "nin": "11234567890",
    "first_name": "MAKINWA",
    "last_name": "MUKARAM",
    "gender": "male",
    "residence_state": "Lagos"
  },
  "meta": {
    "request_id": "vx_req_2b88f10c",
    "latency_ms": 168
  }
}`,
    },
    nuban: {
      endpoint: "POST /v1/verify/bank-account",
      curl: `curl -X POST https://api.verixaid.com/v1/verify/bank-account \\
  -H "Authorization: Bearer vrx_live_9f83a8f1e2..." \\
  -H "Idempotency-Key: 9c2a1e4b-7f8d-4e1a..." \\
  -H "Content-Type: application/json" \\
  -d '{"accountNumber": "0123456789", "bankCode": "058"}'`,
      response: `{
  "status": "verified",
  "data": {
    "account_name": "TOBILOBA OLUFEYIKEMI",
    "account_number": "0123456789",
    "bank_code": "058",
    "bank_name": "Guaranty Trust Bank",
    "account_status": "active"
  },
  "meta": {
    "request_id": "vx_req_4e71d93a",
    "latency_ms": 115
  }
}`,
    },
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <Logo size="md" />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#products" className="hover:text-zinc-100 transition-colors">Products</a>
            <a href="#developers" className="hover:text-zinc-100 transition-colors">Developers</a>
            <a href="#solutions" className="hover:text-zinc-100 transition-colors">Solutions</a>
            <a href="#pricing" className="hover:text-zinc-100 transition-colors">Pricing</a>
            <a href="#roadmap" className="hover:text-zinc-100 transition-colors">Roadmap</a>
            <AppLink app="docs" className="hover:text-zinc-100 transition-colors">Documentation</AppLink>
            <Link href="/contact" className="hover:text-zinc-100 transition-colors">Contact</Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <AppLink
              app="dashboard"
              path="/login"
              className="text-sm font-medium text-zinc-300 hover:text-white px-3 py-1.5 transition-colors"
            >
              Sign In
            </AppLink>
            <AppLink
              app="dashboard"
              path="/register"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm px-4 py-2 transition-all shadow-sm shadow-emerald-500/20"
            >
              Start Building
            </AppLink>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-zinc-800 bg-zinc-950 px-6 py-4 space-y-3">
            <a href="#products" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-zinc-300">Products</a>
            <a href="#developers" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-zinc-300">Developers</a>
            <a href="#solutions" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-zinc-300">Solutions</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-zinc-300">Pricing</a>
            <a href="#roadmap" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-zinc-300">Roadmap</a>
            <AppLink app="docs" className="block text-sm text-zinc-300">Documentation</AppLink>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-zinc-300">Contact</Link>
            <div className="pt-3 border-t border-zinc-800 flex flex-col gap-2">
              <AppLink app="dashboard" path="/login" className="w-full text-center py-2 text-sm text-zinc-200 border border-zinc-800 rounded-lg">
                Sign In
              </AppLink>
              <AppLink app="dashboard" path="/register" className="w-full text-center py-2 text-sm bg-emerald-500 text-zinc-950 font-semibold rounded-lg">
                Start Building
              </AppLink>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 lg:pt-28 lg:pb-24 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300 text-xs font-mono mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Identity infrastructure for modern businesses
          </div>

          <h1 className="max-w-4xl text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Verify people, accounts & businesses through a{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
              single API
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base sm:text-lg text-zinc-400 leading-relaxed">
            Standardized verification for BVN, NIN, and Bank Accounts with provider-agnostic failovers, prepaid NGX credits, and sub-200ms latency.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <AppLink
              app="dashboard"
              path="/register"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-base px-8 py-3.5 transition-all shadow-xl shadow-emerald-500/20"
            >
              Start Building
            </AppLink>
            <AppLink
              app="docs"
              className="inline-flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 font-semibold text-base px-8 py-3.5 transition-colors"
            >
              Explore Documentation &rarr;
            </AppLink>
          </div>

          {/* Interactive Live Code Sandbox */}
          <div id="developers" className="mt-16 w-full max-w-4xl rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl text-left overflow-hidden">
            <div className="flex flex-wrap items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveApiTab("bvn")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    activeApiTab === "bvn"
                      ? "bg-zinc-800 text-emerald-400 border border-zinc-700"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  BVN Lookup
                </button>
                <button
                  onClick={() => setActiveApiTab("nin")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    activeApiTab === "nin"
                      ? "bg-zinc-800 text-sky-400 border border-zinc-700"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  NIN Verification
                </button>
                <button
                  onClick={() => setActiveApiTab("nuban")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    activeApiTab === "nuban"
                      ? "bg-zinc-800 text-indigo-400 border border-zinc-700"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Bank Account (NUBAN)
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <span className="font-mono text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  200 OK
                </span>
                <span className="font-mono text-[11px] text-zinc-500">
                  {activeApiTab === "bvn" ? "142ms" : activeApiTab === "nin" ? "168ms" : "115ms"}
                </span>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800">
              <div className="p-4 sm:p-6 bg-zinc-950">
                <span className="text-[11px] font-mono text-zinc-500 block mb-2">REQUEST PAYLOAD</span>
                <pre className="font-mono text-xs text-zinc-300 overflow-x-auto leading-relaxed">
                  {apiSamples[activeApiTab].curl}
                </pre>
              </div>
              <div className="p-4 sm:p-6 bg-zinc-900/40">
                <span className="text-[11px] font-mono text-emerald-500/80 block mb-2">STANDARDIZED RESPONSE</span>
                <pre className="font-mono text-xs text-emerald-300/90 overflow-x-auto leading-relaxed">
                  {apiSamples[activeApiTab].response}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Product Suite Section */}
        <section id="products" className="border-t border-zinc-900 bg-zinc-950/60 py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                The Verixa Identity Suite
              </h2>
              <p className="mt-4 text-zinc-400 text-sm sm:text-base">
                Modular verification products designed to scale from early-stage startups to high-volume enterprise operations.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Verixa Verify */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col justify-between hover:border-zinc-700 transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="verified">AVAILABLE</Badge>
                    <span className="font-mono text-xs text-zinc-500">Core Engine</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Verixa Verify</h3>
                  <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                    Instant validation for Bank Verification Numbers (BVN), National ID (NIN), and bank account ownership lookups.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-800/80 font-mono text-xs text-emerald-400">
                  POST /v1/verify/* &rarr;
                </div>
              </div>

              {/* Smart Identity Cache */}
              <div className="rounded-2xl border border-emerald-500/40 bg-zinc-900/60 p-6 flex flex-col justify-between hover:border-emerald-500/70 transition-colors relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ⚡ SUB-15MS · 60% SAVINGS
                    </span>
                    <span className="font-mono text-xs text-zinc-500">Identity Cache</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Smart Identity Cache</h3>
                  <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                    Sub-15ms memory caching for repeat BVN, NIN, and bank lookups within a 30-day window. Slashes lookup costs by up to 60% with complete tenant NDPR privacy isolation.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-800/80 font-mono text-xs text-emerald-400 flex items-center justify-between">
                  <span>X-Cache: HIT / MISS</span>
                  <AppLink app="docs" path="/smart-cache" className="hover:underline">Docs &rarr;</AppLink>
                </div>
              </div>

              {/* Verixa API */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col justify-between hover:border-zinc-700 transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="verified">AVAILABLE</Badge>
                    <span className="font-mono text-xs text-zinc-500">Gateway</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Verixa API & Idempotency</h3>
                  <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                    Restful developer API with Redis-backed 24h idempotency keys, sub-second SLAs, and live sandbox environments.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-800/80 font-mono text-xs text-emerald-400">
                  Idempotency-Key header &rarr;
                </div>
              </div>

              {/* Verixa Webhooks */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col justify-between hover:border-zinc-700 transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="verified">AVAILABLE</Badge>
                    <span className="font-mono text-xs text-zinc-500">Events</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Real-time Webhooks</h3>
                  <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                    HMAC SHA-512 signed webhook notifications for asynchronous top-ups and verification events.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-800/80 font-mono text-xs text-emerald-400">
                  Webhook signatures &rarr;
                </div>
              </div>

              {/* Verixa Business */}
              <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/20 p-6 flex flex-col justify-between opacity-85">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="neutral">COMING SOON</Badge>
                    <span className="font-mono text-xs text-zinc-500">Corporate</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Verixa Business (CAC)</h3>
                  <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                    Corporate entity verification, CAC registration validation, and beneficial ownership resolution.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-800/60 font-mono text-xs text-zinc-500">
                  Enterprise preview &rarr;
                </div>
              </div>

              {/* Verixa Link */}
              <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/20 p-6 flex flex-col justify-between opacity-85">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="neutral">COMING SOON</Badge>
                    <span className="font-mono text-xs text-zinc-500">Hosted UI</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Verixa Link</h3>
                  <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                    Embeddable zero-code verification widget to securely collect and verify KYC data directly from end users.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-800/60 font-mono text-xs text-zinc-500">
                  SDK Integration &rarr;
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Flow */}
        <section className="border-t border-zinc-900 py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                How Verixa ID Works
              </h2>
              <p className="mt-4 text-zinc-400 text-sm">
                A provider-agnostic engine that eliminates single points of failure across identity data providers.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6 relative">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <span className="font-mono text-xs font-bold text-emerald-400">01</span>
                <h4 className="text-base font-bold text-white mt-2 mb-1">Your Application</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Sends an authorized request with an Idempotency-Key and payload.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <span className="font-mono text-xs font-bold text-emerald-400">02</span>
                <h4 className="text-base font-bold text-white mt-2 mb-1">Verixa Gateway</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Validates API key, checks NGX balance, and prevents duplicate requests.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <span className="font-mono text-xs font-bold text-emerald-400">03</span>
                <h4 className="text-base font-bold text-white mt-2 mb-1">Routing & Failover</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Routes queries to upstream registries with automatic fallback protection.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <span className="font-mono text-xs font-bold text-emerald-400">04</span>
                <h4 className="text-base font-bold text-white mt-2 mb-1">Normalized Result</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Returns clean, standardized JSON with request reference and audit metadata.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section id="solutions" className="border-t border-zinc-900 bg-zinc-950/60 py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Built for High-Growth Industries
              </h2>
              <p className="mt-4 text-zinc-400 text-sm">
                Empowering regulated sectors with frictionless customer onboarding.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl border border-zinc-800/80 bg-zinc-900/30">
                <h4 className="text-base font-bold text-white mb-2">Fintech & Neobanks</h4>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Perform Tier 1, 2, and 3 KYC validation during digital wallet creation and loan disbursement.
                </p>
              </div>
              <div className="p-6 rounded-xl border border-zinc-800/80 bg-zinc-900/30">
                <h4 className="text-base font-bold text-white mb-2">Mortgage & Lending</h4>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Verify borrower identity and cross-reference bank account details for instant credit assessment.
                </p>
              </div>
              <div className="p-6 rounded-xl border border-zinc-800/80 bg-zinc-900/30">
                <h4 className="text-base font-bold text-white mb-2">Property & Tenant Screening</h4>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Validate government IDs for prospective tenants and property buyers before signing agreements.
                </p>
              </div>
              <div className="p-6 rounded-xl border border-zinc-800/80 bg-zinc-900/30">
                <h4 className="text-base font-bold text-white mb-2">HR & Recruitment</h4>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Run background verification on candidate NIN and banking records before issuing employment contracts.
                </p>
              </div>
              <div className="p-6 rounded-xl border border-zinc-800/80 bg-zinc-900/30">
                <h4 className="text-base font-bold text-white mb-2">Digital Asset Platforms</h4>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Comply with anti-money laundering (AML) directives by validating Nigerian identities at signup.
                </p>
              </div>
              <div className="p-6 rounded-xl border border-zinc-800/80 bg-zinc-900/30">
                <h4 className="text-base font-bold text-white mb-2">Merchant Onboarding</h4>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Verify business owners and bank payout accounts before approving payment gateway settlements.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="border-t border-zinc-900 py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono mb-4">
                1 NGX Credit = ₦1.00 NGN
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Transparent Usage Pricing
              </h2>
              <p className="mt-4 text-zinc-400 text-sm">
                No monthly maintenance fees. Only pay for successful verifications with prepaid NGX credits.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Sandbox Tier */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Developer Sandbox</h3>
                  <p className="text-xs text-zinc-400 mt-1">For testing and building integrations</p>
                  <div className="mt-6 mb-6">
                    <span className="text-4xl font-extrabold text-white">₦0</span>
                    <span className="text-xs text-zinc-500 ml-2">/ free forever</span>
                  </div>
                  <ul className="space-y-3 text-xs text-zinc-300">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">&#10003;</span>
                      Unlimited mock API calls
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">&#10003;</span>
                      Realistic Nigerian test data
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">&#10003;</span>
                      API keys & Interactive Explorer
                    </li>
                  </ul>
                </div>
                <AppLink
                  app="dashboard"
                  path="/register"
                  className="mt-8 block text-center rounded-lg border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 py-2.5 text-xs font-semibold text-white transition-colors"
                >
                  Create Free Sandbox
                </AppLink>
              </div>

              {/* Pay As You Go */}
              <div className="rounded-2xl border-2 border-emerald-500/80 bg-zinc-900/80 p-8 flex flex-col justify-between relative shadow-xl shadow-emerald-500/10">
                <div className="absolute -top-3 right-6 px-2.5 py-0.5 rounded-full bg-emerald-500 text-zinc-950 font-mono text-[10px] font-bold">
                  POPULAR · SMART CACHE READY
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Pay As You Go</h3>
                  <p className="text-xs text-zinc-400 mt-1">Prepaid NGX credits via Dedicated Virtual Account with dual-tier live & cache hit rates</p>
                  <div className="mt-5 mb-4">
                    <span className="text-4xl font-extrabold text-white">1:1</span>
                    <span className="text-xs text-zinc-400 ml-2">NGX to NGN (₦)</span>
                  </div>

                  <div className="mb-4 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between">
                    <span>⚡ Smart Cache Discount:</span>
                    <strong className="font-mono text-emerald-400">Save 50% - 60%</strong>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-medium text-zinc-200">BVN Lookup</span>
                        <span className="font-mono text-xs">
                          <span className="text-zinc-400">₦50</span>
                          <span className="text-zinc-600 mx-1">/</span>
                          <span className="text-emerald-400 font-semibold">₦20 cache</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500">60% savings on repeat customer lookups</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-medium text-zinc-200">NIN Verification</span>
                        <span className="font-mono text-xs">
                          <span className="text-zinc-400">₦50</span>
                          <span className="text-zinc-600 mx-1">/</span>
                          <span className="text-emerald-400 font-semibold">₦20 cache</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500">Sub-15ms cached latency across 30 days</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-medium text-zinc-200">NUBAN Bank Account</span>
                        <span className="font-mono text-xs">
                          <span className="text-zinc-400">₦10</span>
                          <span className="text-zinc-600 mx-1">/</span>
                          <span className="text-emerald-400 font-semibold">₦5 cache</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500">50% savings on recurring settlement lookups</p>
                    </div>
                  </div>

                  <ul className="mt-4 space-y-2 text-xs text-zinc-300">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">&#10003;</span>
                      Dedicated Bank Account auto-credit
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">&#10003;</span>
                      <span>Cache bypass via <code className="text-emerald-400 font-mono text-[10px]">X-Bypass-Cache</code></span>
                    </li>
                  </ul>
                </div>
                <AppLink
                  app="dashboard"
                  path="/register"
                  className="mt-6 block text-center rounded-lg bg-emerald-500 hover:bg-emerald-400 py-2.5 text-xs font-bold text-zinc-950 transition-colors shadow-md"
                >
                  Start Building Live
                </AppLink>
              </div>

              {/* Custom Enterprise */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">High-Volume Enterprise</h3>
                  <p className="text-xs text-zinc-400 mt-1">For operations exceeding 100,000 checks/mo</p>
                  <div className="mt-6 mb-6">
                    <span className="text-4xl font-extrabold text-white">Custom</span>
                    <span className="text-xs text-zinc-500 ml-2">Volume discounts</span>
                  </div>
                  <ul className="space-y-3 text-xs text-zinc-300">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">&#10003;</span>
                      Custom rate negotiated per volume tier
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">&#10003;</span>
                      Extended Smart Cache TTL (up to 90 days)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">&#10003;</span>
                      Dedicated account manager & Slack channel
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">&#10003;</span>
                      99.99% uptime SLA with priority routing
                    </li>
                  </ul>
                </div>
                <Link
                  href="/contact"
                  className="mt-8 block text-center rounded-lg border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 py-2.5 text-xs font-semibold text-white transition-colors"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Future APIs Roadmap Section */}
        <section id="roadmap" className="border-t border-zinc-900 bg-zinc-950/80 py-24 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/5 blur-[120px] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 relative">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-4">
                PIPELINE & ROADMAP
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Expanding the Identity Surface
              </h2>
              <p className="mt-4 text-zinc-400 text-sm sm:text-base leading-relaxed">
                We are actively integrating 8 new national identity registers, business directories, and biometric engines into the unified Verixa gateway.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* 1. CAC KYB */}
              <div className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      ALPHA · Q4 2026
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">Corporate</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5">CAC Entity (KYB)</h3>
                  <code className="text-[11px] font-mono text-emerald-400 block mb-2">POST /v1/verify/cac</code>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Verify registered RC/BN numbers with official Corporate Affairs Commission records and directors.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span>Source: CAC Public API</span>
                  <span className="text-amber-400">In Testing</span>
                </div>
              </div>

              {/* 2. FRSC Drivers License */}
              <div className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      ALPHA · Q4 2026
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">Driving</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5">FRSC Driver's License</h3>
                  <code className="text-[11px] font-mono text-emerald-400 block mb-2">POST /v1/verify/drivers-license</code>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Instant validation of Nigerian driver licenses via the Federal Road Safety Corps registry.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span>Source: FRSC Registry</span>
                  <span className="text-amber-400">Sandbox Ready</span>
                </div>
              </div>

              {/* 3. NIS Passport */}
              <div className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      DEV · Q1 2027
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">Travel</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5">NIS Passport Check</h3>
                  <code className="text-[11px] font-mono text-emerald-400 block mb-2">POST /v1/verify/passport</code>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Validate Nigerian e-Passports against the Nigerian Immigration Service database with MRZ decoding.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span>Source: NIS Gateway</span>
                  <span className="text-sky-400">Developing</span>
                </div>
              </div>

              {/* 4. INEC Voter's Card */}
              <div className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      DEV · Q1 2027
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">Electoral</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5">INEC Voter's Card (PVC)</h3>
                  <code className="text-[11px] font-mono text-emerald-400 block mb-2">POST /v1/verify/voter-card</code>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Validate Permanent Voter Cards (VIN) directly through the national electoral registry.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span>Source: INEC Registry</span>
                  <span className="text-sky-400">Developing</span>
                </div>
              </div>

              {/* 5. Biometric Face Match */}
              <div className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      DEV · Q1 2027
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">Biometrics</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5">Face Match & Liveness</h3>
                  <code className="text-[11px] font-mono text-emerald-400 block mb-2">POST /v1/verify/biometrics/face</code>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    1:1 face matching against government ID photos with 3D passive anti-spoof liveness detection.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span>Source: Neural Vision Model</span>
                  <span className="text-sky-400">Developing</span>
                </div>
              </div>

              {/* 6. TIN / FIRS */}
              <div className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      PLAN · Q2 2027
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">Tax</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5">TIN & FIRS Tax ID</h3>
                  <code className="text-[11px] font-mono text-emerald-400 block mb-2">POST /v1/verify/tin</code>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Validate individual and corporate Tax Identification Numbers with Federal Inland Revenue.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span>Source: FIRS / JTB</span>
                  <span className="text-purple-400">Architecting</span>
                </div>
              </div>

              {/* 7. Telecom Phone KYC */}
              <div className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      PLAN · Q2 2027
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">Telco</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5">Telecom Phone KYC</h3>
                  <code className="text-[11px] font-mono text-emerald-400 block mb-2">POST /v1/verify/phone-kyc</code>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Confirm MSISDN subscriber registration details, SIM swap recency, and live subscriber status.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span>Source: Telco Hubs</span>
                  <span className="text-purple-400">Architecting</span>
                </div>
              </div>

              {/* 8. Address Verification */}
              <div className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      PLAN · Q2 2027
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">Physical</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5">Address Verification</h3>
                  <code className="text-[11px] font-mono text-emerald-400 block mb-2">POST /v1/verify/address</code>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Automated address standardisation, geospatial coordinate matching, and digital agent dispatch.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span>Source: GIS & Field Agents</span>
                  <span className="text-purple-400">Architecting</span>
                </div>
              </div>
            </div>

            <div className="mt-12 p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white">Need an identity registry not listed here?</h4>
                <p className="text-xs text-zinc-400 mt-1">We partner with enterprise compliance teams to build bespoke upstream adapters.</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <AppLink app="docs" path="/roadmap" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300">
                  Read Full Roadmap Spec &rarr;
                </AppLink>
                <Link href="/contact" className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-colors">
                  Request Custom API
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-zinc-900 bg-gradient-to-b from-zinc-950 to-zinc-900/40 py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Start building with Verixa ID today
            </h2>
            <p className="mt-4 text-zinc-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Integrate verified BVN, NIN, and bank verification in minutes with our developer sandbox.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <AppLink
                app="dashboard"
                path="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm px-8 py-3.5 transition-all shadow-lg"
              >
                Create Account Free
              </AppLink>
              <AppLink
                app="docs"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-sm px-8 py-3.5 transition-colors"
              >
                Read Quickstart Docs
              </AppLink>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center sm:items-start gap-2">
            <Logo size="sm" />
            <p className="text-xs text-zinc-500">
              &copy; {new Date().getFullYear()} Verixa ID. B2B Verification Infrastructure.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-400 font-medium">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
            <a href="https://chat.whatsapp.com/verixaid" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
              WhatsApp Community
            </a>
            <a href="https://t.me/verixaid" target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 transition-colors">
              Telegram Updates
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
