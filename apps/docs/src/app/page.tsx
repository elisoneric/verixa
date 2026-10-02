import Link from "next/link"
import { Badge, CodeBlock, Button, AppLink } from "@verixa/ui"

export default function DocsIntroductionPage() {
  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="verified">VERSION 1.0</Badge>
          <span className="text-xs font-mono text-zinc-500">REST API</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Verixa ID Developer Documentation
        </h1>
        <p className="mt-2 text-base text-zinc-400 leading-relaxed">
          Welcome to the Verixa ID developer reference. Verixa ID provides high-availability APIs to verify Bank Verification Numbers (BVN), National ID Numbers (NIN), and Nigerian bank accounts (NUBAN).
        </p>
      </div>

      {/* Base URLs */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white tracking-tight">API Base URLs</h2>
        <div className="grid sm:grid-cols-2 gap-3 font-mono text-xs">
          <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-1">
            <span className="text-amber-400 font-bold block">Sandbox Environment</span>
            <code className="text-zinc-300">https://api.verixaid.com/v1</code>
          </div>
          <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-1">
            <span className="text-emerald-400 font-bold block">Production Environment</span>
            <code className="text-zinc-300">https://api.verixaid.com/v1</code>
          </div>
        </div>
      </div>

      {/* 5-Minute Quickstart */}
      <div className="space-y-4 pt-4 border-t border-zinc-800">
        <h2 className="text-lg font-bold text-white tracking-tight">5-Minute Quickstart</h2>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          To perform your first identity verification, obtain a Sandbox API Key from your dashboard and include it in the <code className="text-emerald-400">Authorization</code> header.
        </p>

        <CodeBlock
          language="bash"
          title="Making your first BVN request"
          code={`curl -X POST https://api.verixaid.com/v1/verify/bvn \\
  -H "Authorization: Bearer vrx_test_demokey123456789" \\
  -H "Idempotency-Key: 7b3e6d1a-4c2e-48a9-981f-1c4a92b02e11" \\
  -H "Content-Type: application/json" \\
  -d '{
    "bvn": "22123456789",
    "firstName": "CHIDERA"
  }'`}
        />

        <div className="space-y-2">
          <span className="text-xs font-mono text-zinc-400 uppercase">Normalized JSON Response</span>
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
      <div className="pt-6 border-t border-zinc-800 grid sm:grid-cols-3 gap-4">
        <Link
          href="/authentication"
          className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 hover:border-zinc-700 transition-all block"
        >
          <span className="text-xs font-bold text-white block">Authentication &rarr;</span>
          <span className="text-[11px] text-zinc-400 mt-1 block">API tokens and secret security</span>
        </Link>
        <Link
          href="/bvn"
          className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 hover:border-zinc-700 transition-all block"
        >
          <span className="text-xs font-bold text-white block">BVN Verification &rarr;</span>
          <span className="text-[11px] text-zinc-400 mt-1 block">Parameters & fuzzy name scoring</span>
        </Link>
        <Link
          href="/webhooks"
          className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 hover:border-zinc-700 transition-all block"
        >
          <span className="text-xs font-bold text-white block">Webhooks &rarr;</span>
          <span className="text-[11px] text-zinc-400 mt-1 block">Real-time signature verification</span>
        </Link>
      </div>
    </div>
  )
}
