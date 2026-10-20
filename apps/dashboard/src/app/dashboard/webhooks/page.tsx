"use client"

import * as React from "react"
import { Button, Input, Badge, Card, Modal, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, CodeBlock, EmptyState } from "@verixa/ui"

export default function WebhooksPage() {
  const [endpoints, setEndpoints] = React.useState<any[]>([])
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-heading">
              Webhooks
            </h1>
            <Badge variant="verified" size="sm">
              HMAC SHA-512
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Receive real-time asynchronous HTTP notifications for KYC and wallet deposit events.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer shadow-xs self-start sm:self-center flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add Endpoint</span>
        </button>
      </div>

      {/* Endpoints List */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Configured Endpoints
        </h2>

        {endpoints.length === 0 ? (
          <EmptyState
            title="No webhook endpoints configured"
            description="Add an HTTPS URL to receive event payloads when verifications complete."
            actionLabel="Add Endpoint"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="space-y-3">
            {endpoints.map((ep) => (
              <div key={ep.id} className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-900">{ep.url}</span>
                      <Badge variant="verified" size="sm">ACTIVE</Badge>
                    </div>
                    <div className="text-xs font-mono text-slate-500">
                      ID: {ep.id} • Created {new Date(ep.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTestPing(ep.id)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Test Ping</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEndpoints(endpoints.filter((e) => e.id !== ep.id))}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Events:</span>
                    {ep.events.map((ev: string) => (
                      <span key={ev} className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 font-mono text-[11px] text-slate-700">
                        {ev}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-mono">Signing Secret:</span>
                    <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {ep.secret.slice(0, 10)}••••••••••••
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Signature Verification Code Example */}
      <div className="space-y-2 pt-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Signature Verification (Node.js)
        </h2>
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
        <form onSubmit={handleAddEndpoint} className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Endpoint URL (HTTPS Required)
            </label>
            <Input
              placeholder="https://api.yourdomain.com/v1/webhooks"
              value={endpointUrl}
              onChange={(e) => setEndpointUrl(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Subscribed Events</label>
            <div className="space-y-2 text-xs text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer" />
                <span>verification.successful — Triggered on successful verification</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer" />
                <span>verification.failed — Triggered on identity mismatch or invalid registry data</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer" />
                <span>billing.deposit_credited — Triggered on successful wallet bank transfer credit</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3.5 py-2 text-xs font-medium rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer shadow-xs"
            >
              Add Endpoint
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
