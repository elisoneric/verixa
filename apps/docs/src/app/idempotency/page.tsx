import { Badge, CodeBlock } from "@verixa/ui"

export default function IdempotencyDocsPage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="mono">CACHE</Badge>
          <span className="font-mono text-xs text-zinc-500">REDIS 24H</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Redis Idempotency Keys
        </h1>
        <p className="mt-2 text-base text-zinc-400 leading-relaxed">
          Prevent accidental double charges and duplicate verification queries during network timeouts and retries using the <code className="text-emerald-400">Idempotency-Key</code> header.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight">How It Works</h2>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          When you send a request with an <code className="text-emerald-400">Idempotency-Key</code>, Verixa checks its Redis cache. If the key was already processed within the last 24 hours, Verixa returns the cached response in 0ms without deducting additional NGX credits.
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
