"use client"

import * as React from "react"
import { Badge, Button, Card, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyState } from "@verixa/ui"
import { ApiClient } from "../../../lib/api"

export default function AdminRevenuePage() {
  const [data, setData] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [filterType, setFilterType] = React.useState("ALL")

  const fetchRevenue = () => {
    setIsLoading(true)
    ApiClient.getAdminRevenue()
      .then((res) => setData(res))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }

  React.useEffect(() => {
    fetchRevenue()
  }, [])

  const transactions = (data?.recentTransactions || []).filter((tx: any) => {
    if (filterType === "TOPUP") return tx.amount > 0
    if (filterType === "DEDUCTION") return tx.amount < 0
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Revenue & Platform Ledger</h1>
            <Badge variant="verified" size="sm">SETTLEMENT ENGINE</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Real-time financial audits, 1:1 Paystack virtual account settlements, credit revenue, and balance reserves.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchRevenue}
          isLoading={isLoading}
          className="self-start sm:self-auto"
        >
          <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Figures
        </Button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 shadow-xs">
          <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
            All-Time Deposits (NGN)
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            ₦{Number(data?.totalDepositedNgx || 0).toLocaleString()}.00
          </div>
          <span className="mt-2 block text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
            Direct Paystack DVA settlements
          </span>
        </Card>

        <Card className="p-5 bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 shadow-xs">
          <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
            This Month Deposits
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white">
            ₦{Number(data?.depositsThisMonth || 0).toLocaleString()}.00
          </div>
          <span className="mt-2 block text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
            Today: ₦{Number(data?.depositsToday || 0).toLocaleString()}
          </span>
        </Card>

        <Card className="p-5 bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 shadow-xs">
          <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
            API Usage Revenue (Burn)
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
            {Number(data?.totalConsumedNgx || 0).toLocaleString()} NGX
          </div>
          <span className="mt-2 block text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
            Earned from verification charges
          </span>
        </Card>

        <Card className="p-5 bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 shadow-xs">
          <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
            Net Unspent Balance Reserve
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
            {Number(data?.netReserveNgx || 0).toLocaleString()} NGX
          </div>
          <span className="mt-2 block text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
            Customer pre-paid float
          </span>
        </Card>
      </div>

      {/* Transactions Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Multi-Tenant Transactions</h2>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType("ALL")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filterType === "ALL"
                  ? "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-zinc-800 dark:text-rose-400 dark:border-zinc-700"
                  : "bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-200"
              }`}
            >
              All Records ({data?.recentTransactions?.length || 0})
            </button>
            <button
              onClick={() => setFilterType("TOPUP")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filterType === "TOPUP"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                  : "bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-200"
              }`}
            >
              Deposits Only
            </button>
            <button
              onClick={() => setFilterType("DEDUCTION")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filterType === "DEDUCTION"
                  ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800"
                  : "bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-200"
              }`}
            >
              Usage Deductions
            </button>
          </div>
        </div>

        {transactions.length === 0 && !isLoading ? (
          <EmptyState
            title="No transactions found"
            description="Tenant transactions and automated settlements will be listed here."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Tenant Organization</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead className="text-right">Amount (NGX)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx: any) => {
                const isCredit = Number(tx.amount) > 0
                return (
                  <TableRow key={tx.id}>
                    <TableCell className="font-mono text-xs text-slate-500 dark:text-zinc-400 whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900 dark:text-white">
                      {tx.orgName}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 dark:text-zinc-300">
                      {tx.description}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-slate-400 dark:text-zinc-500">
                      {tx.referenceId ? `${tx.referenceId.slice(0, 16)}…` : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={tx.environment === "live" ? "verified" : "warning"}
                        size="sm"
                      >
                        {tx.environment?.toUpperCase() || "LIVE"}
                      </Badge>
                    </TableCell>
                    <TableCell className={`font-mono text-xs font-bold text-right ${isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}>
                      {isCredit ? `+₦${Number(tx.amount).toLocaleString()}` : `${Number(tx.amount).toLocaleString()} NGX`}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
