import { Badge, CodeBlock, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@verixa/ui"

export default function RateLimitsDocsPage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="mono">THROTTLING</Badge>
          <span className="font-mono text-xs text-slate-500">100 REQ/MIN</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Rate Limits & Quotas
        </h1>
        <p className="mt-2 text-base text-slate-600 leading-relaxed">
          Verixa enforces rate limits per tenant organization to maintain high availability and prevent denial-of-service degradation.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Environment</TableHead>
            <TableHead>Default Rate Limit</TableHead>
            <TableHead>Burst Quota</TableHead>
            <TableHead>HTTP Header Returned</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-semibold text-slate-900">Sandbox</TableCell>
            <TableCell className="font-mono text-slate-700">100 req / min</TableCell>
            <TableCell className="font-mono text-slate-700">20 req / sec</TableCell>
            <TableCell className="font-mono text-xs text-slate-600">X-RateLimit-Remaining</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-semibold text-slate-900">Production (Live)</TableCell>
            <TableCell className="font-mono text-emerald-700 font-bold">1,000 req / min</TableCell>
            <TableCell className="font-mono text-emerald-700">100 req / sec</TableCell>
            <TableCell className="font-mono text-xs text-slate-600">X-RateLimit-Remaining</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Rate Limit Headers Example</h2>
        <div className="space-y-3">
          <CodeBlock
            language="bash"
            title="HTTP Response Headers (Status 200 OK)"
            code={`HTTP/1.1 200 OK
Content-Type: application/json
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 984
X-RateLimit-Reset: 1729501860`}
          />
          <CodeBlock
            language="json"
            title="HTTP 429 Too Many Requests Response"
            code={`{
  "status": "error",
  "error_code": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. You have exceeded your 1,000 req/min quota.",
  "retry_after_seconds": 24,
  "meta": {
    "request_id": "vx_req_rate_limit_8f2",
    "timestamp": "2026-10-21T10:00:00.000Z"
  }
}`}
          />
        </div>
      </div>
    </div>
  )
}
