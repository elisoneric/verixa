import { Badge, CodeBlock, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@verixa/ui"

export default function NubanDocsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="verified">DOJAH PARITY</Badge>
          <span className="font-mono text-xs text-sky-400 font-bold">/api/v1/kyc/account</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Bank Account (NUBAN) Resolution
        </h1>
        <p className="mt-2 text-base text-zinc-400 leading-relaxed">
          Resolve beneficiary and account holder names instantly across all Nigerian commercial banks, merchant banks, and microfinance institutions.
        </p>
      </div>

      {/* Pricing and SLA Chips */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-500 block">COST</span>
          <span className="text-emerald-400 font-bold">Free (₦0.00)</span>
        </div>
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-500 block">TARGET SLA</span>
          <span className="text-white font-bold">&lt; 150ms</span>
        </div>
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-500 block">COVERAGE</span>
          <span className="text-white font-bold">100% CBN Licensed Banks</span>
        </div>
      </div>

      {/* Query Parameters Table */}
      <div className="space-y-3 pt-4 border-t border-zinc-800">
        <h2 className="text-lg font-bold text-white tracking-tight">Query Parameters</h2>
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
              <TableCell className="font-mono text-emerald-400 font-bold">account_number</TableCell>
              <TableCell className="font-mono text-zinc-400">string</TableCell>
              <TableCell className="text-rose-400 font-bold">Required</TableCell>
              <TableCell className="text-zinc-300">The 10-digit NUBAN account number.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-zinc-300 font-bold">bank_code</TableCell>
              <TableCell className="font-mono text-zinc-400">string</TableCell>
              <TableCell className="text-rose-400 font-bold">Required</TableCell>
              <TableCell className="text-zinc-300">3-digit CBN bank code (e.g. <code className="text-sky-300 font-mono">058</code> for GTBank, <code className="text-sky-300 font-mono">011</code> for First Bank, <code className="text-sky-300 font-mono">033</code> for UBA).</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Example Request & Response */}
      <div className="space-y-4 pt-4 border-t border-zinc-800">
        <h2 className="text-lg font-bold text-white tracking-tight">Example Request & Response (Dojah Parity)</h2>
        <CodeBlock
          language="bash"
          title="cURL Request"
          code={`curl -X GET "https://api.verixaid.com/api/v1/kyc/account?account_number=0123456789&bank_code=058" \\
  -H "Authorization: vrx_live_9f83a8f1e2b4c6d8_a1b2c3d4..." \\
  -H "AppId: app_6a7b8c9d0e1f" \\
  -H "Content-Type: application/json"`}
        />

        <CodeBlock
          language="json"
          title="HTTP 200 OK Response"
          code={`{
  "status": "success",
  "entity": {
    "account_number": "0123456789",
    "account_name": "CHIDERA EMEKA OLUTOLA",
    "bank_code": "058"
  },
  "billed_amount": 0,
  "cached": false,
  "meta": {
    "request_id": "vx_req_nuban_1928a",
    "service": "account_resolve",
    "latency_ms": 115
  }
}`}
        />
      </div>
    </div>
  )
}
