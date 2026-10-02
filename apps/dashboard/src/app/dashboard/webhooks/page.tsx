"use client"

import * as React from "react"
import { Button, Input, Badge, Card, Modal, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, CodeBlock, EmptyState } from "@verixa/ui"

export default function WebhooksPage() {
  const [endpoints, setEndpoints] = React.useState<any[]>([
    {
      id: "ep_9f81a2",
      url: "https://api.acmefintech.com/v1/webhooks/verixa",
      events: ["verification.successful", "billing.deposit_credited"],
      status: "active",
      secret: "whsec_981a8f192b8c9d01248a9e102",
      createdAt: "2026-08-20T10:15:00Z",
    },
  ])
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [endpointUrl, setEndpointUrl] = React.useState("")
  const [selectedEvents, setSelectedEvents] = React.useState<string[]>([
    "verification.successful",
    "verification.failed",
  ])

  const handleAddEndpoint = (e: React.FormEvent) => {
    e.preventDefault()
    if (!endpointUrl.startsWith("https://")) {
      alert("Webhook endpoints must use HTTPS for production security.")
      return
    }
    const newEp = {
      id: `ep_${Date.now().toString(36)}`,
      url: endpointUrl,
      events: selectedEvents,
      status: "active",
      secret: `whsec_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString(),
    }
    setEndpoints([...endpoints, newEp])
    setIsModalOpen(false)
    setEndpointUrl("")
  }

  const handleTestPing = (epId: string) => {
    alert("Test webhook event dispatched! Response: HTTP 200 OK (112ms)")
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Webhooks</h1>
            <Badge variant="verified" size="sm">
              HMAC SHA-512
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Receive real-time asynchronous HTTP notifications for KYC verification events and account top-ups.
          </p>
        </div>

        <Button variant="emerald" size="sm" onClick={() => setIsModalOpen(true)}>
          + Add Webhook Endpoint
        </Button>
      </div>

      {/* Endpoints List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight">Configured Endpoints</h3>

        {endpoints.length === 0 ? (
          <EmptyState
            title="No webhook endpoints configured"
            description="Add an HTTPS URL to receive event payloads when verifications complete."
            actionLabel="Add Endpoint"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="space-y-4">
            {endpoints.map((ep) => (
              <Card key={ep.id} className="p-6 bg-zinc-900/50 border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-white">{ep.url}</span>
                      <Badge variant="verified" size="sm">ACTIVE</Badge>
                    </div>
                    <div className="text-xs font-mono text-zinc-500">
                      ID: {ep.id} • Created {new Date(ep.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="xs" onClick={() => handleTestPing(ep.id)}>
                      ⚡ Send Test Ping
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      className="text-rose-400 border-rose-500/30"
                      onClick={() => setEndpoints(endpoints.filter((e) => e.id !== ep.id))}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400">Subscribed Events:</span>
                    {ep.events.map((ev: string) => (
                      <span key={ev} className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-[11px] text-zinc-300">
                        {ev}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 font-mono">Signing Secret:</span>
                    <span className="font-mono text-zinc-300 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                      {ep.secret.slice(0, 10)}••••••••••••
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Signature Verification Code Example */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white tracking-tight">Verifying Webhook Signatures (Node.js)</h3>
        <CodeBlock
          language="javascript"
          title="Signature Verification Handler"
          code={`const crypto = require('crypto');

function verifyVerixaWebhook(req, signingSecret) {
  const signature = req.headers['x-verixa-signature'];
  const payload = JSON.stringify(req.body);
  const hash = crypto.createHmac('sha512', signingSecret).update(payload).digest('hex');
  return hash === signature;
}`}
        />
      </div>

      {/* Add Endpoint Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Webhook Endpoint"
        description="Enter the HTTPS URL where Verixa ID should send signed event notifications."
      >
        <form onSubmit={handleAddEndpoint} className="space-y-4 mt-4">
          <Input
            label="Endpoint URL (HTTPS Required)"
            placeholder="https://api.yourdomain.com/v1/webhooks"
            value={endpointUrl}
            onChange={(e) => setEndpointUrl(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">Subscribed Events</label>
            <div className="space-y-2 text-xs text-zinc-300">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded border-zinc-700 bg-zinc-950" />
                <span>verification.successful — Triggered when BVN/NIN/NUBAN is verified</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded border-zinc-700 bg-zinc-950" />
                <span>verification.failed — Triggered on identity mismatch or invalid registry data</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded border-zinc-700 bg-zinc-950" />
                <span>billing.deposit_credited — Triggered on successful Paystack DVA credit</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="emerald" size="sm">
              Add Endpoint
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
