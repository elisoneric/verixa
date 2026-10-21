import type { Metadata } from "next"
import { Badge, CodeBlock, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@verixa/ui"

export const metadata: Metadata = {
  title: "NIN Verification API (Low-Cost ₦125) & Automated Slip Generator",
  description:
    "Low-cost NIN verification API in Nigeria. Verify 11-digit NIN with NIMC, retrieve portrait photos, residential demography, automated PDF slips (₦250), and Smart Cache lookups from ₦38.",
  keywords: [
    "NIN verification API",
    "NIN API Nigeria",
    "low cost NIN API",
    "cheapest NIN API Nigeria",
    "NIMC verification API",
    "automated NIN slip generator",
    "NIN phone search API",
  ],
  alternates: {
    canonical: "https://docs.verixaid.com/nin",
  },
}

export default function NinDocsPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Verixa ID",
        "item": "https://verixaid.com",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Documentation",
        "item": "https://docs.verixaid.com",
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "NIN Verification API",
        "item": "https://docs.verixaid.com/nin",
      },
    ],
  }

  return (
    <div className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
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
          <span className="text-slate-500 block">OFFICIAL NIN SLIP (PDF)</span>
          <span className="text-emerald-700 font-bold">250 NGX (₦250.00)</span>
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
            <p className="text-slate-600 font-sans text-xs">
              Direct upstream to Dojah Basic (<code className="text-slate-800">GET /api/v1/kyc/nin</code>). Returns full name, gender, date of birth, phone number, and photo.
            </p>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
            <span className="text-sky-700 font-bold block">2. Advance NIN Lookup</span>
            <code className="text-slate-900 block text-[11px]">POST /api/v1/kyc/nin/advance or GET ?nin=...</code>
            <p className="text-slate-600 font-sans text-xs">
              Direct upstream to Dojah Advance (<code className="text-slate-800">GET /api/v1/kyc/nin/advance</code>). Adds birth details, full residence address, state and LGA of origin, next-of-kin, and tracking ID.
            </p>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
            <span className="text-sky-700 font-bold block">3. Premium NIN Lookup</span>
            <code className="text-slate-900 block text-[11px]">POST /api/v1/kyc/nin/premium or GET ?nin=...</code>
            <p className="text-slate-600 font-sans text-xs">
              Direct upstream to Dojah Premium (<code className="text-slate-800">GET /api/v1/kyc/nin/premium</code>). Everything in Advanced, plus demographics, profession, previous name/address, height, title, and digital signature records.
            </p>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
            <span className="text-sky-700 font-bold block">4. NIN Slip Record</span>
            <code className="text-slate-900 block text-[11px]">POST /api/v1/kyc/nin/nin_slip or GET ?nin=...</code>
            <p className="text-slate-600 font-sans text-xs">
              Direct upstream to Dojah NIN Slip (<code className="text-slate-800">GET /api/v1/kyc/nin/nin_slip</code>). Resolves official printable NIMC slip data, tracking ID, and <code className="text-slate-800 font-mono">nin_id</code> (base64 PDF).
            </p>
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
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Request Parameters</h2>
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
              <TableCell className="text-slate-700">The 11-digit National Identity Number. Accepted via URL query param or JSON request body.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-emerald-700 font-bold">consent</TableCell>
              <TableCell className="font-mono text-slate-600">boolean</TableCell>
              <TableCell className="text-slate-500 font-medium">Optional</TableCell>
              <TableCell className="text-slate-700">Mandatory NDPA user consent flag. Recommended <code className="text-emerald-700 font-mono">true</code>.</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Code Examples: Basic NIN */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">1. Basic NIN Lookup (GET /api/v1/kyc/nin)</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Retrieves core citizen identity: full names, gender, date of birth, phone number, and portrait photo.
        </p>
        <CodeBlock
          language="bash"
          title="cURL Request (Basic NIN)"
          code={`curl -X GET "https://api.verixaid.com/api/v1/kyc/nin?nin=70123456789" \\
  -H "Authorization: Bearer vrx_live_9f83a8f1e2b4c6d8_a1b2c3d4..."`}
        />

        <CodeBlock
          language="json"
          title="HTTP 200 OK Response (Basic NIN)"
          code={`{
  "status": "success",
  "entity": {
    "nin": "70123456789",
    "first_name": "JOHN",
    "last_name": "MUSA",
    "middle_name": "DOE",
    "gender": "Male",
    "date_of_birth": "1990-01-11",
    "phone_number": "081123456798",
    "photo": "/9j/4AAQSkZJRgABAQEASABIAAD/2wBD...",
    "employment_status": "employed",
    "marital_status": "single"
  },
  "billed_amount": 125,
  "cached": false,
  "meta": {
    "request_id": "vx_req_7a18f2d9",
    "service": "nin",
    "latency_ms": 154
  }
}`}
        />
      </div>

      {/* Code Examples: Advance NIN */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">2. Advance NIN Lookup (POST /api/v1/kyc/nin/advance)</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Adds comprehensive residence address, state of origin, tracking ID, and next-of-kin information.
        </p>
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
          title="HTTP 200 OK Response (Advance NIN)"
          code={`{
  "status": "success",
  "entity": {
    "nin": "70123456789",
    "tracking_id": "T09281729481",
    "first_name": "JOHN",
    "last_name": "MUSA",
    "middle_name": "DOE",
    "gender": "MALE",
    "date_of_birth": "1990-01-11",
    "phone_number": "081123456798",
    "photo": "/9j/4AAQSkZJRg...",
    "signature": "data:image/png;base64,...",
    "residence_state": "Lagos",
    "residence_lga": "Ikeja",
    "residence_address_line_1": "2, ANON STREET",
    "nok_firstname": "JANE",
    "nok_lastname": "MUSA"
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

      {/* Code Examples: NIN Slip Record */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">3. Official NIN Slip Record (GET /api/v1/kyc/nin/nin_slip)</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Resolves official printable NIMC slip record with tracking ID and <code className="text-slate-800 font-mono">nin_id</code> containing the base64 encoded PDF document.
        </p>
        <CodeBlock
          language="bash"
          title="cURL Request (NIN Slip Record)"
          code={`curl -X GET "https://api.verixaid.com/api/v1/kyc/nin/nin_slip?nin=70123456789" \\
  -H "Authorization: Bearer vrx_live_9f83a8f1e2b4c6d8_a1b2c3d4..."`}
        />

        <CodeBlock
          language="json"
          title="HTTP 200 OK Response (NIN Slip)"
          code={`{
  "status": "success",
  "entity": {
    "nin": "70123456789",
    "first_name": "John",
    "last_name": "Musa",
    "middle_name": "Doe",
    "date_of_birth": "1990-01-11",
    "phone_number": "081123456798",
    "gender": "Male",
    "photo": "/9j/4AAQSkZJRg...",
    "employment_status": "unemployed",
    "marital_status": "single",
    "birth_state": "Lagos",
    "residence_address_line_1": "2, ANON STREET",
    "residence_lga": "Lagos West",
    "residence_state": "Lagos",
    "height": "171",
    "nin_id": "JVBERi0xLjQKJeLjz9MKMSAwIG9iajw..."
  },
  "billed_amount": 250,
  "cached": false,
  "meta": {
    "request_id": "vx_req_slip_92b810",
    "service": "nin_slip",
    "latency_ms": 182
  }
}`}
        />
      </div>

      {/* Biometric Face Match */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">4. NIN Face Match Verification (POST /api/v1/kyc/nin/verify)</h2>
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
