import { Badge, CodeBlock, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@verixa/ui"

export default function PhoneDocsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="verified">DOJAH PARITY</Badge>
          <span className="font-mono text-xs text-sky-400 font-bold">/api/v1/kyc/phone_number</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Phone Number Intelligence
        </h1>
        <p className="mt-2 text-base text-zinc-400 leading-relaxed">
          Resolve the verified subscriber identity and carrier intelligence behind any Nigerian mobile phone number (MTN, Airtel, Glo, 9mobile) via upstream carrier KYC registries.
        </p>
      </div>

      {/* Pricing and SLA Chips */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-500 block">BASIC PHONE</span>
          <span className="text-emerald-400 font-bold">85 NGX (₦85.00)</span>
        </div>
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-500 block">FULL INTELLIGENCE</span>
          <span className="text-emerald-400 font-bold">120 NGX (₦120.00)</span>
        </div>
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-500 block">SMART CACHE HIT</span>
          <span className="text-cyan-400 font-bold">30 NGX (₦30.00)</span>
        </div>
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-500 block">TARGET SLA</span>
          <span className="text-white font-bold">&lt; 180ms</span>
        </div>
      </div>

      {/* Available Endpoints Overview */}
      <div className="space-y-4 pt-2">
        <h2 className="text-lg font-bold text-white tracking-tight">Available Endpoints</h2>
        <div className="grid sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1">
            <span className="text-sky-400 font-bold block">1. Basic Phone Lookup</span>
            <code className="text-white block text-[11px]">GET /api/v1/kyc/phone_number/basic?phone_number=...</code>
            <p className="text-zinc-400 font-sans text-xs">Returns subscriber first name, surname, and registered status.</p>
          </div>
          <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1">
            <span className="text-sky-400 font-bold block">2. Full Carrier Intelligence</span>
            <code className="text-white block text-[11px]">GET /api/v1/kyc/phone_number?phone_number=...</code>
            <p className="text-zinc-400 font-sans text-xs">Adds date of birth, gender, address, carrier network, and portrait.</p>
          </div>
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
              <TableCell className="font-mono text-emerald-400 font-bold">phone_number</TableCell>
              <TableCell className="font-mono text-zinc-400">string</TableCell>
              <TableCell className="text-rose-400 font-bold">Required</TableCell>
              <TableCell className="text-zinc-300">Valid 11-digit or E.164 Nigerian phone number (e.g. 08012345678 or +2348012345678).</TableCell>
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
          code={`curl -X GET "https://api.verixaid.com/api/v1/kyc/phone_number?phone_number=08012345678" \\
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
    "phone_number": "08012345678",
    "first_name": "EMEKA",
    "last_name": "OKAFOR",
    "date_of_birth": "1994-08-22",
    "gender": "Male",
    "network": "MTN",
    "status": "Active"
  },
  "billed_amount": 120,
  "cached": false,
  "meta": {
    "request_id": "vx_req_7d82b01a",
    "service": "phone_advance",
    "latency_ms": 172
  }
}`}
        />
      </div>
    </div>
  )
}
