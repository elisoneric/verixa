import type { Metadata } from "next"
import { Badge, CodeBlock, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@verixa/ui"

export const metadata: Metadata = {
  title: "Smart Identity Cache (Sub-15ms Accelerated Lookups) | Verixa ID",
  description:
    "Accelerate NIN & BVN verification to sub-15ms with tenant-isolated Smart Identity Cache. Instant responses for repeated verification lookups.",
  keywords: [
    "Smart Identity Cache",
    "cheap NIN verification API",
    "discounted BVN lookup",
    "sub-15ms identity API",
    "low cost identity verification",
  ],
  alternates: {
    canonical: "https://docs.verixaid.com/smart-cache",
  },
}

export default function SmartCacheDocsPage() {
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
        "name": "Smart Identity Cache",
        "item": "https://docs.verixaid.com/smart-cache",
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
          <Badge variant="verified">PERFORMANCE & PRICING</Badge>
          <span className="font-mono text-xs text-slate-500">SMART IDENTITY CACHE</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Smart Identity Cache & Billing
        </h1>
        <p className="mt-2 text-base text-slate-600 leading-relaxed">
          Accelerate recurring identity lookups to sub-15ms and slash verification costs by 50% with Verixa's automated identity caching engine.
        </p>
      </div>

      {/* How It Works Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">How Smart Cache Works</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          In high-volume applications (e.g., loan repayments, repeat user transactions, or multi-step onboarding), users often trigger multiple verification checks for the same identity record (NIN, BVN, or Bank Account).
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-white shadow-2xs border border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="mono" size="sm">STEP 1: FIRST QUERY</Badge>
              <span className="text-xs text-slate-600 font-mono">CACHE MISS</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">Live Upstream Query</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              When an identity is verified for the first time, Verixa routes the request to authorized verification registries. The verified payload is stored in Verixa's tenant-isolated in-memory cache with a 30-day retention window.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-br from-zinc-900/80 to-emerald-950/20 border border-emerald-500/30 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="verified" size="sm">STEP 2: REPEAT QUERIES</Badge>
              <span className="text-xs text-emerald-700 font-mono">CACHE HIT</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">Sub-15ms Cache Delivery</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Subsequent queries for the same NIN, BVN, or account within 30 days are served instantly from cache memory with zero network delay and discounted retrieval.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Comparison Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Rate Schedule & Performance</h2>
        <p className="text-xs sm:text-sm text-slate-600">
          Smart Cache speed improvements are applied automatically to all Starter, Growth, and Enterprise accounts.
        </p>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>First Lookup (Live Miss)</TableHead>
              <TableHead>Cached Lookup (Cache Hit)</TableHead>
              <TableHead>Speed Advantage</TableHead>
              <TableHead>Latency</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-semibold text-slate-900">BVN Verification</TableCell>
              <TableCell className="font-mono text-slate-700">Starts from ₦100 on API</TableCell>
              <TableCell className="font-mono text-emerald-700 font-bold">Sub-15ms Cached</TableCell>
              <TableCell className="text-emerald-700 font-bold">Up to 10x Faster</TableCell>
              <TableCell className="font-mono text-xs text-slate-600">&lt;15ms vs ~140ms</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold text-slate-900">NIN Verification</TableCell>
              <TableCell className="font-mono text-slate-700">Starts from ₦120 on API</TableCell>
              <TableCell className="font-mono text-emerald-700 font-bold">Sub-15ms Cached</TableCell>
              <TableCell className="text-emerald-700 font-bold">Up to 10x Faster</TableCell>
              <TableCell className="font-mono text-xs text-slate-600">&lt;15ms vs ~160ms</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold text-slate-900">Bank Account (NUBAN)</TableCell>
              <TableCell className="font-mono text-emerald-700 font-bold">Free (₦0.00)</TableCell>
              <TableCell className="font-mono text-emerald-700 font-bold">Free (₦0.00)</TableCell>
              <TableCell className="text-emerald-700 font-bold">Always Free</TableCell>
              <TableCell className="font-mono text-xs text-slate-600">&lt;15ms vs ~80ms</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Response Structure */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Identifying Cached Responses</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Verixa returns audit metadata in the standardized response envelope. When a query hits cache, <code className="text-emerald-700">meta.cached</code> is set to <code className="text-emerald-700">true</code>, along with the timestamp of the original verification.
        </p>

        <CodeBlock
          language="json"
          title="Standardized Cache Hit Response Payload"
          code={`{
  "status": "success",
  "data": {
    "nin": "11234567890",
    "first_name": "CHIDERA",
    "last_name": "OLUTOLA",
    "gender": "male",
    "residence_state": "Lagos"
  },
  "meta": {
    "cached": true,
    "cached_at": "2026-10-01T14:22:10.450Z",
    "provider": "verixa_smart_cache",
    "upstream_provider": "primary_gateway",
    "referenceId": "vx_cache_8f19a02d41ba",
    "cost_ngx": 50,
    "latency_ms": 12,
    "environment": "live"
  }
}`}
        />
      </div>

      {/* Cache Bypass */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Forcing a Fresh Live Lookup (Cache Bypass)</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          If you need to guarantee that data is re-queried directly from upstream verification registries (for example, during annual AML re-kyc reviews), include the <code className="text-emerald-700">X-Bypass-Cache: true</code> HTTP header.
        </p>

        <CodeBlock
          language="bash"
          title="Bypassing Cache with X-Bypass-Cache"
          code={`curl -X POST https://api.verixaid.com/v1/verify/nin \\
  -H "Authorization: Bearer vrx_live_9f83a8f1e2..." \\
  -H "X-Bypass-Cache: true" \\
  -H "Content-Type: application/json" \\
  -d '{"nin": "11234567890", "consent": true}'`}
        />
      </div>

      {/* Security & Data Protection */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Data Isolation & NDPR Compliance</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Verixa Smart Identity Cache is strictly tenant-isolated. Cache entries are partitioned by organization ID, ensuring that no client ever accesses records queried by another company. In accordance with the Nigeria Data Protection Act (NDPR), identity cache records are encrypted at rest and automatically purged when their TTL expires.
        </p>
      </div>
    </div>
  )
}
