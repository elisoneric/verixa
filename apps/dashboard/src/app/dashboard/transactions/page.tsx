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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Transactions Ledger</h1>
            <Badge variant="mono" size="sm">
              {transactions.length} RECORDS
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Complete financial history of NGX deposits, top-ups, and verification usage.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchTransactions}>
            ↻ Refresh
          </Button>
          <Link href="/dashboard/billing">
            <Button variant="emerald" size="sm">
              + Top Up Credits
            </Button>
          </Link>
        </div>
      </div>

      {/* Ledger Table */}
      {transactions.length === 0 ? (
        <EmptyState
          title="No transactions recorded yet"
          description="Your financial ledger is currently empty. Transactions will appear upon top-up or verification deduction."
          actionLabel="Top Up Credits"
          onAction={() => window.location.href = "/dashboard/billing"}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
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
                <TableRow key={tx.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/60">
                  <TableCell className="font-mono text-xs text-slate-800 dark:text-zinc-200 font-bold">
                    {tx.referenceId?.slice(0, 16) || tx.id.slice(0, 16)}...
                  </TableCell>
                  <TableCell className="text-sm font-medium text-slate-900 dark:text-white">
                    {tx.description}
                  </TableCell>
                  <TableCell className={`font-mono text-sm font-bold ${isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-zinc-300"}`}>
                    {isCredit ? `+${tx.amount.toLocaleString()} NGX` : `${tx.amount.toLocaleString()} NGX`}
                  </TableCell>
                  <TableCell>
                    <Badge variant={tx.status === "completed" ? "verified" : "warning"} size="sm">
                      {tx.status?.toUpperCase() || "COMPLETED"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-500 dark:text-zinc-400">
                    {new Date(tx.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
