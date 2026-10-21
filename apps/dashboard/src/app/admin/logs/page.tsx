"use client"

import * as React from "react"
import { Badge, Button, Card, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyState, Input } from "@verixa/ui"
import { ApiClient } from "../../../lib/api"

export default function AdminLogsPage() {
  const [logs, setLogs] = React.useState<any[]>([])
  const [total, setTotal] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(true)
  const [page, setPage] = React.useState(0)
  const pageSize = 25

  // Filters
  const [serviceType, setServiceType] = React.useState("")
  const [status, setStatus] = React.useState("")
  const [searchOrg, setSearchOrg] = React.useState("")

  const fetchLogs = () => {
    setIsLoading(true)
    ApiClient.getAdminLogs({
      limit: pageSize,
      offset: page * pageSize,
      serviceType: serviceType || undefined,
      status: status || undefined,
      orgId: searchOrg || undefined,
    })
      .then((data) => {
        setLogs(data?.logs || [])
        setTotal(data?.total || 0)
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }

  React.useEffect(() => {
    fetchLogs()
  }, [page, serviceType, status])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Cluster Verification Logs</h1>
            <Badge variant="mono" size="sm">{total.toLocaleString()} EVENTS</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time multi-tenant verification audit trails, latency health, cache splits, and upstream routing.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchLogs}
          isLoading={isLoading}
          className="self-start sm:self-auto"
        >
          <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Feed
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 bg-white border border-slate-200 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-mono font-medium text-slate-500 uppercase block mb-1">
              Service Filter
            </label>
            <select
              value={serviceType}
              onChange={(e) => {
                setServiceType(e.target.value)
                setPage(0)
              }}
              className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
            >
              <option value="">All Verification Services</option>
              <option value="nin">NIN Standard Lookup</option>
              <option value="nin_advance">NIN Advance Demography</option>
              <option value="nin_slip">NIN Slip Generation</option>
              <option value="bvn">BVN Verification</option>
              <option value="nuban">NUBAN Resolution</option>
              <option value="cac">CAC Company Lookup</option>
              <option value="phone">Phone Search</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-mono font-medium text-slate-500 uppercase block mb-1">
              Status Filter
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(0)
              }}
              className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
            >
              <option value="">All Statuses</option>
              <option value="Success">Success (200 OK)</option>
              <option value="Failed">Failed (Error / Unmatched)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-mono font-medium text-slate-500 uppercase block mb-1">
              Tenant ID Search
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste Org UUID..."
                value={searchOrg}
                onChange={(e) => setSearchOrg(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setPage(0)
                    fetchLogs()
                  }
                }}
                className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setPage(0)
                  fetchLogs()
                }}
              >
                Filter
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Logs Table */}
      {logs.length === 0 && !isLoading ? (
        <EmptyState
          title="No verification events found"
          description="Try adjusting your filters or wait for tenant API traffic."
        />
      ) : (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Tenant Org</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Routing</TableHead>
                <TableHead>Latency</TableHead>
                <TableHead className="text-right">Billed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs text-slate-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">
                    <div>
                      <span>{log.orgName}</span>
                      <span className="block font-mono text-[10px] text-slate-400">
                        {log.orgId ? `${log.orgId.slice(0, 8)}…` : "—"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-300">
                      {log.serviceType.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={log.status === "Success" ? "verified" : "failed"}
                      size="sm"
                    >
                      {log.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {log.isCached ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        REDIS CACHE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500">
                        UPSTREAM LIVE
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    <span className={log.latencyMs < 200 ? "text-emerald-600 font-semibold" : "text-slate-600"}>
                      {log.latencyMs}ms
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-bold text-right text-slate-900">
                    {log.costDeducted > 0 ? `${log.costDeducted} NGX` : "FREE"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-2">
            <span>
              Showing {logs.length > 0 ? page * pageSize + 1 : 0} to{" "}
              {Math.min((page + 1) * pageSize, total)} of {total.toLocaleString()} records
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="xs"
                disabled={page === 0 || isLoading}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                &larr; Previous
              </Button>
              <span className="px-2 py-1 font-mono font-semibold text-slate-700">
                Page {page + 1} of {Math.max(1, totalPages)}
              </span>
              <Button
                variant="outline"
                size="xs"
                disabled={page + 1 >= totalPages || isLoading}
                onClick={() => setPage((p) => p + 1)}
              >
                Next &rarr;
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
