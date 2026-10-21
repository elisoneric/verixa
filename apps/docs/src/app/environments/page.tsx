import type { Metadata } from "next"
import { Badge, CodeBlock, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@verixa/ui"

export const metadata: Metadata = {
  title: "Sandbox Testing & Production Environments | Verixa ID Docs",
  description:
    "Test NIN and BVN API integrations risk-free with Verixa's Sandbox simulator. Free mock test keys, realistic Nigerian KYC response generation, and zero live charges.",
  keywords: [
    "NIN API sandbox",
    "BVN API test environment",
    "mock KYC API",
    "Nigerian identity sandbox test keys",
  ],
  alternates: {
    canonical: "https://docs.verixaid.com/environments",
  },
}

export default function EnvironmentsDocsPage() {
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
        "name": "Environments & Testing",
        "item": "https://docs.verixaid.com/environments",
      },
    ],
  }

  return (
    <div className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="mono">ARCHITECTURE</Badge>
          <span className="text-xs font-mono text-slate-500">SANDBOX VS LIVE</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Environments & Testing
        </h1>
        <p className="mt-2 text-base text-slate-600 leading-relaxed">
          Verixa ID provides complete environment isolation between Sandbox (development/testing) and Live (production).
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Feature</TableHead>
            <TableHead>Sandbox (vrx_test_*)</TableHead>
            <TableHead>Live (vrx_live_*)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-semibold text-slate-900">Identity Data Source</TableCell>
            <TableCell className="text-slate-700">Mock Nigerian Data Generator</TableCell>
            <TableCell className="text-emerald-700 font-semibold">Live Upstream Registries</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-semibold text-slate-900">Billing Deductions</TableCell>
            <TableCell className="text-slate-700">Free Test Credits (100,000 NGX)</TableCell>
            <TableCell className="text-slate-700">Prepaid Metered NGX Wallet</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-semibold text-slate-900">Cost per BVN / NIN</TableCell>
            <TableCell className="text-slate-700">50 Test NGX (free)</TableCell>
            <TableCell className="text-slate-700">50 NGX (₦50.00)</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-semibold text-slate-900">Cost per NUBAN</TableCell>
            <TableCell className="text-slate-700">10 Test NGX (free)</TableCell>
            <TableCell className="text-slate-700">10 NGX (₦10.00)</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Environment Base URLs</h2>
        <div className="space-y-3">
          <CodeBlock
            language="bash"
            title="Sandbox Base URL (Free Test Credits)"
            code={`# Base URL for sandbox development and integration testing
https://sandbox.verixaid.com/api/v1

# Example Sandbox Request with test key
curl -X GET "https://sandbox.verixaid.com/api/v1/kyc/bvn?bvn=22123456789" \\
  -H "Authorization: Bearer vrx_test_sandbox_secret_key" \\
  -H "Content-Type: application/json"`}
          />
          <CodeBlock
            language="bash"
            title="Production Base URL (Live Metered Registries)"
            code={`# Base URL for production live traffic
https://api.verixaid.com/api/v1

# Example Production Request with live key
curl -X GET "https://api.verixaid.com/api/v1/kyc/bvn?bvn=22123456789" \\
  -H "Authorization: Bearer vrx_live_production_secret_key" \\
  -H "Content-Type: application/json"`}
          />
        </div>
      </div>
    </div>
  )
}
