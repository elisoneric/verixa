import { Badge, CodeBlock, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@verixa/ui"

export default function NinDocsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="verified">UNIVERSAL TAXONOMY</Badge>
          <span className="font-mono text-xs text-sky-700 font-bold">/api/v1/kyc/nin</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          National Identification Number (NIN)
        </h1>
        <p className="mt-2 text-base text-slate-600 leading-relaxed">
          Verify an 11-digit NIN against the NIMC database. Verixa provides universal REST endpoint compatibility across basic demographics, advance records with portraits and addresses, premium tiers, NIMC slips, and live biometric face matching.
        </p>
      </div>

      {/* Pricing and SLA Chips */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
        <div className="p-3 rounded-lg bg-white shadow-2xs border border-slate-200">
          <span className="text-slate-500 block">BASIC & ADVANCE NIN</span>
          <span className="text-emerald-700 font-bold">125 NGX (₦125.00)</span>
        </div>
        <div className="p-3 rounded-lg bg-white shadow-2xs border border-slate-200">
          <span className="text-slate-500 block">PREMIUM / BIOMETRIC</span>
          <span className="text-emerald-700 font-bold">150 NGX</span>
        </div>
        <div className="p-3 rounded-lg bg-white shadow-2xs border border-slate-200">
          <span className="text-slate-500 block">SMART CACHE HIT (50% OFF)</span>
          <span className="text-cyan-700 font-bold">50 NGX (₦50.00)</span>
        </div>
        <div className="p-3 rounded-lg bg-white shadow-2xs border border-slate-200">
          <span className="text-slate-500 block">LATENCY (CACHE / LIVE)</span>
          <span className="text-slate-900 font-bold">&lt;15ms / ~160ms</span>
        </div>
      </div>

      {/* Available Tiers Overview */}
      <div className="space-y-4 pt-2">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Available Endpoints & Tiers</h2>
        <div className="grid sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
            <span className="text-sky-700 font-bold block">1. Basic NIN Lookup</span>
            <code className="text-slate-900 block text-[11px]">POST /api/v1/kyc/nin or GET /api/v1/kyc/nin?nin=...</code>
            <p className="text-slate-600 font-sans text-xs">Returns full name, gender, phone number, and date of birth.</p>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
            <span className="text-sky-700 font-bold block">2. Advance NIN Lookup</span>
            <code className="text-slate-900 block text-[11px]">POST /api/v1/kyc/nin/advance or GET ?nin=...</code>
            <p className="text-slate-600 font-sans text-xs">Adds residence address, state of origin, next-of-kin, and base64 portrait.</p>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
            <span className="text-sky-700 font-bold block">3. Premium NIN</span>
            <code className="text-slate-900 block text-[11px]">GET /api/v1/kyc/nin/premium?nin=...</code>
            <p className="text-slate-600 font-sans text-xs">Includes religion, profession, and digital signature records.</p>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
            <span className="text-sky-700 font-bold block">4. NIN Slip Record</span>
            <code className="text-slate-900 block text-[11px]">GET /api/v1/kyc/nin/nin_slip?nin=...</code>
            <p className="text-slate-600 font-sans text-xs">Resolves official printable NIMC slip data with tracking ID.</p>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1 sm:col-span-2">
            <span className="text-emerald-700 font-bold block">5. NIN Selfie Face Verification</span>
            <code className="text-slate-900 block text-[11px]">POST /api/v1/kyc/nin/verify</code>
            <p className="text-slate-600 font-sans text-xs">Matches live user selfie against the government NIMC identity image.</p>
          </div>
        </div>
      </div>

      {/* Query Parameters Table */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Request Parameters (POST /api/v1/kyc/nin)</h2>
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
              <TableCell className="font-mono text-emerald-700 font-bold">nin</TableCell>
              <TableCell className="font-mono text-slate-600">string</TableCell>
              <TableCell className="text-rose-700 font-bold">Required</TableCell>
              <TableCell className="text-slate-700">The 11-digit National Identity Number.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-emerald-700 font-bold">consent</TableCell>
              <TableCell className="font-mono text-slate-600">boolean</TableCell>
              <TableCell className="text-rose-700 font-bold">Required</TableCell>
              <TableCell className="text-slate-700">Mandatory NDPA user consent flag. Must be <code className="text-emerald-700 font-mono">true</code>.</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Code Examples */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Example Request & Response (Advance)</h2>
        <CodeBlock
          language="bash"
          title="cURL Request (Advance Profile)"
          code={`curl -X POST "https://api.verixaid.com/api/v1/kyc/nin/advance" \\
  -H "Authorization: Bearer vrx_live_9f83a8f1e2b4c6d8_a1b2c3d4..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "nin": "70123456789",
    "consent": true
  }'`}
        />

        <CodeBlock
          language="json"
          title="HTTP 200 OK Response"
          code={`{
  "status": "success",
  "entity": {
    "nin": "70123456789",
    "tracking_id": "T09281729481",
    "firstname": "JOHN",
    "surname": "ADAMU",
    "middlename": "DOE",
    "gender": "MALE",
    "birthdate": "1990-01-01",
    "telephoneno": "08012345678",
    "photo": "iVBORw0KGgoAAAANSUhEUgAA...",
    "signature": "data:image/png;base64,...",
    "residence_state": "Lagos",
    "residence_lga": "Ikeja",
    "residence_address_line_1": "12, Example Crescent, Ikeja",
    "nok_firstname": "JANE",
    "nok_lastname": "ADAMU"
  },
  "billed_amount": 125,
  "cached": false,
  "meta": {
    "request_id": "vx_req_4f92a10c",
    "service": "nin_advance",
    "latency_ms": 168
  }
}`}
        />
      </div>

      {/* Biometric Face Match */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">NIN Face Match Verification (POST /api/v1/kyc/nin/verify)</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Verify an applicant&apos;s identity with biometric certainty by matching their live captured selfie against the NIMC registry photograph.
        </p>

        <CodeBlock
          language="bash"
          title="cURL Request (Selfie Match)"
          code={`curl -X POST https://api.verixaid.com/api/v1/kyc/nin/verify \\
  -H "Authorization: Bearer vrx_live_9f83a8f1..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "nin": "70123456789",
    "selfie_image": "/9j/4AAQSkZJRgABAQ...",
    "threshold": 90,
    "consent": true
  }'`}
        />
      </div>
    </div>
  )
}
