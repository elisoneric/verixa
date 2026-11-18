"use client"

import * as React from "react"
import { Badge, Button, Card } from "@verixa/ui"
import { ApiClient } from "../../../lib/api"

export default function AdminSystemMonitorPage() {
  const [stats, setStats] = React.useState<Awaited<ReturnType<typeof ApiClient.getSystemMonitor>> | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isClearingCache, setIsClearingCache] = React.useState(false)
  const [isClearingSlips, setIsClearingSlips] = React.useState(false)
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null)

  const loadStats = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await ApiClient.getSystemMonitor()
      setStats(data)
    } catch (err: any) {
      setStatusMessage(err?.message || "Failed to load system monitor")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadStats()
  }, [loadStats])

  const handleClearCache = async () => {
    setIsClearingCache(true)
    setStatusMessage(null)
    try {
      const res = await ApiClient.clearSystemCache()
      setStatusMessage(`Cleared ${res.clearedRedisKeys} Redis keys and ${res.clearedMemoryEntries} in-memory entries.`)
      await loadStats()
    } catch (err: any) {
      setStatusMessage(err?.message || "Failed to clear cache")
    } finally {
      setIsClearingCache(false)
    }
  }

  const handleClearSlipBlobs = async () => {
    setIsClearingSlips(true)
    setStatusMessage(null)
    try {
      const res = await ApiClient.clearStoredSlipBlobs()
      setStatusMessage(`Cleaned stored slip/card blobs from ${res.clearedLogs} log records. Slips regenerate dynamically on download.`)
      await loadStats()
    } catch (err: any) {
      setStatusMessage(err?.message || "Failed to clear stored slip blobs")
    } finally {
      setIsClearingSlips(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">System Monitor & Cache</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Live Node.js API RAM, Redis cache usage, and stored NIN slip cleanup.
          </p>
        </div>
        <Button onClick={loadStats} variant="outline" size="sm" className="cursor-pointer">
          {isLoading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 text-xs font-mono">
          {statusMessage}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-5">
        {/* Node.js API Memory */}
        <Card className="p-5 bg-white border border-slate-200 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-700 font-mono">Node.js API RAM</span>
            <Badge variant="verified" size="sm">ACTIVE</Badge>
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">RSS Memory:</span>
              <span className="font-bold text-slate-900">{stats?.nodeMemory.rssMb ?? "—"} MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Heap Used / Total:</span>
              <span className="font-bold text-slate-900">
                {stats?.nodeMemory.heapUsedMb ?? "—"} / {stats?.nodeMemory.heapTotalMb ?? "—"} MB
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">External (Sharp/Buffers):</span>
              <span className="font-bold text-slate-900">{stats?.nodeMemory.externalMb ?? "—"} MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Uptime:</span>
              <span className="font-bold text-slate-900">{stats?.nodeMemory.uptimeSeconds ?? "—"}s</span>
            </div>
          </div>
        </Card>

        {/* Redis & In-Memory Cache */}
        <Card className="p-5 bg-white border border-slate-200 space-y-4 shadow-2xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-700 font-mono">Redis & Cache</span>
              <Badge variant={stats?.cache.redisConnected ? "verified" : "failed"} size="sm">
                {stats?.cache.redisConnected ? "CONNECTED" : "OFFLINE"}
              </Badge>
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Redis Used / Max:</span>
                <span className="font-bold text-slate-900">
                  {stats?.cache.usedMemoryHuman ?? "—"} / {stats?.cache.maxMemoryHuman ?? "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Redis Keys:</span>
                <span className="font-bold text-slate-900">{stats?.cache.totalKeys ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Node Fallback Entries:</span>
                <span className="font-bold text-slate-900">{stats?.cache.memoryFallbackEntries ?? "—"}</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleClearCache}
            disabled={isClearingCache}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer"
          >
            {isClearingCache ? "Clearing Cache..." : "Clear All Redis & Memory Cache"}
          </Button>
        </Card>

        {/* Stored NIN Slip & Card Blobs */}
        <Card className="p-5 bg-white border border-slate-200 space-y-4 shadow-2xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-700 font-mono">NIN Slip Storage</span>
              <Badge variant="info" size="sm">REGENERABLE</Badge>
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Slip/Card Logs:</span>
                <span className="font-bold text-slate-900">{stats?.slipLogs.totalSlipLogs ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Logs With Stored Payloads:</span>
                <span className="font-bold text-slate-900">{stats?.slipLogs.slipLogsWithPayloads ?? "—"}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Strips cached base64 PDFs, DOCX, SVGs, and card images from DB logs while keeping citizen fields so downloads regenerate on demand.
            </p>
          </div>

          <Button
            onClick={handleClearSlipBlobs}
            disabled={isClearingSlips}
            variant="outline"
            className="w-full border-slate-300 text-slate-900 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
          >
            {isClearingSlips ? "Clearing Slip Blobs..." : "Clear Stored NIN Slip Blobs"}
          </Button>
        </Card>
      </div>
    </div>
  )
}
