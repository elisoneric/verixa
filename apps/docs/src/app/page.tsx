import Link from "next/link"
import { CodeBlock } from "@verixa/ui"

export default function DocsIntroductionPage() {
  return (
    <div className="space-y-10">
      {/* Title & Eyebrow */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-mono font-medium border border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
            VERSION 1.0
          </span>
          <span className="text-xs font-mono text-zinc-500">REST API</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-normal tracking-tight text-white">
          Verixa ID Developer Documentation
        </h1>
        <p className="mt-3 text-base text-zinc-400 leading-relaxed max-w-2xl">
          Welcome to the Verixa ID developer reference. Verixa ID provides high-availability APIs to verify Bank Verification Numbers (BVN), National ID Numbers (NIN), and Nigerian bank accounts (NUBAN) with automated provider failover and Smart Identity Caching.
        </p>
      </div>

      {/* Base URLs */}
      <div className="space-y-3">
        <h2 className="text-base font-medium text-white tracking-tight">API Base URLs</h2>
        <div className="grid sm:grid-cols-2 gap-3 font-mono text-xs">
          <div className="p-4 rounded-xl border border-white/[0.08] bg-zinc-950/60 space-y-1.5">
            <span className="text-amber-400 font-medium block">Sandbox Environment</span>
            <code className="text-zinc-300 text-[13px]">https://api.verixaid.com/v1</code>
          </div>
          <div className="p-4 rounded-xl border border-white/[0.08] bg-zinc-950/60 space-y-1.5">
            <span className="text-emerald-400 font-medium block">Production Environment</span>
            <code className="text-zinc-300 text-[13px]">https://api.verixaid.com/v1</code>
          </div>
        </div>
      </div>

      {/* Core API Directory */}
      <div className="space-y-4 pt-6 border-t border-white/[0.08]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-medium text-white tracking-tight">Active API Endpoints & Live Rates</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Current live rates with automated ₦15 price drop applied to every identity query.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            -₦15 DROPPED RATES
          </span>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-zinc-950/60 overflow-hidden divide-y divide-white/[0.06] text-xs font-mono">
          {/* 1. NIN Verification */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                POST
              </span>
              <div>
                <span className="text-white font-semibold font-sans">NIN Verification</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/nin-verification</code>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-zinc-500 line-through font-sans">₦150</span>
              <span className="text-emerald-400 font-bold font-sans text-sm">₦135</span>
            </div>
          </div>

          {/* 2. BVN Verification */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                POST
              </span>
              <div>
                <span className="text-white font-semibold font-sans">BVN Verification</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/bvn-verification</code>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-zinc-500 line-through font-sans">₦100</span>
              <span className="text-emerald-400 font-bold font-sans text-sm">₦85</span>
            </div>
          </div>

          {/* 3. NIN Phone Search */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                POST
              </span>
              <div>
                <span className="text-white font-semibold font-sans">NIN Phone Search</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/nin-phone</code>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-zinc-500 line-through font-sans">₦200</span>
              <span className="text-emerald-400 font-bold font-sans text-sm">₦185</span>
            </div>
          </div>

          {/* 4. BVN Phone Search */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                POST
              </span>
              <div>
                <span className="text-white font-semibold font-sans">BVN Phone Search</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/bvn-phone</code>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-zinc-500 line-through font-sans">₦150</span>
              <span className="text-emerald-400 font-bold font-sans text-sm">₦135</span>
            </div>
          </div>

          {/* 5. NIN Demography */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                POST
              </span>
              <div>
                <span className="text-white font-semibold font-sans">NIN Demography</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/nin-demography</code>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-zinc-500 line-through font-sans">₦250</span>
              <span className="text-emerald-400 font-bold font-sans text-sm">₦235</span>
            </div>
          </div>

          {/* 6. NIN Tracking */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                POST
              </span>
              <div>
                <span className="text-white font-semibold font-sans">NIN Tracking</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/nin-tracking</code>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-zinc-500 line-through font-sans">₦200</span>
              <span className="text-emerald-400 font-bold font-sans text-sm">₦185</span>
            </div>
          </div>

          {/* 7. Account Balance */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-500/[0.03]">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/25">
                GET
              </span>
              <div>
                <span className="text-white font-semibold font-sans">Account Balance</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/balance</code>
              </div>
            </div>
            <span className="text-emerald-400 font-bold font-sans text-sm">Free (₦0.00)</span>
          </div>

          {/* Corporate KYB Group Header */}
          <div className="bg-white/[0.03] px-4 py-2 text-[11px] uppercase tracking-wider text-emerald-400 font-bold font-sans border-t border-b border-white/[0.08]">
            Corporate Registry & Business Verification (KYB)
          </div>

          {/* 8. CAC Basic */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                POST
              </span>
              <div>
                <span className="text-white font-semibold font-sans">CAC Basic Company Lookup</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/cac-basic</code>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-zinc-500 line-through font-sans">₦250</span>
              <span className="text-emerald-400 font-bold font-sans text-sm">₦220</span>
            </div>
          </div>

          {/* 9. CAC Advance */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                POST
              </span>
              <div>
                <span className="text-white font-semibold font-sans">CAC Advance (Directors & Shares)</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/cac-advance</code>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-zinc-500 line-through font-sans">₦600</span>
              <span className="text-emerald-400 font-bold font-sans text-sm">₦540</span>
            </div>
          </div>

          {/* 10. TIN Verification */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                POST
              </span>
              <div>
                <span className="text-white font-semibold font-sans">TIN Tax ID Verification</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/tin-verification</code>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-zinc-500 line-through font-sans">₦200</span>
              <span className="text-emerald-400 font-bold font-sans text-sm">₦180</span>
            </div>
          </div>

          {/* Secondary Government IDs Group Header */}
          <div className="bg-white/[0.03] px-4 py-2 text-[11px] uppercase tracking-wider text-emerald-400 font-bold font-sans border-t border-b border-white/[0.08]">
            Secondary Government IDs (FRSC / INEC / NIS)
          </div>

          {/* 11. Driver's License */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                POST
              </span>
              <div>
                <span className="text-white font-semibold font-sans">Driver's License (FRSC)</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/drivers-license</code>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-zinc-500 line-through font-sans">₦180</span>
              <span className="text-emerald-400 font-bold font-sans text-sm">₦160</span>
            </div>
          </div>

          {/* 12. Voter's Card */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                POST
              </span>
              <div>
                <span className="text-white font-semibold font-sans">Voter's Card (VIN / INEC)</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/voters-card</code>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-zinc-500 line-through font-sans">₦150</span>
              <span className="text-emerald-400 font-bold font-sans text-sm">₦130</span>
            </div>
          </div>

          {/* 13. Passport */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                POST
              </span>
              <div>
                <span className="text-white font-semibold font-sans">International Passport (NIS)</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/passport-verification</code>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-zinc-500 line-through font-sans">₦300</span>
              <span className="text-emerald-400 font-bold font-sans text-sm">₦270</span>
            </div>
          </div>

          {/* Banking & Credit Group Header */}
          <div className="bg-white/[0.03] px-4 py-2 text-[11px] uppercase tracking-wider text-emerald-400 font-bold font-sans border-t border-b border-white/[0.08]">
            Banking Intelligence & Multi-Bureau Credit
          </div>

          {/* 14. Account Resolve */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                POST
              </span>
              <div>
                <span className="text-white font-semibold font-sans">NUBAN Bank Account Resolve</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/account-resolve</code>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-zinc-500 line-through font-sans">₦10</span>
              <span className="text-emerald-400 font-bold font-sans text-sm">Free (₦0.00)</span>
            </div>
          </div>

          {/* 15. Credit Score */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                POST
              </span>
              <div>
                <span className="text-white font-semibold font-sans">Credit Score & Bureau Summary</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/credit-score</code>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-zinc-500 line-through font-sans">₦450</span>
              <span className="text-emerald-400 font-bold font-sans text-sm">₦390</span>
            </div>
          </div>

          {/* Biometrics & Risk Screening Group Header */}
          <div className="bg-white/[0.03] px-4 py-2 text-[11px] uppercase tracking-wider text-emerald-400 font-bold font-sans border-t border-b border-white/[0.08]">
            Biometrics, Anti-Fraud & Compliance Screening
          </div>

          {/* 16. Face Match */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                POST
              </span>
              <div>
                <span className="text-white font-semibold font-sans">Face Match & Liveness Check</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/face-match</code>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-zinc-500 line-through font-sans">₦250</span>
              <span className="text-emerald-400 font-bold font-sans text-sm">₦220</span>
            </div>
          </div>

          {/* 17. AML Screening */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                POST
              </span>
              <div>
                <span className="text-white font-semibold font-sans">AML, PEP & Sanctions Screening</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/aml-screening</code>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-zinc-500 line-through font-sans">₦200</span>
              <span className="text-emerald-400 font-bold font-sans text-sm">₦175</span>
            </div>
          </div>

          {/* 18. Phone Intelligence */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                POST
              </span>
              <div>
                <span className="text-white font-semibold font-sans">SIM Swap & Carrier Intelligence</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/phone-intelligence</code>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-zinc-500 line-through font-sans">₦150</span>
              <span className="text-emerald-400 font-bold font-sans text-sm">₦130</span>
            </div>
          </div>

          {/* 19. Email Risk */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                POST
              </span>
              <div>
                <span className="text-white font-semibold font-sans">Email Risk & Deliverability Score</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/email-risk</code>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-zinc-500 line-through font-sans">₦80</span>
              <span className="text-emerald-400 font-bold font-sans text-sm">₦65</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Minute Quickstart */}
      <div className="space-y-4 pt-6 border-t border-white/[0.08]">
        <h2 className="text-base font-medium text-white tracking-tight">5-Minute Quickstart</h2>
        <p className="text-sm text-zinc-400 leading-relaxed">
          To perform your first identity verification, obtain a Sandbox API Key from your Console dashboard and include it in the <code className="text-emerald-400 font-mono text-xs">Authorization</code> header.
        </p>

        <CodeBlock
          language="bash"
          title="Making your first BVN request"
          code={`curl -X POST https://api.verixaid.com/v1/verify/bvn \\
  -H "Authorization: Bearer vx_test_demokey123456789" \\
  -H "Idempotency-Key: 7b3e6d1a-4c2e-48a9-981f-1c4a92b02e11" \\
  -H "Content-Type: application/json" \\
  -d '{
    "bvn": "22123456789",
    "firstName": "CHIDERA"
  }'`}
        />

        <div className="space-y-2 pt-2">
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block">Normalized JSON Response</span>
          <CodeBlock
            language="json"
            title="HTTP 200 OK"
            code={`{
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
}`}
          />
        </div>
      </div>

      {/* Next steps grid */}
      <div className="pt-6 border-t border-white/[0.08] grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Link
          href="/authentication"
          className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.14] transition-all block group"
        >
          <span className="text-xs font-medium text-white group-hover:text-emerald-400 transition-colors block">
            Authentication &rarr;
          </span>
          <span className="text-[11px] text-zinc-500 mt-1 block">API tokens and secret security</span>
        </Link>
        <Link
          href="/bvn"
          className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.14] transition-all block group"
        >
          <span className="text-xs font-medium text-white group-hover:text-emerald-400 transition-colors block">
            BVN Verification &rarr;
          </span>
          <span className="text-[11px] text-zinc-500 mt-1 block">Parameters & fuzzy name scoring</span>
        </Link>
        <Link
          href="/airtime-data"
          className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.14] transition-all block group"
        >
          <span className="text-xs font-medium text-white group-hover:text-emerald-400 transition-colors block">
            Airtime & Data API &rarr;
          </span>
          <span className="text-[11px] text-zinc-500 mt-1 block">Automated telco VTU vending</span>
        </Link>
        <Link
          href="/smart-cache"
          className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.14] transition-all block group"
        >
          <span className="text-xs font-medium text-white group-hover:text-emerald-400 transition-colors block">
            Smart Identity Cache &rarr;
          </span>
          <span className="text-[11px] text-zinc-500 mt-1 block">Save 60% with sub-15ms hits</span>
        </Link>
      </div>
    </div>
  )
}
