import { Badge, CodeBlock, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@verixa/ui"

export default function SmartCacheDocsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="verified">PERFORMANCE & PRICING</Badge>
          <span className="font-mono text-xs text-zinc-500">SMART IDENTITY CACHE</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Smart Identity Cache & Billing
        </h1>
        <p className="mt-2 text-base text-zinc-400 leading-relaxed">
          Accelerate recurring identity lookups to sub-15ms and slash verification costs by up to 60% with Verixa's automated identity caching engine.
        </p>
      </div>

      {/* How It Works Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight">How Smart Cache Works</h2>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          In high-volume applications (e.g., loan repayments, repeat user transactions, or multi-step onboarding), users often trigger multiple verification checks for the same identity record (NIN, BVN, or Bank Account).
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="mono" size="sm">STEP 1: FIRST QUERY</Badge>
              <span className="text-xs text-zinc-400 font-mono">CACHE MISS</span>
            </div>
            <h4 className="text-sm font-bold text-white">Live Upstream Query</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              When an identity is verified for the first time, Verixa routes the request to authorized official registries (Dojah / NIMC / NIBSS). The verified payload is stored in Verixa's tenant-isolated in-memory Redis cache with a 30-day retention window. Billed at standard live rate (₦50).
            </p>
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-br from-zinc-900/80 to-emerald-950/20 border border-emerald-500/30 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="verified" size="sm">STEP 2: REPEAT QUERIES</Badge>
              <span className="text-xs text-emerald-400 font-mono">CACHE HIT</span>
            </div>
            <h4 className="text-sm font-bold text-white">Sub-15ms Cache Delivery</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Subsequent queries for the same NIN, BVN, or account within 30 days are served instantly from cache memory without querying upstream registries. Billed at up to 60% discounted rates (₦20 for NIN/BVN, ₦5 for NUBAN).
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Comparison Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight">Live vs Smart Cache Rate Schedule</h2>
        <p className="text-xs sm:text-sm text-zinc-400">
          Smart Cache savings are applied automatically to all Starter, Growth, and Enterprise accounts.
        </p>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>First Lookup (Live Miss)</TableHead>
              <TableHead>Cached Lookup (Cache Hit)</TableHead>
              <TableHead>Client Savings</TableHead>
              <TableHead>Latency</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-semibold text-white">BVN Verification</TableCell>
              <TableCell className="font-mono text-zinc-300">50 NGX (₦50.00)</TableCell>
              <TableCell className="font-mono text-emerald-400 font-bold">20 NGX (₦20.00)</TableCell>
              <TableCell className="text-emerald-400 font-bold">60% OFF</TableCell>
              <TableCell className="font-mono text-xs text-zinc-400">&lt;15ms (Cache) vs ~180ms</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold text-white">NIN Verification</TableCell>
              <TableCell className="font-mono text-zinc-300">50 NGX (₦50.00)</TableCell>
              <TableCell className="font-mono text-emerald-400 font-bold">20 NGX (₦20.00)</TableCell>
              <TableCell className="text-emerald-400 font-bold">60% OFF</TableCell>
              <TableCell className="font-mono text-xs text-zinc-400">&lt;15ms (Cache) vs ~180ms</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold text-white">Bank Account (NUBAN)</TableCell>
              <TableCell className="font-mono text-zinc-300">10 NGX (₦10.00)</TableCell>
              <TableCell className="font-mono text-emerald-400 font-bold">5 NGX (₦5.00)</TableCell>
              <TableCell className="text-emerald-400 font-bold">50% OFF</TableCell>
              <TableCell className="font-mono text-xs text-zinc-400">&lt;15ms (Cache) vs ~120ms</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Response Structure */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight">Identifying Cached Responses</h2>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          Verixa returns audit metadata in the standardized response envelope. When a query hits cache, <code className="text-emerald-400">meta.cached</code> is set to <code className="text-emerald-400">true</code>, along with the timestamp of the original verification.
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
    "upstream_provider": "dojah",
    "referenceId": "vx_cache_8f19a02d41ba",
    "cost_ngx": 20,
    "latency_ms": 12,
    "environment": "live"
  }
}`}
        />
      </div>

      {/* Cache Bypass */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight">Forcing a Fresh Live Lookup (Cache Bypass)</h2>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          If you need to guarantee that data is re-queried directly from official government registries (for example, during annual AML re-kyc reviews), include the <code className="text-emerald-400">X-Bypass-Cache: true</code> HTTP header.
        </p>

        <CodeBlock
          language="bash"
          title="Bypassing Cache with X-Bypass-Cache"
          code={`curl -X POST https://api.verixaid.com/v1/verify/nin \\
  -H "Authorization: Bearer vrx_live_9f83a8f1e2..." \\
  -H "X-Bypass-Cache: true" \\
  -H "Content-Type: application/json" \\
  -d '{"nin": "11234567890"}'`}
        />
      </div>

      {/* Security & Data Protection */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight">Data Isolation & NDPR Compliance</h2>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          Verixa Smart Identity Cache is strictly tenant-isolated. Cache entries are partitioned by organization ID, ensuring that no client ever accesses records queried by another company. In accordance with the Nigeria Data Protection Act (NDPR), identity cache records are encrypted at rest and automatically purged when their TTL expires.
        </p>
      </div>
    </div>
  )
}
