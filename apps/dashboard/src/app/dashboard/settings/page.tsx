"use client"

import * as React from "react"
import { Button, Input, Badge, Card } from "@verixa/ui"
import { useAuth } from "../../../lib/auth-context"

export default function SettingsPage() {
  const { user } = useAuth()
  const [orgName, setOrgName] = React.useState(user?.org_name || "Verixa Organization")
  const [emailAlerts, setEmailAlerts] = React.useState(true)
  const [lowBalanceThreshold, setLowBalanceThreshold] = React.useState("5000")
  const [saved, setSaved] = React.useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Organization Settings</h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Manage your organization profile, security credentials, and automated notification thresholds.
        </p>
      </div>

      {saved && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium">
          ✓ Organization settings saved successfully.
        </div>
      )}

      {/* Profile Section */}
      <Card className="p-6 bg-zinc-900/50 border-zinc-800 space-y-4">
        <h3 className="text-sm font-bold text-white tracking-tight">Organization Profile</h3>
        <form onSubmit={handleSave} className="space-y-4 max-w-xl">
          <Input
            label="Organization Name"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
          />

          <Input
            label="Organization ID"
            readOnly
            copyable
            value={user?.org_id || "org_9f83a8f1e2b4c6d8"}
            className="font-mono text-xs text-zinc-400"
          />

          <Input
            label="Primary Administrator Email"
            readOnly
            value={user?.email || "developer@verixaid.com"}
            className="font-mono text-xs text-zinc-400"
          />

          <Button type="submit" variant="emerald" size="sm">
            Save Profile
          </Button>
        </form>
      </Card>

      {/* Automated Notifications & Alerts */}
      <Card className="p-6 bg-zinc-900/50 border-zinc-800 space-y-4">
        <h3 className="text-sm font-bold text-white tracking-tight">Email Notifications & Balance Alerts</h3>
        <div className="space-y-4 max-w-xl text-xs">
          <label className="flex items-center gap-3 text-zinc-300">
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-950 text-emerald-500"
            />
            <span>Send automated email receipt on every NGX top-up</span>
          </label>

          <div className="space-y-1.5 pt-2">
            <label className="block text-xs font-medium text-zinc-300">
              Low Balance Email Alert Threshold (NGX)
            </label>
            <Input
              type="number"
              value={lowBalanceThreshold}
              onChange={(e) => setLowBalanceThreshold(e.target.value)}
              hint="You will receive an automated alert when your live balance drops below this amount."
            />
          </div>

          <Button variant="outline" size="sm" onClick={() => alert("Notification settings saved!")}>
            Update Alert Preferences
          </Button>
        </div>
      </Card>
    </div>
  )
}
