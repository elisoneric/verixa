import { Badge, CodeBlock, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@verixa/ui"

export default function NubanKycDocsPage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="verified">POST</Badge>
          <span className="font-mono text-xs text-indigo-400 font-bold">/v1/verify/nuban-kyc</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          NUBAN KYC Status & Linked Identity Tier
        </h1>
        <p className="mt-2 text-base text-zinc-400 leading-relaxed">
          Retrieve the CBN KYC compliance tier (Tier 1, 2, or 3) and linked national identity anchor (BVN / NIN) associated with any Nigerian commercial or microfinance bank account.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-500 block">COST</span>
          <span className="text-emerald-400 font-bold">80 NGX (₦80.00)</span>
        </div>
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-500 block">CACHE SPLIT</span>
          <span className="text-cyan-400 font-bold">30 NGX (₦30.00)</span>
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
              <TableCell className="font-mono text-emerald-400 font-bold">accountNumber</TableCell>
              <TableCell className="font-mono text-zinc-400">string</TableCell>
              <TableCell className="text-rose-400 font-bold">Required</TableCell>
              <TableCell className="text-zinc-300">10-digit NUBAN bank account number.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-emerald-400 font-bold">bankCode</TableCell>
              <TableCell className="font-mono text-zinc-400">string | number</TableCell>
              <TableCell className="text-rose-400 font-bold">Required</TableCell>
              <TableCell className="text-zinc-300">CBN bank code (e.g. 058 or 58 for GTBank, 011 for First Bank).</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-amber-400 font-bold">consent</TableCell>
              <TableCell className="font-mono text-zinc-400">boolean</TableCell>
              <TableCell className="text-rose-400 font-bold">Required</TableCell>
              <TableCell className="text-zinc-300">Must be set to <code className="text-amber-300 font-mono">true</code> per NDPA compliance.</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white tracking-tight">Example Request & Response</h2>
        <CodeBlock
          language="bash"
          title="cURL Request"
          code={`curl -X POST https://api.verixaid.com/v1/verify/nuban-kyc \\
  -H "Authorization: Bearer vrx_live_..." \\
  -H "Idempotency-Key: nuban-kyc-019a2e" \\
  -H "Content-Type: application/json" \\
  -d '{
    "accountNumber": "3046123407",
    "bankCode": "058",
    "consent": true
  }'`}
        />

        <CodeBlock
          language="json"
          title="Response (200 OK)"
          code={`{
  "status": "verified",
  "data": {
    "account_name": "JOHN DOE MUSA",
    "account_number": "3046***407",
    "bank": "GTB",
    "kyc_status": "2",
    "identity_type": "BVN",
    "identity_number": "*********556",
    "first_name": "John",
    "last_name": "Musa",
    "other_names": "DOE",
    "account_currency": "NGN"
  },
  "cached": false,
  "billed_amount": 80,
  "meta": {
    "provider": "dojah",
    "latency_ms": 164
  }
}`}
        />
      </div>
    </div>
  )
}
