import { Badge, CodeBlock } from "@verixa/ui"

export default function WebhooksDocsPage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="verified">EVENTS</Badge>
          <span className="font-mono text-xs text-zinc-500">HMAC SHA-512</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Webhooks & Signatures
        </h1>
        <p className="mt-2 text-base text-zinc-400 leading-relaxed">
          Verixa ID sends signed HTTP POST requests to your configured webhook endpoints when events happen in your account.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight">Verifying Signatures</h2>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          Each webhook delivery contains a <code className="text-emerald-400">x-verixa-signature</code> header containing an HMAC SHA-512 hash of the raw payload computed with your endpoint signing secret.
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
