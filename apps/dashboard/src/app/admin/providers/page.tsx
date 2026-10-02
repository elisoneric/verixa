"use client"

import * as React from "react"
import { Badge, Button, Card, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@verixa/ui"
import { ApiClient } from "../../../lib/api"

export default function AdminProvidersPage() {
  const [providers, setProviders] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    ApiClient.getAdminProviders()
      .then((data) => setProviders(data || []))
      .catch(() => {
        // Fallback
      })
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Upstream Provider Routing</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
          Inspect uptime SLAs, automated failover triggers, and latency health across all connected identity verification registries.
        </p>
      </div>

      {/* Provider Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {providers.map((p) => (
          <Card key={p.provider} className="p-6 bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">{p.provider}</h3>
                <div className="flex gap-1.5 mt-1">
                  {p.services.map((s: string) => (
                    <span key={s} className="rounded bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-1.5 py-0.2 font-mono text-[10px] text-slate-700 dark:text-zinc-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <Badge variant={p.status === "operational" ? "verified" : "warning"} size="sm">
                {p.status.toUpperCase()}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-zinc-800/80 font-mono text-xs">
              <div>
                <span className="text-slate-400 dark:text-zinc-500 block">UPTIME SLA</span>
                <span className="text-slate-900 dark:text-white font-bold">{p.uptime}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-zinc-500 block">AVG LATENCY</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{p.latency}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
