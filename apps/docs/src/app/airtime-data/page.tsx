import { Badge, CodeBlock, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@verixa/ui"

export default function AirtimeDataDocsPage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="verified">POST</Badge>
          <span className="font-mono text-xs text-sky-400 font-bold">/v1/purchase/airtime | /v1/purchase/data</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Airtime & Mobile Data APIs
        </h1>
        <p className="mt-2 text-base text-zinc-400 leading-relaxed">
          Automate instant airtime top-ups and mobile data bundle provisioning across all major Nigerian mobile operators (MTN, Airtel, Glo, 9mobile).
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-white tracking-tight">1. Buy Airtime</h2>
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
                <TableCell className="font-mono text-emerald-400 font-bold">amount</TableCell>
                <TableCell className="font-mono text-zinc-400">number</TableCell>
                <TableCell className="text-rose-400 font-bold">Required</TableCell>
                <TableCell className="text-zinc-300">Amount in NGN (e.g. 500).</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-emerald-400 font-bold">destination</TableCell>
                <TableCell className="font-mono text-zinc-400">string[] | string</TableCell>
                <TableCell className="text-rose-400 font-bold">Required</TableCell>
                <TableCell className="text-zinc-300">Recipient number or array of numbers to top up.</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <CodeBlock
            language="bash"
            title="cURL Request (Airtime)"
            code={`curl -X POST https://api.verixaid.com/v1/purchase/airtime \\
  -H "Authorization: Bearer vrx_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 500,
    "destination": ["2348012345678"]
  }'`}
          />
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-bold text-white tracking-tight">2. Buy Data Bundle</h2>
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
                <TableCell className="font-mono text-emerald-400 font-bold">plan</TableCell>
                <TableCell className="font-mono text-zinc-400">string</TableCell>
                <TableCell className="text-rose-400 font-bold">Required</TableCell>
                <TableCell className="text-zinc-300">Bundle plan code (e.g. MTN_1GB, 9MOBILE_1.5GB).</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-emerald-400 font-bold">destination</TableCell>
                <TableCell className="font-mono text-zinc-400">string | number</TableCell>
                <TableCell className="text-rose-400 font-bold">Required</TableCell>
                <TableCell className="text-zinc-300">Recipient phone number.</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <CodeBlock
            language="bash"
            title="cURL Request (Data)"
            code={`curl -X POST https://api.verixaid.com/v1/purchase/data \\
  -H "Authorization: Bearer vrx_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "plan": "9MOBILE_1.5GB",
    "destination": "2348012345678"
  }'`}
          />
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-bold text-white tracking-tight">3. Fetch Available Data Plans</h2>
          <p className="text-sm text-zinc-400">Query all available live network data packages and their exact plan codes:</p>
          <CodeBlock
            language="bash"
            title="cURL Request (Fetch Plans)"
            code={`curl -X GET https://api.verixaid.com/v1/purchase/data-plans \\
  -H "Authorization: Bearer vrx_live_..."`}
          />
        </div>
      </div>
    </div>
  )
}
