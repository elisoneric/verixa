import type { Metadata } from "next"
import { Badge, CodeBlock, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@verixa/ui"

export const metadata: Metadata = {
  title: "CAC Company Verification API (Low-Cost KYB) — Corporate Affairs Commission",
  description:
    "Low-cost CAC company verification API. Validate registered Nigerian RC / BN numbers, directors, share capital, and TIN with instant JSON response.",
  keywords: [
    "CAC verification API",
    "CAC company lookup API",
    "KYB API Nigeria",
    "corporate verification API Nigeria",
    "TIN verification API",
  ],
  alternates: {
    canonical: "https://docs.verixaid.com/cac",
  },
}

export default function CacDocsPage() {
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
        "name": "CAC Corporate Verification API",
        "item": "https://docs.verixaid.com/cac",
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
          <span className="font-mono text-xs text-sky-700 font-bold">/api/v1/kyc/cac</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          CAC Corporate & Business Verification (KYB)
        </h1>
        <p className="mt-2 text-base text-slate-600 leading-relaxed">
          Verify registered Nigerian companies and business names directly against the Corporate Affairs Commission (CAC) registry. Retrieve status, company officers, share capital, and tax identification numbers (TIN).
        </p>
      </div>

      {/* Pricing and SLA Chips */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
        <div className="p-3 rounded-lg bg-white shadow-2xs border border-slate-200">
          <span className="text-slate-500 block">CAC BASIC</span>
          <span className="text-emerald-700 font-bold">120 NGX (₦120.00)</span>
        </div>
        <div className="p-3 rounded-lg bg-white shadow-2xs border border-slate-200">
          <span className="text-slate-500 block">CAC ADVANCE</span>
          <span className="text-emerald-700 font-bold">250 NGX (₦250.00)</span>
        </div>
        <div className="p-3 rounded-lg bg-white shadow-2xs border border-slate-200">
          <span className="text-slate-500 block">TIN VERIFICATION</span>
          <span className="text-emerald-700 font-bold">90 NGX (₦90.00)</span>
        </div>
        <div className="p-3 rounded-lg bg-white shadow-2xs border border-slate-200">
          <span className="text-slate-500 block">SMART CACHE HIT</span>
          <span className="text-cyan-700 font-bold">48 - 100 NGX</span>
        </div>
      </div>

      {/* Available Endpoints Overview */}
      <div className="space-y-4 pt-2">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Available Endpoints</h2>
        <div className="grid sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
            <span className="text-sky-700 font-bold block">1. CAC Basic Lookup</span>
            <code className="text-slate-900 block text-[11px]">GET /api/v1/kyc/cac/basic</code>
            <p className="text-slate-600 font-sans text-xs">Returns company name, registration date, head office address, and active status.</p>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
            <span className="text-sky-700 font-bold block">2. CAC Advance</span>
            <code className="text-slate-900 block text-[11px]">GET /api/v1/kyc/cac/advance</code>
            <p className="text-slate-600 font-sans text-xs">Adds directors, beneficial owners, shareholders, and allotted share capital.</p>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
            <span className="text-sky-700 font-bold block">3. TIN Verification</span>
            <code className="text-slate-900 block text-[11px]">GET /api/v1/kyc/tin</code>
            <p className="text-slate-600 font-sans text-xs">Verifies Tax Identification Number against the Joint Tax Board / FIRS database.</p>
          </div>
        </div>
      </div>

      {/* Query Parameters Table */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Query Parameters (CAC)</h2>
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
              <TableCell className="font-mono text-emerald-700 font-bold">rc_number</TableCell>
              <TableCell className="font-mono text-slate-600">string</TableCell>
              <TableCell className="text-rose-700 font-bold">Required</TableCell>
              <TableCell className="text-slate-700">Registration or Business number (e.g. <code className="text-sky-700 font-mono">1261103</code> or <code className="text-sky-700 font-mono">BN123456</code>).</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-slate-700 font-bold">company_type</TableCell>
              <TableCell className="font-mono text-slate-600">string</TableCell>
              <TableCell className="text-slate-500">Optional</TableCell>
              <TableCell className="text-slate-700">
                Entity type: <code className="text-sky-700 font-mono">COMPANY</code> (default), <code className="text-sky-700 font-mono">BUSINESS_NAME</code>, or <code className="text-sky-700 font-mono">INCORPORATED_TRUSTEES</code>.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Code Examples */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Example Request & Response (Universal Taxonomy)</h2>
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
