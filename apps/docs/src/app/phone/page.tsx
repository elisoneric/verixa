import type { Metadata } from "next"
import { Badge, CodeBlock, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@verixa/ui"

export const metadata: Metadata = {
  title: "Phone Number Verification & Carrier KYC API (₦85) | Verixa ID",
  description:
    "Low-cost Nigerian phone number verification API. Query subscriber identity, telecom carrier intelligence (MTN, Airtel, Glo, 9mobile), and SIM registration status from ₦30 with Smart Cache.",
  keywords: [
    "phone number verification API",
    "Nigeria phone lookup API",
    "carrier KYC API",
    "telco subscriber verification Nigeria",
    "cheap phone validation API",
  ],
  alternates: {
    canonical: "https://docs.verixaid.com/phone",
  },
}

export default function PhoneDocsPage() {
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
        "name": "Phone Intelligence API",
        "item": "https://docs.verixaid.com/phone",
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
          <span className="font-mono text-xs text-sky-700 font-bold">/api/v1/kyc/phone_number</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Phone Number Intelligence
        </h1>
        <p className="mt-2 text-base text-slate-600 leading-relaxed">
          Resolve the verified subscriber identity and carrier intelligence behind any Nigerian mobile phone number (MTN, Airtel, Glo, 9mobile) via upstream carrier KYC registries.
        </p>
      </div>

      {/* Pricing and SLA Chips */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
        <div className="p-3 rounded-lg bg-white shadow-2xs border border-slate-200">
          <span className="text-slate-500 block">BASIC PHONE</span>
          <span className="text-emerald-700 font-bold">85 NGX (₦85.00)</span>
        </div>
        <div className="p-3 rounded-lg bg-white shadow-2xs border border-slate-200">
          <span className="text-slate-500 block">FULL INTELLIGENCE</span>
          <span className="text-emerald-700 font-bold">120 NGX (₦120.00)</span>
        </div>
        <div className="p-3 rounded-lg bg-white shadow-2xs border border-slate-200">
          <span className="text-slate-500 block">SMART CACHE HIT (50% OFF)</span>
          <span className="text-cyan-700 font-bold">30 NGX (₦30.00)</span>
        </div>
        <div className="p-3 rounded-lg bg-white shadow-2xs border border-slate-200">
          <span className="text-slate-500 block">TARGET SLA</span>
          <span className="text-slate-900 font-bold">&lt; 180ms</span>
        </div>
      </div>

      {/* Available Endpoints Overview */}
      <div className="space-y-4 pt-2">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Available Endpoints</h2>
        <div className="grid sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
            <span className="text-sky-700 font-bold block">1. Basic Phone Lookup</span>
            <code className="text-slate-900 block text-[11px]">GET /api/v1/kyc/phone_number/basic?phone_number=...</code>
            <p className="text-slate-600 font-sans text-xs">Returns subscriber first name, surname, and registered status.</p>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
            <span className="text-sky-700 font-bold block">2. Full Carrier Intelligence</span>
            <code className="text-slate-900 block text-[11px]">GET /api/v1/kyc/phone_number?phone_number=...</code>
            <p className="text-slate-600 font-sans text-xs">Adds date of birth, gender, address, carrier network, and portrait.</p>
          </div>
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
              <TableCell className="font-mono text-emerald-700 font-bold">phone_number</TableCell>
              <TableCell className="font-mono text-slate-600">string</TableCell>
              <TableCell className="text-rose-700 font-bold">Required</TableCell>
              <TableCell className="text-slate-700">Valid 11-digit or E.164 Nigerian phone number (e.g. 08012345678 or +2348012345678).</TableCell>
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
