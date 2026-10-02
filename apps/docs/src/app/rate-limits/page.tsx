import { Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@verixa/ui"

export default function RateLimitsDocsPage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="mono">THROTTLING</Badge>
          <span className="font-mono text-xs text-zinc-500">100 REQ/MIN</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Rate Limits & Quotas
        </h1>
        <p className="mt-2 text-base text-zinc-400 leading-relaxed">
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
            <TableCell className="font-semibold text-white">Sandbox</TableCell>
            <TableCell className="font-mono text-zinc-300">100 req / min</TableCell>
            <TableCell className="font-mono text-zinc-300">20 req / sec</TableCell>
            <TableCell className="font-mono text-xs text-zinc-400">X-RateLimit-Remaining</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-semibold text-white">Production (Live)</TableCell>
            <TableCell className="font-mono text-emerald-400 font-bold">1,000 req / min</TableCell>
            <TableCell className="font-mono text-emerald-400">100 req / sec</TableCell>
            <TableCell className="font-mono text-xs text-zinc-400">X-RateLimit-Remaining</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
