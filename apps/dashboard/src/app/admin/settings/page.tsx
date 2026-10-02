"use client"

import * as React from "react"
import { Button, Input, Badge, Card } from "@verixa/ui"
import { ApiClient } from "../../../lib/api"

export default function AdminSettingsPage() {
  const [paystackKey, setPaystackKey] = React.useState("")
  const [dojahAppId, setDojahAppId] = React.useState("")
  const [dojahKey, setDojahKey] = React.useState("")
  const [smileIdKey, setSmileIdKey] = React.useState("")
  const [isSaving, setIsSaving] = React.useState(false)
  const [savedSuccess, setSavedSuccess] = React.useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      if (paystackKey.trim()) {
        await ApiClient.updateAdminConfig(
          "PAYSTACK_SECRET_KEY",
          paystackKey,
          true,
          "Paystack Master Secret Key for DVA and Checkouts"
        )
      }
      if (dojahAppId.trim()) {
        await ApiClient.updateAdminConfig(
          "DOJAH_APP_ID",
          dojahAppId,
          false,
          "Dojah Application ID (AppId)"
        )
      }
      if (dojahKey.trim()) {
        await ApiClient.updateAdminConfig(
          "DOJAH_SECRET_KEY",
          dojahKey,
          true,
          "Dojah Upstream Identity API Secret Key"
        )
      }
      if (smileIdKey.trim()) {
        await ApiClient.updateAdminConfig(
          "SMILE_ID_KEY",
          smileIdKey,
          true,
          "SmileID Upstream Biometric API Secret Key"
        )
      }
      setSavedSuccess(true)
      setPaystackKey("")
      setDojahAppId("")
      setDojahKey("")
      setSmileIdKey("")
      setTimeout(() => setSavedSuccess(false), 4000)
    } catch (e: any) {
      alert(e.message || "Failed to update configurations")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">System Configuration & Secrets</h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Dynamic runtime provider keys. Values are encrypted at rest with AES-256 envelope encryption and never exposed to the frontend.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium">
          ✓ Provider secret keys encrypted and updated in runtime cache.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Paystack Secret */}
        <Card className="p-6 bg-zinc-900/50 border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-tight">Paystack Gateway Configuration</h3>
            <Badge variant="verified" size="sm">ENCRYPTED (AES-256)</Badge>
          </div>
          <div className="space-y-3 max-w-xl">
            <Input
              label="Paystack Secret Key"
              type="password"
              placeholder="sk_live_••••••••••••••••••••••••"
              value={paystackKey}
              onChange={(e) => setPaystackKey(e.target.value)}
              hint="Used for Dedicated Virtual Account (DVA) auto-generation and Webhook verification."
            />
          </div>
        </Card>

        {/* Upstream Identity Gateways */}
        <Card className="p-6 bg-zinc-900/50 border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-tight">Upstream Verification Gateways</h3>
            <Badge variant="verified" size="sm">ENCRYPTED (AES-256)</Badge>
          </div>

          <div className="space-y-4 max-w-xl">
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400">
              <span className="font-semibold">Hybrid Provider Engine:</span> When keys are absent, Verixa runs in realistic Zero-Config Mock Mode (with authentic Nigerian photos and slip rendering). Once Dojah keys are configured, Verixa automatically routes live queries upstream.
            </div>

            <Input
              label="Dojah Application ID (AppId)"
              type="text"
              placeholder="app_id_••••••••••••••••••••"
              value={dojahAppId}
              onChange={(e) => setDojahAppId(e.target.value)}
              hint="Required header (AppId) for official Dojah API queries."
            />

            <Input
              label="Dojah Secret API Key (Authorization)"
              type="password"
              placeholder="prod_sk_••••••••••••••••••••••••"
              value={dojahKey}
              onChange={(e) => setDojahKey(e.target.value)}
              hint="Primary upstream fallback for BVN & NIN Advance identity registry queries."
            />

            <Input
              label="SmileID API Key"
              type="password"
              placeholder="sid_live_••••••••••••••••••••••••"
              value={smileIdKey}
              onChange={(e) => setSmileIdKey(e.target.value)}
              hint="Secondary fallback for biometric & NIN validations."
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="emerald"
            size="md"
            isLoading={isSaving}
          >
            Encrypt & Save System Configuration
          </Button>
        </div>
      </form>
    </div>
  )
}
