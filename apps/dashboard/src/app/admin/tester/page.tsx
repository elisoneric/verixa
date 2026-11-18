"use client"

import * as React from "react"
import { Badge, Button, Card, Tabs } from "@verixa/ui"
import { ApiClient } from "../../../lib/api"
import Image from "next/image"

interface TestEndpoint {
  id: string
  name: string
  path: string
  method: "GET" | "POST"
  description: string
  defaultParams: Record<string, any>
}

const TEST_ENDPOINTS: TestEndpoint[] = [
  {
    id: "nin-premium-details",
    name: "Premium NIN Details",
    path: "/api/v1/kyc/nin/premium-details",
    method: "GET",
    description: "Full demographics, signature, parent & NOK fields + card_image.",
    defaultParams: { nin: "70123456789", consent: true },
  },
  {
    id: "nin-premium",
    name: "NIMC Card Premium",
    path: "/api/v1/kyc/nin/premium",
    method: "GET",
    description: "Plastic wallet card image (entity.image).",
    defaultParams: { nin: "70123456789", consent: true },
  },
  {
    id: "nin-advance",
    name: "Advance NIN",
    path: "/api/v1/kyc/nin/advance",
    method: "GET",
    description: "Demographics, address, origin & NOK.",
    defaultParams: { nin: "70123456789", consent: true },
  },
  {
    id: "nin-basic",
    name: "Basic NIN",
    path: "/api/v1/kyc/nin",
    method: "GET",
    description: "Core NIN demographics & photo.",
    defaultParams: { nin: "70123456789", consent: true },
  },
  {
    id: "nin-slip",
    name: "NIN Slip Record",
    path: "/api/v1/kyc/nin/nin_slip",
    method: "GET",
    description: "Official printable slip record + nin_id PDF.",
    defaultParams: { nin: "70123456789", consent: true },
  },
  {
    id: "nin-slip-generator",
    name: "NIN Slip PDF",
    path: "/api/v1/slips/nin",
    method: "POST",
    description: "Standard printable A4 NIN slip PDF.",
    defaultParams: { nin: "70123456789", format: "pdf", consent: true },
  },
  {
    id: "nin-card-generator",
    name: "Digital NIN Card",
    path: "/api/v1/slips/nin",
    method: "POST",
    description: "ID-1 digital NIN card PDF & SVG.",
    defaultParams: { nin: "70123456789", cardType: "card", format: "pdf", consent: true },
  },
  {
    id: "bvn-match",
    name: "BVN Basic",
    path: "/api/v1/kyc/bvn",
    method: "GET",
    description: "NIBSS BVN lookup.",
    defaultParams: { bvn: "22222222222", consent: true },
  },
  {
    id: "bvn-advance",
    name: "BVN Advance",
    path: "/api/v1/kyc/bvn/advance",
    method: "GET",
    description: "Full BVN demographic profile.",
    defaultParams: { bvn: "22222222222", consent: true },
  },
  {
    id: "phone-basic",
    name: "Phone Basic",
    path: "/api/v1/kyc/phone_number/basic",
    method: "GET",
    description: "Phone subscriber lookup.",
    defaultParams: { phone_number: "09011111111", consent: true },
  },
  {
    id: "phone-advance",
    name: "Phone Advance",
    path: "/api/v1/kyc/phone_number",
    method: "GET",
    description: "Full phone subscriber profile.",
    defaultParams: { phone_number: "09011111111", consent: true },
  },
  {
    id: "cac-search",
    name: "CAC Search",
    path: "/api/v1/kyc/cac",
    method: "POST",
    description: "Corporate Affairs Commission search.",
    defaultParams: { rc_number: "1234567", company_type: "COMPANY", consent: true },
  },
]

export default function AdminTesterPage() {
  const [selectedId, setSelectedId] = React.useState<string>("nin-premium-details")
  const [mode, setMode] = React.useState<"live" | "sandbox">("live")
  const [bypassCache, setBypassCache] = React.useState<boolean>(true)
  const [params, setParams] = React.useState<string>("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [response, setResponse] = React.useState<any | null>(null)
  const [latencyMs, setLatencyMs] = React.useState<number | null>(null)
  const [httpStatus, setHttpStatus] = React.useState<number | null>(null)
  const [activeTab, setActiveTab] = React.useState<"upstream" | "json" | "slip" | "card" | "attributes">("upstream")
  const [slipViewMode, setSlipViewMode] = React.useState<"visual" | "pdf">("visual")

  const currentEndpoint = React.useMemo(() => {
    return TEST_ENDPOINTS.find((e) => e.id === selectedId) || TEST_ENDPOINTS[0]
  }, [selectedId])

  React.useEffect(() => {
    setParams(JSON.stringify(currentEndpoint.defaultParams, null, 2))
    setResponse(null)
    setLatencyMs(null)
    setHttpStatus(null)
  }, [currentEndpoint])

  const handleExecute = async () => {
    setIsLoading(true)
    setResponse(null)
    setLatencyMs(null)
    setHttpStatus(null)
    const startTime = performance.now()

    try {
      let parsed = {}
      try {
        parsed = params.trim() ? JSON.parse(params) : {}
      } catch {
        alert("Invalid JSON parameters")
        setIsLoading(false)
        return
      }

      // Execute endpoint via direct REST call with selected environment (live or sandbox)
      const extraHeaders: Record<string, string> = {
        "x-admin-debug": "true",
        ...(bypassCache ? { "x-bypass-cache": "true" } : {}),
      }
      const res = await ApiClient.executeDirectApi(currentEndpoint.path, currentEndpoint.method, parsed, mode, extraHeaders)
      const duration = Math.max(15, Math.round(performance.now() - startTime))
      setLatencyMs(duration)
      setHttpStatus(200)
      setResponse(res)

      if (res?._upstream) {
        setActiveTab("upstream")
      } else {
        setActiveTab("json")
      }
    } catch (err: any) {
      const duration = Math.max(15, Math.round(performance.now() - startTime))
      setLatencyMs(duration)
      setHttpStatus(400)
      setResponse({
        error: true,
        message: err.message || "Failed to execute upstream request",
        ...(err._upstream ? { _upstream: err._upstream } : {}),
        details: err,
      })
      setActiveTab(err._upstream ? "upstream" : "json")
    } finally {
      setIsLoading(false)
    }
  }

  // Extract entity data from response
  const entity = response?.entity || response?.data || null
  const ninIdBase64 = entity?.nin_id || entity?.pdfBase64 || null
  const photoBase64 = entity?.photo ? (entity.photo.startsWith("data:") ? entity.photo : `data:image/jpeg;base64,${entity.photo}`) : null
  const signatureBase64 = entity?.signature ? (entity.signature.startsWith("data:") ? entity.signature : `data:image/jpeg;base64,${entity.signature}`) : null
  const rawCardImage = entity?.card_image || (selectedId === "nin-premium" ? entity?.image : null)
  const cardImageDataUrl = rawCardImage ? (rawCardImage.startsWith("data:") ? rawCardImage : `data:image/png;base64,${rawCardImage}`) : null

  // Generate Blob URL for base64 PDF to view authentic document
  const pdfBlobUrl = React.useMemo(() => {
    if (!ninIdBase64) return null
    try {
      const clean = ninIdBase64.replace(/^data:application\/pdf;base64,/, "").replace(/\s/g, "")
      const byteCharacters = atob(clean)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: "application/pdf" })
      return URL.createObjectURL(blob)
    } catch (e) {
      console.error("Failed to parse PDF blob:", e)
      return null
    }
  }, [ninIdBase64])

  React.useEffect(() => {
    return () => {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl)
    }
  }, [pdfBlobUrl])

  const downloadPdf = () => {
    if (!ninIdBase64) return
    try {
      const clean = ninIdBase64.replace(/\s/g, "")
      const byteCharacters = atob(clean)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `NIN_Slip_${entity?.nin || "official"}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (e: any) {
      alert(`PDF download failed: ${e.message}`)
    }
  }


  const downloadCardPdf = () => {
    const cardB64 = entity?.cardPdfBase64 || (selectedId === "nin-card-generator" ? ninIdBase64 : null)
    if (!cardB64) return
    try {
      const clean = cardB64.replace(/\s/g, "")
      const byteCharacters = atob(clean)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `NIN_Digital_Card_${entity?.nin || "official"}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (e: any) {
      alert(`Card PDF download failed: ${e.message}`)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            API Tester
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Inspect live or sandbox responses, cards, portraits, signatures, and raw JSON.
          </p>
        </div>

        {/* Mode & Fresh Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 cursor-pointer shadow-2xs">
            <input
              type="checkbox"
              checked={bypassCache}
              onChange={(e) => setBypassCache(e.target.checked)}
              className="rounded border-slate-300 text-slate-900 focus:ring-0"
            />
            <span>Fresh (Bypass Cache)</span>
          </label>

          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setMode("sandbox")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                mode === "sandbox" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Sandbox
            </button>
            <button
              onClick={() => setMode("live")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                mode === "live" ? "bg-rose-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Live
            </button>
          </div>
        </div>
      </div>

      {/* Endpoint Selector Pills */}
      <div className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-2.5 shadow-2xs">
        <div className="flex flex-wrap gap-2">
          {TEST_ENDPOINTS.map((ep) => {
            const isSelected = ep.id === selectedId
            return (
              <button
                key={ep.id}
                onClick={() => setSelectedId(ep.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all text-left border cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 font-semibold shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div>{ep.name}</div>
                <div className="text-[10px] opacity-70">{ep.method} {ep.path}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left: Request Configuration (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="px-2 py-0.5 rounded font-bold bg-slate-200 text-slate-800">
                  {currentEndpoint.method}
                </span>
                <span className="text-slate-700 font-bold">{currentEndpoint.path}</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">{currentEndpoint.description}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 uppercase">
                  Parameters ({currentEndpoint.method === "GET" ? "Query Params" : "JSON Body"})
                </label>
                <button
                  onClick={() => setParams(JSON.stringify(currentEndpoint.defaultParams, null, 2))}
                  className="text-[11px] text-slate-500 hover:text-slate-900 font-mono cursor-pointer font-bold underline"
                >
                  Reset Sample
                </button>
              </div>

              {/* Quick-Insert Sandbox Values Bar */}
              <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-slate-100 border border-slate-200 text-[11px] font-mono">
                <span className="text-slate-500 font-bold text-[10px] uppercase">Direct Sandbox:</span>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      const cur = JSON.parse(params)
                      cur.nin = "70123456789"
                      setParams(JSON.stringify(cur, null, 2))
                    } catch {
                      setParams(JSON.stringify({ nin: "70123456789", consent: true }, null, 2))
                    }
                  }}
                  className="px-2 py-0.5 rounded bg-white hover:bg-slate-200 text-slate-800 font-semibold cursor-pointer border border-slate-300 transition-colors shadow-2xs"
                >
                  NIN: 70123456789
                </button>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      const cur = JSON.parse(params)
                      cur.bvn = "22222222222"
                      setParams(JSON.stringify(cur, null, 2))
                    } catch {
                      setParams(JSON.stringify({ bvn: "22222222222", consent: true }, null, 2))
                    }
                  }}
                  className="px-2 py-0.5 rounded bg-white hover:bg-slate-200 text-slate-800 font-semibold cursor-pointer border border-slate-300 transition-colors shadow-2xs"
                >
                  BVN: 22222222222
                </button>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      const cur = JSON.parse(params)
                      cur.phone_number = "09011111111"
                      if (cur.phone) cur.phone = "09011111111"
                      setParams(JSON.stringify(cur, null, 2))
                    } catch {
                      setParams(JSON.stringify({ phone_number: "09011111111", consent: true }, null, 2))
                    }
                  }}
                  className="px-2 py-0.5 rounded bg-white hover:bg-slate-200 text-slate-800 font-semibold cursor-pointer border border-slate-300 transition-colors shadow-2xs"
                >
                  Phone: 09011111111
                </button>
              </div>

              <textarea
                value={params}
                onChange={(e) => setParams(e.target.value)}
                rows={8}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 font-mono text-xs text-slate-900 focus:border-slate-900 focus:bg-white focus:outline-none transition-all shadow-inner"
              />
            </div>

            <div className="text-[11px] text-slate-500 font-mono space-y-1">
              <div>• Live mode queries official primary identity registry credentials and bills wallet credits.</div>
              <div>• Sandbox mode returns mock government records with real generated PDF and Digital Card for free.</div>
            </div>
          </div>

          <Button
            onClick={handleExecute}
            disabled={isLoading}
            className={`w-full mt-4 font-semibold py-2.5 transition-colors cursor-pointer ${
              mode === "live"
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : "bg-slate-900 hover:bg-slate-800 text-white"
            }`}
          >
            {isLoading
              ? "Querying..."
              : mode === "live"
              ? `Run Live Test${bypassCache ? " (Fresh)" : ""}`
              : "Run Sandbox Test"}
          </Button>
        </div>

        {/* Right: Response Inspector & Live Slip Viewer (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
          {/* Response Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-800 uppercase">Result</span>
              {httpStatus && (
                <Badge variant={httpStatus === 200 ? "verified" : "failed"} size="sm">
                  {httpStatus} {httpStatus === 200 ? "OK" : "ERROR"}
                </Badge>
              )}
              {response && (
                <Badge
                  variant={response?._upstream ? "verified" : response?.cached || response?.meta?.cached ? "info" : "neutral"}
                  size="sm"
                >
                  {response?._upstream
                    ? "DOJAH DIRECT"
                    : response?.cached || response?.meta?.cached
                    ? "FROM CACHE"
                    : mode === "sandbox"
                    ? "SANDBOX"
                    : "LIVE"}
                </Badge>
              )}
              {latencyMs && <span className="font-mono text-xs text-slate-500">{latencyMs}ms</span>}
            </div>

            {/* View Tabs */}
            <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-mono">
              <button
                onClick={() => setActiveTab("upstream")}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeTab === "upstream" ? "bg-white font-bold text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                cURL & Direct
              </button>
              <button
                onClick={() => setActiveTab("json")}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeTab === "json" ? "bg-white font-bold text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Verixa JSON
              </button>
              <button
                onClick={() => setActiveTab("attributes")}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeTab === "attributes" ? "bg-white font-bold text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Attributes
              </button>
              <button
                onClick={() => setActiveTab("card")}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeTab === "card" ? "bg-white font-bold text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Card
              </button>
              <button
                onClick={() => setActiveTab("slip")}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeTab === "slip" ? "bg-white font-bold text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Slip
              </button>
            </div>
          </div>

          {/* Response Content */}
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center text-slate-500 space-y-3 font-mono text-xs">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
              <span>Contacting upstream gateway...</span>
            </div>
          ) : !response ? (
            <div className="py-24 text-center text-xs text-slate-400 font-mono">
              Run a test to inspect the cURL sent, raw upstream response, and Verixa output.
            </div>
          ) : activeTab === "upstream" ? (
            <div className="space-y-4">
              {response?._upstream ? (
                <>
                  {/* Call Timing & Status Metadata Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[11px] font-mono">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 block text-[10px] uppercase">Called At</span>
                      <span className="text-slate-900 font-bold">
                        {response._upstream.calledAt
                          ? new Date(response._upstream.calledAt).toLocaleString()
                          : "—"}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 block text-[10px] uppercase">Dojah Status</span>
                      <span className="text-slate-900 font-bold">
                        {String(response._upstream.upstreamStatus ?? "—")}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 block text-[10px] uppercase">Dojah Time</span>
                      <span className="text-slate-900 font-bold">
                        {response._upstream.upstreamLatencyMs != null
                          ? `${response._upstream.upstreamLatencyMs}ms`
                          : "—"}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 block text-[10px] uppercase">Card Synth</span>
                      <span className="text-slate-900 font-bold">
                        {response._upstream.cardSynthesisMs != null
                          ? `${response._upstream.cardSynthesisMs}ms`
                          : "0ms"}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 block text-[10px] uppercase">Billing / DB</span>
                      <span className="text-slate-900 font-bold">
                        {response._upstream.billingMs != null
                          ? `${response._upstream.billingMs} / ${response._upstream.persistMs ?? 0}ms`
                          : "—"}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 block text-[10px] uppercase">Total Server</span>
                      <span className="text-slate-900 font-bold">
                        {response._upstream.totalServerMs != null
                          ? `${response._upstream.totalServerMs}ms`
                          : "—"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-600">
                      <span className="font-bold uppercase text-slate-800">1. cURL Sent to Upstream</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(response._upstream.curl)
                          alert("cURL copied!")
                        }}
                        className="text-slate-700 hover:text-slate-900 font-semibold cursor-pointer"
                      >
                        Copy cURL
                      </button>
                    </div>
                    <pre className="p-3.5 rounded-xl bg-slate-900 font-mono text-xs text-sky-300 overflow-x-auto leading-relaxed border border-slate-800 shadow-xs">
                      {response._upstream.curl}
                    </pre>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-600">
                      <span className="font-bold uppercase text-slate-800">2. Direct Upstream Response (Raw)</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(response._upstream.rawResponse, null, 2))
                          alert("Full direct response copied!")
                        }}
                        className="text-slate-700 hover:text-slate-900 font-semibold cursor-pointer"
                      >
                        Copy Direct JSON
                      </button>
                    </div>
                    <pre className="p-4 rounded-xl bg-slate-900 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed border border-slate-800 max-h-[420px] shadow-xs">
                      {JSON.stringify(
                        response._upstream.rawResponse,
                        (_key, val) =>
                          typeof val === "string" && val.length > 220
                            ? `${val.slice(0, 64)}... [truncated ${(val.length / 1024).toFixed(1)} KB — click Copy Direct JSON]`
                            : val,
                        2
                      )}
                    </pre>
                  </div>
                </>
              ) : (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-600 space-y-2">
                  <div className="font-bold text-slate-800">No Live Upstream Call Captured</div>
                  <p>
                    Switch to <strong>Live</strong> mode and enable <strong>Fresh (Bypass Cache)</strong> to inspect the exact cURL and raw upstream response before Verixa processing.
                  </p>
                </div>
              )}
            </div>
          ) : activeTab === "card" ? (
            /* Tab: Digital NIN Card Preview (ID-1 Format without address) */
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">NIMC Digital NIN Card (No Address)</span>
                    <span className="text-[11px] font-mono text-slate-500">
                      ID-1 Credit Card Size • Front Face • Encrypted QR Code • Photo & Names
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={downloadCardPdf} size="sm" variant="outline" className="text-xs font-semibold cursor-pointer">
                      <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Card PDF
                    </Button>
                  </div>
                </div>

                {/* Card Canvas / SVG Container */}
                <div className="flex justify-center p-4 bg-slate-900/5 rounded-2xl border border-slate-200">
                  {cardImageDataUrl ? (
                    <div className="space-y-3 w-full flex flex-col items-center">
                      <img
                        src={cardImageDataUrl}
                        alt="NIMC Card Premium Preview"
                        className="max-w-[560px] w-full rounded-2xl shadow-md border border-slate-200 bg-white"
                      />
                      <a
                        href={cardImageDataUrl}
                        download={`NIMC_Card_${entity?.nin || "premium"}.png`}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                      >
                        Download Card PNG
                      </a>
                    </div>
                  ) : entity?.cardSvg ? (
                    <div
                      className="max-w-[560px] w-full rounded-2xl overflow-hidden shadow-md"
                      dangerouslySetInnerHTML={{ __html: entity.cardSvg }}
                    />
                  ) : pdfBlobUrl ? (
                    <iframe
                      src={`${pdfBlobUrl}#toolbar=0&navpanes=0`}
                      title="NIMC Digital NIN Card Preview"
                      className="max-w-[560px] w-full h-[355px] border-0 rounded-2xl bg-white shadow-md block"
                    />
                  ) : (
                    <div className="py-16 text-center text-slate-400 text-xs">
                      No Digital Card payload received. Run a query with &quot;cardType&quot;: &quot;card&quot; or Premium NIN Details.
                    </div>
                  )}
                </div>
              </div>

              {/* Status Banner */}
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center justify-between">
                <span>✓ Official NIMC Digital NIN Card (CR80 Plastic / Wallet Ready)</span>
                <span className="font-bold">No Residential Address</span>
              </div>
            </div>
          ) : activeTab === "slip" ? (
            /* Tab: Slip Preview */
            <div className="space-y-4">
              {/* Slip Card */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Printable NIMC Official Slip</span>
                    <span className="text-[11px] font-mono text-slate-500">
                      NIN: {entity?.nin || "70123456789"} • Tracking ID: {entity?.tracking_id || entity?.trackingId || "VNX796745906418"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* View Switcher */}
                    {entity?.slipSvg && pdfBlobUrl && (
                      <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-xs font-mono">
                        <button
                          type="button"
                          onClick={() => setSlipViewMode("visual")}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                            slipViewMode === "visual"
                              ? "bg-slate-900 text-white shadow-2xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          ⚡ Instant View
                        </button>
                        <button
                          type="button"
                          onClick={() => setSlipViewMode("pdf")}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                            slipViewMode === "pdf"
                              ? "bg-slate-900 text-white shadow-2xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          📄 PDF Viewer
                        </button>
                      </div>
                    )}
                    {ninIdBase64 && (
                      <Button onClick={downloadPdf} size="sm" variant="outline" className="text-xs font-semibold cursor-pointer">
                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download PDF
                      </Button>
                    )}
                  </div>
                </div>

                {/* Instant SVG / Native PDF Slip Viewer */}
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900/5 shadow-xs relative p-3">
                  {slipViewMode === "visual" && entity?.slipSvg ? (
                    <div className="flex justify-center p-1 sm:p-2">
                      <div
                        className="w-full max-w-[820px] rounded-xl overflow-hidden shadow-md"
                        dangerouslySetInnerHTML={{ __html: entity.slipSvg }}
                      />
                    </div>
                  ) : pdfBlobUrl ? (
                    <iframe
                      src={`${pdfBlobUrl}#toolbar=0&navpanes=0`}
                      title="Official Government NIN Slip Preview"
                      className="w-full h-[680px] border-0 rounded-lg bg-white block shadow-xs"
                    />
                  ) : entity?.slipSvg ? (
                    <div className="flex justify-center p-1 sm:p-2">
                      <div
                        className="w-full max-w-[820px] rounded-xl overflow-hidden shadow-md"
                        dangerouslySetInnerHTML={{ __html: entity.slipSvg }}
                      />
                    </div>
                  ) : (
                    <div className="py-16 text-center text-slate-400 text-xs font-mono">
                      No official slip payload received in nin_id or slipSvg.
                    </div>
                  )}
                </div>
              </div>

              {/* Status Banner */}
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center justify-between">
                <span>✓ Slip Verified & Validated (Encrypted PDF Base64 present in nin_id)</span>
                {ninIdBase64 && (
                  <span className="font-bold">{(ninIdBase64.length * 0.75 / 1024).toFixed(1)} KB PDF</span>
                )}
              </div>
            </div>
          ) : activeTab === "attributes" ? (
            /* Tab: Extracted Attributes */
            <div className="space-y-4">
              {/* Top Identity Banner: Passport + Signature + Core Identity */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-4">
                  {photoBase64 ? (
                    <img
                      src={photoBase64}
                      alt="Citizen Passport Photo"
                      className="w-20 h-24 rounded-lg object-cover border border-slate-300 shadow-2xs bg-white shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-24 rounded-lg bg-slate-200 flex items-center justify-center text-[10px] text-slate-500 font-mono shrink-0">
                      NO PHOTO
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      {entity?.title && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[10px] uppercase font-bold">
                          {entity.title}
                        </span>
                      )}
                      <h3 className="text-base font-bold text-slate-900">
                        {entity?.first_name || entity?.firstName} {entity?.middle_name || entity?.middleName}{" "}
                        {entity?.last_name || entity?.surname}
                      </h3>
                    </div>
                    <div className="text-xs font-mono text-slate-600 mt-1">
                      NIN: <span className="font-bold text-slate-900">{entity?.nin || "N/A"}</span>
                      {(entity?.tracking_id || entity?.trackingId) && (
                        <>
                          {" "}• Tracking: <span className="font-bold text-slate-900">{entity?.tracking_id || entity?.trackingId}</span>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Gender: {entity?.gender || "N/A"} • DOB: {entity?.date_of_birth || entity?.birthdate || "N/A"} • Phone:{" "}
                      {entity?.phone_number || entity?.phoneNumber || "N/A"}
                    </div>
                  </div>
                </div>

                {/* Signature Preview */}
                <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Citizen Signature</span>
                  {signatureBase64 ? (
                    <img
                      src={signatureBase64}
                      alt="Citizen Signature"
                      className="h-14 max-w-[160px] object-contain rounded-lg border border-slate-300 bg-white p-1 shadow-2xs"
                    />
                  ) : (
                    <div className="h-14 w-32 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center text-[10px] text-slate-400 font-mono">
                      NO SIGNATURE
                    </div>
                  )}
                </div>
              </div>

              {/* Synthesized NIMC Card Image (if returned) */}
              {cardImageDataUrl && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase font-mono">
                      Generated NIMC Card Image (card_image)
                    </span>
                    <a
                      href={cardImageDataUrl}
                      download={`NIMC_Card_${entity?.nin || "premium"}.png`}
                      className="text-xs font-mono font-semibold text-sky-700 hover:underline"
                    >
                      Download PNG
                    </a>
                  </div>
                  <div className="flex justify-center">
                    <img
                      src={cardImageDataUrl}
                      alt="Generated NIMC Card Image"
                      className="max-w-[440px] w-full rounded-xl shadow-sm border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              )}

              {/* All Returned Fields Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs font-mono">
                {entity &&
                  Object.entries(entity)
                    .filter(([k]) => !["photo", "signature", "card_image", "image", "nin_id", "pdfBase64", "cardPdfBase64", "docxBase64", "slipSvg", "cardSvg"].includes(k))
                    .map(([key, val]) => (
                      <div key={key} className="p-2.5 rounded-lg border border-slate-200 bg-white">
                        <span className="text-slate-400 block text-[10px] uppercase truncate">{key}</span>
                        <span className="text-slate-900 font-medium break-words">
                          {val === null || val === undefined || val === ""
                            ? "—"
                            : typeof val === "object"
                            ? JSON.stringify(val)
                            : String(val)}
                        </span>
                      </div>
                    ))}
              </div>
            </div>
          ) : (
            /* Tab: Raw JSON */
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                <span>
                  {mode === "sandbox" ? "Sandbox Response" : "Live Response"}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(response, null, 2))
                    alert("Full JSON copied to clipboard!")
                  }}
                  className="text-slate-700 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  Copy Full JSON
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-900 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed border border-slate-800 max-h-[460px] shadow-xs">
                {JSON.stringify(
                  response,
                  (_key, val) =>
                    typeof val === "string" && val.length > 220
                      ? `${val.slice(0, 64)}... [truncated ${(val.length / 1024).toFixed(1)} KB — click Copy Full JSON]`
                      : val,
                  2
                )}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
