import { Badge, CodeBlock, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@verixa/ui"

export default function BiometricsAmlDocsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="verified">UNIVERSAL TAXONOMY</Badge>
          <span className="font-mono text-xs text-sky-400 font-bold">FRAUD & COMPLIANCE</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Biometrics, AML & Credit Intelligence
        </h1>
        <p className="mt-2 text-base text-zinc-400 leading-relaxed">
          Comprehensive anti-fraud suite covering biometric selfie liveness matching, PEP and international sanctions screening, multi-bureau credit reports, and email risk scoring.
        </p>
      </div>

      {/* Available Services Overview */}
      <div className="grid sm:grid-cols-2 gap-3 text-xs font-mono">
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1.5">
          <span className="text-emerald-400 font-bold block">1. Photo ID Face Match (Liveness)</span>
          <code className="text-white block text-[11px]">POST /api/v1/kyc/photoid/verify</code>
          <p className="text-zinc-400 font-sans text-xs">Compares a selfie against BVN/NIN portraits with passive liveness detection.</p>
          <span className="text-zinc-500 block text-[11px]">Rate: 150 NGX (₦150.00)</span>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1.5">
          <span className="text-sky-400 font-bold block">2. AML & Sanctions Screening</span>
          <code className="text-white block text-[11px]">POST /api/v1/aml/screening</code>
          <p className="text-zinc-400 font-sans text-xs">Screens individuals across OFAC, UN, PEP, and global financial crime watchlists.</p>
          <span className="text-zinc-500 block text-[11px]">Rate: 120 NGX (₦120.00)</span>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1.5">
          <span className="text-amber-400 font-bold block">3. Multi-Bureau Credit Score</span>
          <code className="text-white block text-[11px]">GET /api/v1/credit/bvn</code>
          <p className="text-zinc-400 font-sans text-xs">Aggregates credit history and score from CRC, FirstCentral, and CreditRegistry.</p>
          <span className="text-zinc-500 block text-[11px]">Rate: 250 NGX (₦250.00)</span>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1.5">
          <span className="text-indigo-400 font-bold block">4. Email Risk Intelligence</span>
          <code className="text-white block text-[11px]">GET /api/v1/kyc/email</code>
          <p className="text-zinc-400 font-sans text-xs">Scores disposable domains, MX deliverability, and account breach exposure.</p>
          <span className="text-zinc-500 block text-[11px]">Rate: 50 NGX (₦50.00)</span>
        </div>
      </div>

      {/* 1. Photo ID Face Match */}
      <div className="space-y-4 pt-6 border-t border-zinc-800">
        <div className="flex items-center gap-2">
          <Badge variant="verified">POST</Badge>
          <h2 className="text-lg font-bold text-white tracking-tight">Photo ID Face Match (POST /api/v1/kyc/photoid/verify)</h2>
        </div>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          Submit user selfie image (Base64) alongside their government identifier (<code className="text-emerald-400 font-mono">BVN</code> or <code className="text-emerald-400 font-mono">NIN</code>) to execute AI facial landmark comparison.
        </p>

        <CodeBlock
          language="bash"
          title="cURL Request (Photo ID Face Match)"
          code={`curl -X POST https://api.verixaid.com/api/v1/kyc/photoid/verify \\
  -H "Authorization: Bearer vrx_live_9f83a8f1e2b4c6d8_a1b2c3d4..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "id_type": "BVN",
    "id_number": "22123456789",
    "image": "/9j/4AAQSkZJRgABAQ...",
    "consent": true
  }'`}
        />

        <CodeBlock
          language="json"
          title="HTTP 200 OK Response"
          code={`{
  "status": "success",
  "entity": {
    "match_status": "MATCH",
    "confidence_score": 96.4,
    "liveness_verified": true,
    "threshold": 90
  },
  "billed_amount": 150,
  "cached": false,
  "meta": {
    "request_id": "vx_req_face_881b2",
    "service": "face_match",
    "latency_ms": 280
  }
}`}
        />
      </div>

      {/* 2. AML Screening */}
      <div className="space-y-4 pt-6 border-t border-zinc-800">
        <div className="flex items-center gap-2">
          <Badge variant="verified">POST</Badge>
          <h2 className="text-lg font-bold text-white tracking-tight">AML & PEP Screening (POST /api/v1/aml/screening)</h2>
        </div>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          Screen natural persons against global sanctions watchlists, Politically Exposed Persons (PEP), Interpol notices, and adverse media.
        </p>

        <CodeBlock
          language="bash"
          title="cURL Request (AML Screening)"
          code={`curl -X POST https://api.verixaid.com/api/v1/aml/screening \\
  -H "Authorization: Bearer vrx_live_9f83a8f1e2b4c6d8_a1b2c3d4..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "CHIDERA OLUTOLA",
    "date_of_birth": "1988-04-14",
    "country": "NG",
    "consent": true
  }'`}
        />

        <CodeBlock
          language="json"
          title="HTTP 200 OK Response"
          code={`{
  "status": "success",
  "entity": {
    "risk_level": "LOW",
    "pep_detected": false,
    "sanctions_match": false,
    "total_hits": 0,
    "screened_at": "2026-10-12T16:00:00.000Z"
  },
  "billed_amount": 120,
  "cached": false,
  "meta": {
    "request_id": "vx_req_aml_3301a",
    "service": "aml_screening",
    "latency_ms": 195
  }
}`}
        />
      </div>

      {/* 3. Credit Score */}
      <div className="space-y-4 pt-6 border-t border-zinc-800">
        <div className="flex items-center gap-2">
          <Badge variant="verified">GET</Badge>
          <h2 className="text-lg font-bold text-white tracking-tight">Multi-Bureau Credit Score (GET /api/v1/credit/bvn)</h2>
        </div>

        <CodeBlock
          language="bash"
          title="cURL Request (Credit Score)"
          code={`curl -X GET "https://api.verixaid.com/api/v1/credit/bvn?bvn=22123456789&phone_number=08012345678" \\
  -H "Authorization: vrx_live_9f83a8f1e2b4c6d8_a1b2c3d4..." \\
  -H "AppId: app_6a7b8c9d0e1f"`}
        />
      </div>

      {/* 4. Email Risk */}
      <div className="space-y-4 pt-6 border-t border-zinc-800">
        <div className="flex items-center gap-2">
          <Badge variant="verified">GET</Badge>
          <h2 className="text-lg font-bold text-white tracking-tight">Email Risk & Deliverability (GET /api/v1/kyc/email)</h2>
        </div>

        <CodeBlock
          language="bash"
          title="cURL Request (Email Risk)"
          code={`curl -X GET "https://api.verixaid.com/api/v1/kyc/email?email=user@company.com" \\
  -H "Authorization: vrx_live_9f83a8f1e2b4c6d8_a1b2c3d4..." \\
  -H "AppId: app_6a7b8c9d0e1f"`}
        />
      </div>
    </div>
  )
}
