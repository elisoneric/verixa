import { Badge, CodeBlock, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@verixa/ui"

export default function BvnDocsPage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="verified">POST</Badge>
          <span className="font-mono text-xs text-emerald-400 font-bold">/v1/verify/bvn</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Bank Verification Number (BVN)
        </h1>
        <p className="mt-2 text-base text-zinc-400 leading-relaxed">
          Verify an 11-digit BVN against the national database and resolve the customer&apos;s verified full name, date of birth, phone number, and gender.
        </p>
      </div>

      {/* Pricing and SLA Chip */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-500 block">COST</span>
          <span className="text-emerald-400 font-bold">50 NGX (₦50.00)</span>
        </div>
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-500 block">CACHE SPLIT</span>
          <span className="text-cyan-400 font-bold">20 NGX (₦20.00)</span>
        </div>
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-500 block">TARGET SLA</span>
          <span className="text-white font-bold">&lt; 180ms</span>
        </div>
      </div>

      {/* Request Body Parameters Table */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white tracking-tight">Request Parameters</h2>
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
              <TableCell className="font-mono text-zinc-300 font-bold">variant</TableCell>
              <TableCell className="font-mono text-zinc-400">string</TableCell>
              <TableCell className="text-zinc-500">Optional</TableCell>
              <TableCell className="text-zinc-300">
                Lookup variant: <code className="text-sky-300 font-mono">full</code> (default, masked BVN with demographics), <code className="text-sky-300 font-mono">match</code> (confidence score matching), or <code className="text-sky-300 font-mono">advance</code> (adds enrollment branch, level, nationality).
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-zinc-300 font-bold">firstName</TableCell>
              <TableCell className="font-mono text-zinc-400">string</TableCell>
              <TableCell className="text-zinc-500">Optional</TableCell>
              <TableCell className="text-zinc-300">Customer first name for registry match scoring.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-amber-400 font-bold">consent</TableCell>
              <TableCell className="font-mono text-zinc-400">boolean</TableCell>
              <TableCell className="text-rose-400 font-bold">Required</TableCell>
              <TableCell className="text-zinc-300">Must be set to <code className="text-amber-300 font-mono">true</code> per NDPA regulatory compliance.</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Code Examples */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white tracking-tight">Example Request & Response</h2>
        <CodeBlock
          language="bash"
          title="cURL Request"
          code={`curl -X POST https://api.verixaid.com/v1/verify/bvn \\
  -H "Authorization: Bearer vrx_live_..." \\
  -H "Idempotency-Key: 7b3e6d1a-4c2e-48a9-981f-1c4a92b02e11" \\
  -H "Content-Type: application/json" \\
  -d '{
    "bvn": "22123456789",
    "variant": "advance",
    "consent": true
  }'`}
        />

        <CodeBlock
          language="json"
          title="Response (200 OK)"
          code={`{
  "status": "verified",
  "data": {
    "bvn": "2*****34567",
    "first_name": "JOHN",
    "last_name": "MUSA",
    "middle_name": "DOE",
    "date_of_birth": "1997-05-16",
    "phone_number1": "08012345678",
    "enrollment_bank": "GTB",
    "enrollment_branch": "IKEJA",
    "level_of_account": "LEVEL 2",
    "watch_listed": "NO"
  },
  "cached": false,
  "billed_amount": 50,
  "meta": {
    "provider": "nibss_direct",
    "variant": "advance",
    "request_id": "vx_req_8f19a02d",
    "latency_ms": 142
  }
}`}
        />
      </div>
    </div>
  )
}
