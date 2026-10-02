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
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">API Explorer</h1>
            <Badge variant={environment === "live" ? "verified" : "warning"} size="sm">
              {environment.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
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
        <Card className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 p-6 flex flex-col justify-between space-y-6 shadow-xs">
          <div className="space-y-4">
            {/* Service Tab Switcher */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-slate-500 dark:text-zinc-400 uppercase">Verification Service</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleServiceChange("bvn")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                    service === "bvn"
                      ? "bg-slate-900 dark:bg-zinc-800 text-emerald-400 border border-slate-800 dark:border-zinc-700 shadow-2xs font-bold"
                      : "bg-slate-100 dark:bg-zinc-950 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  BVN (50 NGX)
                </button>
                <button
                  onClick={() => handleServiceChange("nin")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                    service === "nin"
                      ? "bg-slate-900 dark:bg-zinc-800 text-sky-400 border border-slate-800 dark:border-zinc-700 shadow-2xs font-bold"
                      : "bg-slate-100 dark:bg-zinc-950 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  NIN Advance (140 NGX)
                </button>
                <button
                  onClick={() => handleServiceChange("nuban")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                    service === "nuban"
                      ? "bg-slate-900 dark:bg-zinc-800 text-indigo-400 border border-slate-800 dark:border-zinc-700 shadow-2xs font-bold"
                      : "bg-slate-100 dark:bg-zinc-950 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  NUBAN Account (0 NGX Free)
                </button>
              </div>
            </div>

            {/* HTTP Method & Endpoint */}
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 font-mono text-xs">
              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 font-bold">
                POST
              </span>
              <span className="text-slate-800 dark:text-zinc-200">{endpoints[service]}</span>
            </div>

            {/* Request Body Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-semibold text-slate-500 dark:text-zinc-400 uppercase">JSON Request Body</label>
                <button
                  onClick={() => handleServiceChange(service)}
                  className="text-[11px] text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-zinc-300 font-mono cursor-pointer"
                >
                  Reset Template
                </button>
              </div>
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                rows={7}
                className="w-full rounded-lg border border-slate-300 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 p-3 font-mono text-xs text-slate-900 dark:text-zinc-200 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
              />
            </div>
          </div>

          <Button
            variant="emerald"
            size="md"
            className="w-full font-bold h-11"
            onClick={handleExecute}
            isLoading={isLoading}
          >
            ▶ Run Request
          </Button>
        </Card>

        {/* Response Panel */}
        <Card className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 p-6 flex flex-col justify-between shadow-xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <span className="text-xs font-mono font-semibold text-slate-500 dark:text-zinc-400 uppercase">Response Inspector</span>
              {responseMeta && (
                <div className="flex items-center gap-2 font-mono text-xs">
                  <Badge variant={responseMeta.status === 200 ? "verified" : "failed"} size="sm">
                    {responseMeta.status} {responseMeta.status === 200 ? "OK" : "ERROR"}
                  </Badge>
                  <span className="text-slate-500 dark:text-zinc-500">{responseMeta.latencyMs}ms</span>
                </div>
              )}
            </div>

            {responseResult ? (
              <pre className="p-4 rounded-lg bg-slate-900 dark:bg-zinc-950 font-mono text-xs text-emerald-300/90 overflow-x-auto leading-relaxed border border-slate-800 dark:border-zinc-800 max-h-[380px] shadow-inner">
                {JSON.stringify(responseResult, null, 2)}
              </pre>
            ) : (
              <div className="py-20 text-center text-xs text-slate-400 dark:text-zinc-500 font-mono">
                Click &quot;Run Request&quot; to execute query and view live JSON response payload.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-slate-400 dark:text-zinc-500 font-mono">
            <span>Auth: Bearer API_KEY</span>
            <span>Content-Type: application/json</span>
          </div>
        </Card>
      </div>
    </div>
  )
}
