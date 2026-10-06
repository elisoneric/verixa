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
