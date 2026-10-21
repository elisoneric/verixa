import type { Metadata } from "next"
import { Badge, CodeBlock } from "@verixa/ui"

export const metadata: Metadata = {
  title: "Webhooks & HMAC SHA-512 Signatures | Verixa ID Docs",
  description:
    "Secure event delivery and webhook payload verification using HMAC SHA-512 signatures for payment events, identity verifications, and telecom top-ups.",
  keywords: [
    "Verixa webhooks",
    "HMAC SHA-512 signature verification",
    "identity webhook events",
    "fintech webhook security",
  ],
  alternates: {
    canonical: "https://docs.verixaid.com/webhooks",
  },
}

export default function WebhooksDocsPage() {
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
        "name": "Webhooks & Signatures",
        "item": "https://docs.verixaid.com/webhooks",
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
          <Badge variant="verified">EVENTS</Badge>
          <span className="font-mono text-xs text-slate-500">HMAC SHA-512</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Webhooks & Signatures
        </h1>
        <p className="mt-2 text-base text-slate-600 leading-relaxed">
          Verixa ID sends signed HTTP POST requests to your configured webhook endpoints when events happen in your account.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Verifying Signatures</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Each webhook delivery contains a <code className="text-emerald-700">x-verixa-signature</code> header containing an HMAC SHA-512 hash of the raw payload computed with your endpoint signing secret.
        </p>

        <CodeBlock
          language="javascript"
          title="Node.js Webhook Handler"
          code={`const express = require('express');
const crypto = require('crypto');
const app = express();

app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-verixa-signature'];
  const secret = process.env.VERIXA_WEBHOOK_SECRET;

  const expectedSignature = crypto
    .createHmac('sha512', secret)
    .update(req.body)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(400).send('Invalid signature');
  }

  const event = JSON.parse(req.body.toString());
  console.log('Received valid event:', event.event);

  res.status(200).json({ received: true });
});`}
        />
      </div>
    </div>
  )
}
