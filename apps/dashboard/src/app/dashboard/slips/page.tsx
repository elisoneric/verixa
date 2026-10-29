"use client"

import * as React from "react"
import { Badge } from "@verixa/ui"
import { ApiClient } from "../../../lib/api"
import { useAuth } from "../../../lib/auth-context"

interface GeneratedSlip {
  nin: string
  trackingId: string
  fullName: string
  photoBase64?: string
  slipType: "card" | "slip"
  pdfBase64?: string
  docxBase64?: string
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
  const [history, setHistory] = React.useState<GeneratedSlip[]>([])
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

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
    // Instantly retrieves citizen identity attributes from registry / cache
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
          docxBase64: d.docxBase64 || docRes.docxBase64,
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
        setHistory((prev) => [slipRecord, ...prev.filter((h) => h.nin !== cleanNin)])
        refreshBalance()
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
    } catch (err) {
      alert("Download failed. Please try again.")
    }
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-heading">
            NIMC Card & NIN Slip Generator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Generate official NIMC Direct ID-1 Cards and Standard Government NIN Slips with instant vector previews and download triggers.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-xs shadow-2xs self-start sm:self-center">
          <span className="text-emerald-700 font-mono font-medium">RATE:</span>
          <span className="font-semibold text-emerald-900 font-mono">₦250 / slip</span>
        </div>
      </div>

      {/* Slip Type Format Selector (Dual Toggle) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleFormatChange("card")}
          className={`flex items-start gap-3.5 p-4 rounded-xl border text-left transition-all cursor-pointer ${
            formatType === "card"
              ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/10"
              : "bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 shadow-xs"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              formatType === "card" ? "bg-white/10 text-emerald-400" : "bg-emerald-50 text-emerald-700"
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth={1.75} />
              <line x1="2" y1="10" x2="22" y2="10" strokeWidth={1.75} />
              <rect x="5" y="13" width="3" height="3" rx="0.5" fill="currentColor" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold tracking-tight">NIMC Direct (NIMC Card)</span>
              {formatType === "card" && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </div>
            <p className={`text-xs mt-1 leading-relaxed ${formatType === "card" ? "text-slate-300" : "text-slate-500"}`}>
              Premium ID-1 wallet card with Nigerian green guilloche, biometric portrait, gold accents & 2D QR Code.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleFormatChange("slip")}
          className={`flex items-start gap-3.5 p-4 rounded-xl border text-left transition-all cursor-pointer ${
            formatType === "slip"
              ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/10"
              : "bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 shadow-xs"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              formatType === "slip" ? "bg-white/10 text-emerald-400" : "bg-emerald-50 text-emerald-700"
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold tracking-tight">Standard NIN Slip</span>
              {formatType === "slip" && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </div>
            <p className={`text-xs mt-1 leading-relaxed ${formatType === "slip" ? "text-slate-300" : "text-slate-500"}`}>
              Official government paper slip format with residential address, tracking ID, and official tamper-proof PDF export.
            </p>
          </div>
        </button>
      </div>

      {/* Main Generator Form */}
      <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white shadow-xs">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block">
                National Identification Number (NIN)
              </label>
              {/* Quick Sandbox Fillers */}
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <span className="text-slate-400">Sandbox Test:</span>
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

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  maxLength={11}
                  placeholder="Enter 11-digit NIN (e.g. 70123456789)"
                  value={ninInput}
                  onChange={(e) => setNinInput(e.target.value.replace(/\D/g, ""))}
                  className="w-full h-11 px-4 rounded-lg bg-white border border-slate-200 text-slate-900 font-mono text-sm tracking-wider placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all shadow-2xs"
                  required
                />
                <span className="absolute right-3.5 top-3 text-xs font-mono text-slate-400">
                  {ninInput.length}/11
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || ninInput.length !== 11 || !consent}
                className="shrink-0 min-h-[44px] px-6 py-2.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Generating {formatType === "card" ? "Card" : "Slip"}...</span>
                  </>
                ) : (
                  <span>Generate {formatType === "card" ? "NIMC Card" : "NIN Slip"} (₦250)</span>
                )}
              </button>
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="consentCheckbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
            />
            <label htmlFor="consentCheckbox" className="text-xs text-slate-600 select-none cursor-pointer">
              I confirm applicant consent has been obtained for regulatory identity verification and official slip generation.
            </label>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}
        </form>
      </div>

      {/* STAGE 1: Optimistic UI Rendering (Instant Verified Identity Banner) */}
      {optimisticRecord && (
        <div className="p-5 sm:p-6 rounded-2xl border border-emerald-300/80 bg-linear-to-b from-emerald-50/60 to-white shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {/* Biometric Portrait Thumbnail */}
              {optimisticRecord.photoBase64 ? (
                <div className="w-14 h-16 rounded-lg overflow-hidden border-2 border-emerald-600 bg-slate-100 shrink-0 shadow-xs">
                  <img
                    src={optimisticRecord.photoBase64.startsWith("data:") ? optimisticRecord.photoBase64 : `data:image/jpeg;base64,${optimisticRecord.photoBase64}`}
                    alt="Citizen Biometric Portrait"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-14 h-16 rounded-lg border-2 border-emerald-600 bg-emerald-50 flex items-center justify-center shrink-0 text-emerald-700">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                    {optimisticRecord.fullName}
                  </h2>
                  <Badge variant="verified" size="sm" dot>
                    Registry Confirmed
                  </Badge>
                  {optimisticRecord.cached && (
                    <Badge variant="neutral" size="sm">
                      Smart Cache
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs font-mono text-slate-600">
                  <span>NIN: {optimisticRecord.nin}</span>
                  {optimisticRecord.trackingId && (
                    <span>• TRACKING: {optimisticRecord.trackingId}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Instant Download Triggers */}
            <div className="flex items-center gap-2">
              {currentSlip?.pdfBase64 && (
                <button
                  type="button"
                  onClick={() => downloadFile(
                    activePdfBase64 || currentSlip.pdfBase64!,
                    `${previewTab === "card" ? "NIMC_Digital_Card" : "NIN_Slip"}_${currentSlip.nin}.pdf`,
                    "application/pdf"
                  )}
                  className="min-h-[40px] px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download PDF ⚡</span>
                </button>
              )}
            </div>
          </div>

          {/* Optimistic Background Compilation Status Notice */}
          {optimisticRecord.isCompiling && (
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-emerald-100/70 text-emerald-900 text-xs font-medium border border-emerald-200">
              <svg className="w-4 h-4 animate-spin text-emerald-700 shrink-0" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>
                Verified identity rendered optimistically in {optimisticRecord.latencyMs}ms. Background service is synthesizing high-resolution vector security patterns and compiling PDF downloads...
              </span>
            </div>
          )}

          {/* STAGE 2: Interactive Vector SVG Preview */}
          {currentSlip && (
            <div className="space-y-3 pt-2">
              {/* Preview Format Switcher */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Vector Preview ({previewTab === "card" ? "NIMC Direct ID-1 Card" : "Standard NIN Slip"})
                </span>
                <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewTab("card")}
                    className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
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
                    className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                      previewTab === "slip"
                        ? "bg-white text-slate-900 shadow-2xs font-semibold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Standard Slip
                  </button>
                </div>
              </div>

              {/* Vector SVG Rendered Document Container */}
              {activeSvg ? (
                <div
                  className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 p-2 sm:p-4 flex items-center justify-center shadow-xs"
                  dangerouslySetInnerHTML={{ __html: activeSvg }}
                />
              ) : activePdfBase64 ? (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                  <iframe
                    src={`data:application/pdf;base64,${activePdfBase64}#toolbar=0&navpanes=0`}
                    className="w-full h-[480px] border-none"
                    title="Document Preview"
                  />
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* Session History */}
      {history.length > 0 && (
        <div className="p-5 rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Recent Session Records
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {history.length} {history.length === 1 ? "document" : "documents"} generated
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {history.map((item, idx) => (
              <div key={`${item.nin}-${idx}`} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 font-mono text-[11px] font-bold">
                    {item.slipType === "card" ? "ID" : "A4"}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 mr-2">{item.fullName}</span>
                    <span className="font-mono text-slate-500">{item.nin}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {item.pdfBase64 && (
                    <button
                      type="button"
                      onClick={() => downloadFile(
                        item.cardPdfBase64 || item.pdfBase64!,
                        `${item.slipType === "card" ? "NIMC_Digital_Card" : "NIN_Slip"}_${item.nin}.pdf`,
                        "application/pdf"
                      )}
                      className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      PDF
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
