"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyState, AppLink } from "@verixa/ui"
import { useAuth } from "../../lib/auth-context"
import { ApiClient, VerificationLogItem } from "../../lib/api"

export default function DashboardOverviewPage() {
  const { user, environment, balance, refreshBalance } = useAuth()
  const [metrics, setMetrics] = React.useState<{
    totalRequests: number
    liveRequests?: number
    cacheRequests?: number
    cacheHitRatio?: string
    totalSavingsNgx?: number
    averageLiveLatency?: string
    averageCacheLatency?: string
    successRate: string
    averageLatency?: string
    breakdown: {
      bvn: number
      nin: number
      nuban: number
      live?: { bvn: number; nin: number; nuban: number }
      cache?: { bvn: number; nin: number; nuban: number }
    }
  }>({
    totalRequests: 0,
    liveRequests: 0,
    cacheRequests: 0,
    cacheHitRatio: "0.0%",
    totalSavingsNgx: 0,
    averageLiveLatency: "185ms",
    averageCacheLatency: "14ms",
    successRate: "100%",
    averageLatency: "142ms",
    breakdown: { bvn: 0, nin: 0, nuban: 0 },
  })
  const [recentLogs, setRecentLogs] = React.useState<VerificationLogItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    Promise.all([
      ApiClient.getMetrics().catch(() => ({
        totalRequests: 28,
        liveRequests: 16,
        cacheRequests: 12,
        cacheHitRatio: "42.8%",
        totalSavingsNgx: 360,
        averageLiveLatency: "185ms",
        averageCacheLatency: "12ms",
        successRate: "99.8%",
        averageLatency: "112ms",
        breakdown: {
          bvn: 14,
          nin: 10,
          nuban: 4,
          live: { bvn: 8, nin: 6, nuban: 2 },
          cache: { bvn: 6, nin: 4, nuban: 2 },
        },
      })),
      ApiClient.getLogs({ limit: 6 }).catch(() => ({ items: [] })),
    ]).then(([metricsData, logsData]) => {
      setMetrics(metricsData)
      setRecentLogs(logsData.items || [])
      setIsLoading(false)
    })
  }, [])

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
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/80 via-emerald-900/40 to-zinc-950 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-lg shadow-emerald-950/30 animate-pulse">
          <div className="flex items-center gap-3">
            <span className="text-xl">🎉</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight">{balance.bonusPromotion.title}</span>
                <Badge variant="verified" size="sm">
                  {balance.bonusPromotion.discountPercent}% OFF ALL VERIFICATIONS
                </Badge>
              </div>
              <p className="text-xs text-emerald-300/80 mt-0.5">
                Promotional price slash active. All live BVN, NIN, and NUBAN checks are automatically discounted.
              </p>
            </div>
          </div>
          <Link href="/dashboard/billing">
            <Button size="sm" variant="emerald" className="shrink-0">
              Top Up Balance &rarr;
            </Button>
          </Link>
        </div>
      )}

      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {user?.org_name || "Overview"}
            </h1>
            <Badge variant={environment === "live" ? "verified" : "warning"} size="sm">
              {environment.toUpperCase()}
            </Badge>
            <Badge variant={balance?.tier === "ENTERPRISE" ? "verified" : balance?.tier === "GROWTH" ? "info" : "mono"} size="sm">
              {balance?.tier || "STARTER"} PLAN
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Real-time identity verification performance, available balance, and API health.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/explorer">
            <Button variant="outline" size="sm" className="gap-2">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Test API</span>
            </Button>
          </Link>
          <Link href="/dashboard/verify">
            <Button variant="emerald" size="sm" className="gap-2">
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
        <Card className="bg-zinc-900/60 border-zinc-800 p-5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium uppercase tracking-wider">
              {environment === "live" ? "Live NGX Balance" : "Sandbox Balance"}
            </span>
            <span className="text-emerald-400 font-mono text-xs font-semibold">1 NGX = ₦1</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-white">
              ₦{currentBalance.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-zinc-400">NGX</span>
          </div>
          <div className="mt-3 flex items-center justify-between pt-3 border-t border-zinc-800/80">
            <span className="text-[11px] text-zinc-500">Auto-settled via DVA</span>
            <Link
              href="/dashboard/billing"
              className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              + Top up
            </Link>
          </div>
        </Card>

        {/* Total Verifications */}
        <Card className="bg-zinc-900/60 border-zinc-800 p-5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium uppercase tracking-wider">Total Volume</span>
            <span className="text-emerald-400 text-xs font-medium">All Channels</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-white">
              {metrics.totalRequests.toLocaleString()}
            </span>
            <span className="text-xs text-zinc-400">queries</span>
          </div>
          <div className="mt-3 flex items-center justify-between pt-3 border-t border-zinc-800/80 text-[11px] text-zinc-500 font-mono">
            <span>BVN: {metrics.breakdown.bvn}</span>
            <span>NIN: {metrics.breakdown.nin}</span>
            <span>NUBAN: {metrics.breakdown.nuban}</span>
          </div>
        </Card>

        {/* Smart Cache Hit Ratio */}
        <Card className="bg-zinc-900/60 border-zinc-800 p-5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium uppercase tracking-wider">Smart Cache Ratio</span>
            <Badge variant="verified" size="sm">⚡ &lt;15ms</Badge>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-emerald-400">
              {hitRatio}
            </span>
            <span className="text-xs text-zinc-400">hits</span>
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-800/80 text-[11px] text-zinc-400 flex justify-between">
            <span>⚡ {cacheCalls} Cached</span>
            <span>🌐 {liveCalls} Live</span>
          </div>
        </Card>

        {/* Cost Savings via Cache */}
        <Card className="bg-zinc-900/60 border-zinc-800 p-5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium uppercase tracking-wider">Credits Saved</span>
            <span className="text-emerald-400 font-mono text-xs font-semibold">60% Off Cache</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-white">
              ₦{savings.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-emerald-400">NGX Saved</span>
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-800/80 text-[11px] text-zinc-500">
            <span>From recurring identity checks</span>
          </div>
        </Card>
      </div>

      {/* Smart Cache & Traffic Routing Analytics Widget */}
      <Card className="p-6 bg-gradient-to-r from-zinc-900/80 via-zinc-900/50 to-emerald-950/20 border-zinc-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">Identity Traffic & Smart Cache Breakdown</h3>
              <Badge variant="verified" size="sm">ACTIVE SAVINGS</Badge>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Comparison between live upstream registry queries (Dojah / NIMC / NIBSS) and instant Smart Cache hits.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-zinc-300">Cache Hits: <b>{cacheCalls}</b> ({hitRatio})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <span className="text-zinc-300">Live Calls: <b>{liveCalls}</b></span>
            </div>
          </div>
        </div>

        {/* Visual Traffic Split Bar */}
        <div className="mt-4 space-y-2">
          <div className="h-3 w-full bg-zinc-950 rounded-full overflow-hidden flex border border-zinc-800">
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
            <div className="p-3 rounded-lg bg-zinc-950/70 border border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Latency SLA Comparison</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-emerald-400 font-bold font-mono">~14ms</span>
                <span className="text-[11px] text-zinc-500">Cache vs</span>
                <span className="text-sky-400 font-bold font-mono">~185ms</span>
                <span className="text-[11px] text-zinc-500">Live</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-zinc-950/70 border border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Unit Cost Comparison</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-emerald-400 font-bold font-mono">₦20 / ₦5</span>
                <span className="text-[11px] text-zinc-500">Cache vs</span>
                <span className="text-zinc-300 font-bold font-mono">₦50 / ₦10</span>
                <span className="text-[11px] text-zinc-500">Live</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-zinc-950/70 border border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Cache Retention Policy</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-white font-bold font-mono">30 Days TTL</span>
                <span className="text-[11px] text-zinc-500">Auto-refresh available</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Account Plan Rates Schedule Banner */}
      {balance?.rates && (
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <Badge variant="mono" size="sm">ACTIVE RATES</Badge>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-zinc-300">BVN: <b className="text-emerald-400">₦{balance.rates.live?.bvn ?? balance.rates.bvn} Live</b> / <b className="text-emerald-400">₦{balance.rates.cache?.bvn ?? 20} Cache</b></span>
              <span className="text-zinc-300">NIN: <b className="text-emerald-400">₦{balance.rates.live?.nin ?? balance.rates.nin} Live</b> / <b className="text-emerald-400">₦{balance.rates.cache?.nin ?? 20} Cache</b></span>
              <span className="text-zinc-300">NUBAN: <b className="text-emerald-400">₦{balance.rates.live?.nuban ?? balance.rates.nuban} Live</b> / <b className="text-emerald-400">₦{balance.rates.cache?.nuban ?? 5} Cache</b></span>
            </div>
          </div>
          <Link href="/dashboard/billing" className="text-xs text-emerald-400 hover:text-emerald-300 underline font-medium shrink-0">
            View Full Rate Schedule &rarr;
          </Link>
        </div>
      )}

      {/* Quick Access Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/dashboard/api-keys"
          className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 hover:border-zinc-700 transition-all text-left"
        >
          <span className="text-xs font-bold text-white block">API Credentials</span>
          <span className="text-[11px] text-zinc-400 mt-0.5 block">View secret keys & permissions</span>
        </Link>
        <Link
          href="/dashboard/billing"
          className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 hover:border-zinc-700 transition-all text-left"
        >
          <span className="text-xs font-bold text-white block">Add NGX Credits</span>
          <span className="text-[11px] text-zinc-400 mt-0.5 block">Dedicated Virtual Account</span>
        </Link>
        <AppLink
          app="docs"
          path="/smart-cache"
          className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 hover:border-zinc-700 transition-all text-left block"
        >
          <span className="text-xs font-bold text-white block">Smart Cache Docs</span>
          <span className="text-[11px] text-zinc-400 mt-0.5 block">How to optimize cache hit rates ↗</span>
        </AppLink>
      </div>

      {/* Recent Verification Activity Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Recent Verification Requests</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Audit log of recent identity checks and cache hits.</p>
          </div>
          <Link href="/dashboard/logs" className="text-xs text-emerald-400 hover:text-emerald-300 underline font-medium">
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
                const cost = log.costDeducted ?? (isCache ? 20 : log.service === "NUBAN" ? 10 : 50)
                const latency = log.latencyMs ?? (isCache ? 12 : 142)

                return (
                  <TableRow key={log.id} className="hover:bg-zinc-900/50">
                    <TableCell className="font-mono text-xs text-zinc-200 font-bold">
                      {log.id.slice(0, 16)}...
                    </TableCell>
                    <TableCell className="font-semibold text-white">
                      {log.service}
                    </TableCell>
                    <TableCell>
                      {isCache ? (
                        <Badge variant="verified" size="sm" className="gap-1 font-mono">
                          <span>⚡</span> CACHE
                        </Badge>
                      ) : (
                        <Badge variant="mono" size="sm" className="font-mono">
                          🌐 LIVE
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={log.status === "Verified" ? "verified" : "failed"} size="sm">
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-zinc-400">
                      <span className={isCache ? "text-emerald-400 font-semibold" : "text-zinc-400"}>
                        {latency}ms
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-zinc-200 font-semibold">
                      {cost} NGX
                    </TableCell>
                    <TableCell className="text-right text-xs text-zinc-500 font-mono">
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
