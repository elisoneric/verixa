import type { Metadata } from "next"
import { Badge, CodeBlock, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@verixa/ui"

export const metadata: Metadata = {
  title: "API Error Codes & RFC 7807 Taxonomy | Verixa ID Docs",
  description:
    "Standardized API error taxonomies, HTTP status codes, and recovery strategies for Verixa identity verification and payment APIs.",
  keywords: [
    "Verixa API errors",
    "RFC 7807 error codes",
    "KYC API troubleshooting",
    "HTTP status codes API",
  ],
  alternates: {
    canonical: "https://docs.verixaid.com/errors",
  },
}

export default function ErrorsDocsPage() {
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
        "name": "Error Reference & Codes",
        "item": "https://docs.verixaid.com/errors",
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
          <Badge variant="failed">ERROR TAXONOMY</Badge>
          <span className="font-mono text-xs text-slate-500">RFC 7807</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Error Reference & Codes
        </h1>
        <p className="mt-2 text-base text-slate-600 leading-relaxed">
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
            <TableCell className="font-mono text-emerald-700 font-bold">200 OK</TableCell>
            <TableCell className="font-mono text-slate-600">None</TableCell>
            <TableCell className="text-slate-700">Request succeeded. Identity verified or lookup resolved.</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-mono text-amber-700 font-bold">400 Bad Request</TableCell>
            <TableCell className="font-mono text-amber-700">parameter_missing / invalid_bvn</TableCell>
            <TableCell className="text-slate-700">Missing required parameters or malformed payload.</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-mono text-rose-700 font-bold">401 Unauthorized</TableCell>
            <TableCell className="font-mono text-rose-700">invalid_api_key</TableCell>
            <TableCell className="text-slate-700">Invalid, revoked, or missing API token.</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-mono text-rose-700 font-bold">402 Payment Required</TableCell>
            <TableCell className="font-mono text-rose-700">insufficient_credits</TableCell>
            <TableCell className="text-slate-700">NGX credit balance is too low to perform lookup.</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-mono text-rose-700 font-bold">429 Too Many Requests</TableCell>
            <TableCell className="font-mono text-rose-700">rate_limit_exceeded</TableCell>
            <TableCell className="text-slate-700">Exceeded rate limit for the organization.</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Standard Error Payload Format</h2>
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
