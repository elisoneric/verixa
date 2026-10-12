import { Badge, CodeBlock, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@verixa/ui"

export default function BalanceDocsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="verified">BILLING & WALLET</Badge>
          <span className="font-mono text-xs text-emerald-400 font-bold">/api/v1/balance</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Wallet Balance API
        </h1>
        <p className="mt-2 text-base text-zinc-400 leading-relaxed">
          Programmatically query your organization&apos;s real-time NGX prepaid balance, sandbox credits, currency, and dedicated virtual bank settlement account details.
        </p>
      </div>

      {/* Pricing and SLA Chips */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-500 block">QUERY COST</span>
          <span className="text-emerald-400 font-bold">Free (₦0.00)</span>
        </div>
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-500 block">AUTHENTICATION</span>
          <span className="text-white font-bold">API Key / Bearer Token</span>
        </div>
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-500 block">TARGET LATENCY</span>
          <span className="text-cyan-400 font-bold">&lt; 15ms</span>
        </div>
      </div>

      {/* Available Endpoints Overview */}
      <div className="space-y-4 pt-2">
        <h2 className="text-lg font-bold text-white tracking-tight">Available Balance Endpoints</h2>
        <div className="grid sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1">
            <span className="text-emerald-400 font-bold block">1. Standard Balance Endpoint</span>
            <code className="text-white block text-[11px]">GET /api/v1/balance</code>
            <p className="text-zinc-400 font-sans text-xs">Primary drop-in balance query using your secret API key.</p>
          </div>
          <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1">
            <span className="text-sky-400 font-bold block">2. Billing Balance Taxonomy</span>
            <code className="text-white block text-[11px]">GET /v1/billing/balance</code>
            <p className="text-zinc-400 font-sans text-xs">Dual-auth balance endpoint supporting both API keys and JWT session tokens.</p>
          </div>
        </div>
      </div>

      {/* Request Headers Table */}
      <div className="space-y-3 pt-4 border-t border-zinc-800">
        <h2 className="text-lg font-bold text-white tracking-tight">Request Headers</h2>
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
              <TableCell className="font-mono text-emerald-400 font-bold">Authorization</TableCell>
              <TableCell className="font-mono text-zinc-400">string</TableCell>
              <TableCell className="text-rose-400 font-bold">Required</TableCell>
              <TableCell className="text-zinc-300">
                Your Verixa secret key. Pass directly or with <code className="text-zinc-100 font-mono">Bearer</code> prefix (e.g. <code className="text-emerald-300 font-mono">Bearer vrx_live_...</code>).
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-sky-400 font-bold">AppId</TableCell>
              <TableCell className="font-mono text-zinc-400">string</TableCell>
              <TableCell className="text-zinc-500 font-bold">Optional</TableCell>
              <TableCell className="text-zinc-300">Your application identifier (e.g. <code className="text-zinc-100 font-mono">app_6a7b8c...</code>).</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Code Examples */}
      <div className="space-y-4 pt-4 border-t border-zinc-800">
        <h2 className="text-lg font-bold text-white tracking-tight">Example Request & Response</h2>
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
      <div className="space-y-4 pt-4 border-t border-zinc-800">
        <h2 className="text-lg font-bold text-white tracking-tight">Automated Low Balance Alerts</h2>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          You can configure low-balance email alerts and webhook notifications in your <strong className="text-white">Admin & Console Settings</strong>. When your balance drops below your chosen threshold (e.g., ₦5,000), Verixa dispatches an instant notification so your operations are never interrupted.
        </p>
      </div>
    </div>
  )
}
