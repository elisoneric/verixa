"use client"

import * as React from "react"
import { Badge } from "@verixa/ui"
import { ApiClient, VerificationLogItem } from "../../../lib/api"
import { useAuth } from "../../../lib/auth-context"

interface GeneratedSlip {
  nin: string
  trackingId: string
  fullName: string
  photoBase64?: string
  slipType: "card" | "slip"
  pdfBase64?: string
  cardPdfBase64?: string
  cardSvg?: string
  slipSvg?: string
  svgContent?: string
  cached: boolean
  cost: number
  latencyMs: number
  timestamp: string
}

interface OptimisticIdentity {
  nin: string
  trackingId: string
  fullName: string
  firstName?: string
  surname?: string
  photoBase64?: string
  cached: boolean
  isCompiling: boolean
  latencyMs: number
}

export default function NinSlipGeneratorPage() {
  const { environment, refreshBalance } = useAuth()
  const [ninInput, setNinInput] = React.useState("")
  const [consent, setConsent] = React.useState(true)
  const [formatType, setFormatType] = React.useState<"card" | "slip">("card")
  const [previewTab, setPreviewTab] = React.useState<"card" | "slip">("card")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [optimisticRecord, setOptimisticRecord] = React.useState<OptimisticIdentity | null>(null)
  const [currentSlip, setCurrentSlip] = React.useState<GeneratedSlip | null>(null)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  // Persistent History from Database
  const [historyLogs, setHistoryLogs] = React.useState<VerificationLogItem[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = React.useState(true)
  const [downloadingLogId, setDownloadingLogId] = React.useState<string | null>(null)

  const loadHistory = React.useCallback(async () => {
    try {
      const res = await ApiClient.getLogs({ service: "nin_slip", limit: 10 })
      if (res && res.items) {
        setHistoryLogs(res.items)
      }
    } catch (err) {
      console.warn("Could not load slip history", err)
    } finally {
      setIsLoadingHistory(false)
    }
  }, [])

  React.useEffect(() => {
    loadHistory()
  }, [loadHistory, environment])

  // Keep preview tab in sync with format type when user switches
  const handleFormatChange = (newFormat: "card" | "slip") => {
    setFormatType(newFormat)
    setPreviewTab(newFormat)
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanNin = ninInput.replace(/\D/g, "")
    if (cleanNin.length !== 11) {
      setErrorMsg("Please enter a valid 11-digit NIN.")
      return
    }

    if (!consent) {
      setErrorMsg("Applicant consent is required to perform regulatory verification.")
      return
    }

    setErrorMsg(null)
    setIsSubmitting(true)

    // STAGE 1: Fast Optimistic Lookup (<300ms)
    try {
      const lookupPromise = ApiClient.lookupNinIdentity(cleanNin, consent)
      const docGenPromise = ApiClient.generateNinSlip(cleanNin, formatType, consent, {
        cardType: formatType,
        fileType: "both",
      })

      // Handle Stage 1 response as soon as it resolves
      lookupPromise
        .then((lookupRes) => {
          if (lookupRes && lookupRes.data) {
            setOptimisticRecord({
              nin: cleanNin,
              trackingId: lookupRes.data.trackingId || lookupRes.trackingId || "",
              fullName: lookupRes.data.fullName || lookupRes.fullName || "VERIFIED CITIZEN",
              firstName: lookupRes.data.firstName,
              surname: lookupRes.data.surname,
              photoBase64: lookupRes.data.photoBase64 || lookupRes.photoBase64,
              cached: lookupRes.meta?.cached || false,
              isCompiling: true,
              latencyMs: lookupRes.meta?.latency_ms || 110,
            })
          }
        })
        .catch(() => {
          // If lookup fails standalone, fallback gracefully to full document response
        })

      // STAGE 2: Full Document Compilation Resolution
      const docRes = await docGenPromise

      if (docRes && (docRes.status === "success" || docRes.success)) {
        const d = docRes.data || docRes
        const fullName = d.fullName || docRes.fullName || "VERIFIED CITIZEN"
        const trackingId = d.trackingId || docRes.trackingId || ""
        const photoBase64 = d.photoBase64 || docRes.photoBase64

        const slipRecord: GeneratedSlip = {
          nin: cleanNin,
          trackingId,
          fullName,
          photoBase64,
          slipType: formatType,
          pdfBase64: d.pdfBase64 || docRes.pdfBase64,
          cardPdfBase64: d.cardPdfBase64 || docRes.cardPdfBase64,
          cardSvg: d.cardSvg || docRes.cardSvg,
          slipSvg: d.slipSvg || docRes.slipSvg,
          svgContent: d.svgContent || docRes.svgContent,
          cached: docRes.meta?.cached || false,
          cost: docRes.meta?.cost_ngx || 250,
          latencyMs: docRes.meta?.latency_ms || 140,
          timestamp: new Date().toLocaleTimeString(),
        }

        setCurrentSlip(slipRecord)
        setPreviewTab(formatType)
        setOptimisticRecord({
          nin: cleanNin,
          trackingId,
          fullName,
          photoBase64,
          cached: docRes.meta?.cached || false,
          isCompiling: false,
          latencyMs: docRes.meta?.latency_ms || 140,
        })
        refreshBalance()
        loadHistory()
      } else {
        throw new Error((docRes as any)?.message || "Failed to generate NIN slip")
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Slip generation failed. Please verify the NIN and balance.")
      setOptimisticRecord(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Instant zero-network client-side file download
  const downloadFile = (base64Data: string, filename: string, mimeType: string) => {
    try {
      const cleanData = base64Data.includes("base64,") ? base64Data.split("base64,")[1] : base64Data
      const byteCharacters = atob(cleanData)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch {
      alert("Download failed. Please try again.")
    }
  }

  // On-demand historical PDF download
  const handleDownloadHistorical = async (logItem: VerificationLogItem) => {
    setDownloadingLogId(logItem.id)
    try {
      const format = (logItem.format === "card" ? "card" : "slip") as "card" | "slip"
      const { blob, filename } = await ApiClient.downloadHistoricalSlip(logItem.id, format)
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err: any) {
      alert(err.message || "Failed to download historical document.")
    } finally {
      setDownloadingLogId(null)
    }
  }

  // Print current preview
  const handlePrint = () => {
    window.print()
  }

  // Active SVG content based on selected preview tab
  const activeSvg = previewTab === "card" 
    ? (currentSlip?.cardSvg || currentSlip?.svgContent) 
    : (currentSlip?.slipSvg || currentSlip?.svgContent)

  const activePdfBase64 = previewTab === "card"
    ? (currentSlip?.cardPdfBase64 || currentSlip?.pdfBase64)
    : currentSlip?.pdfBase64

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header - Clean & Minimal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-heading">
            NIN Slips & NIMC Cards
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Instant official NIMC ID-1 wallet cards and standard paper slips.
          </p>
        </div>

        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/80 text-xs self-start sm:self-center">
          <span className="text-emerald-700 font-mono font-medium text-[11px]">RATE:</span>
          <span className="font-semibold text-emerald-900 font-mono text-xs">₦250 / document</span>
        </div>
      </div>

      {/* Segmented Format Selector (Zero wordy copy) */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
        <button
          type="button"
          onClick={() => handleFormatChange("card")}
          className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            formatType === "card"
              ? "bg-white text-slate-900 shadow-xs border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth={1.8} />
            <line x1="2" y1="10" x2="22" y2="10" strokeWidth={1.8} />
            <rect x="5" y="13" width="3" height="3" rx="0.5" fill="currentColor" />
          </svg>
          <span>NIMC Card (ID-1)</span>
        </button>

        <button
          type="button"
          onClick={() => handleFormatChange("slip")}
          className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            formatType === "slip"
              ? "bg-white text-slate-900 shadow-xs border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Standard Slip (A4)</span>
        </button>
      </div>

      {/* Main Generator Form */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
        <form onSubmit={handleGenerate} className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block">
                National Identification Number
              </label>
              {/* Quick Sandbox Fillers */}
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <span className="text-slate-400">Sample:</span>
                <button
                  type="button"
                  onClick={() => setNinInput("70123456789")}
                  className="font-mono text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                >
                  70123456789
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setNinInput("11234567890")}
                  className="font-mono text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                >
                  11234567890
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <input
                  type="text"
                  maxLength={11}
                  placeholder="Enter 11-digit NIN"
                  value={ninInput}
                  onChange={(e) => setNinInput(e.target.value.replace(/\D/g, ""))}
                  className="w-full h-10 px-3.5 rounded-lg bg-white border border-slate-200 text-slate-900 font-mono text-sm tracking-wider placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all shadow-2xs"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs font-mono text-slate-400">
                  {ninInput.length}/11
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || ninInput.length !== 11 || !consent}
                className="shrink-0 min-h-[40px] px-5 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Generating...</span>
                  </>
                ) : (
                  <span>Generate · ₦250</span>
                )}
              </button>
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="flex items-center gap-2 pt-0.5">
            <input
              type="checkbox"
              id="consentCheckbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
            />
            <label htmlFor="consentCheckbox" className="text-[11px] text-slate-600 select-none cursor-pointer">
              I confirm applicant consent has been obtained for regulatory verification and official slip generation.
            </label>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}
        </form>
      </div>

      {/* Optimistic UI Rendering & Preview Card */}
      {optimisticRecord && (
        <div className="p-4 sm:p-5 rounded-2xl border border-emerald-300/80 bg-white shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              {optimisticRecord.photoBase64 ? (
                <div className="w-12 h-14 rounded-lg overflow-hidden border border-emerald-500 bg-slate-100 shrink-0 shadow-2xs">
                  <img
                    src={optimisticRecord.photoBase64.startsWith("data:") ? optimisticRecord.photoBase64 : `data:image/jpeg;base64,${optimisticRecord.photoBase64}`}
                    alt="Portrait"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-14 rounded-lg border border-emerald-500 bg-emerald-50 flex items-center justify-center shrink-0 text-emerald-700">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">
                    {optimisticRecord.fullName}
                  </h2>
                  <Badge variant="verified" size="sm" dot>
                    Verified
                  </Badge>
                  {optimisticRecord.cached && (
                    <Badge variant="neutral" size="sm">
                      Cached
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs font-mono text-slate-500">
                  <span>NIN: {optimisticRecord.nin}</span>
                  {optimisticRecord.trackingId && (
                    <span>• {optimisticRecord.trackingId}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons & Micro Status Pill */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              {optimisticRecord.isCompiling ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-mono font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Compiling PDF...
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-mono font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Ready ({optimisticRecord.latencyMs}ms)
                </span>
              )}

              {currentSlip?.pdfBase64 && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => downloadFile(
                      activePdfBase64 || currentSlip.pdfBase64!,
                      `${previewTab === "card" ? "NIMC_Digital_Card" : "NIN_Slip"}_${currentSlip.nin}.pdf`,
                      "application/pdf"
                    )}
                    className="h-8 px-3 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Download PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="h-8 px-2.5 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    <span>Print</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Vector SVG Preview */}
          {currentSlip && (
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 font-mono">
                  Preview: {previewTab === "card" ? "ID-1 Wallet Card" : "Standard A4 Slip"}
                </span>
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewTab("card")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                      previewTab === "card"
                        ? "bg-white text-slate-900 shadow-2xs font-semibold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    NIMC Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab("slip")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                      previewTab === "slip"
                        ? "bg-white text-slate-900 shadow-2xs font-semibold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Standard Slip
                  </button>
                </div>
              </div>

              {activeSvg ? (
                <div
                  className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-2 sm:p-4 flex items-center justify-center shadow-2xs"
                  dangerouslySetInnerHTML={{ __html: activeSvg }}
                />
              ) : activePdfBase64 ? (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                  <iframe
                    src={`data:application/pdf;base64,${activePdfBase64}#toolbar=0&navpanes=0`}
                    className="w-full h-[450px] border-none"
                    title="Document Preview"
                  />
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* Persistent History (From Database) */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono">
              Generated Documents History
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Encrypted audit records with instant on-demand vector PDF regeneration.
            </p>
          </div>
          <button
            type="button"
            onClick={loadHistory}
            className="text-[11px] text-slate-600 hover:text-slate-900 font-medium hover:underline cursor-pointer flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>

        {isLoadingHistory ? (
          <div className="py-6 text-center text-xs text-slate-400">Loading history...</div>
        ) : historyLogs.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
            No NIN slips generated yet. Generate a card or slip above to see persistent records.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {historyLogs.map((item) => (
              <div
                key={item.id}
                className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 font-mono text-[10px] font-bold">
                    {item.format === "card" ? "ID" : "A4"}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">
                        {item.format === "card" ? "NIMC Card (ID-1)" : "Standard NIN Slip"}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {item.identifier || item.id.slice(0, 8)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{new Date(item.createdAt).toLocaleString()}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-medium">₦{item.costDeducted || 250}</span>
                      {item.isCached && <span>• Cached</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDownloadHistorical(item)}
                    disabled={downloadingLogId === item.id}
                    className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    {downloadingLogId === item.id ? (
                      <>
                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Synthesizing...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Download PDF</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
