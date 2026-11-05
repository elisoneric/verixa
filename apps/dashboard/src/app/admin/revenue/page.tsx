"use client"

import * as React from "react"
import { Badge, Button, Card, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyState } from "@verixa/ui"
import { ApiClient } from "../../../lib/api"

export default function AdminRevenuePage() {
  const [data, setData] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [filterType, setFilterType] = React.useState("ALL")

  // Database Ledger Reconciliation State
  const [isReconciling, setIsReconciling] = React.useState(false)
  const [reconcileResult, setReconcileResult] = React.useState<any>(null)
  const [isAuditing, setIsAuditing] = React.useState(false)
  const [auditData, setAuditData] = React.useState<any>(null)

  // Upstream Buy-Rates Form State
  const [upstreamRates, setUpstreamRates] = React.useState({
    nin: "60",
    ninAdvance: "85",
    ninPremium: "60",
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
        const incoming = res?.upstreamRates || res?.dojahRates
        if (incoming) {
          setUpstreamRates({
            nin: String(incoming.nin ?? 60),
            ninAdvance: String(incoming.ninAdvance ?? 85),
            ninPremium: String(incoming.ninPremium ?? 60),
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
      await ApiClient.updateUpstreamPricing({
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

  const handleAuditDb = async () => {
    setIsAuditing(true)
    try {
      const res = await ApiClient.auditAdminRevenueDb()
      setAuditData(res)
    } catch (err: any) {
      alert("Failed to audit DB ledger: " + err.message)
    } finally {
      setIsAuditing(false)
    }
  }

  const handleReconcileLedger = async () => {
    if (!confirm("Are you sure you want to reconcile the database ledger? This will purge all test/admin deposit records, reset admin wallets to ₦0, and retain strictly the 3 genuine customer deposits (₦500k, ₦100, ₦100).")) {
      return
    }

    setIsReconciling(true)
    setReconcileResult(null)
    try {
      const res = await ApiClient.reconcileAdminLedger()
      setReconcileResult(res)
      fetchRevenue()
      if (auditData) handleAuditDb()
    } catch (err: any) {
      alert("Reconciliation failed: " + err.message)
    } finally {
      setIsReconciling(false)
    }
  }

  const transactions = (data?.recentTransactions || []).filter((tx: any) => {
    if (filterType === "TOPUP") return tx.amount > 0
    if (filterType === "DEDUCTION") return tx.amount < 0
    return true
  })

  // Services pricing metadata for margin calculation
  const servicesMeta = [
    { key: "nin", label: "Basic NIN Lookup", sellPrice: 120, buyRate: upstreamRates.nin },
    { key: "ninAdvance", label: "Advance NIN Lookup", sellPrice: 120, buyRate: upstreamRates.ninAdvance },
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

      {/* Financial Overview Cards Row - Shows Gross Customer Revenue, Customer Upstream Cost, Admin Test Cost, and Net True Profit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Gross Customer Revenue */}
        <Card className="p-5 bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">
              Customer Billed
            </span>
            <Badge variant="neutral" size="sm">REVENUE</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">
            ₦{Number(data?.totalConsumedNgx || 0).toLocaleString()}.00
          </div>
          <span className="mt-2 block text-[11px] text-slate-500 font-mono">
            Live fees billed to customer tenants
          </span>
        </Card>

        {/* Customer Upstream Direct Cost */}
        <Card className="p-5 bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">
              Customer Upstream
            </span>
            <Badge variant="warning" size="sm">DOJAH BUY</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-600">
            ₦{Number(data?.customerCostSpentNgx || 0).toLocaleString()}.00
          </div>
          <span className="mt-2 block text-[11px] text-slate-500 font-mono">
            Dojah cost for {data?.customerCallsCount || 0} customer lookup(s)
          </span>
        </Card>

        {/* Admin Incurred Upstream Cost (Dojah) */}
        <Card className="p-5 bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">
              Admin Upstream Cost
            </span>
            <Badge variant="failed" size="sm">INTERNAL</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-600">
            ₦{Number(data?.adminCostSpentNgx || 0).toLocaleString()}.00
          </div>
          <span className="mt-2 block text-[11px] text-slate-500 font-mono">
            Dojah expense for {data?.adminCallsCount || 0} admin test lookup(s)
          </span>
        </Card>

        {/* Net True Profit */}
        <Card className="p-5 bg-white border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-emerald-800 uppercase tracking-wider block font-bold">
              Net True Profit
            </span>
            <Badge variant="verified" size="sm">
              +{data?.profitMarginPercent || 0}% MARGIN
            </Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600">
            ₦{Number(data?.netProfitNgx || 0).toLocaleString()}.00
          </div>
          <span className="mt-2 block text-[11px] text-emerald-700 font-mono">
            Billed − Customer Cost − Admin Cost
          </span>
        </Card>

        {/* Smart Cache Retained Profit */}
        <Card className="p-5 bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">
              Smart Cache Savings
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

      {/* Second Row: True Customer Deposits & Escrow Reserve */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* All-time true deposits */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs font-mono text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 block text-[11px] font-bold">TRUE CUSTOMER DEPOSITS</span>
            <Badge variant="verified" size="sm">LIVE RECONCILED</Badge>
          </div>
          <span className="text-2xl font-bold text-slate-900 block font-mono">
            ₦{Number(data?.totalDepositedNgx || 0).toLocaleString()}.00
          </span>
          <div className="space-y-1.5 pt-1 border-t border-slate-100 text-[11px]">
            {data?.trueDeposits && data.trueDeposits.length > 0 ? (
              data.trueDeposits.map((dep: any, idx: number) => (
                <div key={dep.id || idx} className="flex justify-between items-center text-slate-600">
                  <span className="truncate pr-2">• {dep.label || dep.orgName}:</span>
                  <strong className="text-slate-900 shrink-0 font-mono">₦{Number(dep.amount).toLocaleString()}.00</strong>
                </div>
              ))
            ) : (
              <span className="text-slate-400">Loading live deposits...</span>
            )}
          </div>
        </div>

        {/* Total Billed */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs font-mono text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 block text-[11px] font-bold">CONSUMED BY TENANTS</span>
            <Badge variant="neutral" size="sm">REAL USAGE</Badge>
          </div>
          <span className="text-2xl font-bold text-slate-900 block font-mono">
            ₦{Number(data?.totalConsumedNgx || 0).toLocaleString()}.00
          </span>
          <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            Total live usage deducted from customer tenant balances.
          </p>
        </div>

        {/* Net Unspent Reserve */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs font-mono text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 block text-[11px] font-bold">NET UNSPENT TENANT RESERVE</span>
            <Badge variant="verified" size="sm">HELD IN ESCROW</Badge>
          </div>
          <span className="text-2xl font-bold text-blue-600 block font-mono">
            ₦{Number(data?.netReserveNgx || 0).toLocaleString()}.00
          </span>
          <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 font-mono">
            ₦{Number(data?.netReserveNgx || 0).toLocaleString()}.00 unspent reserve (₦{Number(data?.totalDepositedNgx || 0).toLocaleString()} customer deposits − ₦{Number(data?.totalConsumedNgx || 0).toLocaleString()} customer consumed).
          </p>
        </div>
      </div>

      {/* Database Ledger Reconciliation Panel */}
      <Card className="p-6 border border-slate-200 bg-white shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Database Ledger Reconciliation & Test Purge</h2>
              <Badge variant="warning" size="sm">ADMIN DB CLEANUP</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Read live database records, purge test/admin deposits, reset admin wallets to ₦0 (admin mode usage), and lock true revenue.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAuditDb}
              isLoading={isAuditing}
              className="cursor-pointer text-xs"
            >
              Preview DB Audit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleReconcileLedger}
              isLoading={isReconciling}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer text-xs"
            >
              Purge Test Deposits & Lock Ledger
            </Button>
          </div>
        </div>

        {reconcileResult && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-900 space-y-1">
            <div className="flex items-center gap-2 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>{reconcileResult.message}</span>
            </div>
            <div className="text-[11px] text-emerald-700">
              Purged {reconcileResult.purgedTestDepositsCount} test deposit record(s). Retained {reconcileResult.genuineDepositsRetainedCount} genuine deposit(s) totaling ₦{reconcileResult.trueTotalDepositsNgx.toLocaleString()}. Reset {reconcileResult.adminWalletsResetCount} admin wallet(s) to 0.
            </div>
          </div>
        )}

        {auditData && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3 font-mono">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-900">Live Database Audit Preview</span>
              <span className="text-[11px] text-slate-500">Actual Calls: {auditData.actualDojahCallsCount} | Dojah Cost: ₦{auditData.actualDojahCostSpent.toLocaleString()}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
              <div className="p-3 bg-white rounded-lg border border-emerald-200 space-y-1">
                <span className="text-emerald-800 font-bold block">✓ Genuine Deposits ({auditData.genuineDepositsCount})</span>
                <span className="text-slate-600 block">Total: ₦{auditData.trueDepositedTotal.toLocaleString()}.00</span>
                <ul className="text-slate-500 list-disc list-inside">
                  {auditData.genuineDeposits.map((d: any, idx: number) => (
                    <li key={d.id || idx}>₦{Number(d.amount).toLocaleString()} - {d.orgName}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-white rounded-lg border border-rose-200 space-y-1">
                <span className="text-rose-800 font-bold block">✕ Test / Admin Deposits to Purge ({auditData.testDepositsCount})</span>
                <span className="text-slate-600 block">Total to clear: ₦{auditData.testDepositsTotal.toLocaleString()}.00</span>
                <p className="text-slate-500 text-[10px]">These test deposit transactions will be wiped from the ledger.</p>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 bg-slate-100 p-2 rounded border border-slate-200">
              Direct API execution command: <code className="text-slate-800 font-bold">curl -X POST https://api.verixaid.com/v1/admin-tools/reconcile-ledger?key=verixa_reconcile_secret_2026</code>
            </div>
          </div>
        )}
      </Card>

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

      {/* Actual Calls to Dojah & Upstream Incurred Costs Table */}
      <Card className="p-6 border border-slate-200 bg-white shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Actual Calls to Dojah & Real Upstream Incurred Costs</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown of successful verification lookups, upstream buy-rate cost paid to Dojah, customer revenue billed, and net profit.
            </p>
          </div>
          <Badge variant="verified" size="sm">LIVE AUDIT</Badge>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead className="text-right">Live Calls</TableHead>
              <TableHead className="text-right">Dojah Buy Rate</TableHead>
              <TableHead className="text-right">Customer Cost</TableHead>
              <TableHead className="text-right">Admin Cost (Internal)</TableHead>
              <TableHead className="text-right">Customer Billed</TableHead>
              <TableHead className="text-right">Net Profit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {servicesMeta.map((s) => {
              const breakdown = data?.breakdownByService?.[s.key.toLowerCase()] || data?.breakdownByService?.[s.key]
              const callCount = breakdown?.count || 0
              const unitCost = parseInt((upstreamRates as any)[s.key], 10) || 0
              const custCost = breakdown?.realCost || 0
              const admCost = breakdown?.adminCost || 0
              const totalCost = custCost + admCost
              const totalRev = breakdown?.revenue || 0
              const profit = totalRev - totalCost

              return (
                <TableRow key={s.key}>
                  <TableCell className="font-semibold text-xs text-slate-900">{s.label}</TableCell>
                  <TableCell className="font-mono text-xs text-right text-slate-700 font-bold">{callCount}</TableCell>
                  <TableCell className="font-mono text-xs text-right text-slate-500">₦{unitCost}.00</TableCell>
                  <TableCell className="font-mono text-xs text-right text-rose-600 font-bold">₦{custCost.toLocaleString()}.00</TableCell>
                  <TableCell className="font-mono text-xs text-right text-amber-600 font-bold">₦{admCost.toLocaleString()}.00</TableCell>
                  <TableCell className="font-mono text-xs text-right text-slate-900 font-bold">₦{totalRev.toLocaleString()}.00</TableCell>
                  <TableCell className={`font-mono text-xs text-right font-bold ${profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {profit >= 0 ? `+₦${profit.toLocaleString()}.00` : `-₦${Math.abs(profit).toLocaleString()}.00`}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs font-mono text-slate-600 gap-2">
          <span>Customer Revenue: <strong className="text-slate-900">₦{Number(data?.totalConsumedNgx || 0).toLocaleString()}.00</strong></span>
          <span>Customer Upstream: <strong className="text-rose-600">−₦{Number(data?.customerCostSpentNgx || 0).toLocaleString()}.00</strong></span>
          <span>Admin Incurred: <strong className="text-amber-600">−₦{Number(data?.adminCostSpentNgx || 0).toLocaleString()}.00</strong></span>
          <span className="text-emerald-700 font-bold">Net True Profit: ₦{Number(data?.netProfitNgx || 0).toLocaleString()}.00</span>
        </div>
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
