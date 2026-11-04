"use client"

import * as React from "react"
import Link from "next/link"
import { Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyState, Modal, Input, Button } from "@verixa/ui"
import { ApiClient, TransactionItem } from "../../../lib/api"
import { useAuth } from "../../../lib/auth-context"

type FilterTab = "deposits" | "all" | "deductions"

export default function TransactionsPage() {
  const { environment, balance, refreshBalance } = useAuth()
  const [activeTab, setActiveTab] = React.useState<FilterTab>("deposits")
  const [transactions, setTransactions] = React.useState<TransactionItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSyncing, setIsSyncing] = React.useState(false)
  const [syncMessage, setSyncMessage] = React.useState<{ text: string; type: "success" | "info" | "error" } | null>(null)

  // Manual reference verification modal
  const [verifyModalOpen, setVerifyModalOpen] = React.useState(false)
  const [refInput, setRefInput] = React.useState("")
  const [isVerifyingRef, setIsVerifyingRef] = React.useState(false)
  const [refVerifyMsg, setRefVerifyMsg] = React.useState<string | null>(null)

  const fetchTransactions = React.useCallback(async (tab: FilterTab = activeTab) => {
    setIsLoading(true)
    try {
      const data = await ApiClient.getTransactions(tab)
      setTransactions(data || [])
    } catch (err: any) {
      console.warn("Could not load transactions", err)
    } finally {
      setIsLoading(false)
    }
  }, [activeTab])

  React.useEffect(() => {
    fetchTransactions(activeTab)
  }, [fetchTransactions, activeTab, environment])

  // Instant DVA bank deposit sync from Paystack
  const handleSyncDva = async () => {
    setIsSyncing(true)
    setSyncMessage(null)
    try {
      const res = await ApiClient.syncDvaDeposits()
      if (res.syncedCount > 0) {
        setSyncMessage({
          text: `Success: Found and credited ${res.syncedCount} deposit(s) totaling ₦${res.creditedAmount.toLocaleString()} to your balance!`,
          type: "success",
        })
      } else {
        setSyncMessage({
          text: res.message || "All bank deposits are currently up to date.",
          type: "info",
        })
      }
      await refreshBalance()
      await fetchTransactions(activeTab)
    } catch (err: any) {
      setSyncMessage({
        text: err.message || "Failed to sync deposits. Please verify connection.",
        type: "error",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  // Manual payment reference verification
  const handleVerifyReference = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!refInput.trim()) return
    setIsVerifyingRef(true)
    setRefVerifyMsg(null)
    try {
      const res = await ApiClient.verifyPaymentReference(refInput.trim())
      if (res.paymentStatus === "COMPLETED" || res.status === "success") {
        setRefVerifyMsg(`Payment of ₦${res.amount.toLocaleString()} confirmed and credited successfully!`)
        await refreshBalance()
        await fetchTransactions(activeTab)
        setTimeout(() => {
          setVerifyModalOpen(false)
          setRefInput("")
          setRefVerifyMsg(null)
        }, 1500)
      } else {
        setRefVerifyMsg(`Payment status: ${res.paymentStatus}. Contact support if funds left your bank.`)
      }
    } catch (err: any) {
      setRefVerifyMsg(err.message || "Could not verify reference.")
    } finally {
      setIsVerifyingRef(false)
    }
  }

  // Calculate deposit metrics
  const depositList = transactions.filter((t) => t.amount > 0)
  const totalDeposited = depositList.reduce((acc, t) => acc + t.amount, 0)
  const currentLiveBalance = balance?.live?.balance ?? 0
  const dva = balance?.dedicatedVirtualAccount

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-heading">
              Wallet Deposits & Ledger
            </h1>
            <Badge variant="verified" size="sm">
              LIVE SETTLEMENT
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Dedicated funding history, automated DVA bank transfers, and financial transaction ledger.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Bank Transfer Sync Trigger */}
          <button
            type="button"
            onClick={handleSyncDva}
            disabled={isSyncing}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            title="Query Paystack directly to credit any bank transfer sent to your DVA"
          >
            <svg
              className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{isSyncing ? "Checking Bank..." : "Sync Bank Deposits"}</span>
          </button>

          {/* Manual Reference Verification */}
          <button
            type="button"
            onClick={() => setVerifyModalOpen(true)}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer shadow-2xs"
            title="Verify a specific payment reference or bank transfer session ID"
          >
            Verify Reference
          </button>

          <Link href="/dashboard/billing">
            <button
              type="button"
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer shadow-xs"
            >
              Deposit Funds
            </button>
          </Link>
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncMessage && (
        <div
          className={`flex items-center justify-between p-3.5 rounded-xl text-xs font-medium border ${
            syncMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : syncMessage.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-sky-50 border-sky-200 text-sky-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-current" />
            <span>{syncMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setSyncMessage(null)}
            className="text-xs hover:opacity-70 cursor-pointer ml-3 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Live Balance */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">Available Balance</span>
            <Badge variant="verified" size="sm">LIVE</Badge>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-slate-900">
              ₦{currentLiveBalance.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">NGX</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Real-time settlement balance</p>
        </div>

        {/* Total Deposited */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">Total Deposited</span>
            <span className="text-xs font-mono text-emerald-600 font-bold">CREDIT</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-emerald-700">
              ₦{totalDeposited.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">NGX</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">{depositList.length} total deposit event(s)</p>
        </div>

        {/* Dedicated Bank Account */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">DVA Account</span>
            <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              AUTO-SYNC
            </span>
          </div>
          <div className="mt-2">
            <span className="text-lg font-bold font-mono text-slate-900 block tracking-wider">
              {dva?.accountNumber || "Not Provisioned"}
            </span>
            <span className="text-[11px] text-slate-500 block truncate">
              {dva?.bankName || "Setup on Billing page"}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-emerald-700 font-medium">Instant auto-credit enabled</p>
        </div>

        {/* Active Plan / Rate */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">Account Plan</span>
            <Badge variant="neutral" size="sm">{balance?.tier || "STARTER"}</Badge>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-slate-900">
              Standard
            </span>
            <span className="text-xs text-slate-500 font-mono">₦1.00 = 1 NGX</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Zero charges on failed lookups</p>
        </div>
      </div>

      {/* Segmented Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start">
          <button
            type="button"
            onClick={() => setActiveTab("deposits")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "deposits"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Wallet Deposits Only</span>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold">
              {depositList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Ledger Records ({transactions.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("deductions")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "deductions"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            API Deductions
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Showing: <strong>{activeTab === "deposits" ? "Funding & Bank Transfers" : activeTab === "deductions" ? "API Query Debits" : "Complete Financial History"}</strong></span>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <EmptyState
            title={activeTab === "deposits" ? "No deposits recorded yet" : "No transactions recorded yet"}
            description={
              activeTab === "deposits"
                ? "Send a bank transfer to your Dedicated Virtual Account or deposit via card checkout to fund your balance."
                : "Your financial ledger is currently empty."
            }
            actionLabel="Deposit Funds"
            onAction={() => (window.location.href = "/dashboard/billing")}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200 bg-slate-50/70 text-slate-600 text-xs">
                  <TableHead>Date &amp; Time</TableHead>
                  <TableHead>Channel / Description</TableHead>
                  <TableHead>Reference ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => {
                  const isCredit = tx.amount > 0
                  return (
                    <TableRow key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-mono text-xs text-slate-500 whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs text-slate-800">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isCredit ? "bg-emerald-500" : "bg-slate-400"}`} />
                          <span className="font-semibold text-slate-900">{tx.description}</span>
                          {tx.channel && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                              {tx.channel}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-600">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px]">
                          {tx.referenceId?.slice(0, 18) || tx.id.slice(0, 18)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={isCredit ? "verified" : "neutral"} size="sm">
                          {isCredit ? "DEPOSIT" : "USAGE"}
                        </Badge>
                      </TableCell>
                      <TableCell className={`font-mono text-xs font-bold whitespace-nowrap ${isCredit ? "text-emerald-700 font-extrabold text-sm" : "text-slate-800"}`}>
                        {isCredit ? `+₦${tx.amount.toLocaleString()}` : `-₦${Math.abs(tx.amount).toLocaleString()}`}
                      </TableCell>
                      <TableCell>
                        <Badge variant={tx.status === "completed" || tx.status === "success" ? "verified" : "warning"} size="sm" dot>
                          {tx.status?.toUpperCase() || "COMPLETED"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Manual Reference Verification Modal */}
      <Modal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        title="Verify Payment Reference"
      >
        <form onSubmit={handleVerifyReference} className="space-y-4">
          <p className="text-xs text-slate-600">
            If you transferred money to your DVA or completed a checkout and want to confirm it immediately, enter your transaction reference or bank session ID below:
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block uppercase font-mono">
              Transaction Reference
            </label>
            <Input
              type="text"
              placeholder="e.g. topup_1709562819000 or vrx_tx_..."
              value={refInput}
              onChange={(e) => setRefInput(e.target.value)}
              required
            />
          </div>

          {refVerifyMsg && (
            <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800">
              {refVerifyMsg}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setVerifyModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="emerald"
              size="sm"
              isLoading={isVerifyingRef}
            >
              Verify &amp; Credit Wallet
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
