"use client"

import * as React from "react"
import Link from "next/link"
import { GlassyHeader, AppLink } from "@verixa/ui"

type CodeTab = "bvn_ts" | "airtime_curl" | "data_py" | "nuban_go"

export default function HomePage() {
  const [activeTab, setActiveTab] = React.useState<CodeTab>("bvn_ts")
  const [copied, setCopied] = React.useState(false)
  const [activeFaq, setActiveFaq] = React.useState<number | null>(null)

  const codeSnippets: Record<CodeTab, { title: string; code: string; lang: string }> = {
    bvn_ts: {
      title: "BVN Verification (TypeScript SDK)",
      lang: "TypeScript",
      code: `import { VerixaClient } from "@verixa/sdk";

const verixa = new VerixaClient({
  apiKey: process.env.VERIXA_API_KEY,
  environment: "production",
});

const verification = await verixa.verify.bvn({
  bvn: "22123456789",
  firstName: "CHIDERA",
  lastName: "OLUTOLA",
});

console.log(verification.status); // "verified"
console.log(verification.data.matchScore); // 0.98`,
    },
    airtime_curl: {
      title: "Airtime Vending VTU (cURL)",
      lang: "cURL",
      code: `curl -X POST https://api.verixaid.com/v1/vas/airtime \\
  -H "Authorization: Bearer vx_live_9f83a8f1e29c..." \\
  -H "Idempotency-Key: a1b2c3d4-e5f6-7890..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "network": "MTN",
    "phoneNumber": "08031234567",
    "amount": 1000
  }'`,
    },
    data_py: {
      title: "Mobile Data Bundle (Python)",
      lang: "Python",
      code: `from verixa import VerixaClient
import os

client = VerixaClient(api_key=os.getenv("VERIXA_API_KEY"))

# Vend 5GB SME data plan to customer
bundle = client.vas.purchase_data(
    network="AIRTEL",
    phone_number="08029876543",
    plan_code="AIRTEL-5GB-SME"
)

print(bundle.status) # "success"
print(bundle.reference) # "vx_vas_89b21f"`,
    },
    nuban_go: {
      title: "NUBAN Bank Account (Go)",
      lang: "Go",
      code: `package main

import (
    "context"
    "fmt"
    "github.com/verixa/verixa-go"
)

func main() {
    client := verixa.NewClient("vx_live_9f83a8f1...")
    res, err := client.VerifyBankAccount(context.Background(), &verixa.BankLookup{
        AccountNumber: "0123456789",
        BankCode:      "058", // GTBank
    })
    if err != nil {
        panic(err)
    }
    fmt.Println(res.AccountName) // "TOBILOBA OLUFEYIKEMI"
}`,
    },
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab].code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const navItems = [
    {
      label: "Products",
      dropdown: [
        {
          label: "BVN Lookup & Match",
          description: "Biometric and identity checks with fuzzy name scoring",
          badge: "Core",
          app: "docs" as const,
          path: "/bvn",
        },
        {
          label: "NIN Verification",
          description: "NIMC National Identity register lookups and vNIN support",
          badge: "Core",
          app: "docs" as const,
          path: "/nin",
        },
        {
          label: "Bank Account (NUBAN)",
          description: "Instant account name, bank status, and tier resolution",
          badge: "Core",
          app: "docs" as const,
          path: "/nuban",
        },
        {
          label: "Airtime & Mobile Data API",
          description: "Automated VTU top-ups and SME mobile data gifting API",
          badge: "Telecom VAS",
          app: "docs" as const,
          path: "/airtime-data",
        },
        {
          label: "Smart Identity Cache",
          description: "Sub-15ms cached lookups with 60% fee reduction",
          badge: "Sub-15ms",
          app: "docs" as const,
          path: "/smart-cache",
        },
        {
          label: "Corporate CAC (KYB)",
          description: "Entity validation and beneficial ownership lookup",
          badge: "Corporate",
          app: "docs" as const,
          path: "/cac",
        },
        {
          label: "SMS & WhatsApp Messaging",
          description: "Reliable OTP routing across Nigerian mobile telcos",
          app: "docs" as const,
          path: "/messaging",
        },
      ],
    },
    {
      label: "Solutions",
      dropdown: [
        {
          label: "Fintech & Neobanks",
          description: "Tier 1-3 KYC for wallet onboarding and AML compliance",
          href: "#solutions",
        },
        {
          label: "Digital Lending",
          description: "Cross-reference borrower identity against verified NUBAN accounts",
          href: "#solutions",
        },
        {
          label: "Telecom & VAS Resellers",
          description: "Wholesale automated airtime vending and corporate data distribution",
          app: "docs" as const,
          path: "/airtime-data",
        },
        {
          label: "HR & Contractor Screening",
          description: "Pre-employment NIN, background, and bank validations",
          href: "#solutions",
        },
      ],
    },
    {
      label: "Developers",
      dropdown: [
        {
          label: "API Documentation",
          description: "Complete REST schemas, error taxonomies, and SDK guides",
          app: "docs" as const,
          path: "/",
        },
        {
          label: "Airtime & Data API Guide",
          description: "VTU vending, telco network codes, and webhook callbacks",
          app: "docs" as const,
          path: "/airtime-data",
        },
        {
          label: "Smart Identity Cache Guide",
          description: "How to save 60% on recurring customer verification queries",
          app: "docs" as const,
          path: "/smart-cache",
        },
        {
          label: "Environments & Sandbox",
          description: "Live test keys, mock response simulator, and failovers",
          app: "docs" as const,
          path: "/environments",
        },
      ],
    },
    { label: "APIs & Pricing", href: "#pricing" },
    { label: "Roadmap", href: "#roadmap" },
    { label: "Docs", app: "docs" as const, path: "/" },
  ]

  const faqs = [
    {
      q: "How do I get an API key for Verixa ID?",
      a: "Create an account on console.verixa.com, navigate to the API Keys section, and generate a new Sandbox or Production key. Sandbox keys are ready immediately for instant mock testing.",
    },
    {
      q: "Does Verixa support automated Airtime & Mobile Data vending?",
      a: "Yes. Verixa provides high-throughput REST APIs for instant VTU airtime vending (MTN, Airtel, Glo, 9mobile) and corporate SME data bundle gifting. All telecom requests are backed by multi-aggregator failovers and instant webhook callbacks.",
    },
    {
      q: "What is Smart Identity Cache and how does it save 60%?",
      a: "When your platform verifies a customer (e.g. BVN or NIN), Verixa securely caches the verified record for 30 days within your private tenant partition. If you re-query that identity within 30 days, Verixa returns the result in sub-15ms for only ₦20 (instead of ₦50), saving up to 60%.",
    },
    {
      q: "How does the multi-provider failover work?",
      a: "Upstream government registries and telco gateways experience frequent downtime. Verixa continuously monitors latency and error rates across multiple verified upstream aggregators. If one provider fails or degrades, Verixa automatically re-routes your request within 150ms without dropping the API call.",
    },
    {
      q: "How does billing and NGX credit work?",
      a: "Verixa operates on prepaid NGX credits at a strict 1:1 ratio with Nigerian Naira (1 NGX = ₦1.00). Each organization is provisioned a Dedicated Virtual Bank Account. Any bank transfer instantly credits your balance via webhooks 24/7.",
    },
    {
      q: "Is Verixa NDPR and GDPR compliant?",
      a: "Yes. Verixa complies strictly with the Nigeria Data Protection Act (NDPA) and NDPR standards. Enterprise customers can enable Zero Data Retention (ZDR) to purge biometric records immediately after match verification.",
    },
  ]

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/25 selection:text-emerald-300 antialiased relative">
      {/* Ambient Top Glow Orbs to give the Frosted Glass true translucent color diffusion */}
      <div
        aria-hidden="true"
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-40 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-sky-500/15 blur-3xl pointer-events-none -z-10"
      />

      {/* 1. Sleek Glassy Floating Header (Grok / xAI Parity) */}
      <GlassyHeader
        logoBadge="API"
        logoBadgeColor="emerald"
        navItems={navItems}
        searchPlaceholder="Search docs..."
        secondaryCta={{
          label: "Contact Sales",
          href: "/contact",
        }}
        primaryCta={{
          label: "Get your API key",
          app: "dashboard",
          path: "/register",
        }}
      />

      {/* 2. Sticky Sub-Navigation Strip ("On this page") */}
      <div
        className="sticky top-16 z-40 border-b border-white/[0.08]"
        style={{
          backgroundColor: "rgba(9, 9, 11, 0.72)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
        }}
      >
        <div className="mx-auto w-full px-4 lg:px-6 max-w-7xl">
          <nav
            aria-label="On this page navigation"
            className="flex items-center gap-x-6 overflow-x-auto whitespace-nowrap py-3 text-xs sm:text-[13px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <span className="text-zinc-500 font-medium shrink-0">On this page</span>
            <a href="#quickstart" className="text-zinc-400 hover:text-white transition-colors shrink-0">
              API keys
            </a>
            <a href="#pricing" className="text-zinc-400 hover:text-white transition-colors shrink-0">
              APIs & pricing
            </a>
            <a href="#playground" className="text-zinc-400 hover:text-white transition-colors shrink-0">
              Free Playground
            </a>
            <a href="#capabilities" className="text-zinc-400 hover:text-white transition-colors shrink-0">
              What you can build
            </a>
            <a href="#enterprise" className="text-zinc-400 hover:text-white transition-colors shrink-0">
              Enterprise
            </a>
            <a href="#roadmap" className="text-zinc-400 hover:text-white transition-colors shrink-0">
              Roadmap
            </a>
            <a href="#faq" className="text-zinc-400 hover:text-white transition-colors shrink-0">
              FAQ
            </a>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1">
        {/* 3. Hero Section with Cyber-Terminal & Aurora Mesh */}
        <section className="relative pt-20 pb-16 sm:pt-28 sm:pb-24 lg:pt-32 lg:pb-28 overflow-hidden">
          <div className="mx-auto w-full px-4 lg:px-6 max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              {/* Left Column: Editorial Display Typography */}
              <div>
                <span className="inline-block text-xs font-mono font-medium tracking-wider text-emerald-400/90 uppercase">
                  VERIXA API // IDENTITY & TELECOM GATEWAY
                </span>

                <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl font-[450] leading-[1.08] tracking-tight text-white text-balance">
                  Build with Verixa.
                  <span className="block text-zinc-400 font-light mt-1">Verify in milliseconds.</span>
                </h1>

                <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-xl leading-relaxed">
                  Verify BVN, NIN, and bank accounts, and vend automated Airtime and Mobile Data with sub-150ms multi-provider failover. One usage-based API built for African fintech and enterprise.
                </p>

                {/* Pill Action CTAs */}
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <AppLink
                    app="dashboard"
                    path="/register"
                    className="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold bg-white hover:bg-zinc-200 text-zinc-950 transition-all shadow-md active:scale-[0.99]"
                  >
                    Get your API key &rarr;
                  </AppLink>

                  <AppLink
                    app="docs"
                    path="/"
                    className="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 border border-white/[0.1] transition-all backdrop-blur-md active:scale-[0.99]"
                  >
                    Read the docs
                  </AppLink>
                </div>

                {/* Value Proposition Checklist */}
                <ul className="mt-8 flex flex-col gap-2.5 text-xs sm:text-sm text-zinc-400">
                  <li className="flex items-center gap-2.5">
                    <svg className="size-4 shrink-0 text-emerald-400" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Works with your existing HTTP & SDK stack in Python, TypeScript, or plain cURL</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <svg className="size-4 shrink-0 text-emerald-400" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Identity verification from ₦10 per check & wholesale Mobile Data from ₦220/GB</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <svg className="size-4 shrink-0 text-emerald-400" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Free sandbox & simulated Playground included with every account</span>
                  </li>
                </ul>
              </div>

              {/* Right Column: The Cyber-Sleek Terminal Chrome with Aurora Glow */}
              <div className="relative w-full">
                {/* Aurora Mesh Glow Backdrop */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 -m-6 sm:-m-10 pointer-events-none opacity-45 blur-3xl"
                  style={{
                    background:
                      "radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.35) 0%, transparent 45%), radial-gradient(circle at 70% 60%, rgba(56, 189, 248, 0.25) 0%, transparent 40%), radial-gradient(circle at 20% 70%, rgba(99, 102, 241, 0.2) 0%, transparent 45%)",
                  }}
                />

                {/* Cyber Notch Frame Wrapper */}
                <div className="relative p-6 sm:p-8 rounded-2xl bg-zinc-950/90 border border-white/[0.08] shadow-[0_24px_64px_-16px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                  {/* Stepped Corner Notches (14px Geometric Accents) */}
                  <span className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-emerald-500/80 pointer-events-none rounded-tl-sm" />
                  <span className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-emerald-500/80 pointer-events-none rounded-tr-sm" />
                  <span className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-emerald-500/80 pointer-events-none rounded-bl-sm" />
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-emerald-500/80 pointer-events-none rounded-br-sm" />

                  {/* Terminal Chrome Titlebar */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-[#ff5f57] shadow-[0_0_8px_rgba(255,95,87,0.5)]" />
                      <span className="size-2.5 rounded-full bg-[#febc2e] shadow-[0_0_8px_rgba(254,188,46,0.5)]" />
                      <span className="size-2.5 rounded-full bg-[#28c840] shadow-[0_0_8px_rgba(40,200,64,0.5)]" />
                      <span className="ml-3 font-mono text-xs text-zinc-400 font-medium">
                        {codeSnippets[activeTab].title}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <svg className="size-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none">
                            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                          </svg>
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Code Editor Window */}
                  <div className="py-4 font-mono text-[13px] leading-relaxed overflow-x-auto min-h-[220px]">
                    <pre className="text-zinc-300">
                      <code>{codeSnippets[activeTab].code}</code>
                    </pre>
                  </div>

                  {/* API & Language Switcher Tab Pills */}
                  <div className="pt-4 border-t border-white/[0.08] flex items-center gap-1.5 flex-wrap">
                    {(
                      [
                        { id: "bvn_ts", label: "BVN (TypeScript)" },
                        { id: "airtime_curl", label: "Airtime VTU (cURL)" },
                        { id: "data_py", label: "Mobile Data (Python)" },
                        { id: "nuban_go", label: "NUBAN Bank (Go)" },
                      ] as const
                    ).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveTab(item.id)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
                          activeTab === item.id
                            ? "bg-white text-zinc-950 font-semibold shadow-sm"
                            : "text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Quickstart Stepper & Mock Console Window (#quickstart) */}
        <section id="quickstart" className="border-t border-white/[0.08] py-20 sm:py-24">
          <div className="mx-auto w-full px-4 lg:px-6 max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div className="max-w-lg">
                <span className="text-xs font-mono font-medium tracking-wider text-emerald-400/90 uppercase">
                  ZERO TO FIRST TRANSACTION
                </span>
                <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white">
                  Start building with your API key
                </h2>
                <p className="mt-4 text-zinc-400 leading-relaxed text-sm sm:text-base">
                  Create an account, generate an API key, and complete your first verified identity check or airtime top-up in under a minute.
                </p>

                {/* Vertical Stepper List */}
                <ol className="mt-8 space-y-6">
                  <li className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className="size-7 rounded-full border border-white/[0.12] bg-white/[0.04] text-white flex items-center justify-center text-xs font-mono font-medium">
                        1
                      </span>
                      <span className="w-px flex-1 bg-white/[0.08] my-2" />
                    </div>
                    <div className="pb-4">
                      <h3 className="text-sm font-medium text-white">Sign up at console.verixa.com</h3>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        Instant organization setup with ₦1,000 complimentary Sandbox test credits.
                      </p>
                    </div>
                  </li>

                  <li className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className="size-7 rounded-full border border-white/[0.12] bg-white/[0.04] text-white flex items-center justify-center text-xs font-mono font-medium">
                        2
                      </span>
                      <span className="w-px flex-1 bg-white/[0.08] my-2" />
                    </div>
                    <div className="pb-4">
                      <h3 className="text-sm font-medium text-white">Create an API key</h3>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        Generate live and test tokens instantly with role-based team management.
                      </p>
                    </div>
                  </li>

                  <li className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className="size-7 rounded-full border border-white/[0.12] bg-white/[0.04] text-white flex items-center justify-center text-xs font-mono font-medium">
                        3
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-white">Set your base URL and request</h3>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        Send requests to <code className="font-mono text-emerald-400">https://api.verixaid.com/v1</code> with your bearer token.
                      </p>
                    </div>
                  </li>
                </ol>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <AppLink
                    app="dashboard"
                    path="/register"
                    className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold bg-white hover:bg-zinc-200 text-zinc-950 transition-all shadow-sm"
                  >
                    Get your API key
                  </AppLink>

                  <AppLink
                    app="docs"
                    path="/authentication"
                    className="text-xs sm:text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                  >
                    Full quickstart in docs &rarr;
                  </AppLink>
                </div>
              </div>

              {/* Right: Mock Console Window */}
              <div className="rounded-xl border border-white/[0.08] bg-[#0c0c0e] shadow-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.08] bg-zinc-950/60">
                  <span className="size-2 rounded-full bg-[#ff5f57]" />
                  <span className="size-2 rounded-full bg-[#febc2e]" />
                  <span className="size-2 rounded-full bg-[#28c840]" />
                  <span className="ml-3 font-mono text-xs text-zinc-500">console.verixa.com / api-keys</span>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-white">API Keys</h4>
                      <p className="text-xs text-zinc-500">Manage production and sandbox credentials</p>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Ready
                    </span>
                  </div>

                  <div className="divide-y divide-white/[0.06] rounded-lg border border-white/[0.08] bg-zinc-950/40">
                    <div className="flex items-center justify-between p-3.5">
                      <div>
                        <p className="text-xs font-medium text-white">production-backend-primary</p>
                        <p className="text-[11px] font-mono text-zinc-500">vx_live_••••••••••••••••3kf9</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-zinc-500 hidden sm:inline">Created Oct 2026</span>
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-mono font-medium border border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                          Active
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3.5">
                      <div>
                        <p className="text-xs font-medium text-white">sandbox-developer-test</p>
                        <p className="text-[11px] font-mono text-zinc-500">vx_test_••••••••••••••••q7d2</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-zinc-500 hidden sm:inline">Created Today</span>
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-mono font-medium border border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-500">
                    Live secret keys are revealed only once at creation. Store them securely in environment variables.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. APIs & Usage Pricing Table (#pricing) */}
        <section id="pricing" className="border-t border-white/[0.08] py-20 sm:py-28">
          <div className="mx-auto w-full px-4 lg:px-6 max-w-7xl space-y-12">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <span className="text-xs font-mono font-medium tracking-wider text-emerald-400/90 uppercase">
                  TRANSPARENT USAGE PRICING
                </span>
                <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white">
                  APIs & usage pricing
                </h2>
                <p className="mt-4 text-zinc-400 max-w-xl text-sm sm:text-base leading-relaxed">
                  No monthly seat fees or maintenance retainers. Prepaid credits billed per query with built-in Smart Cache repeat discounts up to 60% and wholesale telecom rates.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <AppLink
                  app="dashboard"
                  path="/register"
                  className="rounded-full px-5 py-2 text-xs sm:text-sm font-semibold bg-white hover:bg-zinc-200 text-zinc-950 transition-all shadow-sm"
                >
                  Get your API key
                </AppLink>
                <AppLink
                  app="docs"
                  path="/airtime-data"
                  className="rounded-full px-4 py-2 text-xs sm:text-sm font-medium bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 border border-white/[0.08] transition-all"
                >
                  Airtime & Data docs
                </AppLink>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-white/[0.08] text-left">
                <thead className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                  <tr className="[&>th]:py-4 [&>th]:px-4">
                    <th className="w-[28%]">Endpoint / Service</th>
                    <th className="w-[28%]">Capabilities & Checks</th>
                    <th className="w-[14%]">SLA & Latency</th>
                    <th className="w-[15%]">Live Rate / Pricing</th>
                    <th className="w-[15%] text-right">Discount / Savings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-xs sm:text-sm">
                  {/* Airtime */}
                  <tr className="hover:bg-white/[0.02] transition-colors bg-emerald-500/[0.02]">
                    <td className="py-4 px-4 font-mono">
                      <div className="text-white font-medium flex items-center gap-2">
                        Airtime Top-up (VTU)
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                          Telecom VAS
                        </span>
                      </div>
                      <div className="text-zinc-500 text-xs">POST /v1/vas/airtime</div>
                    </td>
                    <td className="py-4 px-4 text-zinc-400">
                      MTN, Airtel, Glo, 9mobile instant vending with auto-balance sync
                    </td>
                    <td className="py-4 px-4 font-mono text-zinc-300">sub-2.0s · 99.9%</td>
                    <td className="py-4 px-4 font-mono text-white font-medium">₦0 fee (Face Value)</td>
                    <td className="py-4 px-4 font-mono text-emerald-400 font-bold text-right">
                      2.5% &ndash; 3.5% <span className="text-[10px] text-emerald-500/80">cashback</span>
                    </td>
                  </tr>

                  {/* Mobile Data */}
                  <tr className="hover:bg-white/[0.02] transition-colors bg-emerald-500/[0.02]">
                    <td className="py-4 px-4 font-mono">
                      <div className="text-white font-medium flex items-center gap-2">
                        Mobile Data Bundles
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-500/15 text-sky-400 border border-sky-500/20">
                          Telecom VAS
                        </span>
                      </div>
                      <div className="text-zinc-500 text-xs">POST /v1/vas/data</div>
                    </td>
                    <td className="py-4 px-4 text-zinc-400">
                      SME, Corporate & Direct data gifting (1GB to 50GB bundles)
                    </td>
                    <td className="py-4 px-4 font-mono text-zinc-300">sub-2.5s · 99.9%</td>
                    <td className="py-4 px-4 font-mono text-white font-medium">from ₦220.00 / GB</td>
                    <td className="py-4 px-4 font-mono text-emerald-400 font-bold text-right">
                      Wholesale <span className="text-[10px] text-emerald-500/80">Tier 1</span>
                    </td>
                  </tr>

                  {/* BVN */}
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 font-mono">
                      <div className="text-white font-medium">BVN Verification</div>
                      <div className="text-zinc-500 text-xs">POST /v1/verify/bvn</div>
                    </td>
                    <td className="py-4 px-4 text-zinc-400">
                      Full name, DOB, phone, photo match & fuzzy scoring
                    </td>
                    <td className="py-4 px-4 font-mono text-zinc-300">sub-200ms · 99.9%</td>
                    <td className="py-4 px-4 font-mono text-white font-medium">₦50.00</td>
                    <td className="py-4 px-4 font-mono text-emerald-400 font-bold text-right">
                      ₦20.00 cache <span className="text-[10px] text-emerald-500/80">(-60%)</span>
                    </td>
                  </tr>

                  {/* NIN */}
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 font-mono">
                      <div className="text-white font-medium">NIN National Identity</div>
                      <div className="text-zinc-500 text-xs">POST /v1/verify/nin</div>
                    </td>
                    <td className="py-4 px-4 text-zinc-400">
                      NIMC database lookup, vNIN validation, residence state
                    </td>
                    <td className="py-4 px-4 font-mono text-zinc-300">sub-220ms · 99.9%</td>
                    <td className="py-4 px-4 font-mono text-white font-medium">₦50.00</td>
                    <td className="py-4 px-4 font-mono text-emerald-400 font-bold text-right">
                      ₦20.00 cache <span className="text-[10px] text-emerald-500/80">(-60%)</span>
                    </td>
                  </tr>

                  {/* NUBAN */}
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 font-mono">
                      <div className="text-white font-medium">NUBAN Bank Account</div>
                      <div className="text-zinc-500 text-xs">POST /v1/verify/bank-account</div>
                    </td>
                    <td className="py-4 px-4 text-zinc-400">
                      Account name resolution, bank code validation, status
                    </td>
                    <td className="py-4 px-4 font-mono text-zinc-300">sub-120ms · 99.95%</td>
                    <td className="py-4 px-4 font-mono text-white font-medium">₦10.00</td>
                    <td className="py-4 px-4 font-mono text-emerald-400 font-bold text-right">
                      ₦5.00 cache <span className="text-[10px] text-emerald-500/80">(-50%)</span>
                    </td>
                  </tr>

                  {/* Messaging */}
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 font-mono">
                      <div className="text-white font-medium">SMS & WhatsApp Messaging</div>
                      <div className="text-zinc-500 text-xs">POST /v1/messaging/sms</div>
                    </td>
                    <td className="py-4 px-4 text-zinc-400">
                      DND bypass OTP, alphanumeric sender ID, WhatsApp delivery
                    </td>
                    <td className="py-4 px-4 font-mono text-zinc-300">sub-3.0s · 99.9%</td>
                    <td className="py-4 px-4 font-mono text-white font-medium">₦3.50 / SMS</td>
                    <td className="py-4 px-4 font-mono text-emerald-400 font-bold text-right">
                      ₦12.00 / WhatsApp
                    </td>
                  </tr>

                  {/* Phone KYC */}
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 font-mono">
                      <div className="text-white font-medium">Phone Number KYC</div>
                      <div className="text-zinc-500 text-xs">POST /v1/verify/phone</div>
                    </td>
                    <td className="py-4 px-4 text-zinc-400">
                      Network provider, active SIM status, subscriber match
                    </td>
                    <td className="py-4 px-4 font-mono text-zinc-300">sub-180ms · 99.9%</td>
                    <td className="py-4 px-4 font-mono text-white font-medium">₦25.00</td>
                    <td className="py-4 px-4 font-mono text-emerald-400 font-bold text-right">
                      ₦12.50 cache <span className="text-[10px] text-emerald-500/80">(-50%)</span>
                    </td>
                  </tr>

                  {/* CAC */}
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 font-mono">
                      <div className="text-white font-medium">CAC Corporate Entity (KYB)</div>
                      <div className="text-zinc-500 text-xs">POST /v1/verify/cac</div>
                    </td>
                    <td className="py-4 px-4 text-zinc-400">
                      RC/BN registration validation, directors, official address
                    </td>
                    <td className="py-4 px-4 font-mono text-zinc-300">sub-350ms · 99.8%</td>
                    <td className="py-4 px-4 font-mono text-white font-medium">₦150.00</td>
                    <td className="py-4 px-4 font-mono text-emerald-400 font-bold text-right">
                      ₦75.00 cache <span className="text-[10px] text-emerald-500/80">(-50%)</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 6. Playground Callout Card (#playground) */}
        <section id="playground" className="border-t border-white/[0.08] py-16 sm:py-20">
          <div className="mx-auto w-full px-4 lg:px-6 max-w-7xl">
            <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/60 p-8 sm:p-12 relative overflow-hidden">
              <div
                aria-hidden="true"
                className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"
              />

              <div className="max-w-2xl relative">
                <span className="text-xs font-mono font-medium tracking-wider text-emerald-400/90 uppercase">
                  INCLUDED WITH CONSOLE
                </span>
                <h2 className="mt-3 font-display text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-white">
                  Try Verixa in the Playground
                </h2>
                <p className="mt-4 text-zinc-400 text-sm sm:text-base leading-relaxed">
                  The Playground comes with every Console account: simulate BVN, NIN, bank account lookups, and test Airtime & Data top-up calls with live mock responses before writing integration code. When ready to ship, API usage is seamlessly billed per request.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <AppLink
                    app="dashboard"
                    path="/dashboard"
                    className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-xs sm:text-sm font-semibold bg-white hover:bg-zinc-200 text-zinc-950 transition-all shadow-sm"
                  >
                    Open the Playground
                  </AppLink>

                  <AppLink
                    app="docs"
                    path="/environments"
                    className="text-xs sm:text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                  >
                    Learn about mock environments &rarr;
                  </AppLink>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Capabilities Grid ("Everything you can build with the API") (#capabilities) */}
        <section id="capabilities" className="border-t border-white/[0.08] py-20 sm:py-28">
          <div className="mx-auto w-full px-4 lg:px-6 max-w-7xl">
            <div className="mb-12">
              <span className="text-xs font-mono font-medium tracking-wider text-emerald-400/90 uppercase">
                CAPABILITIES & INTEGRATIONS
              </span>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl font-normal tracking-tight text-white">
                Everything you can build with the API
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {/* Card 1: Airtime & Data */}
              <AppLink
                app="docs"
                path="/airtime-data"
                className="group rounded-xl border border-emerald-500/25 bg-emerald-500/[0.03] hover:bg-emerald-500/[0.06] hover:border-emerald-500/40 p-5 transition-all block relative"
              >
                <div className="flex items-center gap-3 mb-2">
                  <svg className="size-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="2" width="14" height="20" rx="3" />
                    <line x1="12" y1="18" x2="12.01" y2="18" />
                  </svg>
                  <h3 className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                    Airtime & Mobile Data API
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                      Popular
                    </span>
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Automated VTU airtime vending and SME/Corporate data gifting across MTN, Airtel, Glo, and 9mobile with instant DLRs.
                </p>
              </AppLink>

              {/* Card 2: BVN */}
              <AppLink
                app="docs"
                path="/bvn"
                className="group rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] p-5 transition-all block"
              >
                <div className="flex items-center gap-3 mb-2">
                  <svg className="size-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="16" rx="3" />
                    <circle cx="9" cy="10" r="2" />
                    <path d="M15 8h2M15 12h2M7 16h10" />
                  </svg>
                  <h3 className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">
                    BVN & Identity Resolution
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Verify Bank Verification Numbers with fuzzy name matching and date of birth cross-validation.
                </p>
              </AppLink>

              {/* Card 3: NIN */}
              <AppLink
                app="docs"
                path="/nin"
                className="group rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] p-5 transition-all block"
              >
                <div className="flex items-center gap-3 mb-2">
                  <svg className="size-5 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                  <h3 className="text-sm font-medium text-white group-hover:text-sky-400 transition-colors">
                    NIN & National Registry
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  NIMC integration with direct vNIN resolution, residence state, and biometric photo retrieval.
                </p>
              </AppLink>

              {/* Card 4: NUBAN */}
              <AppLink
                app="docs"
                path="/nuban"
                className="group rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] p-5 transition-all block"
              >
                <div className="flex items-center gap-3 mb-2">
                  <svg className="size-5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                  <h3 className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">
                    Bank Account (NUBAN)
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Instant account ownership check across all Nigerian commercial banks, neobanks, and microfinance institutions.
                </p>
              </AppLink>

              {/* Card 5: Smart Cache */}
              <AppLink
                app="docs"
                path="/smart-cache"
                className="group rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] p-5 transition-all block"
              >
                <div className="flex items-center gap-3 mb-2">
                  <svg className="size-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  <h3 className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">
                    Smart Identity Cache
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Sub-15ms response times for repeat queries within 30 days, cutting lookup costs by 60%.
                </p>
              </AppLink>

              {/* Card 6: CAC KYB */}
              <AppLink
                app="docs"
                path="/cac"
                className="group rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] p-5 transition-all block"
              >
                <div className="flex items-center gap-3 mb-2">
                  <svg className="size-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 21h18M3 7v14M21 7v14M6 11h4M6 15h4M14 11h4M14 15h4M12 3l9 4H3l9-4z" />
                  </svg>
                  <h3 className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors">
                    Corporate CAC (KYB)
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Validate RC and Business Name registrations against Corporate Affairs Commission records.
                </p>
              </AppLink>
            </div>
          </div>
        </section>

        {/* 8. Enterprise Controls, Compliance & Trust Stack (#enterprise) */}
        <section id="enterprise" className="border-t border-white/[0.08] py-20 sm:py-28">
          <div className="mx-auto w-full px-4 lg:px-6 max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,1fr)] lg:gap-16">
              {/* Left Column: Sticky Enterprise Pitch */}
              <div>
                <span className="text-xs font-mono font-medium tracking-wider text-emerald-400/90 uppercase">
                  ENTERPRISE
                </span>
                <h2 className="mt-3 font-display text-3xl sm:text-4xl font-normal tracking-tight text-white">
                  Enterprise API controls, compliance, and support
                </h2>
                <p className="mt-4 text-zinc-400 text-sm leading-relaxed max-w-sm">
                  The Verixa enterprise tier adds SAML SSO, immutable audit logging, custom SLA guarantees, data residency, and dedicated support on top of the same APIs available in the Console.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold bg-white hover:bg-zinc-200 text-zinc-950 transition-all shadow-sm"
                  >
                    Contact Sales
                  </Link>
                  <Link href="/privacy" className="text-xs sm:text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                    Privacy & Compliance
                  </Link>
                </div>
              </div>

              {/* Right Column: Stacked Row Items */}
              <div className="divide-y divide-white/[0.08]">
                <div className="grid gap-4 py-6 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-8">
                  <h3 className="flex items-center gap-2 text-sm font-medium text-white">
                    <svg className="size-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span>SSO & audit logging</span>
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    SAML 2.0 / Okta integration, granular role-based permissions (RBAC), and immutable API audit trail exports.
                  </p>
                </div>

                <div className="grid gap-4 py-6 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-8">
                  <h3 className="flex items-center gap-2 text-sm font-medium text-white">
                    <svg className="size-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    <span>SOC 2 & NDPR Compliant</span>
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Audited security controls complying with Nigerian Data Protection Regulation (NDPR) and international privacy frameworks.
                  </p>
                </div>

                <div className="grid gap-4 py-6 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-8">
                  <h3 className="flex items-center gap-2 text-sm font-medium text-white">
                    <svg className="size-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <span>Zero Data Retention</span>
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Optionally enable ZDR in your dashboard to immediately purge BVN/NIN biometric photos and sensitive PII upon match delivery.
                  </p>
                </div>

                <div className="grid gap-4 py-6 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-8">
                  <h3 className="flex items-center gap-2 text-sm font-medium text-white">
                    <svg className="size-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                    </svg>
                    <span>Dedicated Bank Accounts</span>
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Instant automated top-ups via your organization’s dedicated NUBAN virtual account, plus monthly invoice billing for large volumes.
                  </p>
                </div>

                <div className="grid gap-4 py-6 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-8">
                  <h3 className="flex items-center gap-2 text-sm font-medium text-white">
                    <svg className="size-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                    <span>Custom rate limits & SLA</span>
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Scale to hundreds of requests per second with priority upstream routing and a 99.99% uptime financial SLA.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 9. Future Roadmap Section (#roadmap) */}
        <section id="roadmap" className="border-t border-white/[0.08] py-20 sm:py-24">
          <div className="mx-auto w-full px-4 lg:px-6 max-w-7xl">
            <div className="max-w-2xl mb-12">
              <span className="text-xs font-mono font-medium tracking-wider text-emerald-400/90 uppercase">
                ROADMAP & NEW REGISTRIES
              </span>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl font-normal tracking-tight text-white">
                Expanding the verification surface
              </h2>
              <p className="mt-4 text-zinc-400 text-sm sm:text-base leading-relaxed">
                Active integrations in pipeline across federal agencies, motor licensing, and biometric computer vision.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl border border-white/[0.08] bg-zinc-950/40">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ALPHA · Q4 2026
                </span>
                <h3 className="text-sm font-medium text-white mt-3">CAC Corporate Registry</h3>
                <p className="text-xs text-zinc-400 mt-1">Direct RC/BN registry & director resolution</p>
              </div>

              <div className="p-5 rounded-xl border border-white/[0.08] bg-zinc-950/40">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  IN DEV · Q1 2027
                </span>
                <h3 className="text-sm font-medium text-white mt-3">FRSC Driver’s License</h3>
                <p className="text-xs text-zinc-400 mt-1">Real-time driver license number validation</p>
              </div>

              <div className="p-5 rounded-xl border border-white/[0.08] bg-zinc-950/40">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  IN DEV · Q1 2027
                </span>
                <h3 className="text-sm font-medium text-white mt-3">NIS International Passport</h3>
                <p className="text-xs text-zinc-400 mt-1">Passport verification with MRZ decoding</p>
              </div>

              <div className="p-5 rounded-xl border border-white/[0.08] bg-zinc-950/40">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  RESEARCH · Q2 2027
                </span>
                <h3 className="text-sm font-medium text-white mt-3">3D Passive Liveness</h3>
                <p className="text-xs text-zinc-400 mt-1">Anti-spoof neural face match against ID photo</p>
              </div>
            </div>
          </div>
        </section>

        {/* 10. Interactive FAQ Section (#faq) */}
        <section id="faq" className="border-t border-white/[0.08] py-20 sm:py-24">
          <div className="mx-auto w-full px-4 lg:px-6 max-w-4xl">
            <div className="text-center mb-12">
              <span className="text-xs font-mono font-medium tracking-wider text-emerald-400/90 uppercase">
                FREQUENTLY ASKED QUESTIONS
              </span>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl font-normal tracking-tight text-white">
                Everything you need to know
              </h2>
            </div>

            <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
              {faqs.map((faq, i) => {
                const isOpen = activeFaq === i
                return (
                  <div key={faq.q} className="py-5">
                    <button
                      type="button"
                      onClick={() => setActiveFaq(isOpen ? null : i)}
                      className="w-full flex items-center justify-between gap-4 text-left font-medium text-sm sm:text-base text-white hover:text-emerald-400 transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <svg
                        className={`size-4 shrink-0 transition-transform duration-200 text-zinc-400 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                    {isOpen && (
                      <p className="mt-3 text-xs sm:text-sm text-zinc-400 leading-relaxed animate-in fade-in duration-150">
                        {faq.a}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </main>

      {/* 11. Minimalist Sleek Footer */}
      <footer className="border-t border-white/[0.08] bg-[#09090b] py-12">
        <div className="mx-auto w-full px-4 lg:px-6 max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-zinc-500">
          <div>
            <span className="text-white font-semibold">Verixa ID</span> &mdash; B2B Identity & Financial Verification Infrastructure.
          </div>

          <div className="flex flex-wrap items-center gap-6 font-medium">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact Sales
            </Link>
            <AppLink app="docs" className="hover:text-white transition-colors">
              Documentation
            </AppLink>
            <a
              href="https://chat.whatsapp.com/verixaid"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors"
            >
              WhatsApp Community
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
