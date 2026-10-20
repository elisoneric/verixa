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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-heading">
              Verification Logs
            </h1>
            <Badge variant="neutral" size="sm">
              {total} EVENTS
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time identity verification audit trail and metered ledger charges.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchLogs()}
          disabled={isLoading}
          className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1.5 self-start sm:self-center cursor-pointer shadow-2xs"
        >
          <svg className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by Request ID or Service..."
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
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:border-slate-900 focus:outline-none shadow-2xs cursor-pointer"
          >
            <option value="all">All Routing</option>
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
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:border-slate-900 focus:outline-none shadow-2xs cursor-pointer"
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
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:border-slate-900 focus:outline-none shadow-2xs cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="success">Verified</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Logs Table Container */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        {filteredLogs.length === 0 ? (
          <EmptyState
            title="No matching logs found"
            description="Adjust your search query, filter criteria, or execute a new verification."
            actionLabel="Open API Explorer"
            onAction={() => (window.location.href = "/dashboard/explorer")}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200 bg-slate-50/70 text-slate-600">
                  <TableHead>Request ID</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Routing</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Latency</TableHead>
                  <TableHead>Charge</TableHead>
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
                      className="cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <TableCell className="font-mono text-xs text-slate-900 font-semibold">
                        {log.id.slice(0, 16)}...
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
                      <TableCell className="font-mono text-xs text-slate-900 font-medium">
                        {cost === 0 ? "Free" : `₦${cost}`}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 font-mono">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-xs text-slate-700 hover:text-slate-900 font-semibold hover:underline">
                          Inspect →
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-200 text-xs text-slate-500 bg-slate-50/50">
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
      </div>

      {/* Drawer Inspector */}
      {selectedLog && (
        <Drawer
          isOpen={true}
          onClose={() => setSelectedLog(null)}
          title={`Log: ${selectedLog.id.slice(0, 16)}`}
          description="Detailed execution metadata and cache routing."
        >
          <div className="space-y-5">
            {/* Quick Status Badges */}
            <div className="flex items-center gap-2">
              <Badge variant={selectedLog.status === "SUCCESS" || selectedLog.status === "Verified" ? "verified" : "failed"}>
                {selectedLog.status}
              </Badge>
              <Badge variant="neutral">{selectedLog.service}</Badge>
              {selectedLog.isCached || selectedLog.source === "CACHE" ? (
                <Badge variant="verified" size="sm">CACHE HIT</Badge>
              ) : (
                <Badge variant="neutral" size="sm">LIVE CALL</Badge>
              )}
            </div>

            {/* Overview Attributes */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2.5 text-xs text-slate-800">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-mono">REQUEST ID</span>
                <span className="text-slate-900 font-mono font-semibold">{selectedLog.id}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-mono">ROUTING</span>
                <span className="font-mono font-semibold text-slate-900">
                  {selectedLog.isCached || selectedLog.source === "CACHE"
                    ? "In-Memory Cache Hit"
                    : "Live Upstream Query"}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-mono">PROVIDER</span>
                <span className="text-slate-900 font-mono">{selectedLog.provider || "verixa_smart_cache"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-mono">LATENCY</span>
                <span className="text-slate-900 font-mono font-semibold">
                  {selectedLog.latencyMs ?? (selectedLog.isCached ? 12 : 142)}ms
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-mono">CHARGE</span>
                <span className="text-slate-900 font-mono font-semibold">
                  {selectedLog.costDeducted ?? (selectedLog.service === "NUBAN" ? 0 : selectedLog.isCached ? 20 : 50)} NGX
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-mono">IDEMPOTENCY</span>
                <span className="text-slate-600 font-mono">
                  {selectedLog.idempotencyKey || "None"}
                </span>
              </div>
            </div>

            {/* Normalized JSON Payload */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-700 block">Response Payload</span>
              <pre className="p-3.5 rounded-xl bg-slate-900 font-mono text-xs text-emerald-400 overflow-x-auto border border-slate-800 leading-relaxed shadow-xs">
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
