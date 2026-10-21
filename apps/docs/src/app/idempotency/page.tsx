import type { Metadata } from "next"
import { Badge, CodeBlock } from "@verixa/ui"

export const metadata: Metadata = {
  title: "API Idempotency & Zero Double-Charge Guarantee | Verixa ID Docs",
  description:
    "Prevent accidental double billing during API retries and network timeouts using Redis-backed Idempotency-Key headers with Verixa ID.",
  keywords: [
    "API idempotency key",
    "prevent double billing API",
    "idempotent verification request",
  ],
  alternates: {
    canonical: "https://docs.verixaid.com/idempotency",
  },
}

export default function IdempotencyDocsPage() {
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
        "name": "Redis Idempotency Keys",
        "item": "https://docs.verixaid.com/idempotency",
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
          <Badge variant="mono">CACHE</Badge>
          <span className="font-mono text-xs text-slate-500">REDIS 24H</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Redis Idempotency Keys
        </h1>
        <p className="mt-2 text-base text-slate-600 leading-relaxed">
          Prevent accidental double charges and duplicate verification queries during network timeouts and retries using the <code className="text-emerald-700">Idempotency-Key</code> header.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">How It Works</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          When you send a request with an <code className="text-emerald-700">Idempotency-Key</code>, Verixa checks its Redis cache. If the key was already processed within the last 24 hours, Verixa returns the cached response in 0ms without deducting additional NGX credits.
        </p>

        <CodeBlock
          language="bash"
          title="Sending an Idempotency Key"
          code={`curl -X POST https://api.verixaid.com/v1/verify/bvn \\
  -H "Authorization: Bearer vrx_live_..." \\
  -H "Idempotency-Key: 7b3e6d1a-4c2e-48a9-981f-1c4a92b02e11" \\
  -H "Content-Type: application/json" \\
  -d '{"bvn": "22123456789"}'`}
        />
      </div>
    </div>
  )
}
