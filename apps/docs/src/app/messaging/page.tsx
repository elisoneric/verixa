import type { Metadata } from "next"
import { Badge, CodeBlock, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@verixa/ui"

export const metadata: Metadata = {
  title: "SMS & WhatsApp OTP Messaging API (₦5.00) | Verixa ID",
  description:
    "Low-cost transactional SMS and WhatsApp OTP messaging API for Nigerian applications. High deliverability across MTN, Airtel, Glo, and 9mobile at ₦5.00/SMS.",
  keywords: [
    "SMS OTP API Nigeria",
    "WhatsApp OTP API",
    "cheap SMS API Nigeria",
    "transactional SMS gateway",
    "bulk SMS API",
  ],
  alternates: {
    canonical: "https://docs.verixaid.com/messaging",
  },
}

export default function MessagingDocsPage() {
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
        "name": "SMS & WhatsApp Messaging",
        "item": "https://docs.verixaid.com/messaging",
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
          <Badge variant="verified">POST</Badge>
          <span className="font-mono text-xs text-sky-700 font-bold">/v1/messaging/sms</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          SMS & WhatsApp Messaging
        </h1>
        <p className="mt-2 text-base text-slate-600 leading-relaxed">
          Deliver transactional OTPs, identity verification alerts, and customer notifications via high-deliverability SMS or WhatsApp gateways.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
        <div className="p-3 rounded-lg bg-white shadow-2xs border border-slate-200">
          <span className="text-slate-500 block">COST PER SMS</span>
          <span className="text-emerald-700 font-bold">5 NGX (₦5.00)</span>
        </div>
        <div className="p-3 rounded-lg bg-white shadow-2xs border border-slate-200">
          <span className="text-slate-500 block">DELIVERY CHANNELS</span>
          <span className="text-slate-900 font-bold">SMS, WhatsApp, Voice</span>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Request Parameters</h2>
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
              <TableCell className="font-mono text-emerald-700 font-bold">destination</TableCell>
              <TableCell className="font-mono text-slate-600">string</TableCell>
              <TableCell className="text-rose-700 font-bold">Required</TableCell>
              <TableCell className="text-slate-700">Recipient mobile number (e.g. 2348012345678).</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-emerald-700 font-bold">message</TableCell>
              <TableCell className="font-mono text-slate-600">string</TableCell>
              <TableCell className="text-rose-700 font-bold">Required</TableCell>
              <TableCell className="text-slate-700">Text content of the notification message.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-slate-700 font-bold">channel</TableCell>
              <TableCell className="font-mono text-slate-600">string</TableCell>
              <TableCell className="text-slate-500">Optional</TableCell>
              <TableCell className="text-slate-700">Delivery channel: <code className="text-sky-700 font-mono">sms</code> (default), <code className="text-sky-700 font-mono">whatsapp</code>, or <code className="text-sky-700 font-mono">voice</code>.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-slate-700 font-bold">senderId</TableCell>
              <TableCell className="font-mono text-slate-600">string</TableCell>
              <TableCell className="text-slate-500">Optional</TableCell>
              <TableCell className="text-slate-700">Approved alphanumeric Sender ID tag.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-slate-700 font-bold">priority</TableCell>
              <TableCell className="font-mono text-slate-600">boolean</TableCell>
              <TableCell className="text-slate-500">Optional</TableCell>
              <TableCell className="text-slate-700">Deliver via high-priority priority gateway (default: false).</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Example Request & Response</h2>
        <CodeBlock
          language="bash"
          title="cURL Request"
          code={`curl -X POST https://api.verixaid.com/v1/messaging/sms \\
  -H "Authorization: Bearer vrx_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "destination": "2348012345678",
    "message": "Your Verixa verification code is 849201. Do not share this code.",
    "channel": "sms",
    "senderId": "Verixa"
  }'`}
        />

        <CodeBlock
          language="json"
          title="Response (200 OK)"
          code={`{
  "status": "success",
  "data": {
    "status": "Sent",
    "mobile": "2348012345678",
    "message_id": "vx_c8095767-c69f-4bd7-aa52-7cb469effb51",
    "reference_id": "cc7f9a23-959a-4708-ac6e-5cffec7682ba"
  },
  "billed_amount": 5,
  "meta": {
    "provider": "verixa",
    "latency_ms": 112
  }
}`}
        />
      </div>
    </div>
  )
}
