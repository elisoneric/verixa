import type { Metadata } from "next"
import { Badge, CodeBlock, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@verixa/ui"

export const metadata: Metadata = {
  title: "NIN Slips & NIMC Card API — Official Digital ID Generation | Verixa Docs",
  description:
    "Generate authentic NIMC Direct government slips and standard verification A4 slips via high-speed REST API. Returns full verified demographic fields (name, gender, DOB, phone, address, photo) and complete base64 PDF documents.",
  keywords: [
    "NIN slip API",
    "NIMC card API",
    "digital NIN slip generator",
    "NIN slip PDF API Nigeria",
    "NIMC identity slip",
    "automated NIN verification API",
  ],
  alternates: {
    canonical: "https://docs.verixaid.com/slips",
  },
}

export default function SlipsDocsPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
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
        "name": "NIN Slips & NIMC Cards",
        "item": "https://docs.verixaid.com/slips",
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
          <Badge variant="verified">OFFICIAL DOCUMENT ENGINE</Badge>
          <span className="font-mono text-xs text-sky-700 font-bold">POST /api/v1/slips/nin</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          NIN Slips &amp; NIMC Cards API
        </h1>
        <p className="mt-2 text-base text-slate-600 leading-relaxed">
          Produce official, print-ready National Identification Number slips and digital ID documents via high-speed REST API. Verixa returns the complete verified demographic dataset (names, date of birth, gender, phone, residential address, biometric portrait) alongside print-ready base64 PDF payloads for instant developer integration.
        </p>
      </div>

      {/* Pricing and Performance Chips */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
        <div className="p-3 rounded-lg bg-white shadow-2xs border border-slate-200">
          <span className="text-slate-500 block">STANDARD NIN SLIP</span>
          <span className="text-emerald-700 font-bold">Starts from ₦250 for NIN Slip</span>
        </div>
        <div className="p-3 rounded-lg bg-white shadow-2xs border border-slate-200">
          <span className="text-slate-500 block">NIMC CARD</span>
          <span className="text-emerald-700 font-bold">₦300 / card</span>
        </div>
        <div className="p-3 rounded-lg bg-white shadow-2xs border border-slate-200">
          <span className="text-slate-500 block">NIMC CARD PREMIUM</span>
          <span className="text-purple-700 font-bold">₦120 on API / ₦350 on UI</span>
        </div>
        <div className="p-3 rounded-lg bg-white shadow-2xs border border-slate-200">
          <span className="text-slate-500 block">DATA RETENTION</span>
          <span className="text-emerald-700 font-bold">AES-256-GCM On-Demand</span>
        </div>
      </div>

      {/* Three Document Pipelines Overview */}
      <div className="space-y-4 pt-2">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Available Document Pipelines</h2>
        <div className="grid sm:grid-cols-3 gap-4 text-xs">
          {/* Format 1: Standard NIN Slip */}
          <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/40 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sky-800 font-bold font-mono text-sm">1. Standard Slip</span>
              <Badge variant="info">FROM ₦250</Badge>
            </div>
            <p className="text-slate-700 leading-relaxed font-sans text-xs">
              Official standard government A4 paper slip with full address:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 font-sans text-xs">
              <li>Full residential street address, LGA, state of origin</li>
              <li>Official tracking ID and citizen portrait</li>
              <li>Standard government A4 printable PDF</li>
            </ul>
          </div>

          {/* Format 2: NIMC Card */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-emerald-800 font-bold font-mono text-sm">2. NIMC Card</span>
              <Badge variant="verified">₦300 / CARD</Badge>
            </div>
            <p className="text-slate-700 leading-relaxed font-sans text-xs">
              Standard official digital identity card document:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 font-sans text-xs">
              <li>Official ID-1 card dimensions</li>
              <li>Resolved directly with verified portrait and citizen credentials</li>
              <li>Instant high-res PDF</li>
            </ul>
          </div>

          {/* Format 3: NIMC Card Premium */}
          <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-purple-800 font-bold font-mono text-sm">3. NIMC Card Premium</span>
              <Badge variant="verified">₦120 API / ₦350 UI</Badge>
            </div>
            <p className="text-slate-700 leading-relaxed font-sans text-xs">
              High-resolution digital wallet card with folding template:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 font-sans text-xs">
              <li>Official security guilloche patterns and barcode</li>
              <li>Ready-to-print folding template</li>
              <li>Available via /api/slips/nin/premium</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Primary Slip Generation API */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="verified">POST</Badge>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">1. Generate NIN Slip or Card (/api/v1/slips/nin)</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Performs regulatory identity verification and document synthesis. Returns the citizen&apos;s verified demographic data alongside the base64-encoded PDF document.
          </p>
        </div>

        {/* Request Parameters */}
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">Request Body Parameters</h3>
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
              <TableCell className="font-mono text-emerald-700 font-bold">nin</TableCell>
              <TableCell className="font-mono text-slate-600">string</TableCell>
              <TableCell className="text-rose-700 font-bold">Required</TableCell>
              <TableCell className="text-slate-700">11-digit National Identity Number.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-emerald-700 font-bold">format</TableCell>
              <TableCell className="font-mono text-slate-600">string</TableCell>
              <TableCell className="text-slate-500 font-medium">Optional</TableCell>
              <TableCell className="text-slate-700">
                Document type: <code className="text-emerald-700 font-mono">&quot;card&quot;</code> (Official NIMC Upstream Slip) or <code className="text-emerald-700 font-mono">&quot;slip&quot;</code> (Standard DOCX to PDF Slip). Defaults to <code className="text-emerald-700 font-mono">&quot;card&quot;</code>.
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-emerald-700 font-bold">cardType</TableCell>
              <TableCell className="font-mono text-slate-600">string</TableCell>
              <TableCell className="text-slate-500 font-medium">Optional</TableCell>
              <TableCell className="text-slate-700">
                Explicit alias for <code className="text-emerald-700 font-mono">format</code>: <code className="text-emerald-700 font-mono">&quot;card&quot;</code> or <code className="text-emerald-700 font-mono">&quot;slip&quot;</code>.
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-emerald-700 font-bold">consent</TableCell>
              <TableCell className="font-mono text-slate-600">boolean</TableCell>
              <TableCell className="text-rose-700 font-bold">Required</TableCell>
              <TableCell className="text-slate-700">NDPA data subject consent confirmation (must be <code className="text-emerald-700 font-mono">true</code>).</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {/* Response Demographic Attributes */}
        <div className="pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-2">
            Returned Demographic Attributes (Trust Bricks &amp; Developer Integration)
          </h3>
          <p className="text-xs text-slate-600 mb-3">
            API clients can extract these fields directly from the response root or within the <code className="text-emerald-700 font-mono">data</code> / <code className="text-emerald-700 font-mono">entity</code> payload to populate customer onboarding forms and databases:
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description / Sample Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-emerald-700 font-bold">nin</TableCell>
                <TableCell className="font-mono text-slate-600">string</TableCell>
                <TableCell className="text-slate-700">11-digit verified National Identification Number (e.g. <code className="font-mono">&quot;30882411172&quot;</code>).</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-emerald-700 font-bold">first_name</TableCell>
                <TableCell className="font-mono text-slate-600">string</TableCell>
                <TableCell className="text-slate-700">Applicant given name (e.g. <code className="font-mono">&quot;ELISON&quot;</code>).</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-emerald-700 font-bold">last_name</TableCell>
                <TableCell className="font-mono text-slate-600">string</TableCell>
                <TableCell className="text-slate-700">Applicant surname (e.g. <code className="font-mono">&quot;ERIC&quot;</code>).</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-emerald-700 font-bold">middle_name</TableCell>
                <TableCell className="font-mono text-slate-600">string</TableCell>
                <TableCell className="text-slate-700">Applicant middle name (e.g. <code className="font-mono">&quot;EDWARD&quot;</code>).</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-emerald-700 font-bold">full_name</TableCell>
                <TableCell className="font-mono text-slate-600">string</TableCell>
                <TableCell className="text-slate-700">Concatenated full legal name (e.g. <code className="font-mono">&quot;ERIC ELISON EDWARD&quot;</code>).</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-emerald-700 font-bold">date_of_birth</TableCell>
                <TableCell className="font-mono text-slate-600">string</TableCell>
                <TableCell className="text-slate-700">ISO date of birth formatted as <code className="font-mono">YYYY-MM-DD</code>.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-emerald-700 font-bold">gender</TableCell>
                <TableCell className="font-mono text-slate-600">string</TableCell>
                <TableCell className="text-slate-700">Gender classification: <code className="font-mono">&quot;MALE&quot;</code> or <code className="font-mono">&quot;FEMALE&quot;</code>.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-emerald-700 font-bold">phone_number</TableCell>
                <TableCell className="font-mono text-slate-600">string</TableCell>
                <TableCell className="text-slate-700">Registered applicant telephone number (e.g. <code className="font-mono">&quot;0803894606&quot;</code>).</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-emerald-700 font-bold">residence_address_line_1</TableCell>
                <TableCell className="font-mono text-slate-600">string</TableCell>
                <TableCell className="text-slate-700">Primary residential address on record with NIMC.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-emerald-700 font-bold">residence_lga</TableCell>
                <TableCell className="font-mono text-slate-600">string</TableCell>
                <TableCell className="text-slate-700">Local Government Area of residence.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-emerald-700 font-bold">residence_state</TableCell>
                <TableCell className="font-mono text-slate-600">string</TableCell>
                <TableCell className="text-slate-700">State of residence.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-emerald-700 font-bold">birth_state</TableCell>
                <TableCell className="font-mono text-slate-600">string</TableCell>
                <TableCell className="text-slate-700">State of origin / birth state.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-emerald-700 font-bold">photo / photoBase64</TableCell>
                <TableCell className="font-mono text-slate-600">string</TableCell>
                <TableCell className="text-slate-700">Clean Base64-encoded JPEG citizen biometric portrait.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-emerald-700 font-bold">pdfBase64 / nin_id</TableCell>
                <TableCell className="font-mono text-slate-600">string</TableCell>
                <TableCell className="text-slate-700">Complete Base64-encoded PDF document ready for streaming, storage, or iframe rendering.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <CodeBlock
          language="bash"
          title="cURL Request (NIMC Official Slip Generation)"
          code={`curl -X POST "https://api.verixaid.com/api/v1/slips/nin" \\
  -H "Authorization: Bearer vrx_live_9f83a8f1e2b4c6d8..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "nin": "30882411172",
    "format": "card",
    "consent": true
  }'`}
        />

        <CodeBlock
          language="json"
          title="HTTP 200 OK Response"
          code={`{
  "success": true,
  "status": "success",
  "nin": "30882411172",
  "tracking_id": "VNX-3088-2411-1172",
  "first_name": "ELISON",
  "last_name": "ERIC",
  "middle_name": "EDWARD",
  "full_name": "ERIC ELISON EDWARD",
  "date_of_birth": "2005-01-03",
  "gender": "MALE",
  "phone_number": "0803894606",
  "residence_address_line_1": "ARMY BARRACK ROAD BEHIND HOMTEL",
  "residence_lga": "Jalingo",
  "residence_state": "Taraba",
  "birth_state": "Taraba",
  "photo": "/9j/4AAQSkZJRgABAQEASABIAAD/2wBD...",
  "slipType": "card",
  "nin_id": "JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZw...",
  "pdfBase64": "JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZw...",
  "meta": {
    "cached": false,
    "cost_ngx": 250,
    "referenceId": "vx_slip_8e079a45b1",
    "latency_ms": 138
  }
}`}
        />
      </div>

      {/* On-Demand Document Reconstruction API */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="verified">POST</Badge>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">2. On-Demand Document Reconstruction (/api/v1/slips/on-demand)</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Re-synthesizes an official PDF document from an encrypted historical transaction record without requiring long-term binary file retention. Streams the binary PDF directly.
          </p>
        </div>

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
              <TableCell className="font-mono text-emerald-700 font-bold">logId</TableCell>
              <TableCell className="font-mono text-slate-600">string (UUID)</TableCell>
              <TableCell className="text-rose-700 font-bold">Required</TableCell>
              <TableCell className="text-slate-700">The verification transaction log ID.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-emerald-700 font-bold">format</TableCell>
              <TableCell className="font-mono text-slate-600">string</TableCell>
              <TableCell className="text-slate-500 font-medium">Optional</TableCell>
              <TableCell className="text-slate-700"><code className="text-emerald-700 font-mono">&quot;card&quot;</code> or <code className="text-emerald-700 font-mono">&quot;slip&quot;</code>.</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <CodeBlock
          language="bash"
          title="cURL Request (On-Demand PDF Stream)"
          code={`curl -X POST "https://api.verixaid.com/api/v1/slips/on-demand" \\
  -H "Authorization: Bearer vrx_live_9f83a8f1e2b4c6d8..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "logId": "550e8400-e29b-41d4-a716-446655440000",
    "format": "card"
  }' --output NIMC_Slip_Reconstructed.pdf`}
        />
      </div>

      {/* Data Retention & NDPC Compliance Architecture */}
      <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 shadow-2xs space-y-3 pt-4">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Badge variant="verified">NDPC / NDPA 2023</Badge>
          Data Retention &amp; Zero Binary Bloat Architecture
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed font-sans">
          To comply with the <strong>Nigeria Data Protection Act (NDPA 2023)</strong> and minimize storage bloat, Verixa does not retain generated binary PDF files in databases or disks. Instead:
        </p>
        <div className="grid sm:grid-cols-3 gap-3 text-xs font-mono pt-1">
          <div className="p-3 rounded-lg bg-white border border-slate-200">
            <span className="text-emerald-700 font-bold block mb-1">1. Encryption at Rest</span>
            <span className="text-slate-600 font-sans text-[11px]">Structured identity records are encrypted with AES-256-GCM using isolated master keys.</span>
          </div>
          <div className="p-3 rounded-lg bg-white border border-slate-200">
            <span className="text-sky-700 font-bold block mb-1">2. Zero Binary Bloat</span>
            <span className="text-slate-600 font-sans text-[11px]">No heavy PDF blobs stored long term, saving over 95% in database infrastructure costs.</span>
          </div>
          <div className="p-3 rounded-lg bg-white border border-slate-200">
            <span className="text-purple-700 font-bold block mb-1">3. Dynamic Synthesis</span>
            <span className="text-slate-600 font-sans text-[11px]">Official documents are generated dynamically on demand whenever an authorized audit download is requested.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
