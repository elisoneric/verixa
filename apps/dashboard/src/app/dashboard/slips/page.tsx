"use client"

import * as React from "react"
import { Card, Button, Badge } from "@verixa/ui"
import { ApiClient } from "../../../lib/api"
import { useAuth } from "../../../lib/auth-context"

interface GeneratedSlip {
  nin: string
  trackingId: string
  fullName: string
  pdfBase64?: string
  docxBase64?: string
  cached: boolean
  cost: number
  latencyMs: number
  timestamp: string
}

export default function NinSlipGeneratorPage() {
  const { environment, refreshBalance } = useAuth()
  const [ninInput, setNinInput] = React.useState("")
  const [consent, setConsent] = React.useState(true)
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [currentSlip, setCurrentSlip] = React.useState<GeneratedSlip | null>(null)
  const [history, setHistory] = React.useState<GeneratedSlip[]>([])
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanNin = ninInput.replace(/\D/g, "")
    if (cleanNin.length !== 11) {
      setErrorMsg("Please enter a valid 11-digit NIN.")
      return
    }

    if (!consent) {
      setErrorMsg("Applicant consent is required to perform verification.")
      return
    }

    setErrorMsg(null)
    setIsGenerating(true)

    try {
      const res = await ApiClient.generateNinSlip(cleanNin, "both", consent)
      if (res.status === "success" && res.data) {
        const slipRecord: GeneratedSlip = {
          nin: cleanNin,
          trackingId: res.data.trackingId,
          fullName: res.data.fullName,
          pdfBase64: res.data.pdfBase64,
          docxBase64: res.data.docxBase64,
          cached: res.meta?.cached || false,
          cost: res.meta?.cost_ngx || 250,
          latencyMs: res.meta?.latency_ms || 120,
          timestamp: new Date().toLocaleTimeString(),
        }

        setCurrentSlip(slipRecord)
        setHistory((prev) => [slipRecord, ...prev.filter((h) => h.nin !== cleanNin)])
        refreshBalance()
      } else {
        throw new Error((res as any).message || "Failed to generate NIN slip")
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Slip generation failed. Please verify the NIN and balance.")
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadFile = (base64Data: string, filename: string, mimeType: string) => {
    try {
      const byteCharacters = atob(base64Data)
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-heading">
            Slip Generator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Generate standardized PDF and Word (.docx) identity slips.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs shadow-2xs self-start sm:self-center">
          <span className="text-slate-500 font-mono">RATE:</span>
          <span className="font-semibold text-slate-900 font-mono">₦250 / slip</span>
        </div>
      </div>

      {/* Main Generator Form */}
      <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white shadow-xs">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block">
              National Identification Number (NIN)
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  maxLength={11}
                  placeholder="Enter 11-digit NIN"
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
                disabled={isGenerating || ninInput.length !== 11 || !consent}
                className="shrink-0 px-6 py-2.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isGenerating ? "Generating..." : "Generate Slip (₦250)"}
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
              I confirm applicant consent has been obtained for identity verification and slip generation.
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

      {/* Generated Slip Result Preview & Downloads */}
      {currentSlip && (
        <div className="p-5 sm:p-6 rounded-2xl border border-emerald-200 bg-white shadow-xs space-y-5 text-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  {currentSlip.fullName}
                </h2>
                <Badge variant={currentSlip.cached ? "verified" : "neutral"} size="sm">
                  {currentSlip.cached ? "Cached" : "Live Registry"}
                </Badge>
              </div>
              <p className="text-xs font-mono text-slate-500 mt-1">
                NIN: {currentSlip.nin} {currentSlip.trackingId ? `• TRACKING: ${currentSlip.trackingId}` : ""}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {currentSlip.pdfBase64 && (
                <button
                  type="button"
                  onClick={() => downloadFile(currentSlip.pdfBase64!, `NIN_Slip_${currentSlip.nin}.pdf`, "application/pdf")}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download PDF</span>
                </button>
              )}
              {currentSlip.docxBase64 && (
                <button
                  type="button"
                  onClick={() => downloadFile(currentSlip.docxBase64!, `NIN_Slip_${currentSlip.nin}.docx`, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download Word</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick PDF Preview */}
          {currentSlip.pdfBase64 && (
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
              <iframe
                src={`data:application/pdf;base64,${currentSlip.pdfBase64}#toolbar=0&navpanes=0`}
                className="w-full h-[480px] border-none"
                title="NIN Slip Document Preview"
              />
            </div>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 1 && (
        <div className="p-5 rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-xs">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Recent Session Slips
          </h3>
          <div className="divide-y divide-slate-100">
            {history.slice(1).map((item) => (
              <div key={item.nin} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-900 mr-2">{item.fullName}</span>
                  <span className="font-mono text-slate-500">{item.nin}</span>
                </div>
                <div className="flex items-center gap-3">
                  {item.pdfBase64 && (
                    <button
                      type="button"
                      onClick={() => downloadFile(item.pdfBase64!, `NIN_Slip_${item.nin}.pdf`, "application/pdf")}
                      className="text-slate-700 hover:text-slate-900 underline font-medium cursor-pointer"
                    >
                      PDF
                    </button>
                  )}
                  {item.docxBase64 && (
                    <button
                      type="button"
                      onClick={() => downloadFile(item.docxBase64!, `NIN_Slip_${item.nin}.docx`, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
                      className="text-slate-700 hover:text-slate-900 underline font-medium cursor-pointer"
                    >
                      Word
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
