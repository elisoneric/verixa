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
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="pb-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-heading">
          Organization Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your organization profile, security details, and alert thresholds.
        </p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
          <svg className="w-4 h-4 shrink-0 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>Organization settings saved successfully.</span>
        </div>
      )}

      {/* Profile Section */}
      <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight">Organization Profile</h2>
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
            className="font-mono text-xs text-slate-600"
          />

          <Input
            label="Primary Administrator Email"
            readOnly
            value={user?.email || "admin@yourdomain.com"}
            className="font-mono text-xs text-slate-600"
          />

          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer shadow-xs"
          >
            Save Profile
          </button>
        </form>
      </div>

      {/* Automated Notifications & Alerts */}
      <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight">Email Notifications & Balance Alerts</h2>
        <div className="space-y-4 max-w-xl text-xs">
          <label className="flex items-center gap-2.5 text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
            />
            <span>Send automated email receipt on every wallet deposit</span>
          </label>

          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-semibold text-slate-700">
              Low Balance Email Alert Threshold (NGN)
            </label>
            <Input
              type="number"
              value={lowBalanceThreshold}
              onChange={(e) => setLowBalanceThreshold(e.target.value)}
              hint="You will receive an automated alert when your live balance drops below this amount."
            />
          </div>

          <button
            type="button"
            onClick={() => alert("Notification settings saved.")}
            className="px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer shadow-2xs"
          >
            Update Alert Preferences
          </button>
        </div>
      </div>
    </div>
  )
}
