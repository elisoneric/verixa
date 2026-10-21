import type { Metadata } from "next"
import Link from "next/link"
import { Badge, CodeBlock } from "@verixa/ui"

export const metadata: Metadata = {
  title: "Verixa ID Docs — Low-Cost NIN, BVN & Identity API Reference",
  description:
    "Official developer documentation for Verixa ID. Low-cost NIN (₦125), BVN (₦95), and free NUBAN resolution APIs. Comprehensive REST taxonomy, cURL snippets, and sub-15ms Smart Cache.",
  keywords: [
    "NIN API documentation",
    "BVN API documentation",
    "low cost NIN API",
    "cheap BVN verification API",
    "Nigeria KYC API docs",
    "NUBAN lookup API",
  ],
  alternates: {
    canonical: "https://docs.verixaid.com",
  },
}

export default function DocsHomePage() {
  return (
    <div className="space-y-10">
      {/* Hero / Overview Header */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="verified">DEVELOPER HUB</Badge>
          <span className="text-xs font-mono text-slate-500">v1.2.0 API SPECIFICATION</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-heading">
          Verixa ID Developer Platform
        </h1>
        <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl">
          Unified identity verification, corporate KYB, biometric face match, and banking resolution APIs. Built with standard REST taxonomy and sub-15ms Smart Identity Caching.
        </p>

        {/* Highlight Architecture Cards */}
        <div className="grid sm:grid-cols-3 gap-3 mt-6">
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
            <span className="text-xs font-mono font-bold text-emerald-700 block mb-1">Universal REST Standard</span>
            <p className="text-xs text-slate-600">
              Clean endpoint taxonomy (<code className="text-slate-900 font-mono font-semibold">/api/v1/kyc/...</code>), standard authentication headers, and predictable JSON envelopes.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
            <span className="text-xs font-mono font-bold text-sky-700 block mb-1">Smart Identity Cache</span>
            <p className="text-xs text-slate-600">
              Sub-15ms cached lookups with automated cost reduction on repeat queries within your tenant partition.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
            <span className="text-xs font-mono font-bold text-amber-700 block mb-1">Prepaid NGX Metering</span>
            <p className="text-xs text-slate-600">
              Per-call usage deductions from your prepaid balance. Zero monthly commitments or hidden subscription fees.
            </p>
          </div>
        </div>
      </div>

      {/* Core API Directory */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-900 tracking-tight">Active API Endpoints & Rates</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Standard rates across primary registries and discounted Smart Cache hits.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              REST TAXONOMY
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-sky-50 text-sky-800 border border-sky-200">
              SUB-15MS CACHE
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-100 text-xs font-mono shadow-xs">
          {/* Identity & KYC Group Header */}
          <div className="bg-slate-50 px-4 py-2.5 text-[11px] uppercase tracking-wider text-slate-700 font-bold font-sans">
            1. Identity & Government KYC Lookups
          </div>

          {/* 1. BVN Validate */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                GET
              </span>
              <div>
                <span className="text-slate-900 font-semibold font-sans">BVN Validation (Match Details)</span>
                <code className="block text-slate-500 text-[11px] mt-0.5">/api/v1/kyc/bvn?bvn=...</code>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-900 font-bold font-sans text-sm">₦95.00</span>
              <span className="text-slate-400 font-sans text-xs">/ ₦38.00 cache</span>
            </div>
          </div>

          {/* 2. BVN Full Profile */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                GET
              </span>
              <div>
                <span className="text-slate-900 font-semibold font-sans">BVN Full Lookup</span>
                <code className="block text-slate-500 text-[11px] mt-0.5">/api/v1/kyc/bvn/full?bvn=...</code>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-900 font-bold font-sans text-sm">₦95.00</span>
              <span className="text-slate-400 font-sans text-xs">/ ₦38.00 cache</span>
            </div>
          </div>

          {/* 3. BVN Advance */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                GET
              </span>
              <div>
                <span className="text-slate-900 font-semibold font-sans">BVN Advance</span>
                <code className="block text-slate-500 text-[11px] mt-0.5">/api/v1/kyc/bvn/advance?bvn=...</code>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-900 font-bold font-sans text-sm">₦125.00</span>
              <span className="text-slate-400 font-sans text-xs">/ ₦50.00 cache</span>
            </div>
          </div>

          {/* 4. BVN Face Match */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                POST
              </span>
              <div>
                <span className="text-slate-900 font-semibold font-sans">BVN + Facial Verification</span>
                <code className="block text-slate-500 text-[11px] mt-0.5">/api/v1/kyc/bvn/verify</code>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-900 font-bold font-sans text-sm">₦150.00</span>
              <span className="text-slate-400 font-sans text-xs">/ ₦60.00 cache</span>
            </div>
          </div>

          {/* 5. NIN Basic */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                GET
              </span>
              <div>
                <span className="text-slate-900 font-semibold font-sans">NIN Basic Lookup</span>
                <code className="block text-slate-500 text-[11px] mt-0.5">/api/v1/kyc/nin?nin=...</code>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-900 font-bold font-sans text-sm">₦125.00</span>
              <span className="text-slate-400 font-sans text-xs">/ ₦50.00 cache</span>
            </div>
          </div>

          {/* 6. NIN Advance */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                GET
              </span>
              <div>
                <span className="text-slate-900 font-semibold font-sans">NIN Advance (Demographics & Photo)</span>
                <code className="block text-slate-500 text-[11px] mt-0.5">/api/v1/kyc/nin/advance?nin=...</code>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-900 font-bold font-sans text-sm">₦125.00</span>
              <span className="text-slate-400 font-sans text-xs">/ ₦50.00 cache</span>
            </div>
          </div>

          {/* 7. NIN Slip */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                GET
              </span>
              <div>
                <span className="text-slate-900 font-semibold font-sans">Automated NIN Slip</span>
                <code className="block text-slate-500 text-[11px] mt-0.5">/api/v1/kyc/nin/nin_slip?nin=...</code>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-900 font-bold font-sans text-sm">₦250.00</span>
              <span className="text-slate-400 font-sans text-xs">/ ₦100.00 cache</span>
            </div>
          </div>

          {/* Banking & NUBAN Group Header */}
          <div className="bg-slate-50 px-4 py-2.5 text-[11px] uppercase tracking-wider text-slate-700 font-bold font-sans border-t border-b border-slate-200">
            2. Banking Intelligence & NUBAN
          </div>

          {/* Account Resolve */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                GET
              </span>
              <div>
                <span className="text-slate-900 font-semibold font-sans">NUBAN Account Name Resolve</span>
                <code className="block text-slate-500 text-[11px] mt-0.5">/api/v1/kyc/account?account_number=...&bank_code=...</code>
              </div>
            </div>
            <span className="text-emerald-700 font-bold font-sans text-sm">Free (₦0.00)</span>
          </div>

          {/* Corporate KYB Group Header */}
          <div className="bg-slate-50 px-4 py-2.5 text-[11px] uppercase tracking-wider text-slate-700 font-bold font-sans border-t border-b border-slate-200">
            3. Corporate Affairs & Business KYB (CAC & TIN)
          </div>

          {/* CAC Basic */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                GET
              </span>
              <div>
                <span className="text-slate-900 font-semibold font-sans">CAC Basic Company Lookup</span>
                <code className="block text-slate-500 text-[11px] mt-0.5">/api/v1/kyc/cac/basic?rc_number=...&company_type=...</code>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-900 font-bold font-sans text-sm">₦120.00</span>
              <span className="text-slate-400 font-sans text-xs">/ ₦48.00 cache</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Minute Quickstart */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <h2 className="text-base font-semibold text-slate-900 tracking-tight">Quickstart Guide</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Authenticate your requests by passing your API key in the <code className="text-slate-900 font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">Authorization</code> header. Include regulatory consent (<code className="text-slate-900 font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">&quot;consent&quot;: true</code>) across identity verification requests.
        </p>

        <CodeBlock
          language="bash"
          title="Making your first BVN lookup (POST with JSON Body)"
          code={`curl -X POST "https://api.verixaid.com/api/v1/kyc/bvn" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "bvn": "22123456789",
    "first_name": "CHIDERA",
    "consent": true
  }'`}
        />

        <div className="space-y-2 pt-2">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block">Standard JSON Response</span>
          <CodeBlock
            language="json"
            title="HTTP 200 OK"
            code={`{
  "status": "success",
  "entity": {
    "bvn": "22123456789",
    "first_name": "CHIDERA",
    "last_name": "OLUTOLA",
    "date_of_birth": "1988-04-14",
    "phone_number1": "08039218492",
    "gender": "Male"
  },
  "billed_amount": 95,
  "cached": false,
  "meta": {
    "request_id": "vx_req_8f19a02d",
    "service": "bvn",
    "latency_ms": 142,
    "environment": "live"
  }
}`}
          />
        </div>
      </div>

      {/* Next steps grid */}
      <div className="pt-6 border-t border-slate-200 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Link
          href="/authentication"
          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all block group shadow-2xs"
        >
          <span className="text-xs font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors block">
            Authentication →
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">API Key & Bearer auth headers</span>
        </Link>
        <Link
          href="/bvn"
          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all block group shadow-2xs"
        >
          <span className="text-xs font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors block">
            BVN Verification →
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Match, advance, and face match</span>
        </Link>
        <Link
          href="/nin"
          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all block group shadow-2xs"
        >
          <span className="text-xs font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors block">
            NIN Verification →
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Basic, advance, and slip generator</span>
        </Link>
        <Link
          href="/smart-cache"
          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all block group shadow-2xs"
        >
          <span className="text-xs font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors block">
            Smart Identity Cache →
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Sub-15ms hits with fee savings</span>
        </Link>
      </div>
    </div>
  )
}
