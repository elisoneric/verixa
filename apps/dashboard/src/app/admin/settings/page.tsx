"use client"

import * as React from "react"
import { Button, Input, Badge, Card } from "@verixa/ui"
import { ApiClient } from "../../../lib/api"

export default function AdminSettingsPage() {
  // Provider Keys
  const [paystackKey, setPaystackKey] = React.useState("")
  const [upstreamAppId, setupstreamAppId] = React.useState("")
  const [upstreamKey, setupstreamKey] = React.useState("")
  const [smileIdKey, setSmileIdKey] = React.useState("")
  const [googleClientId, setGoogleClientId] = React.useState("")
  const [adminEmails, setAdminEmails] = React.useState("")

  // SMTP Settings
  const [smtpHost, setSmtpHost] = React.useState("")
  const [smtpPort, setSmtpPort] = React.useState("465")
  const [smtpSecure, setSmtpSecure] = React.useState(true)
  const [smtpUser, setSmtpUser] = React.useState("")
  const [smtpPass, setSmtpPass] = React.useState("")
  const [smtpFromName, setSmtpFromName] = React.useState("Verixa ID")
  const [smtpFromEmail, setSmtpFromEmail] = React.useState("no-reply@verixaid.com")

  // Test Email State
  const [testEmailRecipient, setTestEmailRecipient] = React.useState("")
  const [isTestingEmail, setIsTestingEmail] = React.useState(false)
  const [testResult, setTestResult] = React.useState<{ success: boolean; message: string } | null>(null)

  const [isSaving, setIsSaving] = React.useState(false)
  const [savedSuccess, setSavedSuccess] = React.useState(false)
  const [configuredKeys, setConfiguredKeys] = React.useState<Record<string, boolean>>({})

  // Load current unmasked config names
  React.useEffect(() => {
    ApiClient.getAdminConfigs()
      .then((configs: any[]) => {
        if (!configs) return
        const cfgStatus: Record<string, boolean> = {}
        const map = new Map(configs.map((c) => {
          cfgStatus[c.key] = c.isConfigured !== false && Boolean(c.value && c.value !== '')
          return [c.key, c.value]
        }))
        setConfiguredKeys(cfgStatus)

        if (map.get("DOJAH_APP_ID") && map.get("DOJAH_APP_ID") !== "••••••••••••••••") {
          setupstreamAppId(map.get("DOJAH_APP_ID"))
        }
        if (map.get("SMTP_HOST") && map.get("SMTP_HOST") !== "••••••••••••••••") {
          setSmtpHost(map.get("SMTP_HOST"))
        }
        if (map.get("SMTP_PORT")) setSmtpPort(map.get("SMTP_PORT"))
        if (map.get("SMTP_USER") && map.get("SMTP_USER") !== "••••••••••••••••") {
          setSmtpUser(map.get("SMTP_USER"))
        }
        if (map.get("SMTP_FROM_NAME")) setSmtpFromName(map.get("SMTP_FROM_NAME"))
        if (map.get("SMTP_FROM_EMAIL")) setSmtpFromEmail(map.get("SMTP_FROM_EMAIL"))
        if (map.get("GOOGLE_CLIENT_ID")) setGoogleClientId(map.get("GOOGLE_CLIENT_ID"))
        if (map.get("ADMIN_EMAILS")) setAdminEmails(map.get("ADMIN_EMAILS"))
      })
      .catch(() => {})
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      if (paystackKey.trim()) {
        await ApiClient.updateAdminConfig(
          "PAYSTACK_SECRET_KEY",
          paystackKey.trim(),
          true,
          "Paystack Master Secret Key for DVA and Webhooks"
        )
      }
      if (upstreamAppId.trim()) {
        await ApiClient.updateAdminConfig(
          "DOJAH_APP_ID",
          upstreamAppId.trim(),
          false,
          "Upstream Gateway Application ID"
        )
      }
      if (upstreamKey.trim()) {
        await ApiClient.updateAdminConfig(
          "DOJAH_SECRET_KEY",
          upstreamKey.trim(),
          true,
          "Upstream Gateway Secret Key"
        )
      }
      if (smileIdKey.trim()) {
        await ApiClient.updateAdminConfig(
          "SMILE_ID_KEY",
          smileIdKey.trim(),
          true,
          "SmileID Biometric API Key"
        )
      }
      if (googleClientId.trim()) {
        await ApiClient.updateAdminConfig(
          "GOOGLE_CLIENT_ID",
          googleClientId.trim(),
          false,
          "Google OAuth 2.0 Web Client ID"
        )
      }
      if (adminEmails.trim()) {
        await ApiClient.updateAdminConfig(
          "ADMIN_EMAILS",
          adminEmails.trim(),
          false,
          "Comma-delimited super admin operator emails"
        )
      }

      // Save SMTP
      if (smtpHost.trim()) {
        await ApiClient.updateAdminConfig("SMTP_HOST", smtpHost.trim(), false, "SMTP Server Host")
      }
      if (smtpPort.trim()) {
        await ApiClient.updateAdminConfig("SMTP_PORT", smtpPort.trim(), false, "SMTP Port")
      }
      await ApiClient.updateAdminConfig("SMTP_SECURE", String(smtpSecure), false, "SMTP SSL/TLS Secure")
      if (smtpUser.trim()) {
        await ApiClient.updateAdminConfig("SMTP_USER", smtpUser.trim(), false, "SMTP Account Username")
      }
      if (smtpPass.trim()) {
        await ApiClient.updateAdminConfig("SMTP_PASS", smtpPass.trim(), true, "SMTP Account Password")
      }
      if (smtpFromName.trim()) {
        await ApiClient.updateAdminConfig("SMTP_FROM_NAME", smtpFromName.trim(), false, "Sender Display Name")
      }
      if (smtpFromEmail.trim()) {
        await ApiClient.updateAdminConfig("SMTP_FROM_EMAIL", smtpFromEmail.trim(), false, "Sender Email Address")
      }

      setSavedSuccess(true)
      setPaystackKey("")
      setupstreamKey("")
      setSmileIdKey("")
      setSmtpPass("")
      setTimeout(() => setSavedSuccess(false), 5000)
    } catch (e: any) {
      alert(e.message || "Failed to update configurations")
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestSmtp = async () => {
    if (!testEmailRecipient.trim()) {
      alert("Please provide a recipient email address to send the diagnostic message to.")
      return
    }

    setIsTestingEmail(true)
    setTestResult(null)
    try {
      const res = await ApiClient.testAdminSmtp(testEmailRecipient.trim(), {
        host: smtpHost.trim() || undefined,
        port: parseInt(smtpPort, 10) || undefined,
        secure: smtpSecure,
        user: smtpUser.trim() || undefined,
        pass: smtpPass.trim() || undefined,
        fromName: smtpFromName.trim() || undefined,
        fromEmail: smtpFromEmail.trim() || undefined,
      })
      setTestResult(res)
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "Failed to dispatch test email",
      })
    } finally {
      setIsTestingEmail(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">System Configuration & Secrets</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
          Dynamic runtime provider keys, SMTP mail servers, and platform credentials. Values are encrypted at rest with AES-256 envelope encryption.
        </p>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
          <svg className="w-4 h-4 shrink-0 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>System configuration encrypted with AES-256 and synchronized in memory.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* SMTP Mail Server Configuration Card */}
        <Card className="p-6 bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">SMTP Email Server (Notifications & Alerts)</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Dispatches welcome instructions, login alerts, Paystack top-up receipts, and low-balance warnings.
              </p>
            </div>
            <Badge variant="verified" size="sm">TRANSACTIONAL MAIL</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="SMTP Host"
              type="text"
              placeholder="mail.verixaid.com or smtp.sendgrid.net"
              value={smtpHost}
              onChange={(e) => setSmtpHost(e.target.value)}
              hint="Outgoing mail exchange server"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="SMTP Port"
                type="number"
                placeholder="465"
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
                hint="465 (SSL) or 587 (TLS)"
              />
              <div className="flex flex-col justify-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer mt-3">
                  <input
                    type="checkbox"
                    checked={smtpSecure}
                    onChange={(e) => setSmtpSecure(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 dark:border-zinc-700 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">SSL / TLS Secure</span>
                </label>
              </div>
            </div>

            <Input
              label="SMTP Username"
              type="text"
              placeholder="no-reply@verixaid.com"
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
              hint="Account identifier or API key user"
            />
            <Input
              label="SMTP Password"
              type="password"
              placeholder="••••••••••••••••"
              value={smtpPass}
              onChange={(e) => setSmtpPass(e.target.value)}
              hint="Encrypted with AES-256. Leave blank to keep existing."
            />

            <Input
              label="Sender Display Name"
              type="text"
              placeholder="Verixa ID"
              value={smtpFromName}
              onChange={(e) => setSmtpFromName(e.target.value)}
            />
            <Input
              label="Sender Email Address"
              type="email"
              placeholder="no-reply@verixaid.com"
              value={smtpFromEmail}
              onChange={(e) => setSmtpFromEmail(e.target.value)}
            />
          </div>

          {/* Diagnostic Test Email Section */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                SMTP Live Delivery Verification
              </span>
              <Badge variant="mono" size="sm">DIAGNOSTIC TOOL</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Send an authenticated diagnostic test message to verify connectivity, TLS handshake, and mailbox delivery.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="dev@verixaid.com"
                value={testEmailRecipient}
                onChange={(e) => setTestEmailRecipient(e.target.value)}
                className="flex-1 text-xs rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:placeholder-transparent focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestSmtp}
                isLoading={isTestingEmail}
                className="shrink-0"
              >
                Send Test Email
              </Button>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-lg text-xs font-mono ${
                  testResult.success
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                }`}
              >
                {testResult.success ? "✓ " : "✕ "}
                {testResult.message}
              </div>
            )}
          </div>
        </Card>

        {/* Upstream Gateways & Secret Keys */}
        <Card className="p-6 bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Provider Secret Keys & Authentication</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Paystack virtual account webhooks, primary upstream registry credentials, and Google OAuth GIS.
              </p>
            </div>
            <Badge variant="verified" size="sm">ENCRYPTED AT REST</Badge>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">Paystack Master Secret Key</span>
                {configuredKeys["PAYSTACK_SECRET_KEY"] ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    CONFIGURED & ACTIVE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-zinc-500/15 text-zinc-400 border border-zinc-500/20">
                    NOT CONFIGURED
                  </span>
                )}
              </div>
              <Input
                type="password"
                placeholder="sk_••••••••••••••••••••••••"
                value={paystackKey}
                onChange={(e) => setPaystackKey(e.target.value)}
                hint="Required for Dedicated Virtual Account auto-generation, Deposits, and Webhook verification."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">Primary Gateway App ID</span>
                  {configuredKeys["DOJAH_APP_ID"] ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      CONFIGURED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-zinc-500/15 text-zinc-400 border border-zinc-500/20">
                      NOT CONFIGURED
                    </span>
                  )}
                </div>
                <Input
                  type="text"
                  placeholder="app_••••••••••••••••"
                  value={upstreamAppId}
                  onChange={(e) => setupstreamAppId(e.target.value)}
                  hint="Primary registry Application ID header"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">Primary Gateway Secret Key</span>
                  {configuredKeys["DOJAH_SECRET_KEY"] ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      CONFIGURED & ACTIVE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-zinc-500/15 text-zinc-400 border border-zinc-500/20">
                      NOT CONFIGURED
                    </span>
                  )}
                </div>
                <Input
                  type="password"
                  placeholder="sk_••••••••••••••••"
                  value={upstreamKey}
                  onChange={(e) => setupstreamKey(e.target.value)}
                  hint="Live primary registry Authorization key"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">SmileID API Key</span>
                  {configuredKeys["SMILE_ID_KEY"] ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      CONFIGURED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-zinc-500/15 text-zinc-400 border border-zinc-500/20">
                      NOT CONFIGURED
                    </span>
                  )}
                </div>
                <Input
                  type="password"
                  placeholder="sid_••••••••••••••••"
                  value={smileIdKey}
                  onChange={(e) => setSmileIdKey(e.target.value)}
                  hint="Secondary fallback biometric gateway"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">Google OAuth Web Client ID</span>
                  {configuredKeys["GOOGLE_CLIENT_ID"] ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      CONFIGURED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-zinc-500/15 text-zinc-400 border border-zinc-500/20">
                      NOT CONFIGURED
                    </span>
                  )}
                </div>
                <Input
                  type="text"
                  placeholder="••••••.apps.googleusercontent.com"
                  value={googleClientId}
                  onChange={(e) => setGoogleClientId(e.target.value)}
                  hint="Verified on backend during Google GIS sign-in"
                />
              </div>
            </div>

            <Input
              label="Super Admin Email Addresses"
              type="text"
              placeholder="admin@verixaid.com, dev@verixaid.com"
              value={adminEmails}
              onChange={(e) => setAdminEmails(e.target.value)}
              hint="Comma-separated emails granted immediate SuperAdmin console privileges."
            />
          </div>
        </Card>

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="emerald"
            size="md"
            isLoading={isSaving}
          >
            Encrypt & Apply System Settings
          </Button>
        </div>
      </form>
    </div>
  )
}
