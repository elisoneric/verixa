import { Badge, CodeBlock, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@verixa/ui"

export default function NinDocsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="verified">DOJAH PARITY</Badge>
          <span className="font-mono text-xs text-sky-400 font-bold">/api/v1/kyc/nin</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          National Identification Number (NIN)
        </h1>
        <p className="mt-2 text-base text-zinc-400 leading-relaxed">
          Verify an 11-digit NIN against the NIMC database. Verixa provides 100% Dojah endpoint parity across basic demographics, advance records with portraits and addresses, premium tiers, NIMC slips, and live biometric face matching.
        </p>
      </div>

      {/* Pricing and SLA Chips */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-500 block">BASIC & ADVANCE NIN</span>
          <span className="text-emerald-400 font-bold">125 NGX (₦125.00)</span>
        </div>
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-500 block">PREMIUM / BIOMETRIC</span>
          <span className="text-emerald-400 font-bold">150 NGX</span>
        </div>
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-500 block">SMART CACHE HIT</span>
          <span className="text-cyan-400 font-bold">50 NGX (₦50.00)</span>
        </div>
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-500 block">LATENCY (CACHE / LIVE)</span>
          <span className="text-white font-bold">&lt;15ms / ~160ms</span>
        </div>
      </div>

      {/* Available Tiers Overview */}
      <div className="space-y-4 pt-2">
        <h2 className="text-lg font-bold text-white tracking-tight">Available Endpoints & Tiers</h2>
        <div className="grid sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1">
            <span className="text-sky-400 font-bold block">1. Basic NIN Lookup</span>
            <code className="text-white block text-[11px]">GET /api/v1/kyc/nin?nin=...</code>
            <p className="text-zinc-400 font-sans text-xs">Returns full name, gender, phone number, and date of birth.</p>
          </div>
          <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1">
            <span className="text-sky-400 font-bold block">2. Advance NIN Lookup</span>
            <code className="text-white block text-[11px]">GET /api/v1/kyc/nin/advance?nin=...</code>
            <p className="text-zinc-400 font-sans text-xs">Adds residence address, state of origin, next-of-kin, and base64 portrait.</p>
          </div>
          <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1">
            <span className="text-sky-400 font-bold block">3. Premium NIN</span>
            <code className="text-white block text-[11px]">GET /api/v1/kyc/nin/premium?nin=...</code>
            <p className="text-zinc-400 font-sans text-xs">Includes religion, profession, and digital signature records.</p>
          </div>
          <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1">
            <span className="text-sky-400 font-bold block">4. NIN Slip Record</span>
            <code className="text-white block text-[11px]">GET /api/v1/kyc/nin/nin_slip?nin=...</code>
            <p className="text-zinc-400 font-sans text-xs">Resolves official printable NIMC slip data with tracking ID.</p>
          </div>
          <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1 sm:col-span-2">
            <span className="text-emerald-400 font-bold block">5. NIN Selfie Face Verification</span>
            <code className="text-white block text-[11px]">POST /api/v1/kyc/nin/verify</code>
            <p className="text-zinc-400 font-sans text-xs">Matches live user selfie against the government NIMC identity image.</p>
          </div>
        </div>
      </div>

      {/* Query Parameters Table */}
      <div className="space-y-3 pt-4 border-t border-zinc-800">
        <h2 className="text-lg font-bold text-white tracking-tight">Query Parameters (GET /api/v1/kyc/nin/advance)</h2>
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

      {/* Code Examples */}
      <div className="space-y-4 pt-4 border-t border-zinc-800">
        <h2 className="text-lg font-bold text-white tracking-tight">Example Request & Response (Advance)</h2>
        <CodeBlock
          language="bash"
          title="cURL Request (Advance Profile)"
          code={`curl -X GET "https://api.verixaid.com/api/v1/kyc/nin/advance?nin=70123456789" \\
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
  "billed_amount": 100,
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
      <div className="space-y-4 pt-4 border-t border-zinc-800">
        <h2 className="text-lg font-bold text-white tracking-tight">NIN Face Match Verification (POST /api/v1/kyc/nin/verify)</h2>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          Verify an applicant&apos;s identity with biometric certainty by matching their live captured selfie against the NIMC registry photograph.
        </p>

        <CodeBlock
          language="bash"
          title="cURL Request (Selfie Match)"
          code={`curl -X POST https://api.verixaid.com/api/v1/kyc/nin/verify \\
  -H "Authorization: vrx_live_9f83a8f1..." \\
  -H "AppId: app_6a7b8c9d0e1f" \\
  -H "Content-Type: application/json" \\
  -d '{
    "nin": "70123456789",
    "selfie_image": "/9j/4AAQSkZJRgABAQ...",
    "threshold": 90
  }'`}
        />
      </div>
    </div>
  )
}
