import type { Metadata } from "next"
import { Badge, CodeBlock, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@verixa/ui"

export const metadata: Metadata = {
  title: "Driver's License, Voter's Card & Passport Verification API | Verixa ID",
  description:
    "Low-cost statutory identity verification APIs for FRSC Driver's Licenses, INEC Voter's Cards (VIN), and Nigerian International Passports.",
  keywords: [
    "Driver's License verification API Nigeria",
    "INEC VIN verification API",
    "Nigerian passport verification API",
    "government ID API Nigeria",
  ],
  alternates: {
    canonical: "https://docs.verixaid.com/government-ids",
  },
}

export default function GovernmentIdsDocsPage() {
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
        "name": "Secondary Government IDs",
        "item": "https://docs.verixaid.com/government-ids",
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
          <Badge variant="verified">UNIVERSAL TAXONOMY</Badge>
          <span className="font-mono text-xs text-sky-700 font-bold">FRSC / INEC / NIS</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Secondary Government IDs
        </h1>
        <p className="mt-2 text-base text-slate-600 leading-relaxed">
          Verify official Nigerian travel, voter, and driving credentials directly against issuing statutory bodies. Built with 100% universal enterprise identity endpoint and parameter compatibility.
        </p>
      </div>

      {/* Available ID Services Overview */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1.5">
          <span className="text-emerald-700 font-bold block">1. Driver's License (FRSC)</span>
          <code className="text-slate-900 block text-[11px]">GET /api/v1/kyc/dl</code>
          <p className="text-slate-600 font-sans text-xs">Verify Federal Road Safety Corps licenses and validity dates.</p>
          <span className="text-slate-500 block text-[11px]">Rate: 120 NGX (₦120.00)</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1.5">
          <span className="text-sky-700 font-bold block">2. Voter's Card (VIN / INEC)</span>
          <code className="text-slate-900 block text-[11px]">GET /api/v1/kyc/vin</code>
          <p className="text-slate-600 font-sans text-xs">Verify voter cards against the INEC national electoral register.</p>
          <span className="text-slate-500 block text-[11px]">Rate: 100 NGX (₦100.00)</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1.5">
          <span className="text-amber-700 font-bold block">3. Passport (NIS)</span>
          <code className="text-slate-900 block text-[11px]">GET /api/v1/kyc/passport</code>
          <p className="text-slate-600 font-sans text-xs">Verify Nigerian International Passports against Immigration Service records.</p>
          <span className="text-slate-500 block text-[11px]">Rate: 150 NGX (₦150.00)</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1.5">
          <span className="text-purple-700 font-bold block">4. Tax ID (TIN / FIRS)</span>
          <code className="text-slate-900 block text-[11px]">GET /api/v1/kyc/tin</code>
          <p className="text-slate-600 font-sans text-xs">Validate corporate and individual tax numbers with FIRS & Joint Tax Board.</p>
          <span className="text-slate-500 block text-[11px]">Rate: 100 NGX (₦100.00)</span>
        </div>
      </div>

      {/* 1. Driver's License Details */}
      <div className="space-y-3 pt-6 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <Badge variant="verified">FRSC</Badge>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Driver&apos;s License (GET /api/v1/kyc/dl)</h2>
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
              <TableCell className="font-mono text-emerald-700 font-bold">license_number</TableCell>
              <TableCell className="font-mono text-slate-600">string</TableCell>
              <TableCell className="text-rose-700 font-bold">Required</TableCell>
              <TableCell className="text-slate-700">FRSC license number (e.g. <code className="text-sky-700 font-mono">AAA12345AA01</code>).</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-slate-700 font-bold">dob</TableCell>
              <TableCell className="font-mono text-slate-600">string</TableCell>
              <TableCell className="text-slate-500">Optional</TableCell>
              <TableCell className="text-slate-700">Date of birth in <code className="text-sky-700 font-mono">YYYY-MM-DD</code> format.</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <CodeBlock
          language="bash"
          title="cURL Request (Driver's License)"
          code={`curl -X GET "https://api.verixaid.com/api/v1/kyc/dl?license_number=AAA12345AA01&dob=1991-03-14" \\
  -H "Authorization: vrx_live_9f83a8f1e2b4c6d8_a1b2c3d4..." \\
  -H "AppId: app_6a7b8c9d0e1f"`}
        />
      </div>

      {/* 2. Voter's Card Details */}
      <div className="space-y-3 pt-6 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <Badge variant="verified">INEC</Badge>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Voter&apos;s Card (GET /api/v1/kyc/vin)</h2>
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
              <TableCell className="font-mono text-emerald-700 font-bold">vin</TableCell>
              <TableCell className="font-mono text-slate-600">string</TableCell>
              <TableCell className="text-rose-700 font-bold">Required</TableCell>
              <TableCell className="text-slate-700">19-digit Voter Identification Number.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-slate-700 font-bold">state</TableCell>
              <TableCell className="font-mono text-slate-600">string</TableCell>
              <TableCell className="text-slate-500">Optional</TableCell>
              <TableCell className="text-slate-700">State where voter registration was recorded.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-slate-700 font-bold">last_name</TableCell>
              <TableCell className="font-mono text-slate-600">string</TableCell>
              <TableCell className="text-slate-500">Optional</TableCell>
              <TableCell className="text-slate-700">Voter surname for fuzzy verification matching.</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <CodeBlock
          language="bash"
          title="cURL Request (Voter's Card)"
          code={`curl -X GET "https://api.verixaid.com/api/v1/kyc/vin?vin=90F5B12345678901234&state=Lagos&last_name=ADAMU" \\
  -H "Authorization: vrx_live_9f83a8f1e2b4c6d8_a1b2c3d4..." \\
  -H "AppId: app_6a7b8c9d0e1f"`}
        />
      </div>

      {/* 3. Passport Details */}
      <div className="space-y-3 pt-6 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <Badge variant="verified">NIS</Badge>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">International Passport (GET /api/v1/kyc/passport)</h2>
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
              <TableCell className="font-mono text-emerald-700 font-bold">passport_number</TableCell>
              <TableCell className="font-mono text-slate-600">string</TableCell>
              <TableCell className="text-rose-700 font-bold">Required</TableCell>
              <TableCell className="text-slate-700">Nigerian Passport booklet number (e.g. <code className="text-sky-700 font-mono">A12345678</code>).</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-slate-700 font-bold">last_name</TableCell>
              <TableCell className="font-mono text-slate-600">string</TableCell>
              <TableCell className="text-slate-500">Optional</TableCell>
              <TableCell className="text-slate-700">Passport holder surname.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-slate-700 font-bold">dob</TableCell>
              <TableCell className="font-mono text-slate-600">string</TableCell>
              <TableCell className="text-slate-500">Optional</TableCell>
              <TableCell className="text-slate-700">Date of birth in <code className="text-sky-700 font-mono">YYYY-MM-DD</code> format.</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <CodeBlock
          language="bash"
          title="cURL Request (Passport)"
          code={`curl -X GET "https://api.verixaid.com/api/v1/kyc/passport?passport_number=A12345678&last_name=MUSA&dob=1990-05-12" \\
  -H "Authorization: vrx_live_9f83a8f1e2b4c6d8_a1b2c3d4..." \\
  -H "AppId: app_6a7b8c9d0e1f"`}
        />
      </div>

      {/* 4. Tax Identification Number (TIN) */}
      <div className="space-y-3 pt-6 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <Badge variant="verified">FIRS / JTB</Badge>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Tax ID (TIN) (GET /api/v1/kyc/tin)</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Verify individual and corporate Tax Identification Numbers directly with the Federal Inland Revenue Service (FIRS) and Joint Tax Board (JTB).
        </p>
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
              <TableCell className="font-mono text-emerald-700 font-bold">tin</TableCell>
              <TableCell className="font-mono text-slate-600">string</TableCell>
              <TableCell className="text-rose-700 font-bold">Required</TableCell>
              <TableCell className="text-slate-700">Tax Identification Number.</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <CodeBlock
          language="bash"
          title="cURL Request (Tax ID)"
          code={`curl -X GET "https://api.verixaid.com/api/v1/kyc/tin?tin=12345678-0001" \\
  -H "Authorization: Bearer vrx_live_9f83a8f1e2b4c6d8_a1b2c3d4..."`}
        />
      </div>

      {/* Universal Printable Verification Certificate Export */}
      <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 shadow-2xs space-y-3 pt-4">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Badge variant="verified">UNIVERSAL CERTIFICATE</Badge>
          Instant Printable PDF Verification Certificate Export
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed font-sans">
          All statutory identity verification checks across FRSC, INEC, NIS, and FIRS support instant client-side and API PDF certificate generation. Every certificate is tamper-evident and generated with:
        </p>
        <div className="grid sm:grid-cols-3 gap-3 text-xs font-mono pt-1">
          <div className="p-3 rounded-lg bg-white border border-slate-200">
            <span className="text-emerald-700 font-bold block mb-1">Official Badges</span>
            <span className="text-slate-600 font-sans text-[11px]">Includes verified government crests, issuing authority metadata, and match status.</span>
          </div>
          <div className="p-3 rounded-lg bg-white border border-slate-200">
            <span className="text-sky-700 font-bold block mb-1">Audit Reference</span>
            <span className="text-slate-600 font-sans text-[11px]">Embedded ISO timestamp, reference tracking UUID, and tenant environment tag.</span>
          </div>
          <div className="p-3 rounded-lg bg-white border border-slate-200">
            <span className="text-purple-700 font-bold block mb-1">SHA-256 Seal</span>
            <span className="text-slate-600 font-sans text-[11px]">Cryptographic payload hash ensuring the downloaded certificate has not been altered.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
