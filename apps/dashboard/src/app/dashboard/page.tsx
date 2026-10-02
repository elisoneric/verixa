"use client"

import * as React from "react"
import Link from "next/link"
import { Card, Button, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyState, AppLink } from "@verixa/ui"
import { useAuth } from "../../lib/auth-context"
import { ApiClient } from "../../lib/api"

export default function DashboardOverviewPage() {
  const { user, environment, balance } = useAuth()
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

  const liveCalls = metrics.liveRequests ?? Math.round(metrics.totalRequests * 0.6)
  const cacheCalls = metrics.cacheRequests ?? (metrics.totalRequests - liveCalls)
  const hitRatio = metrics.cacheHitRatio ?? (metrics.totalRequests > 0 ? `${Math.round((cacheCalls / metrics.totalRequests) * 100)}%` : "0%")
  const savings = metrics.totalSavingsNgx ?? (cacheCalls * 30)

  return (
    <div className="space-y-8">
      {/* Promotional Flash Sale Banner if active */}
      {balance?.bonusPromotion?.active && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-gradient-to-r dark:from-emerald-950/80 dark:via-emerald-900/40 dark:to-zinc-950 border border-emerald-300 dark:border-emerald-500/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{balance.bonusPromotion.title}</span>
                <Badge variant="verified" size="sm">
                  {balance.bonusPromotion.discountPercent}% OFF ALL VERIFICATIONS
                </Badge>
              </div>
              <p className="text-xs text-emerald-800 dark:text-emerald-300/80 mt-0.5">
                Promotional price slash active. All live BVN, NIN, and NUBAN checks are automatically discounted.
              </p>
            </div>
          </div>
          <Link href="/dashboard/billing">
            <Button size="sm" variant="emerald" className="shrink-0 font-semibold">
              Top Up Balance &rarr;
            </Button>
          </Link>
        </div>
      )}

      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {user?.org_name || "Overview"}
            </h1>
            <Badge variant={environment === "live" ? "verified" : "warning"} size="sm">
              {environment.toUpperCase()}
            </Badge>
            <Badge variant={balance?.tier === "ENTERPRISE" ? "verified" : balance?.tier === "GROWTH" ? "info" : "mono"} size="sm">
              {balance?.tier || "STARTER"} PLAN
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Real-time identity verification performance, available balance, and API health.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/explorer">
            <Button variant="outline" size="sm" className="gap-2 font-semibold">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Test API</span>
            </Button>
          </Link>
          <Link href="/dashboard/verify">
            <Button variant="emerald" size="sm" className="gap-2 font-semibold">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Verify ID</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <Card className="p-5 bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {environment === "live" ? "Live NGX Balance" : "Sandbox Balance"}
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono text-xs font-semibold">1 NGX = ₦1</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
              ₦{currentBalance.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">NGX</span>
          </div>
          <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800/80">
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">Auto-settled via DVA</span>
            <Link
              href="/dashboard/billing"
              className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline transition-colors"
            >
              + Top up
            </Link>
          </div>
        </Card>

        {/* Total Verifications */}
        <Card className="p-5 bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Volume</span>
            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold">All Channels</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
              {metrics.totalRequests.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400">queries</span>
          </div>
          <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800/80 text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
            <span>BVN: {metrics.breakdown.bvn}</span>
            <span>NIN: {metrics.breakdown.nin}</span>
            <span>NUBAN: {metrics.breakdown.nuban}</span>
          </div>
        </Card>

        {/* Smart Cache Hit Ratio */}
        <Card className="p-5 bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Smart Cache Ratio</span>
            <Badge variant="verified" size="sm" className="gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              &lt;15ms
            </Badge>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
              {hitRatio}
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400">hits</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80 text-[11px] text-slate-500 dark:text-zinc-400 flex justify-between font-mono">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {cacheCalls} Cached
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              {liveCalls} Live
            </span>
          </div>
        </Card>

        {/* Cost Savings via Cache */}
        <Card className="p-5 bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Credits Saved</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono text-xs font-semibold">Cache Split</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
              ₦{savings.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">NGX Saved</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80 text-[11px] text-slate-400 dark:text-zinc-500">
            <span>From repeated verification lookups</span>
          </div>
        </Card>
      </div>

      {/* Smart Cache & Traffic Routing Analytics Widget */}
      <Card className="p-6 bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Identity Traffic & Smart Cache Breakdown</h3>
              <Badge variant="verified" size="sm">ACTIVE SAVINGS</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Comparison between live upstream registry queries (Dojah / NIMC / NIBSS) and instant Smart Cache hits.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-700 dark:text-zinc-300">Cache Hits: <b>{cacheCalls}</b> ({hitRatio})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span className="text-slate-700 dark:text-zinc-300">Live Calls: <b>{liveCalls}</b></span>
            </div>
          </div>
        </div>

        {/* Visual Traffic Split Bar */}
        <div className="mt-4 space-y-2">
          <div className="h-3 w-full bg-slate-100 dark:bg-zinc-950 rounded-full overflow-hidden flex border border-slate-200 dark:border-zinc-800">
            <div
              style={{ width: metrics.totalRequests > 0 ? `${(cacheCalls / metrics.totalRequests) * 100}%` : "50%" }}
              className="bg-emerald-500 transition-all duration-500"
              title="Smart Cache Hits"
            />
            <div
              style={{ width: metrics.totalRequests > 0 ? `${(liveCalls / metrics.totalRequests) * 100}%` : "50%" }}
              className="bg-sky-500 transition-all duration-500"
              title="Live Registry Calls"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800">
              <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 uppercase font-semibold">Latency SLA Comparison</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">~14ms</span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">Cache vs</span>
                <span className="text-sky-600 dark:text-sky-400 font-bold font-mono">~185ms</span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">Live</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800">
              <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 uppercase font-semibold">Cost Optimization</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">Cache Split</span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">vs Upstream Registry Charges</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800">
              <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 uppercase font-semibold">Cache Retention Policy</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-slate-900 dark:text-white font-bold font-mono">30 Days TTL</span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">Auto-refresh available</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Account Plan Rates Schedule Banner */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/40 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Badge variant="mono" size="sm">ACTIVE RATES</Badge>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <span className="text-slate-700 dark:text-zinc-300">BVN: <b className="text-emerald-600 dark:text-emerald-400">₦50 Live</b> • Cache Split</span>
            <span className="text-slate-700 dark:text-zinc-300">NIN: <b className="text-emerald-600 dark:text-emerald-400">₦140 Live</b> • Cache Split</span>
            <span className="text-slate-700 dark:text-zinc-300">NUBAN: <b className="text-emerald-600 dark:text-emerald-400">₦0.00 Free</b> • Cache Split</span>
          </div>
        </div>
        <Link href="/dashboard/billing" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold shrink-0">
          View Full Rate Schedule &rarr;
        </Link>
      </div>

      {/* Quick Access Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/dashboard/api-keys"
          className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:bg-slate-50 dark:hover:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700 shadow-xs transition-all text-left"
        >
          <span className="text-xs font-bold text-slate-900 dark:text-white block">API Credentials</span>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 block">View secret keys & permissions</span>
        </Link>
        <Link
          href="/dashboard/billing"
          className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:bg-slate-50 dark:hover:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700 shadow-xs transition-all text-left"
        >
          <span className="text-xs font-bold text-slate-900 dark:text-white block">Add NGX Credits</span>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 block">Dedicated Virtual Account</span>
        </Link>
        <a
          href="https://docs-verixa.esam.com.ng"
          target="_blank"
          rel="noreferrer"
          className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:bg-slate-50 dark:hover:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700 shadow-xs transition-all text-left block"
        >
          <span className="text-xs font-bold text-slate-900 dark:text-white block">Smart Cache Docs</span>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 block">How to optimize cache hit rates ↗</span>
        </a>
      </div>

      {/* Recent Verification Activity Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Recent Verification Requests</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Audit log of recent identity checks and cache hits.</p>
          </div>
          <Link href="/dashboard/logs" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">
            View All Logs &rarr;
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Routing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Latency</TableHead>
                <TableHead>Deduction</TableHead>
                <TableHead className="text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentLogs.map((log) => {
                const isCache = log.isCached || log.source === "CACHE"
                const cost = log.costDeducted ?? (log.service === "NUBAN" ? 0 : isCache ? 20 : 50)
                const latency = log.latencyMs ?? (isCache ? 12 : 142)

                return (
                  <TableRow key={log.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                    <TableCell className="font-mono text-xs text-slate-800 dark:text-zinc-200 font-bold">
                      {log.id.slice(0, 16)}...
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900 dark:text-white">
                      {log.service}
                    </TableCell>
                    <TableCell>
                      {isCache ? (
                        <Badge variant="verified" size="sm" className="gap-1 font-mono">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          CACHE
                        </Badge>
                      ) : (
                        <Badge variant="mono" size="sm" className="gap-1 font-mono">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                          LIVE
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={log.status === "Verified" ? "verified" : "failed"} size="sm">
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-600 dark:text-zinc-400">
                      <span className={isCache ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-slate-600 dark:text-zinc-400"}>
                        {latency}ms
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-800 dark:text-zinc-200 font-semibold">
                      {cost} NGX
                    </TableCell>
                    <TableCell className="text-right text-xs text-slate-500 font-mono">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
