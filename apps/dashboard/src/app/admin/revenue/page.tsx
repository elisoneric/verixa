"use client"

import * as React from "react"
import { Badge, Button, Card, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyState } from "@verixa/ui"
import { ApiClient } from "../../../lib/api"

export default function AdminRevenuePage() {
  const [data, setData] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [filterType, setFilterType] = React.useState("ALL")

  // Upstream Buy-Rates Form State
  const [upstreamRates, setUpstreamRates] = React.useState({
    nin: "90",
    ninAdvance: "90",
    ninPremium: "110",
    ninSlip: "180",
    bvn: "70",
    bvnAdvance: "90",
    cac: "85",
    phone: "35",
    nuban: "0",
  })
  const [isSavingRates, setIsSavingRates] = React.useState(false)
  const [saveSuccessMsg, setSaveSuccessMsg] = React.useState<string | null>(null)

  const fetchRevenue = () => {
    setIsLoading(true)
    ApiClient.getAdminRevenue()
      .then((res) => {
        setData(res)
        const incoming = res?.dojahRates || res?.upstreamRates
        if (incoming) {
          setUpstreamRates({
            nin: String(incoming.nin ?? 90),
            ninAdvance: String(incoming.ninAdvance ?? 90),
            ninPremium: String(incoming.ninPremium ?? 110),
            ninSlip: String(incoming.ninSlip ?? 180),
            bvn: String(incoming.bvn ?? 70),
            bvnAdvance: String(incoming.bvnAdvance ?? 90),
            cac: String(incoming.cac ?? 85),
            phone: String(incoming.phone ?? 35),
            nuban: String(incoming.nuban ?? 0),
          })
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }

  React.useEffect(() => {
    fetchRevenue()
  }, [])

  const handleSaveRates = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingRates(true)
    setSaveSuccessMsg(null)

    try {
      await ApiClient.updateDojahPricing({
        nin: parseInt(upstreamRates.nin, 10) || 0,
        ninAdvance: parseInt(upstreamRates.ninAdvance, 10) || 0,
        ninPremium: parseInt(upstreamRates.ninPremium, 10) || 0,
        ninSlip: parseInt(upstreamRates.ninSlip, 10) || 0,
        bvn: parseInt(upstreamRates.bvn, 10) || 0,
        bvnAdvance: parseInt(upstreamRates.bvnAdvance, 10) || 0,
        cac: parseInt(upstreamRates.cac, 10) || 0,
        phone: parseInt(upstreamRates.phone, 10) || 0,
        nuban: parseInt(upstreamRates.nuban, 10) || 0,
      })
      setSaveSuccessMsg("Real upstream buy-rates saved successfully!")
      fetchRevenue()
      setTimeout(() => setSaveSuccessMsg(null), 4000)
    } catch (err: any) {
      alert("Failed to save upstream buy rates: " + err.message)
    } finally {
      setIsSavingRates(false)
    }
  }

  const transactions = (data?.recentTransactions || []).filter((tx: any) => {
    if (filterType === "TOPUP") return tx.amount > 0
    if (filterType === "DEDUCTION") return tx.amount < 0
    return true
  })

  // Services pricing metadata for margin calculation
  const servicesMeta = [
    { key: "nin", label: "Basic NIN Lookup", sellPrice: 125, buyRate: upstreamRates.nin },
    { key: "ninAdvance", label: "Advance NIN Lookup", sellPrice: 125, buyRate: upstreamRates.ninAdvance },
    { key: "ninPremium", label: "Premium NIN Lookup", sellPrice: 150, buyRate: upstreamRates.ninPremium },
    { key: "ninSlip", label: "Official NIN Slip (PDF)", sellPrice: 250, buyRate: upstreamRates.ninSlip },
    { key: "bvn", label: "BVN Lookup & Match", sellPrice: 95, buyRate: upstreamRates.bvn },
    { key: "bvnAdvance", label: "BVN Advance Profile", sellPrice: 125, buyRate: upstreamRates.bvnAdvance },
    { key: "cac", label: "CAC Verification", sellPrice: 120, buyRate: upstreamRates.cac },
    { key: "phone", label: "Phone NIN/BVN Search", sellPrice: 50, buyRate: upstreamRates.phone },
    { key: "nuban", label: "NUBAN Resolution", sellPrice: 0, buyRate: upstreamRates.nuban },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Revenue, Real Costs & Profit Ledger</h1>
            <Badge variant="verified" size="sm">
              PROFIT ENGINE
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time financial audits: client revenue charged, real upstream provider costs, net gross profit, and Smart Cache savings.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchRevenue}
          isLoading={isLoading}
          className="self-start sm:self-auto cursor-pointer"
        >
          <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Figures
        </Button>
      </div>

      {/* Financial Overview Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Client Revenue */}
        <Card className="p-5 bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">
              Gross Client Revenue
            </span>
            <Badge variant="neutral" size="sm">BILLED</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">
            ₦{Number(data?.totalConsumedNgx || 0).toLocaleString()}.00
          </div>
          <span className="mt-2 block text-[11px] text-slate-500 font-mono">
            All-time fees charged to organizations
          </span>
        </Card>

        {/* Real Upstream Dojah Cost */}
        <Card className="p-5 bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">
              Real Upstream Cost
            </span>
            <Badge variant="warning" size="sm">BUY RATE</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-600">
            ₦{Number(data?.realCostSpentNgx || 0).toLocaleString()}.00
          </div>
          <span className="mt-2 block text-[11px] text-slate-500 font-mono">
            Actual upstream provider expenditure
          </span>
        </Card>

        {/* Net Gross Profit */}
        <Card className="p-5 bg-white border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-emerald-800 uppercase tracking-wider block font-bold">
              Net Gross Profit
            </span>
            <Badge variant="verified" size="sm">
              +{data?.profitMarginPercent || 0}% MARGIN
            </Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600">
            ₦{Number(data?.netProfitNgx || 0).toLocaleString()}.00
          </div>
          <span className="mt-2 block text-[11px] text-emerald-700 font-mono">
            Revenue minus real upstream buy cost
          </span>
        </Card>

        {/* Smart Cache Retained Profit */}
        <Card className="p-5 bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">
              Smart Cache Retained Profit
            </span>
            <Badge variant="verified" size="sm">100% MARGIN</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-cyan-600">
            ₦{Number(data?.cacheSavingsNgx || 0).toLocaleString()}.00
          </div>
          <span className="mt-2 block text-[11px] text-slate-500 font-mono">
            Upstream fees eliminated via cache
          </span>
        </Card>
      </div>

      {/* Second Row: Deposit Reserves */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs font-mono text-xs">
          <span className="text-slate-500 block text-[11px]">ALL-TIME PREPAID DEPOSITS</span>
          <span className="text-lg font-bold text-slate-900 block mt-1">
            ₦{Number(data?.totalDepositedNgx || 0).toLocaleString()}.00
          </span>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs font-mono text-xs">
          <span className="text-slate-500 block text-[11px]">THIS MONTH DEPOSITS</span>
          <span className="text-lg font-bold text-slate-900 block mt-1">
            ₦{Number(data?.depositsThisMonth || 0).toLocaleString()}.00
          </span>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs font-mono text-xs">
          <span className="text-slate-500 block text-[11px]">NET UNSPENT TENANT RESERVE</span>
          <span className="text-lg font-bold text-blue-600 block mt-1">
            ₦{Number(data?.netReserveNgx || 0).toLocaleString()}.00
          </span>
        </div>
      </div>

      {/* Upstream Buy-Rate Configuration Form */}
      <Card className="p-6 border border-slate-200 bg-white shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Real Upstream Buy-Rates & Margin Manager</h2>
              <Badge variant="verified" size="sm">BUY RATE CONTROLS</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Configure what the upstream provider actually charges Verixa per API call. The system automatically computes real cost spent, revenue minus cost, and net gross profit.
            </p>
          </div>

          {saveSuccessMsg && (
            <div className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              {saveSuccessMsg}
            </div>
          )}
        </div>

        <form onSubmit={handleSaveRates} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {servicesMeta.map((s) => {
              const buyCost = parseInt((upstreamRates as any)[s.key], 10) || 0
              const margin = s.sellPrice - buyCost
              const marginPct = s.sellPrice > 0 ? Math.round((margin / s.sellPrice) * 100) : 0

              return (
                <div key={s.key} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{s.label}</span>
                    <Badge variant={margin >= 0 ? "verified" : "failed"} size="sm">
                      {margin >= 0 ? `+₦${margin} (${marginPct}%)` : `-₦${Math.abs(margin)}`}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 block">OUR SELL PRICE</span>
                      <span className="text-slate-900 font-bold">₦{s.sellPrice}.00</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">UPSTREAM BUY COST (₦)</span>
                      <input
                        type="number"
                        min="0"
                        value={(upstreamRates as any)[s.key]}
                        onChange={(e) =>
                          setUpstreamRates((prev) => ({ ...prev, [s.key]: e.target.value }))
                        }
                        className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 font-mono text-xs font-bold text-slate-900 focus:border-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" isLoading={isSavingRates} className="bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer">
              Save Upstream Buy Rates
            </Button>
          </div>
        </form>
      </Card>

      {/* Transactions Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900">Recent Multi-Tenant Transactions & Settlements</h2>

          <div className="flex gap-2">
            <button
              onClick={() => setFilterType("ALL")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filterType === "ALL"
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Records ({data?.recentTransactions?.length || 0})
            </button>
            <button
              onClick={() => setFilterType("TOPUP")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filterType === "TOPUP"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Deposits Only
            </button>
            <button
              onClick={() => setFilterType("DEDUCTION")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filterType === "DEDUCTION"
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
                    <TableCell className="font-mono text-xs text-slate-500 whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">{tx.orgName}</TableCell>
                    <TableCell className="text-xs text-slate-600">{tx.description}</TableCell>
                    <TableCell className="font-mono text-[11px] text-slate-400">
                      {tx.referenceId ? `${tx.referenceId.slice(0, 16)}…` : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={tx.environment === "live" ? "verified" : "warning"} size="sm">
                        {tx.environment?.toUpperCase() || "LIVE"}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={`font-mono text-xs font-bold text-right ${
                        isCredit ? "text-emerald-600" : "text-slate-900"
                      }`}
                    >
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
