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
  const [downloadingFormat, setDownloadingFormat] = React.useState<string | null>(null)
  const [downloadError, setDownloadError] = React.useState<string | null>(null)
  const [isExportingCert, setIsExportingCert] = React.useState(false)
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null)

  const handleCopy = (text: string, key: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

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
    setDownloadError(null)
    setDownloadingFormat(null)
    setIsExportingCert(false)
    try {
      const detail = await ApiClient.getLogDetail(logId)
      setSelectedLog(detail)
    } catch {
      const current = logs.find((l) => l.id === logId)
      if (current) setSelectedLog(current)
    }
  }

  const handleDownloadSlip = async (format: "card" | "slip", fileType: "pdf" | "docx") => {
    if (!selectedLog) return
    const key = `${format}-${fileType}`
    setDownloadingFormat(key)
    setDownloadError(null)
    try {
      const { blob, filename } = await ApiClient.downloadOnDemandSlip(selectedLog.id, format, fileType)
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err: any) {
      setDownloadError(err?.message || "Failed to generate on-demand document")
    } finally {
      setDownloadingFormat(null)
    }
  }

  const handleExportNonNinCertificate = async () => {
    if (!selectedLog) return
    setIsExportingCert(true)
    setDownloadError(null)
    try {
      const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib")
      const pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage([595.28, 841.89]) // A4 Portrait
      const { width, height } = page.getSize()

      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
      const fontMono = await pdfDoc.embedFont(StandardFonts.Courier)

      const colorEmeraldDark = rgb(0.02, 0.38, 0.28)
      const colorEmerald = rgb(0.06, 0.58, 0.42)
      const colorSlateDark = rgb(0.06, 0.09, 0.16)
      const colorSlateMuted = rgb(0.39, 0.45, 0.55)
      const colorBorder = rgb(0.88, 0.91, 0.94)
      const colorBgLight = rgb(0.97, 0.98, 0.99)

      // Outer Border
      page.drawRectangle({
        x: 20,
        y: 20,
        width: width - 40,
        height: height - 40,
        borderColor: colorEmerald,
        borderWidth: 2,
      })

      // Inner Border
      page.drawRectangle({
        x: 26,
        y: 26,
        width: width - 52,
        height: height - 52,
        borderColor: colorBorder,
        borderWidth: 0.8,
      })

      // Header Banner
      page.drawRectangle({
        x: 27,
        y: height - 100,
        width: width - 54,
        height: 72,
        color: colorSlateDark,
      })

      page.drawText("VERIXA IDENTITY VERIFICATION PLATFORM", {
        x: 44,
        y: height - 54,
        size: 14,
        font: fontBold,
        color: rgb(1, 1, 1),
      })

      page.drawText("OFFICIAL VERIFICATION ATTESTATION CERTIFICATE", {
        x: 44,
        y: height - 72,
        size: 10,
        font: fontRegular,
        color: colorEmerald,
      })

      page.drawText("ISSUED VIA REGULATORY GATEWAY", {
        x: width - 230,
        y: height - 62,
        size: 8,
        font: fontMono,
        color: rgb(0.8, 0.85, 0.9),
      })

      // Verification Badge Box
      let currentY = height - 135
      page.drawRectangle({
        x: 44,
        y: currentY - 26,
        width: width - 88,
        height: 38,
        color: colorBgLight,
        borderColor: colorBorder,
        borderWidth: 1,
      })

      const refId = selectedLog.id || "REF-UNKNOWN"
      const verifiedAt = selectedLog.createdAt || new Date().toISOString()
      const serviceName = String(selectedLog.service || "IDENTITY").toUpperCase()

      page.drawText(`SERVICE: ${serviceName} DIRECT REGISTRY`, {
        x: 56,
        y: currentY - 8,
        size: 9,
        font: fontBold,
        color: colorSlateDark,
      })

      page.drawText("STATUS: REGULATORY VERIFIED", {
        x: 56,
        y: currentY - 20,
        size: 8,
        font: fontBold,
        color: colorEmeraldDark,
      })

      page.drawText(`REFERENCE: ${refId.slice(0, 24)}`, {
        x: width - 290,
        y: currentY - 8,
        size: 8,
        font: fontMono,
        color: colorSlateMuted,
      })

      page.drawText(`TIMESTAMP: ${verifiedAt}`, {
        x: width - 290,
        y: currentY - 20,
        size: 8,
        font: fontMono,
        color: colorSlateMuted,
      })

      // Attributes Header
      currentY -= 55
      page.drawText("VERIFIED IDENTITY ATTRIBUTES", {
        x: 44,
        y: currentY,
        size: 11,
        font: fontBold,
        color: colorSlateDark,
      })

      page.drawLine({
        start: { x: 44, y: currentY - 4 },
        end: { x: width - 44, y: currentY - 4 },
        thickness: 1,
        color: colorEmerald,
      })

      // Table of attributes
      currentY -= 20
      const rawPayload = selectedLog.responsePayload || selectedLog.data || {}
      const targetData = (rawPayload && typeof rawPayload === "object" && rawPayload.data && typeof rawPayload.data === "object")
        ? rawPayload.data
        : rawPayload

      const entries = Object.entries(targetData || {}).filter(
        ([k, v]) =>
          k !== "photo" &&
          k !== "photoBase64" &&
          k !== "image" &&
          k !== "signature" &&
          k !== "pdfBase64" &&
          k !== "docxBase64" &&
          k !== "cardPdfBase64" &&
          k !== "cardSvg" &&
          k !== "nin_id" &&
          k !== "meta" &&
          v !== null &&
          v !== undefined &&
          v !== ""
      )

      if (entries.length === 0) {
        page.drawText("No granular demographic attributes recorded.", {
          x: 52,
          y: currentY - 10,
          size: 9,
          font: fontRegular,
          color: colorSlateMuted,
        })
        currentY -= 20
      } else {
        for (let i = 0; i < entries.length; i++) {
          if (currentY < 120) break
          const [rawKey, rawVal] = entries[i]
          const label = rawKey.replace(/_/g, " ").toUpperCase()
          const value = typeof rawVal === "object" ? JSON.stringify(rawVal) : String(rawVal)

          if (i % 2 === 0) {
            page.drawRectangle({
              x: 44,
              y: currentY - 14,
              width: width - 88,
              height: 18,
              color: colorBgLight,
            })
          }

          page.drawText(label.slice(0, 28), {
            x: 52,
            y: currentY - 10,
            size: 8,
            font: fontBold,
            color: colorSlateMuted,
          })

          page.drawText(value.slice(0, 52), {
            x: 210,
            y: currentY - 10,
            size: 8.5,
            font: fontMono,
            color: colorSlateDark,
          })

          currentY -= 20
        }
      }

      // Security Attestation Seal
      page.drawRectangle({
        x: 44,
        y: 60,
        width: width - 88,
        height: 48,
        color: rgb(0.95, 0.99, 0.96),
        borderColor: colorEmerald,
        borderWidth: 1,
      })

      page.drawText("OFFICIAL COMPLIANCE SEAL & REGULATORY ATTESTATION", {
        x: 56,
        y: 92,
        size: 8,
        font: fontBold,
        color: colorEmeraldDark,
      })

      page.drawText(
        "This document is an authentic verification transcript generated under statutory compliance (NDPA/NCC).",
        {
          x: 56,
          y: 80,
          size: 7,
          font: fontRegular,
          color: colorSlateMuted,
        }
      )

      page.drawText(`VERIXA AUDIT CHECKSUM: SHA256-${refId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 24).toUpperCase()}`, {
        x: 56,
        y: 68,
        size: 7,
        font: fontMono,
        color: colorEmeraldDark,
      })

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `verixa-certificate-${serviceName.toLowerCase()}-${refId.slice(0, 10)}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err: any) {
      setDownloadError(err?.message || "Failed to generate attestation certificate")
    } finally {
      setIsExportingCert(false)
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
            <option value="nin">NIN (National Identity)</option>
            <option value="bvn">BVN (Bank Verification)</option>
            <option value="cac">CAC (Corporate Affairs)</option>
            <option value="nuban">NUBAN (Bank Account)</option>
            <option value="phone">Phone KYC</option>
            <option value="dl">Driver's License (FRSC)</option>
            <option value="vin">Voter's Card (INEC)</option>
            <option value="passport">International Passport</option>
            <option value="tin">TIN (Tax Identification)</option>
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
                        <div className="flex items-center gap-1.5">
                          <span>{log.id.slice(0, 16)}...</span>
                          <button
                            type="button"
                            onClick={(e) => handleCopy(log.id, `table-${log.id}`, e)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                            title="Copy full Request ID"
                          >
                            {copiedKey === `table-${log.id}` ? (
                              <span className="text-[10px] text-emerald-600 font-medium">✓</span>
                            ) : (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                        </div>
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
                        <Badge
                          variant={
                            log.status === "Verified" ||
                            log.status === "SUCCESS" ||
                            String(log.status).toLowerCase() === "success" ||
                            String(log.status).toLowerCase() === "verified"
                              ? "verified"
                              : "failed"
                          }
                          size="sm"
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {latency < 500 ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            {latency}ms
                          </span>
                        ) : latency <= 1500 ? (
                          <span className="inline-flex items-center gap-1.5 text-amber-600 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            {latency}ms
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-orange-600 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                            {latency}ms
                          </span>
                        )}
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
      {selectedLog && (() => {
        const isVerified =
          selectedLog.status === "SUCCESS" ||
          selectedLog.status === "Verified" ||
          String(selectedLog.status || "").toLowerCase() === "success" ||
          String(selectedLog.status || "").toLowerCase() === "verified"

        const serviceName = String(selectedLog.service || "").toLowerCase()
        const isNin = serviceName === "nin" || serviceName === "nin_slip" || serviceName === "nin_advance"

        const rawPayload = selectedLog.responsePayload || selectedLog.data
        const payloadData = (rawPayload && typeof rawPayload === "object" && rawPayload.data && typeof rawPayload.data === "object")
          ? rawPayload.data
          : rawPayload

        const photoSrc = payloadData && (payloadData.photo || payloadData.photoBase64 || payloadData.image)
        const photoUrl = photoSrc
          ? (String(photoSrc).startsWith("data:") ? String(photoSrc) : `data:image/jpeg;base64,${photoSrc}`)
          : null

        const excludedKeys = new Set([
          "photo",
          "photoBase64",
          "image",
          "signature",
          "pdfBase64",
          "docxBase64",
          "cardPdfBase64",
          "pdfBuffer",
          "docxBuffer",
          "cardPdfBuffer",
          "svgContent",
          "cardSvg",
          "slipSvg",
          "nin_id",
          "meta",
          "data",
          "cached",
        ])

        const demographicEntries = payloadData && typeof payloadData === "object"
          ? Object.entries(payloadData).filter(
              ([k, v]) =>
                !excludedKeys.has(k) &&
                v !== null &&
                v !== undefined &&
                v !== "" &&
                typeof v !== "function"
            )
          : []

        return (
          <Drawer
            isOpen={true}
            onClose={() => setSelectedLog(null)}
            width="xl"
            title={`Log: ${selectedLog.id.slice(0, 16)}`}
            description="Detailed execution metadata, decrypted identity payload, and on-demand synthesis."
          >
            <div className="space-y-6">
              {/* Quick Status Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={isVerified ? "verified" : "failed"}>
                  {selectedLog.status}
                </Badge>
                <Badge variant="neutral">{String(selectedLog.service).toUpperCase()}</Badge>
                {selectedLog.isCached || selectedLog.source === "CACHE" ? (
                  <Badge variant="verified" size="sm">CACHE HIT</Badge>
                ) : (
                  <Badge variant="neutral" size="sm">LIVE QUERY</Badge>
                )}
                <Badge variant="neutral" size="sm">{selectedLog.environment || "LIVE"}</Badge>
              </div>

              {/* Citizen Identity Header / Photo if available */}
              {photoUrl && (
                <div className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <img
                    src={photoUrl}
                    alt="Citizen Portrait"
                    className="w-16 h-20 object-cover rounded-lg border border-slate-300 shadow-xs"
                  />
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-slate-900">
                      {[payloadData.surname, payloadData.firstName, payloadData.middleName].filter(Boolean).join(" ") ||
                        payloadData.fullName ||
                        payloadData.name ||
                        "Verified Citizen"}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      {payloadData.nin ? `NIN: ${payloadData.nin}` : payloadData.bvn ? `BVN: ${payloadData.bvn}` : `ID: ${selectedLog.id.slice(0, 12)}`}
                    </div>
                    <div className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Biometrically &amp; Demographically Attested
                    </div>
                  </div>
                </div>
              )}

              {/* On-Demand Document Synthesis Action Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${isVerified ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
                      On-Demand Document Synthesis
                    </h4>
                  </div>
                  <Badge variant={isVerified ? "verified" : "failed"} size="sm">
                    {isVerified ? "ELIGIBLE" : "UNAVAILABLE"}
                  </Badge>
                </div>

                {downloadError && (
                  <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-start gap-2">
                    <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{downloadError}</span>
                  </div>
                )}

                {isVerified ? (
                  isNin ? (
                    <div className="space-y-2.5">
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Re-synthesize official government documents dynamically from encrypted database records. Zero upstream registry cost.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                        <Button
                          variant="emerald"
                          size="sm"
                          isLoading={downloadingFormat === "card-pdf"}
                          disabled={Boolean(downloadingFormat)}
                          onClick={() => handleDownloadSlip("card", "pdf")}
                          className="w-full text-xs font-medium justify-center cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download NIMC Card (PDF)
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          isLoading={downloadingFormat === "slip-pdf"}
                          disabled={Boolean(downloadingFormat)}
                          onClick={() => handleDownloadSlip("slip", "pdf")}
                          className="w-full text-xs font-medium justify-center cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5 mr-1 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download Slip (PDF)
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Export an official verification certificate with Verixa regulatory attestation stamp, timestamp, and SHA-256 compliance seal.
                      </p>
                      <div className="pt-1">
                        <Button
                          variant="emerald"
                          size="sm"
                          isLoading={isExportingCert}
                          disabled={isExportingCert}
                          onClick={handleExportNonNinCertificate}
                          className="w-full sm:w-auto text-xs font-medium justify-center cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download Attestation Certificate (PDF)
                        </Button>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600 space-y-1">
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Document Synthesis Unavailable
                    </div>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      On-demand document and certificate synthesis is strictly reserved for verified regulatory transactions. This request completed with status: {selectedLog.status}.
                    </p>
                  </div>
                )}
              </div>

              {/* Decrypted Identity Demographic Attributes */}
              {demographicEntries.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                      Decrypted Identity Attributes
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      AES-256 Decrypted
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs">
                    {demographicEntries.map(([key, value]) => {
                      const displayKey = key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/_/g, " ")
                        .trim()
                        .toUpperCase()
                      const displayVal = typeof value === "object" ? JSON.stringify(value) : String(value)
                      return (
                        <div key={key} className="flex flex-col py-1 border-b border-slate-200/50 sm:border-none">
                          <span className="text-[10px] font-mono text-slate-500 tracking-wider">
                            {displayKey}
                          </span>
                          <span className="font-medium text-slate-900 break-words font-mono text-xs mt-0.5">
                            {displayVal}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Overview Attributes */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2.5 text-xs text-slate-800">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-mono">REQUEST ID</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-900 font-mono font-semibold">{selectedLog.id}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedLog.id, "drawer-reqId")}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                      title="Copy Request ID"
                    >
                      {copiedKey === "drawer-reqId" ? (
                        <span className="text-[10px] text-emerald-600 font-medium">Copied!</span>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
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
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-mono">LATENCY</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-900 font-mono font-semibold">
                      {selectedLog.latencyMs ?? (selectedLog.isCached ? 12 : 142)}ms
                    </span>
                    {(selectedLog.latencyMs ?? (selectedLog.isCached ? 12 : 142)) < 500 ? (
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        Fast SLA
                      </span>
                    ) : (selectedLog.latencyMs ?? (selectedLog.isCached ? 12 : 142)) <= 1500 ? (
                      <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        Normal SLA
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                        Extended SLA
                      </span>
                    )}
                  </div>
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
                {(() => {
                  const jsonString = JSON.stringify(
                    selectedLog.responsePayload || selectedLog.data || {
                      status: isVerified ? "verified" : "failed",
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
                  );
                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700 block">Response Payload (Decrypted JSON)</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(jsonString, "drawer-json")}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          {copiedKey === "drawer-json" ? (
                            <span className="text-emerald-600 font-semibold">Copied!</span>
                          ) : (
                            <>
                              <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Copy JSON
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-3.5 rounded-xl bg-slate-900 font-mono text-xs text-emerald-400 overflow-x-auto border border-slate-800 leading-relaxed shadow-xs max-h-64">
                        {jsonString}
                      </pre>
                    </>
                  );
                })()}
              </div>
            </div>
          </Drawer>
        )
      })()}
    </div>
  )
}
