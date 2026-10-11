"use client"

import * as React from "react"
import {
  Button,
  Input,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Drawer,
  EmptyState,
} from "@verixa/ui"
import { useAuth } from "../../../lib/auth-context"
import { ApiClient, VerificationLogItem } from "../../../lib/api"

export default function LogsPage() {
  const { environment } = useAuth()
  const [logs, setLogs] = React.useState<VerificationLogItem[]>([])
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [serviceFilter, setServiceFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [sourceFilter, setSourceFilter] = React.useState("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedLog, setSelectedLog] = React.useState<any | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  const fetchLogs = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await ApiClient.getLogs({
        service: serviceFilter === "all" ? undefined : serviceFilter.toLowerCase(),
        status: statusFilter === "all" ? undefined : statusFilter.toLowerCase(),
        source: sourceFilter === "all" ? undefined : sourceFilter.toLowerCase(),
        page,
        limit: 15,
      })
      setLogs(data.items || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
    } catch {
      // Fallback
    } finally {
      setIsLoading(false)
    }
  }, [serviceFilter, statusFilter, sourceFilter, page])

  React.useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const handleRowClick = async (logId: string) => {
    try {
      const detail = await ApiClient.getLogDetail(logId)
      setSelectedLog(detail)
    } catch {
      const current = logs.find((l) => l.id === logId)
      if (current) setSelectedLog(current)
    }
  }

  const filteredLogs = logs.filter(
    (l) =>
      !searchQuery.trim() ||
      l.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.service.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Verification & Audit Logs</h1>
            <Badge variant="mono" size="sm">
              {total} EVENTS
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Real-time audit trail of verifications and metered ledger deductions.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => fetchLogs()} isLoading={isLoading}>
          ↻ Refresh
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by Request ID (e.g. req_8f19a02d)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Source Routing Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value)
              setPage(1)
            }}
            className="h-10 rounded-lg border border-white/[0.12] bg-[#121620] px-3 text-xs text-white focus:border-emerald-500 focus:outline-none shadow-2xs"
          >
            <option value="all">All Routing (Live & Cache)</option>
            <option value="cache">Cache Hits Only</option>
            <option value="live">Live Queries Only</option>
          </select>

          {/* Service Filter */}
          <select
            value={serviceFilter}
            onChange={(e) => {
              setServiceFilter(e.target.value)
              setPage(1)
            }}
            className="h-10 rounded-lg border border-white/[0.12] bg-[#121620] px-3 text-xs text-white focus:border-emerald-500 focus:outline-none shadow-2xs"
          >
            <option value="all">All Services</option>
            <option value="bvn">BVN</option>
            <option value="nin">NIN</option>
            <option value="nuban">Bank Account</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="h-10 rounded-lg border border-white/[0.12] bg-[#121620] px-3 text-xs text-white focus:border-emerald-500 focus:outline-none shadow-2xs"
          >
            <option value="all">All Statuses</option>
            <option value="success">Verified</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      {filteredLogs.length === 0 ? (
        <EmptyState
          title="No matching logs found"
          description="Try adjusting your search query, filter criteria, or execute a verification test."
          actionLabel="Open API Explorer"
          onAction={() => (window.location.href = "/dashboard/explorer")}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request ID</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Routing / Cache</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Latency</TableHead>
              <TableHead>Deduction</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => {
              const isCache = log.isCached || log.source === "CACHE"
              const cost = log.costDeducted ?? (log.service === "NUBAN" ? 0 : isCache ? 20 : 50)
              const latency = log.latencyMs ?? (isCache ? 12 : 148)

              return (
                <TableRow
                  key={log.id}
                  onClick={() => handleRowClick(log.id)}
                  className="cursor-pointer hover:bg-white/[0.03]"
                >
                  <TableCell className="font-mono text-xs text-white font-bold">
                    {log.id.slice(0, 16)}...
                  </TableCell>
                  <TableCell className="font-semibold text-white">
                    {log.service}
                  </TableCell>
                  <TableCell>
                    {isCache ? (
                      <Badge variant="verified" size="sm" className="gap-1 font-mono">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        CACHE HIT
                      </Badge>
                    ) : (
                      <Badge variant="mono" size="sm" className="gap-1 font-mono">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        LIVE CALL
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={log.status === "Verified" ? "verified" : "failed"} size="sm">
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-zinc-300">
                    <span className={isCache ? "text-emerald-400 font-semibold" : "text-zinc-400"}>
                      {latency}ms
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-white font-semibold">
                    {cost} NGX
                  </TableCell>
                  <TableCell className="text-xs text-zinc-400 font-mono">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-xs text-emerald-400 font-mono hover:underline font-semibold">
                      Inspect &rarr;
                    </span>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.08] text-xs text-zinc-400">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="xs"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="xs"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Drawer Inspector */}
      {selectedLog && (
        <Drawer
          isOpen={true}
          onClose={() => setSelectedLog(null)}
          title={`Verification Log: ${selectedLog.id.slice(0, 16)}`}
          description="Detailed execution metadata, cache routing, and billing ledger record."
        >
          <div className="space-y-6">
            {/* Quick Badges */}
            <div className="flex items-center gap-2">
              <Badge variant={selectedLog.status === "SUCCESS" || selectedLog.status === "Verified" ? "verified" : "failed"}>
                {selectedLog.status}
              </Badge>
              <Badge variant="mono">{selectedLog.service}</Badge>
              {selectedLog.isCached || selectedLog.source === "CACHE" ? (
                <Badge variant="verified" size="sm" className="gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  CACHE HIT
                </Badge>
              ) : (
                <Badge variant="mono" size="sm" className="gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  LIVE CALL
                </Badge>
              )}
              <Badge variant="neutral">{selectedLog.environment?.toUpperCase()}</Badge>
            </div>

            {/* Overview Attributes */}
            <div className="rounded-xl glass-card bg-[#0e1118]/70 border border-white/[0.08] p-4 space-y-3 text-xs shadow-xs text-white">
              <div className="flex justify-between border-b border-white/[0.06] pb-2">
                <span className="text-zinc-400 font-mono">REQUEST ID</span>
                <span className="text-white font-mono">{selectedLog.id}</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.06] pb-2">
                <span className="text-zinc-400 font-mono">CACHE ROUTING</span>
                <span className={`font-mono font-semibold ${selectedLog.isCached || selectedLog.source === "CACHE" ? "text-emerald-400" : "text-sky-400"}`}>
                  {selectedLog.isCached || selectedLog.source === "CACHE"
                    ? "HIT (In-Memory Redis Cache)"
                    : "MISS (Live Upstream Registry Call)"}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/[0.06] pb-2">
                <span className="text-zinc-400 font-mono">UPSTREAM PROVIDER</span>
                <span className="text-white font-mono">{selectedLog.provider || "verixa_smart_cache"}</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.06] pb-2">
                <span className="text-zinc-400 font-mono">EXECUTION LATENCY</span>
                <span className="text-emerald-400 font-mono font-semibold">
                  {selectedLog.latencyMs ?? (selectedLog.isCached ? 12 : 142)}ms
                </span>
              </div>
              <div className="flex justify-between border-b border-white/[0.06] pb-2">
                <span className="text-zinc-400 font-mono">BILLING DEDUCTION</span>
                <span className="text-white font-mono font-semibold">
                  {selectedLog.costDeducted ?? (selectedLog.service === "NUBAN" ? 0 : selectedLog.isCached ? 20 : 50)} NGX (
                  ₦{selectedLog.costDeducted ?? (selectedLog.service === "NUBAN" ? 0 : selectedLog.isCached ? 20 : 50)}.00
                  )
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400 font-mono">IDEMPOTENCY KEY</span>
                <span className="text-zinc-400 font-mono">
                  {selectedLog.idempotencyKey || "None (Direct request)"}
                </span>
              </div>
            </div>

            {/* Raw JSON Payload */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-slate-600 dark:text-zinc-400 uppercase font-semibold">Normalized JSON Payload</span>
              <pre className="p-4 rounded-xl bg-slate-900 dark:bg-zinc-900 font-mono text-xs text-emerald-400 dark:text-emerald-300 overflow-x-auto border border-slate-800 dark:border-zinc-800 leading-relaxed shadow-xs">
                {JSON.stringify(
                  {
                    status: selectedLog.status === "SUCCESS" || selectedLog.status === "Verified" ? "verified" : "failed",
                    service: selectedLog.service,
                    meta: {
                      request_id: selectedLog.id,
                      cached: Boolean(selectedLog.isCached || selectedLog.source === "CACHE"),
                      provider: selectedLog.provider || "verixa_smart_cache",
                      cost_ngx: selectedLog.costDeducted ?? (selectedLog.service === "NUBAN" ? 0 : selectedLog.isCached ? 20 : 50),
                      latency_ms: selectedLog.latencyMs ?? (selectedLog.isCached ? 12 : 142),
                      environment: selectedLog.environment,
                    },
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        </Drawer>
      )}
    </div>
  )
}
