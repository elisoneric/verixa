"use client"

import * as React from "react"
import Link from "next/link"
import { Card, Button, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyState, Modal, Input } from "@verixa/ui"
import { useAuth } from "../../lib/auth-context"
import { ApiClient } from "../../lib/api"

export default function DashboardOverviewPage() {
  const { user, environment, balance, refreshBalance } = useAuth()
  const [metrics, setMetrics] = React.useState<any>({
    totalRequests: 0,
    liveRequests: 0,
    cacheRequests: 0,
    cacheHitRatio: "0%",
    totalSavingsNgx: 0,
    breakdown: { bvn: 0, nin: 0, nuban: 0 },
  })
  const [recentLogs, setRecentLogs] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [copiedDva, setCopiedDva] = React.useState(false)
  const [topupModalOpen, setTopupModalOpen] = React.useState(false)
  const [topupAmount, setTopupAmount] = React.useState("5000")
  const [isProcessingTopup, setIsProcessingTopup] = React.useState(false)
  const [isFaucetLoading, setIsFaucetLoading] = React.useState(false)

  React.useEffect(() => {
    async function loadOverview() {
      try {
        const [statsData, logsData] = await Promise.allSettled([
          ApiClient.getMetrics(),
          ApiClient.getLogs({ limit: 5 }),
        ])

        if (statsData.status === "fulfilled") {
          setMetrics(statsData.value)
        }
        if (logsData.status === "fulfilled") {
          setRecentLogs(logsData.value.items || [])
        }
      } catch (err) {
        console.error("Failed to load dashboard overview data", err)
      } finally {
        setIsLoading(false)
      }
    }
    loadOverview()
  }, [environment])

  const currentBalance =
    environment === "live"
      ? balance?.live.balance ?? 0
      : balance?.sandbox.balance ?? 100000

  const dva = balance?.dedicatedVirtualAccount

  const liveCalls = metrics.liveRequests ?? Math.round(metrics.totalRequests * 0.6)
  const cacheCalls = metrics.cacheRequests ?? (metrics.totalRequests - liveCalls)
  const hitRatio = metrics.cacheHitRatio ?? (metrics.totalRequests > 0 ? `${Math.round((cacheCalls / metrics.totalRequests) * 100)}%` : "0%")
  const savings = metrics.totalSavingsNgx ?? (cacheCalls * 30)

  const handleCopyAccount = (accountNumber: string) => {
    navigator.clipboard.writeText(accountNumber)
    setCopiedDva(true)
    setTimeout(() => setCopiedDva(false), 2000)
  }

  const handleTopupCheckout = async (amount: number) => {
    setIsProcessingTopup(true)
    try {
      const ref = `topup_${Date.now()}`
      const res = await ApiClient.createCheckout(amount, ref)
      if (res.url) {
        window.open(res.url, "_blank")
      }
      setTopupModalOpen(false)
    } catch (e: any) {
      alert(e.message || "Failed to initialize deposit checkout")
    } finally {
      setIsProcessingTopup(false)
    }
  }

  const handleSandboxFaucet = async () => {
    setIsFaucetLoading(true)
    try {
      await ApiClient.fundSandbox(10000)
      await refreshBalance()
    } catch (e: any) {
      alert(e.message || "Failed to add sandbox credits")
    } finally {
      setIsFaucetLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-heading">
              {user?.org_name || "Overview"}
            </h1>
            <Badge variant={environment === "live" ? "verified" : "warning"} size="sm">
              {environment.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Identity verification metrics, wallet balance, and recent audit logs.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <Link href="/dashboard/explorer">
            <button
              type="button"
              className="px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span>API Explorer</span>
            </button>
          </Link>
          <Link href="/dashboard/verify">
            <button
              type="button"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Verify ID</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Prominent Wallet & Easy Deposit Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Balance Block (Left Column) */}
          <div className="lg:col-span-5 space-y-3 lg:border-r lg:border-slate-100 lg:pr-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Available Wallet Balance
              </span>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                1 NGX = ₦1.00
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-mono">
                ₦{currentBalance.toLocaleString()}
              </span>
              <span className="text-sm font-semibold text-slate-500">NGX</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {environment === "live" ? (
                <button
                  type="button"
                  onClick={() => setTopupModalOpen(true)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Deposit Funds</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSandboxFaucet}
                  disabled={isFaucetLoading}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>{isFaucetLoading ? "Adding..." : "Add 10,000 Test Credits"}</span>
                </button>
              )}

              <Link
                href="/dashboard/billing"
                className="px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
              >
                Billing Details →
              </Link>
            </div>
          </div>

          {/* Dedicated Virtual Account Block (Right Column) */}
          <div className="lg:col-span-7">
            {dva ? (
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Dedicated Bank Transfer Account
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                    Instant Auto-Credit
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-slate-200 rounded-lg p-3">
                  <div>
                    <span className="text-[11px] text-slate-500 uppercase block font-medium">
                      {dva.bankName}
                    </span>
                    <span className="text-xl font-bold font-mono text-slate-900 tracking-wider">
                      {dva.accountNumber}
                    </span>
                    <span className="text-xs text-slate-600 block mt-0.5">
                      {dva.accountName}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyAccount(dva.accountNumber)}
                    className="self-start sm:self-center px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                    <span>{copiedDva ? "Copied!" : "Copy Account"}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-500">
                  Transfer directly from any Nigerian banking app (GTBank, Zenith, Access, Kuda, OPay, Moniepoint). Credits apply instantly 24/7.
                </p>
              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 border border-dashed border-slate-300 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-900 block">
                    Automated Bank Transfer Deposit
                  </span>
                  <p className="text-xs text-slate-500">
                    Get a dedicated virtual account in your name for 24/7 automated wallet funding.
                  </p>
                </div>
                <Link
                  href="/dashboard/billing"
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors shrink-0 text-center"
                >
                  Setup Virtual Account →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid (Mobile responsive: 1 col on mobile, 2 on sm, 4 on lg) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Verifications */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Lookups</span>
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {metrics.totalRequests.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">queries</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>BVN: {metrics.breakdown.bvn}</span>
            <span>NIN: {metrics.breakdown.nin}</span>
            <span>NUBAN: {metrics.breakdown.nuban}</span>
          </div>
        </div>

        {/* Smart Cache Ratio */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Cache Hit Ratio</span>
            <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              &lt;15ms
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-emerald-600">
              {hitRatio}
            </span>
            <span className="text-xs text-slate-500">efficiency</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span className="text-emerald-700 font-medium">{cacheCalls} Cached</span>
            <span>{liveCalls} Registry</span>
          </div>
        </div>

        {/* Cost Savings */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Cache Savings</span>
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-slate-900">
              ₦{savings.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">saved</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
            <span>Reduced upstream registry fees</span>
          </div>
        </div>

        {/* API Availability */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">System Status</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-slate-900">
              99.98%
            </span>
            <span className="text-xs text-slate-500">uptime</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
            <span>Primary registry routes healthy</span>
          </div>
        </div>
      </div>

      {/* Quick Services Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          href="/dashboard/verify"
          className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-2xs transition-all text-left block"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900">Manual Lookup</span>
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <p className="text-xs text-slate-500 mt-1">Single NIN, BVN, and NUBAN search workspace.</p>
        </Link>

        <Link
          href="/dashboard/slips"
          className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-2xs transition-all text-left block"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900">Slip Generator</span>
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <p className="text-xs text-slate-500 mt-1">Generate standard dual-slip PDF and Word documents.</p>
        </Link>

        <Link
          href="/dashboard/api-keys"
          className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-2xs transition-all text-left block"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900">API Credentials</span>
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <p className="text-xs text-slate-500 mt-1">Manage secret keys, permissions, and IP restrictions.</p>
        </Link>
      </div>

      {/* Recent Verification Activity Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-heading">Recent Lookups</h2>
            <p className="text-xs text-slate-500 mt-0.5">Audit log of recent identity checks and responses.</p>
          </div>
          <Link href="/dashboard/logs" className="text-xs text-slate-700 hover:text-slate-900 font-semibold hover:underline">
            View All Logs →
          </Link>
        </div>

        {recentLogs.length === 0 ? (
          <EmptyState
            title="No verification requests yet"
            description="Run your first identity lookup via the manual workspace or API explorer."
            actionLabel="Open API Explorer"
            onAction={() => (window.location.href = "/dashboard/explorer")}
          />
        ) : (
          <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200 bg-slate-50/70 text-slate-600">
                  <TableHead>Request ID</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Routing</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Latency</TableHead>
                  <TableHead>Charge</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLogs.map((log) => {
                  const isCache = log.isCached || log.source === "CACHE"
                  const cost = log.costDeducted ?? (log.service === "NUBAN" ? 0 : isCache ? 20 : 50)
                  const latency = log.latencyMs ?? (isCache ? 12 : 142)

                  return (
                    <TableRow key={log.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="font-mono text-xs text-slate-800 font-semibold">
                        {log.id.slice(0, 14)}...
                      </TableCell>
                      <TableCell className="font-medium text-slate-900 text-xs">
                        {log.service}
                      </TableCell>
                      <TableCell>
                        {isCache ? (
                          <Badge variant="verified" size="sm">
                            CACHE
                          </Badge>
                        ) : (
                          <Badge variant="neutral" size="sm">
                            LIVE
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={log.status === "Verified" ? "verified" : "failed"} size="sm">
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-600">
                        {latency}ms
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-800 font-medium">
                        {cost === 0 ? "Free" : `₦${cost}`}
                      </TableCell>
                      <TableCell className="text-right text-xs text-slate-500 font-mono">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Instant Deposit Modal */}
      <Modal
        isOpen={topupModalOpen}
        onClose={() => setTopupModalOpen(false)}
        title="Deposit Funds into Wallet"
        description="Select an amount to initialize instant online checkout via Paystack."
      >
        <div className="space-y-4 mt-2">
          {/* Quick-select amount pills */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">
              Select Top-up Amount
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {["2000", "5000", "10000", "25000"].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTopupAmount(amt)}
                  className={`py-2 px-3 text-xs font-semibold font-mono rounded-lg border transition-all cursor-pointer ${
                    topupAmount === amt
                      ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  ₦{parseInt(amt, 10).toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Custom Amount (NGN)
            </label>
            <Input
              type="number"
              min="1000"
              step="500"
              value={topupAmount}
              onChange={(e) => setTopupAmount(e.target.value)}
              placeholder="e.g. 5000"
              className="font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">Minimum top-up is ₦1,000.</p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setTopupModalOpen(false)}
              className="px-3.5 py-2 text-xs font-medium rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleTopupCheckout(parseInt(topupAmount, 10) || 5000)}
              disabled={isProcessingTopup}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>{isProcessingTopup ? "Processing..." : `Pay ₦${(parseInt(topupAmount, 10) || 0).toLocaleString()}`}</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
