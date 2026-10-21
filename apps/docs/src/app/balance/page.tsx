import type { Metadata } from "next"
import { Badge, CodeBlock, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@verixa/ui"

export const metadata: Metadata = {
  title: "Wallet Balance & Virtual Account API (Free ₦0) | Verixa ID Docs",
  description:
    "Free, sub-15ms programmatic wallet balance and dedicated virtual account resolution API for Nigerian fintechs and developers using Verixa ID.",
  keywords: [
    "wallet balance API",
    "prepaid credit query API",
    "virtual account API",
    "free balance API",
  ],
  alternates: {
    canonical: "https://docs.verixaid.com/balance",
  },
}

export default function BalanceDocsPage() {
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
        "name": "Wallet Balance API",
        "item": "https://docs.verixaid.com/balance",
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
          <Badge variant="verified">BILLING & WALLET</Badge>
          <span className="font-mono text-xs text-emerald-700 font-bold">/api/v1/balance</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Wallet Balance API
        </h1>
        <p className="mt-2 text-base text-slate-600 leading-relaxed">
          Programmatically query your organization&apos;s real-time NGX prepaid balance, sandbox credits, currency, and dedicated virtual bank settlement account details.
        </p>
      </div>

      {/* Pricing and SLA Chips */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
        <div className="p-3 rounded-lg bg-white shadow-2xs border border-slate-200">
          <span className="text-slate-500 block">QUERY COST</span>
          <span className="text-emerald-700 font-bold">Free (₦0.00)</span>
        </div>
        <div className="p-3 rounded-lg bg-white shadow-2xs border border-slate-200">
          <span className="text-slate-500 block">AUTHENTICATION</span>
          <span className="text-slate-900 font-bold">API Key / Bearer Token</span>
        </div>
        <div className="p-3 rounded-lg bg-white shadow-2xs border border-slate-200">
          <span className="text-slate-500 block">TARGET LATENCY</span>
          <span className="text-cyan-700 font-bold">&lt; 15ms</span>
        </div>
      </div>

      {/* Available Endpoints Overview */}
      <div className="space-y-4 pt-2">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Available Balance Endpoints</h2>
        <div className="grid sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
            <span className="text-emerald-700 font-bold block">1. Standard Balance Endpoint</span>
            <code className="text-slate-900 block text-[11px]">GET /api/v1/balance</code>
            <p className="text-slate-600 font-sans text-xs">Primary drop-in balance query using your secret API key.</p>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
            <span className="text-sky-700 font-bold block">2. Billing Balance Taxonomy</span>
            <code className="text-slate-900 block text-[11px]">GET /v1/billing/balance</code>
            <p className="text-slate-600 font-sans text-xs">Dual-auth balance endpoint supporting both API keys and JWT session tokens.</p>
          </div>
        </div>
      </div>

      {/* Request Headers Table */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Request Headers</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Required</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-mono text-emerald-700 font-bold">Authorization</TableCell>
              <TableCell className="font-mono text-slate-600">string</TableCell>
              <TableCell className="text-rose-700 font-bold">Required</TableCell>
              <TableCell className="text-slate-700">
                Your Verixa secret key. Pass directly or with <code className="text-slate-900 font-mono">Bearer</code> prefix (e.g. <code className="text-emerald-700 font-mono">Bearer vrx_live_...</code>).
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-sky-700 font-bold">AppId</TableCell>
              <TableCell className="font-mono text-slate-600">string</TableCell>
              <TableCell className="text-slate-500 font-bold">Optional</TableCell>
              <TableCell className="text-slate-700">Your application identifier (e.g. <code className="text-slate-900 font-mono">app_6a7b8c...</code>).</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Code Examples */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Example Request & Response</h2>
        <CodeBlock
          language="bash"
          title="cURL Request (Check Organization Balance)"
          code={`curl -X GET "https://api.verixaid.com/api/v1/balance" \\
  -H "Authorization: Bearer vrx_live_9f83a8f1e2b4c6d8_a1b2c3d4..." \\
  -H "Content-Type: application/json"`}
        />

        <CodeBlock
          language="json"
          title="HTTP 200 OK Response"
          code={`{
  "status": "success",
  "data": {
    "liveBalance": 175000,
    "sandboxBalance": 500000,
    "currency": "NGN",
    "environment": "Live",
    "dedicatedVirtualAccount": {
      "bankName": "Titan Trust Bank",
      "accountNumber": "9940182741",
      "accountName": "Verixa ID / Settlement",
      "status": "active"
    }
  }
}`}
        />
      </div>

      {/* Low Balance Webhooks */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Automated Low Balance Alerts</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          You can configure low-balance email alerts and webhook notifications in your <strong className="text-slate-900">Admin & Console Settings</strong>. When your balance drops below your chosen threshold (e.g., ₦5,000), Verixa dispatches an instant notification so your operations are never interrupted.
        </p>
      </div>
    </div>
  )
}
