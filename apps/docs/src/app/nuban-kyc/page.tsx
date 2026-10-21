import { Badge, CodeBlock, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@verixa/ui"

export default function NubanKycDocsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="verified">UNIVERSAL TAXONOMY</Badge>
          <span className="font-mono text-xs text-indigo-700 font-bold">/api/v1/kyc/nuban/status</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          NUBAN KYC Status & Linked Identity Tier
        </h1>
        <p className="mt-2 text-base text-slate-600 leading-relaxed">
          Retrieve the CBN KYC compliance tier (Tier 1, 2, or 3) and linked national identity status associated with any Nigerian commercial or microfinance bank account.
        </p>
      </div>

      {/* Pricing and SLA Chips */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
        <div className="p-3 rounded-lg bg-white shadow-2xs border border-slate-200">
          <span className="text-slate-500 block">COST</span>
          <span className="text-emerald-700 font-bold">25 NGX (₦25.00)</span>
        </div>
        <div className="p-3 rounded-lg bg-white shadow-2xs border border-slate-200">
          <span className="text-slate-500 block">TARGET SLA</span>
          <span className="text-slate-900 font-bold">&lt; 180ms</span>
        </div>
      </div>

      {/* Query Parameters Table */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Query Parameters</h2>
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
              <TableCell className="font-mono text-emerald-700 font-bold">account_number</TableCell>
              <TableCell className="font-mono text-slate-600">string</TableCell>
              <TableCell className="text-rose-700 font-bold">Required</TableCell>
              <TableCell className="text-slate-700">10-digit NUBAN bank account number.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-emerald-700 font-bold">bank_code</TableCell>
              <TableCell className="font-mono text-slate-600">string</TableCell>
              <TableCell className="text-rose-700 font-bold">Required</TableCell>
              <TableCell className="text-slate-700">CBN bank code (e.g. <code className="text-sky-700 font-mono">058</code> for GTBank, <code className="text-sky-700 font-mono">011</code> for First Bank).</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Example Request & Response */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Example Request & Response (Universal Taxonomy)</h2>
        <CodeBlock
          language="bash"
          title="cURL Request"
          code={`curl -X GET "https://api.verixaid.com/api/v1/kyc/nuban/status?account_number=0123456789&bank_code=058" \\
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
    "account_name": "EMEKA CHIDERA OKAFOR",
    "bank_code": "058",
    "kyc_tier": "TIER_3",
    "bvn_linked": true,
    "nin_linked": true,
    "account_status": "ACTIVE"
  },
  "billed_amount": 25,
  "cached": false,
  "meta": {
    "request_id": "vx_req_kyc_status_2b1",
    "service": "nuban_status",
    "latency_ms": 138
  }
}`}
        />
      </div>
    </div>
  )
}
