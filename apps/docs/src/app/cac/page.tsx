import { Badge, CodeBlock, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@verixa/ui"

export default function CacDocsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="verified">DOJAH PARITY</Badge>
          <span className="font-mono text-xs text-sky-400 font-bold">/api/v1/kyc/cac</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          CAC Corporate & Business Verification (KYB)
        </h1>
        <p className="mt-2 text-base text-zinc-400 leading-relaxed">
          Verify registered Nigerian companies and business names directly against the Corporate Affairs Commission (CAC) registry. Retrieve status, company officers, share capital, and tax identification numbers (TIN).
        </p>
      </div>

      {/* Pricing and SLA Chips */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-500 block">CAC BASIC</span>
          <span className="text-emerald-400 font-bold">120 NGX (₦120.00)</span>
        </div>
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-500 block">CAC ADVANCE</span>
          <span className="text-emerald-400 font-bold">250 NGX (₦250.00)</span>
        </div>
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-500 block">TIN VERIFICATION</span>
          <span className="text-emerald-400 font-bold">100 NGX (₦100.00)</span>
        </div>
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-500 block">SMART CACHE HIT</span>
          <span className="text-cyan-400 font-bold">40 - 80 NGX</span>
        </div>
      </div>

      {/* Available Endpoints Overview */}
      <div className="space-y-4 pt-2">
        <h2 className="text-lg font-bold text-white tracking-tight">Available Endpoints</h2>
        <div className="grid sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1">
            <span className="text-sky-400 font-bold block">1. CAC Basic Lookup</span>
            <code className="text-white block text-[11px]">GET /api/v1/kyc/cac/basic</code>
            <p className="text-zinc-400 font-sans text-xs">Returns company name, registration date, head office address, and active status.</p>
          </div>
          <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1">
            <span className="text-sky-400 font-bold block">2. CAC Advance</span>
            <code className="text-white block text-[11px]">GET /api/v1/kyc/cac/advance</code>
            <p className="text-zinc-400 font-sans text-xs">Adds directors, beneficial owners, shareholders, and allotted share capital.</p>
          </div>
          <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1">
            <span className="text-sky-400 font-bold block">3. TIN Verification</span>
            <code className="text-white block text-[11px]">GET /api/v1/kyc/tin</code>
            <p className="text-zinc-400 font-sans text-xs">Verifies Tax Identification Number against the Joint Tax Board / FIRS database.</p>
          </div>
        </div>
      </div>

      {/* Query Parameters Table */}
      <div className="space-y-3 pt-4 border-t border-zinc-800">
        <h2 className="text-lg font-bold text-white tracking-tight">Query Parameters (CAC)</h2>
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
              <TableCell className="font-mono text-emerald-400 font-bold">rc_number</TableCell>
              <TableCell className="font-mono text-zinc-400">string</TableCell>
              <TableCell className="text-rose-400 font-bold">Required</TableCell>
              <TableCell className="text-zinc-300">Registration or Business number (e.g. <code className="text-sky-300 font-mono">1261103</code> or <code className="text-sky-300 font-mono">BN123456</code>).</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-zinc-300 font-bold">company_type</TableCell>
              <TableCell className="font-mono text-zinc-400">string</TableCell>
              <TableCell className="text-zinc-500">Optional</TableCell>
              <TableCell className="text-zinc-300">
                Entity type: <code className="text-sky-300 font-mono">COMPANY</code> (default), <code className="text-sky-300 font-mono">BUSINESS_NAME</code>, or <code className="text-sky-300 font-mono">INCORPORATED_TRUSTEES</code>.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Code Examples */}
      <div className="space-y-4 pt-4 border-t border-zinc-800">
        <h2 className="text-lg font-bold text-white tracking-tight">Example Request & Response (Dojah Parity)</h2>
        <CodeBlock
          language="bash"
          title="cURL Request (CAC Basic)"
          code={`curl -X GET "https://api.verixaid.com/api/v1/kyc/cac/basic?rc_number=1261103&company_type=COMPANY" \\
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
    "rc_number": "1261103",
    "company_name": "ACME TECHNOLOGIES NIGERIA LIMITED",
    "company_type": "PRIVATE COMPANY LIMITED BY SHARES",
    "registration_date": "2015-06-12",
    "head_office_address": "PLOT 14, ADMIRALTY WAY, LEKKI PHASE 1, LAGOS",
    "status": "ACTIVE",
    "email": "legal@acmetech.ng",
    "branch_address": "LAGOS"
  },
  "billed_amount": 120,
  "cached": false,
  "meta": {
    "request_id": "vx_req_cac_91a0c2",
    "service": "cac_basic",
    "latency_ms": 210
  }
}`}
        />
      </div>
    </div>
  )
}
