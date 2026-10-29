import type { Metadata } from "next"
import { Badge, CodeBlock, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@verixa/ui"

export const metadata: Metadata = {
  title: "NIN Slips & NIMC Card API — Official Digital ID Generation | Verixa Docs",
  description:
    "Generate authentic NIMC Direct ID-1 plastic cards and standard A4 paper slips via high-speed REST API. Instant sub-150ms optimistic preview, tamper-proof PDF generation, and on-demand dynamic synthesis.",
  keywords: [
    "NIN slip API",
    "NIMC card API",
    "digital NIN card generator",
    "NIN slip PDF API Nigeria",
    "NIMC identity card",
    "automated NIN card API",
  ],
  alternates: {
    canonical: "https://docs.verixaid.com/slips",
  },
}

export default function SlipsDocsPage() {
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
          NIN Slips &amp; NIMC Digital Cards
        </h1>
        <p className="mt-2 text-base text-slate-600 leading-relaxed">
          Produce official, print-ready National Identification Number documents via high-speed API. Verixa provides dual document pipelines: the compact <strong>NIMC Direct (ID-1 Digital Card)</strong> and the comprehensive <strong>Standard NIN Slip (A4 PDF)</strong>, backed by sub-150ms optimistic rendering and secure encrypted on-demand reconstruction.
        </p>
      </div>

      {/* Pricing and Performance Chips */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
        <div className="p-3 rounded-lg bg-white shadow-2xs border border-slate-200">
          <span className="text-slate-500 block">STANDARD RATE</span>
          <span className="text-emerald-700 font-bold">250 NGX (₦250.00)</span>
        </div>
        <div className="p-3 rounded-lg bg-white shadow-2xs border border-slate-200">
          <span className="text-slate-500 block">OPTIMISTIC PREVIEW</span>
          <span className="text-sky-700 font-bold">&lt;150ms Vector SVG</span>
        </div>
        <div className="p-3 rounded-lg bg-white shadow-2xs border border-slate-200">
          <span className="text-slate-500 block">OUTPUT FORMATS</span>
          <span className="text-slate-900 font-bold">Tamper-Proof PDF</span>
        </div>
        <div className="p-3 rounded-lg bg-white shadow-2xs border border-slate-200">
          <span className="text-slate-500 block">DATA RETENTION</span>
          <span className="text-emerald-700 font-bold">AES-256-GCM On-Demand</span>
        </div>
      </div>

      {/* Two Document Formats Overview */}
      <div className="space-y-4 pt-2">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Available Document Formats</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          {/* Format 1: NIMC Direct Card */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-emerald-800 font-bold font-mono text-sm">1. NIMC Direct (ID-1 Card)</span>
              <Badge variant="verified">PREMIUM DESIGN</Badge>
            </div>
            <p className="text-slate-700 leading-relaxed font-sans text-xs">
              Complies with international <strong>ISO ID-1 physical card specifications</strong> (242.65 × 153.01 pt). Designed for citizen identity wallets and card-printing machines with authentic security features:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 font-sans text-xs">
              <li>High-resolution Nigerian green guilloche anti-tamper wave patterns</li>
              <li>Official Coat of Arms watermark and micro-text</li>
              <li>High-contrast 4-3-4 formatted NIN security pill (<code className="text-emerald-800">1234 • 567 • 8901</code>)</li>
              <li>Scannable 2D QR verification code linking to registry validation</li>
            </ul>
          </div>

          {/* Format 2: Standard NIN Slip */}
          <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/40 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sky-800 font-bold font-mono text-sm">2. Standard NIN Slip (PDF)</span>
              <Badge variant="info">OFFICIAL A4</Badge>
            </div>
            <p className="text-slate-700 leading-relaxed font-sans text-xs">
              The full statutory paper slip format mandated for government submissions, bank onboarding, and embassy visa verifications:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 font-sans text-xs">
              <li>Complete demographic record: full name, DOB, gender, phone number</li>
              <li>Permanent residential address, LGA, and State of Origin</li>
              <li>NIMC Registry Tracking ID and issuance timestamp</li>
              <li>Tamper-proof vector PDF layout optimized for desktop and mobile printing</li>
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
            Requests real-time document synthesis. Returns citizen demographic attributes, instant vector preview SVG, and base64-encoded PDF download payload.
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
                Document type: <code className="text-emerald-700 font-mono">&quot;card&quot;</code> (ID-1 Digital NIMC Card) or <code className="text-emerald-700 font-mono">&quot;slip&quot;</code> (Standard A4 Paper Slip). Defaults to <code className="text-emerald-700 font-mono">&quot;card&quot;</code>.
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

        <CodeBlock
          language="bash"
          title="cURL Request (NIMC Card Generation)"
          code={`curl -X POST "https://api.verixaid.com/api/v1/slips/nin" \\
  -H "Authorization: Bearer vrx_live_9f83a8f1e2b4c6d8..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "nin": "70123456789",
    "format": "card",
    "consent": true
  }'`}
        />

        <CodeBlock
          language="json"
          title="HTTP 200 OK Response"
          code={`{
  "success": true,
  "trackingId": "VRX-SLIP-7012-9842",
  "fullName": "JOHN ADAMU MUSA",
  "nin": "70123456789",
  "photoBase64": "/9j/4AAQSkZJRg...",
  "slipType": "card",
  "pdfBase64": "JVBERi0xLjQ...",
  "svgContent": "<svg viewBox=\\"0 0 242.65 153.01\\">...</svg>",
  "latencyMs": 142
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
  }' --output NIMC_Card_Reconstructed.pdf`}
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

