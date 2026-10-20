"use client"

import * as React from "react"
import Link from "next/link"
import { Button, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyState } from "@verixa/ui"
import { ApiClient, TransactionItem } from "../../../lib/api"

export default function TransactionsPage() {
  const [transactions, setTransactions] = React.useState<TransactionItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  const fetchTransactions = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await ApiClient.getTransactions()
      setTransactions(data || [])
    } catch {
      // Fallback
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-heading">
              Transactions
            </h1>
            <Badge variant="neutral" size="sm">
              {transactions.length} RECORDS
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Financial ledger of wallet deposits, top-ups, and verification usage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchTransactions}
            disabled={isLoading}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
          >
            <svg className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
          <Link href="/dashboard/billing">
            <button
              type="button"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Deposit Funds</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Ledger Table Container */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        {transactions.length === 0 ? (
          <EmptyState
            title="No transactions recorded yet"
            description="Your financial ledger is currently empty. Transactions will appear upon top-up or verification deduction."
            actionLabel="Deposit Funds"
            onAction={() => (window.location.href = "/dashboard/billing")}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200 bg-slate-50/70 text-slate-600">
                  <TableHead>Reference ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => {
                  const isCredit = tx.amount > 0
                  return (
                    <TableRow key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="font-mono text-xs text-slate-900 font-semibold">
                        {tx.referenceId?.slice(0, 16) || tx.id.slice(0, 16)}...
                      </TableCell>
                      <TableCell className="text-xs font-medium text-slate-800">
                        {tx.description}
                      </TableCell>
                      <TableCell className={`font-mono text-xs font-bold ${isCredit ? "text-emerald-700" : "text-slate-800"}`}>
                        {isCredit ? `+₦${tx.amount.toLocaleString()}` : `-₦${Math.abs(tx.amount).toLocaleString()}`}
                      </TableCell>
                      <TableCell>
                        <Badge variant={tx.status === "completed" ? "verified" : "warning"} size="sm">
                          {tx.status?.toUpperCase() || "COMPLETED"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">
                        {new Date(tx.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
