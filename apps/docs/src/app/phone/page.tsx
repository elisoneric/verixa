import { Badge, CodeBlock, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@verixa/ui"

export default function PhoneDocsPage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="verified">POST</Badge>
          <span className="font-mono text-xs text-sky-400 font-bold">/v1/verify/phone</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Phone Number Identity Resolution
        </h1>
        <p className="mt-2 text-base text-zinc-400 leading-relaxed">
          Resolve the registered individual identity behind any Nigerian mobile phone number (MTN, Airtel, Glo, 9mobile) via upstream carrier KYC registries.
        </p>
      </div>

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
          <span className="text-white font-bold">&lt; 200ms</span>
        </div>
      </div>

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
              <TableCell className="font-mono text-emerald-400 font-bold">phoneNumber</TableCell>
              <TableCell className="font-mono text-zinc-400">string</TableCell>
              <TableCell className="text-rose-400 font-bold">Required</TableCell>
              <TableCell className="text-zinc-300">Valid 11-digit or E.164 Nigerian phone number (e.g. 08012345678 or 2348012345678).</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-zinc-300 font-bold">variant</TableCell>
              <TableCell className="font-mono text-zinc-400">string</TableCell>
              <TableCell className="text-zinc-500">Optional</TableCell>
              <TableCell className="text-zinc-300">
                Lookup tier: <code className="text-sky-300 font-mono">basic</code> (default) returns name, gender, nationality, and DOB. <code className="text-sky-300 font-mono">advance</code> includes portrait photo.
              </TableCell>
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

      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white tracking-tight">Example Request & Response</h2>
        <CodeBlock
          language="bash"
          title="cURL Request"
          code={`curl -X POST https://api.verixaid.com/v1/verify/phone \\
  -H "Authorization: Bearer vrx_live_..." \\
  -H "Idempotency-Key: phone-req-5f8a912c" \\
  -H "Content-Type: application/json" \\
  -d '{
    "phoneNumber": "08012345678",
    "variant": "basic",
    "consent": true
  }'`}
        />

        <CodeBlock
          language="json"
          title="Response (200 OK)"
          code={`{
  "status": "verified",
  "data": {
    "first_name": "JOHN",
    "last_name": "MUSA",
    "middle_name": "DOE",
    "gender": "Male",
    "nationality": "NGA",
    "date_of_birth": "1990-05-16",
    "msisdn": "2348012345678"
  },
  "cached": false,
  "billed_amount": 50,
  "meta": {
    "provider": "dojah",
    "variant": "basic",
    "latency_ms": 178
  }
}`}
        />
      </div>
    </div>
  )
}
