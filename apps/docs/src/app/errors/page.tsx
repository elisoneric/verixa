import { Badge, CodeBlock, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@verixa/ui"

export default function ErrorsDocsPage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="failed">ERROR TAXONOMY</Badge>
          <span className="font-mono text-xs text-zinc-500">RFC 7807</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Error Reference & Codes
        </h1>
        <p className="mt-2 text-base text-zinc-400 leading-relaxed">
          Verixa ID uses conventional HTTP response codes to indicate the success or failure of an API request.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>HTTP Status</TableHead>
            <TableHead>Error Code</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-mono text-emerald-400 font-bold">200 OK</TableCell>
            <TableCell className="font-mono text-zinc-400">None</TableCell>
            <TableCell className="text-zinc-300">Request succeeded. Identity verified or lookup resolved.</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-mono text-amber-400 font-bold">400 Bad Request</TableCell>
            <TableCell className="font-mono text-amber-400">parameter_missing / invalid_bvn</TableCell>
            <TableCell className="text-zinc-300">Missing required parameters or malformed payload.</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-mono text-rose-400 font-bold">401 Unauthorized</TableCell>
            <TableCell className="font-mono text-rose-400">invalid_api_key</TableCell>
            <TableCell className="text-zinc-300">Invalid, revoked, or missing API token.</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-mono text-rose-400 font-bold">402 Payment Required</TableCell>
            <TableCell className="font-mono text-rose-400">insufficient_credits</TableCell>
            <TableCell className="text-zinc-300">NGX credit balance is too low to perform lookup.</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-mono text-rose-400 font-bold">429 Too Many Requests</TableCell>
            <TableCell className="font-mono text-rose-400">rate_limit_exceeded</TableCell>
            <TableCell className="text-zinc-300">Exceeded rate limit for the organization.</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white tracking-tight">Standard Error Payload Format</h2>
        <CodeBlock
          language="json"
          title="Error Response Schema"
          code={`{
  "error": {
    "type": "invalid_request_error",
    "code": "parameter_missing",
    "message": "The 'bvn' parameter is required and must be an 11-digit string.",
    "param": "bvn",
    "request_id": "vx_req_err_8f19a02d"
  }
}`}
        />
      </div>
    </div>
  )
}
