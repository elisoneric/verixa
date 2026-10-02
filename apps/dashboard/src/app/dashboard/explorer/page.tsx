"use client"

import * as React from "react"
import { Button, Input, Badge, Card, CodeBlock, Tabs } from "@verixa/ui"
import { useAuth } from "../../../lib/auth-context"
import { ApiClient } from "../../../lib/api"

export default function ApiExplorerPage() {
  const { environment, setEnvironment, refreshBalance } = useAuth()
  const [service, setService] = React.useState<"bvn" | "nin" | "nuban">("bvn")
  const [requestBody, setRequestBody] = React.useState(
    JSON.stringify({ bvn: "22123456789", firstName: "CHIDERA" }, null, 2)
  )
  const [isLoading, setIsLoading] = React.useState(false)
  const [responseResult, setResponseResult] = React.useState<any | null>(null)
  const [responseMeta, setResponseMeta] = React.useState<{ status: number; latencyMs: number } | null>(null)

  const handleServiceChange = (s: "bvn" | "nin" | "nuban") => {
    setService(s)
    if (s === "bvn") {
      setRequestBody(JSON.stringify({ bvn: "22123456789", firstName: "CHIDERA" }, null, 2))
    } else if (s === "nin") {
      setRequestBody(JSON.stringify({ nin: "11234567890" }, null, 2))
    } else {
      setRequestBody(JSON.stringify({ accountNumber: "0123456789", bankCode: "058" }, null, 2))
    }
  }

  const handleExecute = async () => {
    setIsLoading(true)
    setResponseResult(null)
    setResponseMeta(null)
    const startTime = performance.now()

    try {
      const parsedBody = JSON.parse(requestBody)
      const res = await ApiClient.manualVerify(service, environment, parsedBody)
      const duration = Math.round(performance.now() - startTime)
      setResponseMeta({ status: 200, latencyMs: duration })
      setResponseResult(res)
      refreshBalance()
    } catch (err: any) {
      const duration = Math.round(performance.now() - startTime)
      setResponseMeta({ status: 400, latencyMs: duration })
      setResponseResult({
        error: {
          type: "invalid_request_error",
          message: err.message || "Failed to execute verification",
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  const endpoints = {
    bvn: "POST /v1/verify/bvn",
    nin: "POST /v1/verify/nin",
    nuban: "POST /v1/verify/bank-account",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">API Explorer</h1>
            <Badge variant={environment === "live" ? "verified" : "warning"} size="sm">
              {environment.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Interactive developer console to test verification payloads against live and sandbox endpoints.
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

      {/* Explorer Workspace Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Request Panel */}
        <Card className="bg-zinc-900/60 border-zinc-800 p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Service Tab Switcher */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-zinc-400 uppercase">Verification Service</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleServiceChange("bvn")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    service === "bvn"
                      ? "bg-zinc-800 text-emerald-400 border border-zinc-700"
                      : "bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white"
                  }`}
                >
                  BVN (50 NGX)
                </button>
                <button
                  onClick={() => handleServiceChange("nin")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    service === "nin"
                      ? "bg-zinc-800 text-sky-400 border border-zinc-700"
                      : "bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white"
                  }`}
                >
                  NIN (50 NGX)
                </button>
                <button
                  onClick={() => handleServiceChange("nuban")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    service === "nuban"
                      ? "bg-zinc-800 text-indigo-400 border border-zinc-700"
                      : "bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white"
                  }`}
                >
                  NUBAN Account (10 NGX)
                </button>
              </div>
            </div>

            {/* HTTP Method & Endpoint */}
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-xs">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                POST
              </span>
              <span className="text-zinc-200">{endpoints[service]}</span>
            </div>

            {/* Request Body Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-zinc-400 uppercase">JSON Request Body</label>
                <button
                  onClick={() => handleServiceChange(service)}
                  className="text-[11px] text-zinc-500 hover:text-zinc-300 font-mono"
                >
                  Reset Template
                </button>
              </div>
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                rows={7}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-3 font-mono text-xs text-zinc-200 focus:border-emerald-500/80 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <Button
            variant="emerald"
            size="md"
            className="w-full"
            onClick={handleExecute}
            isLoading={isLoading}
          >
            ▶ Run Request
          </Button>
        </Card>

        {/* Response Panel */}
        <Card className="bg-zinc-900/60 border-zinc-800 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="text-xs font-mono text-zinc-400 uppercase">Response Inspector</span>
              {responseMeta && (
                <div className="flex items-center gap-2 font-mono text-xs">
                  <Badge variant={responseMeta.status === 200 ? "verified" : "failed"} size="sm">
                    {responseMeta.status} {responseMeta.status === 200 ? "OK" : "ERROR"}
                  </Badge>
                  <span className="text-zinc-500">{responseMeta.latencyMs}ms</span>
                </div>
              )}
            </div>

            {responseResult ? (
              <pre className="p-4 rounded-lg bg-zinc-950 font-mono text-xs text-emerald-300/90 overflow-x-auto leading-relaxed border border-zinc-800 max-h-[380px]">
                {JSON.stringify(responseResult, null, 2)}
              </pre>
            ) : (
              <div className="py-20 text-center text-xs text-zinc-500 font-mono">
                Click &quot;Run Request&quot; to execute query and view live JSON response payload.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>Auth: Bearer API_KEY</span>
            <span>Content-Type: application/json</span>
          </div>
        </Card>
      </div>
    </div>
  )
}
