import { Badge, CodeBlock, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@verixa/ui"

export default function MessagingDocsPage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="verified">POST</Badge>
          <span className="font-mono text-xs text-sky-400 font-bold">/v1/messaging/sms</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          SMS & WhatsApp Messaging
        </h1>
        <p className="mt-2 text-base text-zinc-400 leading-relaxed">
          Deliver transactional OTPs, identity verification alerts, and customer notifications via high-deliverability SMS or WhatsApp gateways.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-500 block">COST PER SMS</span>
          <span className="text-emerald-400 font-bold">5 NGX (₦5.00)</span>
        </div>
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-500 block">DELIVERY CHANNELS</span>
          <span className="text-white font-bold">SMS, WhatsApp, Voice</span>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white tracking-tight">Request Parameters</h2>
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
              <TableCell className="font-mono text-emerald-400 font-bold">destination</TableCell>
              <TableCell className="font-mono text-zinc-400">string</TableCell>
              <TableCell className="text-rose-400 font-bold">Required</TableCell>
              <TableCell className="text-zinc-300">Recipient mobile number (e.g. 2348012345678).</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-emerald-400 font-bold">message</TableCell>
              <TableCell className="font-mono text-zinc-400">string</TableCell>
              <TableCell className="text-rose-400 font-bold">Required</TableCell>
              <TableCell className="text-zinc-300">Text content of the notification message.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-zinc-300 font-bold">channel</TableCell>
              <TableCell className="font-mono text-zinc-400">string</TableCell>
              <TableCell className="text-zinc-500">Optional</TableCell>
              <TableCell className="text-zinc-300">Delivery channel: <code className="text-sky-300 font-mono">sms</code> (default), <code className="text-sky-300 font-mono">whatsapp</code>, or <code className="text-sky-300 font-mono">voice</code>.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-zinc-300 font-bold">senderId</TableCell>
              <TableCell className="font-mono text-zinc-400">string</TableCell>
              <TableCell className="text-zinc-500">Optional</TableCell>
              <TableCell className="text-zinc-300">Approved alphanumeric Sender ID tag.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-zinc-300 font-bold">priority</TableCell>
              <TableCell className="font-mono text-zinc-400">boolean</TableCell>
              <TableCell className="text-zinc-500">Optional</TableCell>
              <TableCell className="text-zinc-300">Deliver via high-priority priority gateway (default: false).</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white tracking-tight">Example Request & Response</h2>
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
    "message_id": "dj_c8095767-c69f-4bd7-aa52-7cb469effb51",
    "reference_id": "cc7f9a23-959a-4708-ac6e-5cffec7682ba"
  },
  "billed_amount": 5,
  "meta": {
    "provider": "dojah",
    "latency_ms": 112
  }
}`}
        />
      </div>
    </div>
  )
}
