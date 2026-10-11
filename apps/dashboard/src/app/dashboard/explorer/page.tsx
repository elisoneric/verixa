"use client"

import * as React from "react"
import { Button, Badge, Card, Tabs } from "@verixa/ui"
import { useAuth } from "../../../lib/auth-context"
import { ApiClient } from "../../../lib/api"

type ApiEndpointKey = 
  | "nin-verification"
  | "bvn-verification"
  | "nin-phone"
  | "bvn-phone"
  | "nin-demography"
  | "nin-tracking"
  | "balance"

interface ApiEndpointConfig {
  key: ApiEndpointKey
  name: string
  method: "POST" | "GET"
  path: string
  benchmark: string
  verixaRate: string
  defaultPayload: any
  description: string
}

const ENDPOINTS: ApiEndpointConfig[] = [
  {
    key: "nin-verification",
    name: "NIN Verification",
    method: "POST",
    path: "/api/nin-verification",
    benchmark: "₦150",
    verixaRate: "₦135",
    description: "Official National Identity Number lookup directly against NIMC database.",
    defaultPayload: {
      nin: "11234567890",
      consent: true,
    },
  },
  {
    key: "bvn-verification",
    name: "BVN Verification",
    method: "POST",
    path: "/api/bvn-verification",
    benchmark: "₦100",
    verixaRate: "₦85",
    description: "Instant Bank Verification Number verification against NIBSS registry.",
    defaultPayload: {
      bvn: "22123456789",
      consent: true,
    },
  },
  {
    key: "nin-phone",
    name: "NIN Phone Search",
    method: "POST",
    path: "/api/nin-phone",
    benchmark: "₦200",
    verixaRate: "₦185",
    description: "Reverse lookup and corroborate linked National Identity Number via registered phone line.",
    defaultPayload: {
      phone: "08012345678",
      consent: true,
    },
  },
  {
    key: "bvn-phone",
    name: "BVN Phone Search",
    method: "POST",
    path: "/api/bvn-phone",
    benchmark: "₦150",
    verixaRate: "₦135",
    description: "Query bank customer records and verified financial profile by registered telephone number.",
    defaultPayload: {
      phone: "08012345678",
      consent: true,
    },
  },
  {
    key: "nin-demography",
    name: "NIN Demography",
    method: "POST",
    path: "/api/nin-demography",
    benchmark: "₦250",
    verixaRate: "₦235",
    description: "Full demographic profile including residential address, maiden name, and biometric timestamp.",
    defaultPayload: {
      nin: "11234567890",
      consent: true,
    },
  },
  {
    key: "nin-tracking",
    name: "NIN Tracking",
    method: "POST",
    path: "/api/nin-tracking",
    benchmark: "₦200",
    verixaRate: "₦185",
    description: "Track official NIMC slip issuance and demographic status by tracking ID.",
    defaultPayload: {
      tracking_id: "TRK-982183719",
      consent: true,
    },
  },
  {
    key: "balance",
    name: "Account Balance",
    method: "GET",
    path: "/api/balance",
    benchmark: "Free",
    verixaRate: "Free",
    description: "Check live wallet credit balance and prepaid metered quota with zero deduction overhead.",
    defaultPayload: null,
  },
]

export default function ApiExplorerPage() {
  const { environment, setEnvironment, refreshBalance } = useAuth()
  const [selectedKey, setSelectedKey] = React.useState<ApiEndpointKey>("nin-verification")
  
  const currentConfig = React.useMemo(() => {
    return ENDPOINTS.find((e) => e.key === selectedKey) || ENDPOINTS[0]
  }, [selectedKey])

  const [requestBody, setRequestBody] = React.useState(
    JSON.stringify(currentConfig.defaultPayload, null, 2)
  )
  const [isLoading, setIsLoading] = React.useState(false)
  const [responseResult, setResponseResult] = React.useState<any | null>(null)
  const [responseMeta, setResponseMeta] = React.useState<{ status: number; latencyMs: number } | null>(null)

  const handleSelectEndpoint = (key: ApiEndpointKey) => {
    setSelectedKey(key)
    const cfg = ENDPOINTS.find((e) => e.key === key) || ENDPOINTS[0]
    setRequestBody(cfg.defaultPayload ? JSON.stringify(cfg.defaultPayload, null, 2) : "")
    setResponseResult(null)
    setResponseMeta(null)
  }

  const handleExecute = async () => {
    setIsLoading(true)
    setResponseResult(null)
    setResponseMeta(null)
    const startTime = performance.now()

    try {
      const parsedBody = currentConfig.method === "POST" && requestBody.trim() ? JSON.parse(requestBody) : undefined
      const res = await ApiClient.executeDirectApi(currentConfig.path, currentConfig.method, parsedBody)
      const duration = Math.max(12, Math.round(performance.now() - startTime))
      setResponseMeta({ status: 200, latencyMs: duration })
      setResponseResult(res)
      refreshBalance()
    } catch (err: any) {
      const duration = Math.max(15, Math.round(performance.now() - startTime))
      setResponseMeta({ status: 400, latencyMs: duration })
      setResponseResult({
        error: {
          type: "invalid_request_error",
          message: err.message || "Failed to execute API call",
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white font-heading">API Explorer</h1>
            <Badge variant={environment === "live" ? "verified" : "warning"} size="sm">
              {environment.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Interactive developer console to test Verixa core endpoints with active dropped rates (-₦15).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Tabs
            variant="pills"
            activeTab={environment}
            onChange={(id) => setEnvironment(id as "sandbox" | "live")}
            tabs={[
              { id: "sandbox", label: "Sandbox" },
              { id: "live", label: "Live" },
            ]}
          />
        </div>
      </div>

      {/* Endpoint Selector Tabs */}
      <div className="glass-card p-3 rounded-2xl border border-white/[0.08] bg-[#0c0e14]/60 backdrop-blur-xl">
        <label className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider block mb-2 px-1">
          Select Core API Endpoint
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {ENDPOINTS.map((ep) => {
            const isSelected = ep.key === selectedKey
            return (
              <button
                key={ep.key}
                onClick={() => handleSelectEndpoint(ep.key)}
                className={`p-2.5 rounded-xl text-left transition-all border cursor-pointer ${
                  isSelected
                    ? "bg-white/[0.08] border-emerald-500/50 shadow-lg shadow-emerald-950/20"
                    : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12]"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className={`text-[10px] font-mono font-bold px-1 py-0.2 rounded ${
                    ep.method === "POST" ? "bg-emerald-500/15 text-emerald-400" : "bg-sky-500/15 text-sky-400"
                  }`}>
                    {ep.method}
                  </span>
                  <span className="text-[11px] font-sans font-bold text-emerald-400">
                    {ep.verixaRate}
                  </span>
                </div>
                <div className="text-xs font-semibold text-white truncate">
                  {ep.name}
                </div>
                <div className="text-[10px] font-mono text-zinc-500 truncate">
                  {ep.path}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Explorer Workspace Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Request Panel */}
        <Card className="glass-card bg-[#0c0e14]/70 border border-white/[0.08] p-6 flex flex-col justify-between space-y-6 shadow-2xl rounded-2xl">
          <div className="space-y-4">
            {/* Active Endpoint Info Banner */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    currentConfig.method === "POST"
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                      : "bg-sky-500/15 text-sky-400 border border-sky-500/20"
                  }`}>
                    {currentConfig.method}
                  </span>
                  <span className="text-zinc-200 font-semibold">{currentConfig.path}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  {currentConfig.benchmark !== "Free" && (
                    <span className="text-zinc-500 line-through font-sans text-[11px]">
                      {currentConfig.benchmark}
                    </span>
                  )}
                  <span className="font-sans font-bold text-emerald-400">
                    {currentConfig.verixaRate}
                  </span>
                  {currentConfig.benchmark !== "Free" && (
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/20">
                      -₦15
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                {currentConfig.description}
              </p>
            </div>

            {/* Request Body Editor */}
            {currentConfig.method === "POST" ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-semibold text-zinc-400 uppercase">JSON Request Body</label>
                  <button
                    onClick={() => setRequestBody(JSON.stringify(currentConfig.defaultPayload, null, 2))}
                    className="text-[11px] text-zinc-500 hover:text-zinc-300 font-mono cursor-pointer transition-colors"
                  >
                    Reset Template
                  </button>
                </div>
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  rows={8}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#06070a]/80 p-3.5 font-mono text-xs text-zinc-200 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner"
                />
              </div>
            ) : (
              <div className="p-8 text-center rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-1">
                <span className="text-xs font-mono text-zinc-400 block font-semibold">GET Request - No Payload Required</span>
                <span className="text-[11px] text-zinc-500 block">Queries active authenticated balance with zero rate deductions.</span>
              </div>
            )}
          </div>

          <Button
            variant="emerald"
            size="md"
            className="w-full font-bold h-11 shadow-lg shadow-emerald-950/30"
            onClick={handleExecute}
            isLoading={isLoading}
          >
            ▶ Send Request ({currentConfig.method} {currentConfig.path})
          </Button>
        </Card>

        {/* Response Panel */}
        <Card className="glass-card bg-[#0c0e14]/70 border border-white/[0.08] p-6 flex flex-col justify-between shadow-2xl rounded-2xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <span className="text-xs font-mono font-semibold text-zinc-400 uppercase">Response Inspector</span>
              {responseMeta && (
                <div className="flex items-center gap-2 font-mono text-xs">
                  <Badge variant={responseMeta.status === 200 ? "verified" : "failed"} size="sm">
                    {responseMeta.status} {responseMeta.status === 200 ? "OK" : "ERROR"}
                  </Badge>
                  <span className="text-zinc-500 font-sans">{responseMeta.latencyMs}ms</span>
                </div>
              )}
            </div>

            {responseResult ? (
              <pre className="p-4 rounded-xl bg-[#06070a]/90 font-mono text-xs text-emerald-300/90 overflow-x-auto leading-relaxed border border-white/[0.08] max-h-[380px] shadow-inner">
                {JSON.stringify(responseResult, null, 2)}
              </pre>
            ) : (
              <div className="py-24 text-center text-xs text-zinc-500 font-mono">
                Click &quot;Send Request&quot; to test {currentConfig.path} and view live JSON response.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>Auth: Bearer API_KEY</span>
            <span>Content-Type: application/json</span>
          </div>
        </Card>
      </div>
    </div>
  )
}
