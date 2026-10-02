"use client"

import * as React from "react"
import Link from "next/link"
import { Button, Input, Badge, Card, Modal, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, AppLink } from "@verixa/ui"
import { useAuth } from "../../../lib/auth-context"
import { ApiClient } from "../../../lib/api"

export default function BillingPage() {
  const { environment, balance, refreshBalance } = useAuth()
  const [topupModalOpen, setTopupModalOpen] = React.useState(false)
  const [topupAmount, setTopupAmount] = React.useState("5000")
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [isFaucetLoading, setIsFaucetLoading] = React.useState(false)

  const currentBalance =
    environment === "live"
      ? balance?.live.balance ?? 0
      : balance?.sandbox.balance ?? 100000

  const dva = balance?.dedicatedVirtualAccount || {
    bankName: "Titan Trust Bank",
    accountNumber: "9940182741",
    accountName: "Verixa ID / Settlement",
    status: "active",
    note: "Transfers to this dedicated bank account automatically credit your live NGX balance.",
  }

  const rates = balance?.rates || { bvn: 50, nin: 50, nuban: 10 }
  const liveRates = balance?.rates?.live || { bvn: rates.bvn, nin: rates.nin, nuban: rates.nuban }
  const cacheRates = balance?.rates?.cache || { bvn: Math.round(rates.bvn * 0.4), nin: Math.round(rates.nin * 0.4), nuban: Math.round(rates.nuban * 0.5) }
  const cacheSavings = balance?.rates?.cacheSavingsPercent || 60
  const tier = balance?.tier || "STARTER"

  const handleSandboxFaucet = async () => {
    setIsFaucetLoading(true)
    try {
      await ApiClient.fundSandbox(10000)
      await refreshBalance()
      alert("Success! 10,000 Sandbox NGX test credits added to your wallet.")
    } catch (e: any) {
      alert(e.message || "Failed to add sandbox credits")
    } finally {
      setIsFaucetLoading(false)
    }
  }

  const handleTopupCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    const amountNum = parseInt(topupAmount, 10)
    if (!amountNum || amountNum < 1000) {
      alert("Minimum top-up is 1,000 NGX (₦1,000)")
      setIsProcessing(false)
      return
    }

    try {
      const ref = `topup_${Date.now()}`
      const res = await ApiClient.createCheckout(amountNum * 100, ref)
      if (res.url) {
        window.open(res.url, "_blank")
      }
      setTopupModalOpen(false)
    } catch (e: any) {
      alert(e.message || "Failed to initialize Paystack checkout")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Promotional Flash Sale Banner if active */}
      {balance?.bonusPromotion?.active && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-gradient-to-r dark:from-emerald-950/80 dark:via-emerald-900/40 dark:to-zinc-950 border border-emerald-300 dark:border-emerald-500/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{balance.bonusPromotion.title}</span>
                <Badge variant="verified" size="sm">
                  {balance.bonusPromotion.discountPercent}% OFF ACTIVE
                </Badge>
              </div>
              <p className="text-xs text-emerald-800 dark:text-emerald-300/80 mt-0.5">
                Bonus day rate slash is currently applied automatically to all your API calls.
              </p>
            </div>
          </div>
          <Button size="sm" variant="emerald" onClick={() => setTopupModalOpen(true)} className="shrink-0 font-semibold">
            Top Up at Slashed Rates &rarr;
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Billing & NGX Credits
            </h1>
            <Badge variant="verified" size="sm">
              1 NGX = ₦1.00
            </Badge>
            <Badge variant={tier === "ENTERPRISE" ? "verified" : tier === "GROWTH" ? "info" : "mono"} size="sm">
              {tier} PLAN
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Prepaid credit balance, dedicated virtual account funding, and transaction ledgers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {environment === "sandbox" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSandboxFaucet}
              isLoading={isFaucetLoading}
              className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
            >
              + Add 10,000 Test Credits
            </Button>
          ) : (
            <Button
              variant="emerald"
              size="sm"
              onClick={() => setTopupModalOpen(true)}
            >
              + Top Up NGX Balance
            </Button>
          )}
          <Link href="/dashboard/transactions">
            <Button variant="outline" size="sm">
              View Transactions &rarr;
            </Button>
          </Link>
        </div>
      </div>

      {/* Financial Overview Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Current Balance Card */}
        <Card className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium text-slate-500 dark:text-zinc-400 uppercase">
                {environment} Available Balance
              </span>
              <Badge variant={environment === "live" ? "verified" : "warning"} size="sm">
                {environment.toUpperCase()}
              </Badge>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
                {currentBalance.toLocaleString()}
              </span>
              <span className="text-sm font-mono text-emerald-600 dark:text-emerald-400 font-bold">NGX</span>
            </div>

            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2">
              Equivalent to <strong>₦{currentBalance.toLocaleString()}.00 NGN</strong>
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-400 dark:text-zinc-500">
            <span>Prepaid metered deductions</span>
            <span>Zero charges on failed requests</span>
          </div>
        </Card>

        {/* Dedicated Virtual Account (DVA) Card */}
        <Card className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 uppercase">PAYSTACK DEDICATED ACCOUNT</span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{dva.bankName}</h4>
              </div>
              <Badge variant="verified" size="sm">AUTO-CREDIT</Badge>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-500 dark:text-zinc-400">Dedicated Account Number</span>
                <div className="mt-1 flex items-center gap-3">
                  <span className="font-mono text-2xl font-bold text-slate-900 dark:text-white tracking-widest">
                    {dva.accountNumber}
                  </span>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => {
                      navigator.clipboard.writeText(dva.accountNumber)
                      alert("Account number copied!")
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-500 dark:text-zinc-400">Account Beneficiary</span>
                <p className="text-xs font-semibold text-slate-700 dark:text-zinc-200">{dva.accountName}</p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-[11px] text-slate-400 dark:text-zinc-500">
            {dva.note}
          </p>
        </Card>
      </div>

      {/* Pricing Rates Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Active Metered Rate Schedule ({tier} Plan)</h3>
              <Badge variant="verified" size="sm">SMART CACHE ACTIVE</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Unit costs charged per successful verification. Repeat identity lookups within 30 days are automatically served from Smart Cache at up to {cacheSavings}% off.</p>
          </div>
          <AppLink app="www" path="/contact" className="text-xs text-emerald-400 hover:text-emerald-300 underline font-medium">
            Contact Sales for Custom Volume Tier &rarr;
          </AppLink>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service Endpoint</TableHead>
              <TableHead>Live Upstream Rate</TableHead>
              <TableHead>Intelligent Cache</TableHead>
              <TableHead>Latency SLA</TableHead>
              <TableHead>Billing Policy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="bg-emerald-500/5">
              <TableCell className="font-medium text-white flex items-center gap-2">
                Bank Account Resolution (NUBAN)
                <Badge variant="verified" size="sm">FREE FOR NOW</Badge>
              </TableCell>
              <TableCell className="font-mono text-emerald-400 font-bold">₦0.00 (Free)</TableCell>
              <TableCell className="font-mono text-emerald-400 font-bold">
                Cache Split Included
              </TableCell>
              <TableCell className="font-mono text-xs text-zinc-400">&lt;120ms</TableCell>
              <TableCell className="text-xs text-emerald-400">Zero Charge</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium text-white">NIN Advance Verification</TableCell>
              <TableCell className="font-mono text-zinc-200 font-bold">140 NGX (₦140)</TableCell>
              <TableCell className="font-mono text-emerald-400 font-bold">
                Cache Split Enabled
              </TableCell>
              <TableCell className="font-mono text-xs text-zinc-400">&lt;180ms</TableCell>
              <TableCell className="text-xs text-zinc-400">Charged on 200 OK lookup</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium text-white">Official NIN Slip (Standard & Premium)</TableCell>
              <TableCell className="font-mono text-zinc-200 font-bold">270 NGX (₦270)</TableCell>
              <TableCell className="font-mono text-emerald-400 font-bold">
                Cache Split Enabled
              </TableCell>
              <TableCell className="font-mono text-xs text-zinc-400">&lt;250ms</TableCell>
              <TableCell className="text-xs text-zinc-400">Charged on 200 OK generation</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium text-white">Bank Verification Number (BVN)</TableCell>
              <TableCell className="font-mono text-zinc-200 font-bold">50 NGX (₦50)</TableCell>
              <TableCell className="font-mono text-emerald-400 font-bold">
                Cache Split Enabled
              </TableCell>
              <TableCell className="font-mono text-xs text-zinc-400">&lt;150ms</TableCell>
              <TableCell className="text-xs text-zinc-400">Charged on 200 OK lookup</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Topup Modal */}
      <Modal
        isOpen={topupModalOpen}
        onClose={() => setTopupModalOpen(false)}
        title="Fund Live Wallet Balance"
        description="Transfer to your dedicated virtual account or initialize online checkout."
      >
        <div className="space-y-4 mt-2">
          {/* Primary Recommended Method: Dedicated Account */}
          <div className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-950/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">RECOMMENDED: AUTOMATED BANK TRANSFER</span>
              <Badge variant="verified" size="sm">INSTANT CREDIT</Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
              Transfer directly from your bank app or USSD to your Paystack Dedicated Account. Your live NGX balance is auto-credited immediately upon settlement:
            </p>
            <div className="p-3 rounded-lg bg-white dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 block uppercase font-mono">Bank Name</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Titan Trust Bank</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 block uppercase font-mono">Beneficiary</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Verixa ID / Settlement</span>
                </div>
              </div>
              <div className="pt-1 flex items-center justify-between border-t border-slate-100 dark:border-zinc-800">
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 block uppercase font-mono">Dedicated Account</span>
                  <span className="font-mono text-base font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wider">9940182741</span>
                </div>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    navigator.clipboard.writeText("9940182741")
                    alert("Account number 9940182741 copied to clipboard!")
                  }}
                >
                  Copy Number
                </Button>
              </div>
            </div>
          </div>

          {/* Secondary Method: Online Paystack */}
          <form onSubmit={handleTopupCheckout} className="space-y-3 pt-2 border-t border-slate-200 dark:border-zinc-800">
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block">Alternative: Online Card / Gateway Checkout</span>
            <Input
              label="Deposit Amount (NGN / NGX)"
              type="number"
              min="1000"
              step="1000"
              value={topupAmount}
              onChange={(e) => setTopupAmount(e.target.value)}
              hint="1 NGX = ₦1.00 NGN. Minimum topup is ₦1,000."
              required
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-zinc-800">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setTopupModalOpen(false)}
              >
                Close
              </Button>
              <Button
                type="submit"
                variant="emerald"
                size="sm"
                isLoading={isProcessing}
              >
                Proceed Online
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  )
}
