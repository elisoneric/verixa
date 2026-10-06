import { Badge, CodeBlock, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@verixa/ui"

export default function CacDocsPage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="verified">POST</Badge>
          <span className="font-mono text-xs text-sky-400 font-bold">/v1/verify/cac</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          CAC Business & Corporate Verification
        </h1>
        <p className="mt-2 text-base text-zinc-400 leading-relaxed">
          Verify Nigerian incorporated entities and business names directly against the Corporate Affairs Commission (CAC) registry. Retrieve status, directors, shareholders, and corporate Tax ID (TIN).
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-500 block">COST</span>
          <span className="text-emerald-400 font-bold">200 NGX (₦200.00)</span>
        </div>
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-500 block">CACHE SPLIT</span>
          <span className="text-cyan-400 font-bold">80 NGX (₦80.00)</span>
        </div>
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-500 block">TARGET SLA</span>
          <span className="text-white font-bold">&lt; 250ms</span>
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
              <TableCell className="font-mono text-emerald-400 font-bold">rcNumber</TableCell>
              <TableCell className="font-mono text-zinc-400">string</TableCell>
              <TableCell className="text-rose-400 font-bold">Required</TableCell>
              <TableCell className="text-zinc-300">Registration or Business number (e.g. 1261103 or BN123456).</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-emerald-400 font-bold">companyType</TableCell>
              <TableCell className="font-mono text-zinc-400">string</TableCell>
              <TableCell className="text-rose-400 font-bold">Required</TableCell>
              <TableCell className="text-zinc-300">
                One of: <code className="text-sky-300 font-mono">COMPANY</code>, <code className="text-sky-300 font-mono">BUSINESS_NAME</code>, <code className="text-sky-300 font-mono">INCORPORATED_TRUSTEES</code>, <code className="text-sky-300 font-mono">LIMITED_PARTNERSHIP</code>, <code className="text-sky-300 font-mono">LIMITED_LIABILITY_PARTNERSHIP</code>.
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-zinc-300 font-bold">variant</TableCell>
              <TableCell className="font-mono text-zinc-400">string</TableCell>
              <TableCell className="text-zinc-500">Optional</TableCell>
              <TableCell className="text-zinc-300">
                <code className="text-sky-300 font-mono">basic</code> (status & city), <code className="text-sky-300 font-mono">advance</code> (full address & affiliates/directors), or <code className="text-sky-300 font-mono">tin</code> (tax ID lookup). Default: <code className="text-sky-300 font-mono">basic</code>.
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
        <h2 className="text-lg font-bold text-white tracking-tight">Example Request & Response (Advance)</h2>
        <CodeBlock
          language="bash"
          title="cURL Request"
          code={`curl -X POST https://api.verixaid.com/v1/verify/cac \\
  -H "Authorization: Bearer vrx_live_..." \\
  -H "Idempotency-Key: cac-req-8b29f041" \\
  -H "Content-Type: application/json" \\
  -d '{
    "rcNumber": "1261103",
    "companyType": "COMPANY",
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
    "company_name": "JOHN DOE LIMITED",
    "rc_number": "1261103",
    "status": "Active",
    "type_of_company": "COMPANY",
    "date_of_registration": "2024-07-19T08:00:06.224Z",
    "address": "14 MARINA BOULEVARD",
    "city": "Lagos",
    "state": "Lagos",
    "affiliates": [
      {
        "first_name": "JOHN",
        "last_name": "MUSA",
        "affiliate_type": "DIRECTOR",
        "gender": "MALE",
        "nationality": "Nigeria"
      }
    ]
  },
  "cached": false,
  "billed_amount": 200,
  "meta": {
    "provider": "dojah",
    "variant": "advance",
    "latency_ms": 234
  }
}`}
        />
      </div>
    </div>
  )
}
