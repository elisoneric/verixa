import { Badge, CodeBlock, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@verixa/ui"

export default function NinDocsPage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="verified">POST</Badge>
          <span className="font-mono text-xs text-sky-400 font-bold">/v1/verify/nin</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          National Identification Number (NIN)
        </h1>
        <p className="mt-2 text-base text-zinc-400 leading-relaxed">
          Verify an 11-digit NIN and retrieve official citizen demographic and residency details.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-500 block">COST</span>
          <span className="text-emerald-400 font-bold">50 NGX (₦50.00)</span>
        </div>
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-500 block">TARGET SLA</span>
          <span className="text-white font-bold">&lt; 180ms</span>
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
              <TableCell className="font-mono text-emerald-400 font-bold">nin</TableCell>
              <TableCell className="font-mono text-zinc-400">string</TableCell>
              <TableCell className="text-rose-400 font-bold">Required</TableCell>
              <TableCell className="text-zinc-300">The 11-digit National Identity Number.</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white tracking-tight">Example Request & Response</h2>
        <CodeBlock
          language="bash"
          title="cURL Request"
          code={`curl -X POST https://api.verixaid.com/v1/verify/nin \\
  -H "Authorization: Bearer vrx_live_..." \\
  -H "Idempotency-Key: 3a9f182c-1d4e-4f7b-990a-5c2e1189ab02" \\
  -H "Content-Type: application/json" \\
  -d '{
    "nin": "11234567890"
  }'`}
        />

        <CodeBlock
          language="json"
          title="Response (200 OK)"
          code={`{
  "status": "verified",
  "data": {
    "nin": "11234567890",
    "first_name": "MAKINWA",
    "last_name": "MUKARAM",
    "gender": "male",
    "residence_state": "Lagos"
  },
  "meta": {
    "request_id": "vx_req_2b88f10c",
    "latency_ms": 168
  }
}`}
        />
      </div>
    </div>
  )
}
