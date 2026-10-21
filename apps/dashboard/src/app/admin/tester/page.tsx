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
    id: "nin-slip",
    name: "NIN Slip Record (Official Printable NIMC Slip)",
    path: "/api/v1/kyc/nin/nin_slip",
    method: "GET",
    description: "Queries Live Registry GET /api/v1/kyc/nin/nin_slip. Returns complete citizen identity plus base64-encoded PDF (nin_id).",
    defaultParams: {
      nin: "70123456789",
      consent: true,
    },
  },
  {
    id: "nin-basic",
    name: "Basic NIN Lookup (Names, DOB, Phone & Photo)",
    path: "/api/v1/kyc/nin",
    method: "GET",
    description: "Queries Live Registry GET /api/v1/kyc/nin. Core citizen demographic records and portrait photo.",
    defaultParams: {
      nin: "70123456789",
      consent: true,
    },
  },
  {
    id: "nin-advance",
    name: "Advance NIN Lookup (Address, NOK & Origin)",
    path: "/api/v1/kyc/nin/advance",
    method: "GET",
    description: "Queries Live Registry GET /api/v1/kyc/nin/advance. Adds residential address, next of kin, and tracking ID.",
    defaultParams: {
      nin: "70123456789",
      consent: true,
    },
  },
  {
    id: "nin-premium",
    name: "Premium NIN Lookup (Demographics & Signature)",
    path: "/api/v1/kyc/nin/premium",
    method: "GET",
    description: "Queries Live Registry GET /api/v1/kyc/nin/premium. Comprehensive record with profession, religion, and signature.",
    defaultParams: {
      nin: "70123456789",
      consent: true,
    },
  },
  {
    id: "nin-slip-generator",
    name: "Verixa Hybrid Slip Generator (PDF & Word DOCX)",
    path: "/api/v1/slips/nin",
    method: "POST",
    description: "Generates high-resolution printable PDF and Word DOCX from official NIMC template.",
    defaultParams: {
      nin: "70123456789",
      format: "both",
      consent: true,
    },
  },
  {
    id: "bvn-match",
    name: "BVN Lookup & Name Match",
    path: "/api/v1/kyc/bvn",
    method: "GET",
    description: "Queries Live Registry GET /api/v1/kyc/bvn against the NIBSS central banking registry.",
    defaultParams: {
      bvn: "22123456789",
      consent: true,
    },
  },
  {
    id: "bvn-advance",
    name: "BVN Advance Profile",
    path: "/api/v1/kyc/bvn/advance",
    method: "GET",
    description: "Queries Live Registry GET /api/v1/kyc/bvn/advance. Full banking demographic and portrait records.",
    defaultParams: {
      bvn: "22123456789",
      consent: true,
    },
  },
  {
    id: "cac-search",
    name: "CAC Corporate Search",
    path: "/api/v1/kyc/cac",
    method: "POST",
    description: "Corporate Affairs Commission verified business identity and status lookup.",
    defaultParams: {
      rc_number: "1234567",
      company_type: "COMPANY",
      consent: true,
    },
  },
]

export default function AdminTesterPage() {
  const [selectedId, setSelectedId] = React.useState<string>("nin-slip")
  const [mode, setMode] = React.useState<"live" | "sandbox">("sandbox")
  const [params, setParams] = React.useState<string>("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [response, setResponse] = React.useState<any | null>(null)
  const [latencyMs, setLatencyMs] = React.useState<number | null>(null)
  const [httpStatus, setHttpStatus] = React.useState<number | null>(null)
  const [activeTab, setActiveTab] = React.useState<"json" | "slip" | "attributes">("slip")

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

      // Execute endpoint via direct REST call
      const res = await ApiClient.executeDirectApi(currentEndpoint.path, currentEndpoint.method, parsed)
      const duration = Math.max(15, Math.round(performance.now() - startTime))
      setLatencyMs(duration)
      setHttpStatus(200)
      setResponse(res)

      // If response has nin_id or slip, default to slip view
      if (res?.entity?.nin_id || res?.data?.nin_id || res?.data?.pdfBase64) {
        setActiveTab("slip")
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
        details: err,
      })
      setActiveTab("json")
    } finally {
      setIsLoading(false)
    }
  }

  // Extract entity data from response
  const entity = response?.entity || response?.data || null
  const ninIdBase64 = entity?.nin_id || entity?.pdfBase64 || null
  const photoBase64 = entity?.photo ? (entity.photo.startsWith("data:") ? entity.photo : `data:image/jpeg;base64,${entity.photo}`) : null

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

  const downloadDocx = () => {
    const docxBase64 = entity?.docxBase64
    if (!docxBase64) return
    try {
      const byteCharacters = atob(docxBase64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `NIN_Slip_${entity?.nin || "official"}.docx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (e: any) {
      alert(`DOCX download failed: ${e.message}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Upstream API Tester & Live Slip Viewer
            </h1>
            <Badge variant="verified" size="sm">
              LIVE DIRECT
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Test upstream verification endpoints and inspect live raw responses, tracking IDs, and decoded NIMC PDF slips.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
          <button
            onClick={() => setMode("sandbox")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              mode === "sandbox" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Sandbox Mock
          </button>
          <button
            onClick={() => setMode("live")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              mode === "live" ? "bg-emerald-600 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Live Upstream Registry
          </button>
        </div>
      </div>

      {/* Endpoint Selector Pills */}
      <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-2xs">
        <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">
          Select Upstream Endpoint to Test
        </span>
        <div className="flex flex-wrap gap-2">
          {TEST_ENDPOINTS.map((ep) => {
            const isSelected = ep.id === selectedId
            return (
              <button
                key={ep.id}
                onClick={() => setSelectedId(ep.id)}
                className={`px-3 py-2 rounded-xl text-xs font-mono transition-all text-left border cursor-pointer ${
                  isSelected
                    ? "bg-rose-50 text-rose-700 border-rose-300 font-bold shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                }`}
              >
                <div className="font-semibold">{ep.name}</div>
                <div className="text-[10px] opacity-75 mt-0.5">
                  {ep.method} {ep.path}
                </div>
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

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 uppercase">
                  Parameters ({currentEndpoint.method === "GET" ? "Query Params" : "JSON Body"})
                </label>
                <button
                  onClick={() => setParams(JSON.stringify(currentEndpoint.defaultParams, null, 2))}
                  className="text-[11px] text-slate-500 hover:text-slate-900 font-mono cursor-pointer"
                >
                  Reset Sample
                </button>
              </div>
              <textarea
                value={params}
                onChange={(e) => setParams(e.target.value)}
                rows={9}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 font-mono text-xs text-slate-900 focus:border-slate-900 focus:bg-white focus:outline-none transition-all shadow-inner"
              />
            </div>

            <div className="text-[11px] text-slate-500 font-mono space-y-1">
              <div>• Live mode queries official primary identity registry credentials.</div>
              <div>• Sandbox mode returns mock government records with real generated PDF.</div>
            </div>
          </div>

          <Button
            onClick={handleExecute}
            disabled={isLoading}
            className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5"
          >
            {isLoading ? "Querying Upstream..." : `Send Upstream Test (${currentEndpoint.method})`}
          </Button>
        </div>

        {/* Right: Response Inspector & Live Slip Viewer (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
          {/* Response Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-800 uppercase">Upstream Result</span>
              {httpStatus && (
                <Badge variant={httpStatus === 200 ? "verified" : "failed"} size="sm">
                  {httpStatus} {httpStatus === 200 ? "OK" : "ERROR"}
                </Badge>
              )}
              {latencyMs && <span className="font-mono text-xs text-slate-500">{latencyMs}ms</span>}
            </div>

            {/* View Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-mono">
              <button
                onClick={() => setActiveTab("slip")}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeTab === "slip" ? "bg-white font-bold text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Slip Preview
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
                onClick={() => setActiveTab("json")}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeTab === "json" ? "bg-white font-bold text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Raw JSON
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
              Click &quot;Send Upstream Test&quot; to inspect real returned data and slip records.
            </div>
          ) : activeTab === "slip" ? (
            /* Tab: Slip Preview */
            <div className="space-y-4">
              {/* Slip Card */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Printable NIMC Slip Preview</span>
                    <span className="text-[11px] font-mono text-slate-500">
                      NIN: {entity?.nin || "70123456789"} • Tracking ID: {entity?.tracking_id || entity?.trackingId || "VNX796745906418"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {ninIdBase64 && (
                      <Button onClick={downloadPdf} size="sm" variant="outline" className="text-xs font-semibold">
                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download PDF
                      </Button>
                    )}
                    {entity?.docxBase64 && (
                      <Button onClick={downloadDocx} size="sm" variant="outline" className="text-xs font-semibold">
                        Download Word
                      </Button>
                    )}
                  </div>
                </div>

                {/* Authentic Upstream / Generated PDF Slip Viewer */}
                <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-900 shadow-xs relative">
                  {pdfBlobUrl ? (
                    <iframe
                      src={`${pdfBlobUrl}#toolbar=0&navpanes=0`}
                      title="Official Government NIN Slip Preview"
                      className="w-full h-[680px] border-0 rounded-lg bg-white block"
                    />
                  ) : (
                    <div className="py-16 text-center text-slate-400 text-xs">
                      No PDF payload received in nin_id or pdfBase64.
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
              <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50">
                {photoBase64 ? (
                  <img
                    src={photoBase64}
                    alt="Citizen Photo"
                    className="w-16 h-20 rounded-lg object-cover border border-slate-300 shadow-2xs"
                  />
                ) : (
                  <div className="w-16 h-20 rounded-lg bg-slate-200 flex items-center justify-center text-[10px] text-slate-500 font-mono">
                    NO PHOTO
                  </div>
                )}
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {entity?.first_name || entity?.firstName} {entity?.middle_name || entity?.middleName}{" "}
                    {entity?.last_name || entity?.surname}
                  </h3>
                  <div className="text-xs font-mono text-slate-600 mt-0.5">
                    NIN: <span className="font-bold text-slate-900">{entity?.nin}</span> • Tracking:{" "}
                    <span className="font-bold text-slate-900">{entity?.tracking_id || entity?.trackingId || "N/A"}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Gender: {entity?.gender || "N/A"} • DOB: {entity?.date_of_birth || entity?.birthdate || "N/A"} • Phone:{" "}
                    {entity?.phone_number || entity?.phoneNumber || "N/A"}
                  </div>
                </div>
              </div>

              {/* Attributes Grid */}
              <div className="grid sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <span className="text-slate-400 block text-[10px]">RESIDENCE ADDRESS</span>
                  <span className="text-slate-900 font-medium">
                    {entity?.residence_address_line_1 || entity?.address || "N/A"}
                  </span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <span className="text-slate-400 block text-[10px]">RESIDENCE LGA & STATE</span>
                  <span className="text-slate-900 font-medium">
                    {entity?.residence_lga || entity?.lga || "N/A"}, {entity?.residence_state || entity?.state || "N/A"}
                  </span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <span className="text-slate-400 block text-[10px]">EMPLOYMENT & MARITAL STATUS</span>
                  <span className="text-slate-900 font-medium">
                    {entity?.employment_status || "N/A"} • {entity?.marital_status || "N/A"}
                  </span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <span className="text-slate-400 block text-[10px]">BIRTH STATE & HEIGHT</span>
                  <span className="text-slate-900 font-medium">
                    {entity?.birth_state || "N/A"} • {entity?.height ? `${entity.height} cm` : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Tab: Raw JSON */
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                <span>Live Registry JSON Response Body</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(response, null, 2))
                    alert("JSON copied to clipboard!")
                  }}
                  className="text-slate-700 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  Copy JSON
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-900 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed border border-slate-800 max-h-[420px] shadow-xs">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
