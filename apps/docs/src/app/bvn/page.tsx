import { Badge, CodeBlock, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@verixa/ui"

export default function BvnDocsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="verified">UNIVERSAL TAXONOMY</Badge>
          <span className="font-mono text-xs text-sky-400 font-bold">/api/v1/kyc/bvn</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Bank Verification Number (BVN)
        </h1>
        <p className="mt-2 text-base text-zinc-400 leading-relaxed">
          Verify an 11-digit BVN against the national database. Verixa provides universal REST endpoint compatibility across validation matching, full demographics, advance branch tier lookups, and biometric selfie face verification.
        </p>
      </div>

      {/* Pricing and SLA Chips */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-500 block">STANDARD LOOKUP</span>
          <span className="text-emerald-400 font-bold">95 NGX (₦95.00)</span>
        </div>
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-500 block">ADVANCE / BIOMETRIC</span>
          <span className="text-emerald-400 font-bold">125 - 150 NGX</span>
        </div>
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-500 block">SMART CACHE HIT (50% OFF)</span>
          <span className="text-cyan-400 font-bold">38 NGX (₦38.00)</span>
        </div>
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-500 block">LATENCY (CACHE / LIVE)</span>
          <span className="text-white font-bold">&lt;15ms / ~140ms</span>
        </div>
      </div>

      {/* Available Tiers Overview */}
      <div className="space-y-4 pt-2">
        <h2 className="text-lg font-bold text-white tracking-tight">Available Endpoints & Tiers</h2>
        <div className="grid sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1">
            <span className="text-sky-400 font-bold block">1. Field Validation & Match</span>
            <code className="text-white block text-[11px]">POST /api/v1/kyc/bvn or GET ?bvn=...</code>
            <p className="text-zinc-400 font-sans text-xs">Validates if user-supplied name and DOB match BVN records.</p>
          </div>
          <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1">
            <span className="text-sky-400 font-bold block">2. Full Profile Lookup</span>
            <code className="text-white block text-[11px]">POST /api/v1/kyc/bvn/full or GET ?bvn=...</code>
            <p className="text-zinc-400 font-sans text-xs">Returns customer names, verified phone number, gender, and DOB.</p>
          </div>
          <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1">
            <span className="text-sky-400 font-bold block">3. Advance Profile</span>
            <code className="text-white block text-[11px]">POST /api/v1/kyc/bvn/advance or GET ?bvn=...</code>
            <p className="text-zinc-400 font-sans text-xs">Includes enrollment branch, bank code, and account level tier.</p>
          </div>
          <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1">
            <span className="text-emerald-400 font-bold block">4. Selfie Face Verification</span>
            <code className="text-white block text-[11px]">POST /api/v1/kyc/bvn/verify</code>
            <p className="text-zinc-400 font-sans text-xs">Performs facial matching between live selfie and government photo.</p>
          </div>
        </div>
      </div>

      {/* Request Parameters Table */}
      <div className="space-y-3 pt-4 border-t border-zinc-800">
        <h2 className="text-lg font-bold text-white tracking-tight">Request Parameters (POST /api/v1/kyc/bvn)</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Field</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Required</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-mono text-emerald-400 font-bold">bvn</TableCell>
              <TableCell className="font-mono text-zinc-400">string</TableCell>
              <TableCell className="text-rose-400 font-bold">Required</TableCell>
              <TableCell className="text-zinc-300">The 11-digit Bank Verification Number.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-emerald-400 font-bold">consent</TableCell>
              <TableCell className="font-mono text-zinc-400">boolean</TableCell>
              <TableCell className="text-rose-400 font-bold">Required</TableCell>
              <TableCell className="text-zinc-300">Mandatory NDPA user consent flag. Must be <code className="text-emerald-300 font-mono">true</code>.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-zinc-300 font-bold">first_name</TableCell>
              <TableCell className="font-mono text-zinc-400">string</TableCell>
              <TableCell className="text-zinc-500">Optional</TableCell>
              <TableCell className="text-zinc-300">Customer first name for verification matching.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-zinc-300 font-bold">last_name</TableCell>
              <TableCell className="font-mono text-zinc-400">string</TableCell>
              <TableCell className="text-zinc-500">Optional</TableCell>
              <TableCell className="text-zinc-300">Customer surname / last name for match scoring.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-zinc-300 font-bold">dob</TableCell>
              <TableCell className="font-mono text-zinc-400">string</TableCell>
              <TableCell className="text-zinc-500">Optional</TableCell>
              <TableCell className="text-zinc-300">Date of birth in <code className="text-sky-300 font-mono">YYYY-MM-DD</code> format.</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Code Examples */}
      <div className="space-y-4 pt-4 border-t border-zinc-800">
        <h2 className="text-lg font-bold text-white tracking-tight">Example Request & Response (Universal Taxonomy)</h2>
        <CodeBlock
          language="bash"
          title="cURL Request (Full Profile)"
          code={`curl -X POST "https://api.verixaid.com/api/v1/kyc/bvn/full" \\
  -H "Authorization: Bearer vrx_live_9f83a8f1e2b4c6d8_a1b2c3d4..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "bvn": "22123456789",
    "consent": true
  }'`}
        />

        <CodeBlock
          language="json"
          title="HTTP 200 OK Response"
          code={`{
  "status": "success",
  "entity": {
    "bvn": "22123456789",
    "first_name": "JOHN",
    "last_name": "MUSA",
    "middle_name": "DOE",
    "date_of_birth": "1997-05-16",
    "phone_number1": "08012345678",
    "gender": "Male",
    "enrollment_bank": "GTB",
    "enrollment_branch": "Ikeja",
    "level_of_account": "LEVEL 2"
  },
  "billed_amount": 95,
  "cached": false,
  "meta": {
    "request_id": "vx_req_8f19a02d",
    "service": "bvn",
    "latency_ms": 142
  }
}`}
        />
      </div>

      {/* Biometric Verification */}
      <div className="space-y-4 pt-4 border-t border-zinc-800">
        <h2 className="text-lg font-bold text-white tracking-tight">BVN Face Match Verification (POST /api/v1/kyc/bvn/verify)</h2>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          Pass the user&apos;s live camera selfie base64 image along with their BVN to cross-reference facial landmarks against the NIBSS facial database with liveness detection.
        </p>

        <CodeBlock
          language="bash"
          title="cURL Request (Selfie Match)"
          code={`curl -X POST https://api.verixaid.com/api/v1/kyc/bvn/verify \\
  -H "Authorization: Bearer vrx_live_9f83a8f1..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "bvn": "22123456789",
    "selfie_image": "/9j/4AAQSkZJRgABAQ...",
    "threshold": 90,
    "consent": true
  }'`}
        />
      </div>
    </div>
  )
}
