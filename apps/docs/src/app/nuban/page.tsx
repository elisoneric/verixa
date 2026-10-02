import { Badge, CodeBlock, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@verixa/ui"

export default function NubanDocsPage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="verified">POST</Badge>
          <span className="font-mono text-xs text-indigo-400 font-bold">/v1/verify/bank-account</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Bank Account (NUBAN) Resolution
        </h1>
        <p className="mt-2 text-base text-zinc-400 leading-relaxed">
          Resolve account holder names and verify active status across commercial banks and microfinance institutions.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-500 block">COST</span>
          <span className="text-emerald-400 font-bold">10 NGX (₦10.00)</span>
        </div>
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-500 block">TARGET SLA</span>
          <span className="text-white font-bold">&lt; 150ms</span>
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
              <TableCell className="font-mono text-emerald-400 font-bold">accountNumber</TableCell>
              <TableCell className="font-mono text-zinc-400">string</TableCell>
              <TableCell className="text-rose-400 font-bold">Required</TableCell>
              <TableCell className="text-zinc-300">The 10-digit NUBAN account number.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-zinc-300 font-bold">bankCode</TableCell>
              <TableCell className="font-mono text-zinc-400">string</TableCell>
              <TableCell className="text-rose-400 font-bold">Required</TableCell>
              <TableCell className="text-zinc-300">3-digit CBN bank code (e.g. 058 for GTBank, 011 for First Bank).</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white tracking-tight">Example Request & Response</h2>
        <CodeBlock
          language="bash"
          title="cURL Request"
          code={`curl -X POST https://api.verixaid.com/v1/verify/bank-account \\
  -H "Authorization: Bearer vrx_live_..." \\
  -H "Idempotency-Key: 9c2a1e4b-7f8d-4e1a-882b-4d7a12903e44" \\
  -H "Content-Type: application/json" \\
  -d '{
    "accountNumber": "0123456789",
    "bankCode": "058"
  }'`}
        />

        <CodeBlock
          language="json"
          title="Response (200 OK)"
          code={`{
  "status": "verified",
  "data": {
    "account_name": "TOBILOBA OLUFEYIKEMI",
    "account_number": "0123456789",
    "bank_code": "058",
    "bank_name": "Guaranty Trust Bank",
    "account_status": "active"
  },
  "meta": {
    "request_id": "vx_req_4e71d93a",
    "latency_ms": 115
  }
}`}
        />
      </div>
    </div>
  )
}
