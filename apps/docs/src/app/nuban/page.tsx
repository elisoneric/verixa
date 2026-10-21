import type { Metadata } from "next"
import { Badge, CodeBlock, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@verixa/ui"

export const metadata: Metadata = {
  title: "Free NUBAN Resolution API — Nigerian Bank Account Name Lookup",
  description:
    "100% Free NUBAN bank account resolution API for Nigerian fintechs. Instant account holder name verification across all commercial banks and mobile wallets.",
  keywords: [
    "free NUBAN API Nigeria",
    "bank account resolution API",
    "NUBAN lookup API",
    "account name verification Nigeria",
    "free bank validation API",
  ],
  alternates: {
    canonical: "https://docs.verixaid.com/nuban",
  },
}

export default function NubanDocsPage() {
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
        "name": "NUBAN Resolution API",
        "item": "https://docs.verixaid.com/nuban",
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
          <span className="font-mono text-xs text-sky-700 font-bold">/api/v1/kyc/account</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Bank Account (NUBAN) Resolution
        </h1>
        <p className="mt-2 text-base text-slate-600 leading-relaxed">
          Resolve beneficiary and account holder names instantly across all Nigerian commercial banks, merchant banks, and microfinance institutions.
        </p>
      </div>

      {/* Pricing and SLA Chips */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
        <div className="p-3 rounded-lg bg-white shadow-2xs border border-slate-200">
          <span className="text-slate-500 block">COST</span>
          <span className="text-emerald-700 font-bold">Free (₦0.00)</span>
        </div>
        <div className="p-3 rounded-lg bg-white shadow-2xs border border-slate-200">
          <span className="text-slate-500 block">TARGET SLA</span>
          <span className="text-slate-900 font-bold">&lt; 150ms</span>
        </div>
        <div className="p-3 rounded-lg bg-white shadow-2xs border border-slate-200">
          <span className="text-slate-500 block">COVERAGE</span>
          <span className="text-slate-900 font-bold">100% CBN Licensed Banks</span>
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
              <TableCell className="text-slate-700">The 10-digit NUBAN account number.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-slate-700 font-bold">bank_code</TableCell>
              <TableCell className="font-mono text-slate-600">string</TableCell>
              <TableCell className="text-rose-700 font-bold">Required</TableCell>
              <TableCell className="text-slate-700">3-digit CBN bank code (e.g. <code className="text-sky-700 font-mono">058</code> for GTBank, <code className="text-sky-700 font-mono">011</code> for First Bank, <code className="text-sky-700 font-mono">033</code> for UBA).</TableCell>
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
