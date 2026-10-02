"use client"

import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Badge } from "@verixa/ui"
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
  const { environment, balance, refreshBalance } = useAuth()
  const [ninInput, setNinInput] = React.useState("")
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [currentSlip, setCurrentSlip] = React.useState<GeneratedSlip | null>(null)
  const [history, setHistory] = React.useState<GeneratedSlip[]>([])
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanNin = ninInput.replace(/\D/g, "")
    if (cleanNin.length !== 11) {
      setErrorMsg("Please enter a valid 11-digit Nigerian National Identification Number.")
      return
    }

    setErrorMsg(null)
    setIsGenerating(true)

    try {
      const res = await ApiClient.generateNinSlip(cleanNin, "both")
      if (res.status === "success" && res.data) {
        const slipRecord: GeneratedSlip = {
          nin: cleanNin,
          trackingId: res.data.trackingId,
          fullName: res.data.fullName,
          pdfBase64: res.data.pdfBase64,
          docxBase64: res.data.docxBase64,
          cached: res.meta?.cached || false,
          cost: res.meta?.cost_ngx || 270,
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
      setErrorMsg(err.message || "Slip generation failed. Please check wallet balance or try again.")
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
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">NIN Slip Generator</h1>
            <Badge variant="verified" size="sm">NIMC DUAL-SLIP STANDARD</Badge>
            <Badge variant="mono" size="sm">NO QR CODE</Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Generate official Nigerian National Identity Number Slips (NINS) in print-ready PDF and editable Word (.docx) formats.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
          <span className="text-zinc-500 font-mono">RATE:</span>
          <span className="font-semibold text-emerald-400 font-mono">₦270 Live</span>
          <span className="text-zinc-600">•</span>
          <span className="text-amber-400 font-mono">₦50 Cache</span>
        </div>
      </div>

      {/* Main Generator Form */}
      <Card className="bg-zinc-900/60 border-zinc-800 p-6">
        <form onSubmit={handleGenerate} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              National Identification Number (NIN)
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  maxLength={11}
                  placeholder="Enter 11-digit NIN (e.g. 49201829481)"
                  value={ninInput}
                  onChange={(e) => setNinInput(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white font-mono text-sm tracking-widest placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-mono text-zinc-500">
                  {ninInput.length}/11
                </span>
              </div>

              <Button
                type="submit"
                variant="emerald"
                disabled={isGenerating || ninInput.length !== 11}
                className="shrink-0 px-6 font-semibold"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-900 border-t-white" />
                    Querying NIMC & Rendering...
                  </span>
                ) : (
                  "Generate Official NIN Slip (₦270)"
                )}
              </Button>
            </div>
          </div>

          {/* Official NIMC Compliance Notice */}
          <div className="p-3.5 rounded-lg bg-zinc-950/70 border border-zinc-800/80 text-xs text-zinc-400 space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-zinc-200">
              <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Automated Official Portrait Retrieval (Zero Upload Compliance)</span>
            </div>
            <p>
              In accordance with federal identity guidelines, applicant photos are automatically fetched from official registry databases via <strong>NIN Advance</strong>. Manual photo upload is prohibited to guarantee document authenticity.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-medium">
              ✕ {errorMsg}
            </div>
          )}
        </form>
      </Card>

      {/* Generated Slip Result Preview & Downloads */}
      {currentSlip && (
        <div className="space-y-4">
          <Card className="bg-zinc-900/80 border-emerald-500/30 p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-zinc-800 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 text-lg font-bold">✓</span>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {currentSlip.fullName}
                  </h3>
                  <Badge variant={currentSlip.cached ? "verified" : "mono"} size="sm">
                    {currentSlip.cached ? "SMART CACHE HIT (₦50)" : "LIVE UPSTREAM (₦270)"}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-400 mt-1 font-mono">
                  NIN: <span className="text-zinc-200">{currentSlip.nin}</span> • Tracking ID:{" "}
                  <span className="text-emerald-400">{currentSlip.trackingId}</span> • Generated in {currentSlip.latencyMs}ms
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                {currentSlip.pdfBase64 && (
                  <Button
                    onClick={() => downloadFile(currentSlip.pdfBase64!, `NIN_Slip_${currentSlip.nin}.pdf`, "application/pdf")}
                    variant="emerald"
                    size="sm"
                    className="flex items-center gap-2 font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Official PDF
                  </Button>
                )}

                {currentSlip.docxBase64 && (
                  <Button
                    onClick={() => downloadFile(currentSlip.docxBase64!, `NIN_Slip_${currentSlip.nin}.docx`, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 text-xs"
                  >
                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Word (.docx)
                  </Button>
                )}
              </div>
            </div>

            {/* Embedded Live PDF Document View */}
            {currentSlip.pdfBase64 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Standard NIMC A4 Dual-Slip Layout</span>
                  <span className="font-mono text-zinc-500">Page 1 of 1 • 595 × 842 pt</span>
                </div>
                <div className="w-full rounded-lg border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
                  <iframe
                    src={`data:application/pdf;base64,${currentSlip.pdfBase64}#toolbar=0&navpanes=0`}
                    className="w-full h-[650px] border-none"
                    title="NIN Slip Preview"
                  />
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Recent Slips Session History */}
      {history.length > 0 && (
        <Card className="bg-zinc-900/50 border-zinc-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h3 className="text-sm font-bold text-white tracking-tight">Recent Slips in Session</h3>
            <span className="text-xs text-zinc-500 font-mono">{history.length} records</span>
          </div>

          <div className="divide-y divide-zinc-800/60">
            {history.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2 font-medium text-white">
                    <span>{item.fullName}</span>
                    <Badge variant={item.cached ? "verified" : "mono"} size="sm">
                      {item.cached ? "CACHE" : "LIVE"}
                    </Badge>
                  </div>
                  <div className="text-zinc-500 font-mono mt-0.5">
                    NIN: {item.nin} • Tracking: {item.trackingId} • {item.timestamp}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.pdfBase64 && (
                    <button
                      onClick={() => downloadFile(item.pdfBase64!, `NIN_Slip_${item.nin}.pdf`, "application/pdf")}
                      className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
                    >
                      PDF
                    </button>
                  )}
                  {item.docxBase64 && (
                    <button
                      onClick={() => downloadFile(item.docxBase64!, `NIN_Slip_${item.nin}.docx`, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
                      className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
                    >
                      DOCX
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
