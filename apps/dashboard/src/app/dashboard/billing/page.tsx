"use client"

import * as React from "react"
import Link from "next/link"
import { Button, Input, Badge, Card, Modal, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, AppLink } from "@verixa/ui"
import { useAuth } from "../../../lib/auth-context"
import { ApiClient } from "../../../lib/api"

export default function BillingPage() {
  const { environment, balance, refreshBalance } = useAuth()
  const [topupModalOpen, setTopupModalOpen] = React.useState(false)
  const [provisionModalOpen, setProvisionModalOpen] = React.useState(false)
  const [ninInput, setNinInput] = React.useState("")
  const [phoneInput, setPhoneInput] = React.useState("")
  const [consentAgreed, setConsentAgreed] = React.useState(false)
  const [isProvisioning, setIsProvisioning] = React.useState(false)
  const [provisionError, setProvisionError] = React.useState<string | null>(null)
  const [topupAmount, setTopupAmount] = React.useState("5000")
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [isFaucetLoading, setIsFaucetLoading] = React.useState(false)
  const [copiedAccount, setCopiedAccount] = React.useState(false)

  const currentBalance =
    environment === "live"
      ? balance?.live.balance ?? 0
      : balance?.sandbox.balance ?? 100000

  const dva = balance?.dedicatedVirtualAccount
  const tier = balance?.tier || "STARTER"

  const handleCopyAccount = (acc: string) => {
    navigator.clipboard.writeText(acc)
    setCopiedAccount(true)
    setTimeout(() => setCopiedAccount(false), 2000)
  }

  const handleSandboxFaucet = async () => {
    setIsFaucetLoading(true)
    try {
      await ApiClient.fundSandbox(10000)
      await refreshBalance()
      alert("Success: 10,000 Sandbox test credits added.")
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
      alert("Minimum top-up is ₦1,000.")
      setIsProcessing(false)
      return
    }

    try {
      const ref = `topup_${Date.now()}`
      const res = await ApiClient.createCheckout(amountNum, ref)
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

  const handleProvisionDedicatedAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setProvisionError(null)

    if (!ninInput.trim() || ninInput.trim().length !== 11) {
      setProvisionError("Please provide a valid 11-digit NIN.")
      return
    }

    if (!phoneInput.trim() || phoneInput.trim().length < 10) {
      setProvisionError("Please provide a valid Nigerian phone number.")
      return
    }

    if (!consentAgreed) {
      setProvisionError("Consent agreement is required.")
      return
    }

    setIsProvisioning(true)
    try {
      await ApiClient.provisionDedicatedAccount(ninInput.trim(), phoneInput.trim(), true)
      await refreshBalance()
      setProvisionModalOpen(false)
      alert("Dedicated Virtual Account provisioned successfully.")
    } catch (err: any) {
      setProvisionError(err.message || "Failed to provision dedicated account.")
    } finally {
      setIsProvisioning(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-heading">
              Wallet & Billing
            </h1>
            <Badge variant="verified" size="sm">
              1 NGX = ₦1.00
            </Badge>
            <Badge variant={tier === "ENTERPRISE" ? "verified" : "neutral"} size="sm">
              {tier} PLAN
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Prepaid balance, automated bank funding account, and active rate schedule.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {environment === "sandbox" ? (
            <button
              type="button"
              onClick={handleSandboxFaucet}
              disabled={isFaucetLoading}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>{isFaucetLoading ? "Adding..." : "Add 10,000 Test Credits"}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setTopupModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Deposit Funds</span>
            </button>
          )}

          <Link
            href="/dashboard/transactions"
            className="px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
          >
            Transactions →
          </Link>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Current Balance Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
                {environment} Available Credits
              </span>
              <Badge variant={environment === "live" ? "verified" : "warning"} size="sm">
                {environment.toUpperCase()}
              </Badge>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900 tracking-tight">
                ₦{currentBalance.toLocaleString()}
              </span>
              <span className="text-sm font-semibold text-slate-500">NGX</span>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Metered real-time deduction. Zero fees on failed lookups.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Instant credit settlement</span>
            <button
              type="button"
              onClick={() => setTopupModalOpen(true)}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
            >
              + Deposit Funds
            </button>
          </div>
        </div>

        {/* Dedicated Virtual Account Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 flex flex-col justify-between shadow-xs">
          {dva ? (
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                    AUTOMATED BANK TRANSFER
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{dva.bankName}</h3>
                </div>
                <Badge variant="verified" size="sm">
                  AUTO-CREDIT
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 block uppercase font-medium">Account Number</span>
                    <span className="font-mono text-2xl font-bold text-slate-900 tracking-wider">
                      {dva.accountNumber}
                    </span>
                    <span className="text-xs text-slate-600 block mt-0.5">{dva.accountName}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyAccount(dva.accountNumber)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                    <span>{copiedAccount ? "Copied!" : "Copy"}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Transfer from any Nigerian banking app</span>
                  <button
                    type="button"
                    onClick={() => setProvisionModalOpen(true)}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900 underline"
                  >
                    Update Details
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-between h-full space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                      DEDICATED BANK ACCOUNT
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">Virtual Bank Account</h3>
                  </div>
                  <Badge variant="neutral" size="sm">
                    NOT SET UP
                  </Badge>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Automate wallet top-ups via standard bank transfer. Link your verified NIN and phone number to provision a permanent dedicated virtual account.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setProvisionModalOpen(true)}
                  className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer shadow-xs text-center"
                >
                  + Setup Dedicated Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Rates Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-heading">
              Active Metered Rate Schedule ({tier} Plan)
            </h2>
            <p className="text-xs text-slate-500">Unit rate per verified query. Failed lookups are never charged.</p>
          </div>
          <AppLink app="www" path="/contact" className="text-xs text-slate-700 hover:text-slate-900 underline font-medium">
            Custom Volume Pricing →
          </AppLink>
        </div>

        <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-200 bg-slate-50/70 text-slate-600">
                <TableHead>Endpoint</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Billing Policy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-slate-50 transition-colors">
                <TableCell className="font-mono text-xs text-slate-700">
                  <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded mr-2">POST</span>
                  /api/nin-verification
                </TableCell>
                <TableCell className="font-semibold text-slate-900 text-xs">NIN Verification</TableCell>
                <TableCell className="font-mono text-xs font-bold text-slate-900">₦125 / query</TableCell>
                <TableCell className="text-xs text-slate-500">Charged on 200 OK lookup</TableCell>
              </TableRow>

              <TableRow className="hover:bg-slate-50 transition-colors">
                <TableCell className="font-mono text-xs text-slate-700">
                  <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded mr-2">POST</span>
                  /api/bvn-verification
                </TableCell>
                <TableCell className="font-semibold text-slate-900 text-xs">BVN Verification</TableCell>
                <TableCell className="font-mono text-xs font-bold text-slate-900">₦95 / query</TableCell>
                <TableCell className="text-xs text-slate-500">Charged on 200 OK lookup</TableCell>
              </TableRow>

              <TableRow className="hover:bg-slate-50 transition-colors">
                <TableCell className="font-mono text-xs text-slate-700">
                  <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded mr-2">POST</span>
                  /api/nin-phone
                </TableCell>
                <TableCell className="font-semibold text-slate-900 text-xs">NIN Phone Search</TableCell>
                <TableCell className="font-mono text-xs font-bold text-slate-900">₦50 / query</TableCell>
                <TableCell className="text-xs text-slate-500">Charged on 200 OK lookup</TableCell>
              </TableRow>

              <TableRow className="hover:bg-slate-50 transition-colors">
                <TableCell className="font-mono text-xs text-slate-700">
                  <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded mr-2">POST</span>
                  /api/bvn-phone
                </TableCell>
                <TableCell className="font-semibold text-slate-900 text-xs">BVN Phone Search</TableCell>
                <TableCell className="font-mono text-xs font-bold text-slate-900">₦50 / query</TableCell>
                <TableCell className="text-xs text-slate-500">Charged on 200 OK lookup</TableCell>
              </TableRow>

              <TableRow className="hover:bg-slate-50 transition-colors">
                <TableCell className="font-mono text-xs text-slate-700">
                  <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded mr-2">POST</span>
                  /api/nin-demography
                </TableCell>
                <TableCell className="font-semibold text-slate-900 text-xs">NIN Demography</TableCell>
                <TableCell className="font-mono text-xs font-bold text-slate-900">₦125 / query</TableCell>
                <TableCell className="text-xs text-slate-500">Charged on 200 OK lookup</TableCell>
              </TableRow>

              <TableRow className="hover:bg-slate-50 transition-colors">
                <TableCell className="font-mono text-xs text-slate-700">
                  <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded mr-2">POST</span>
                  /api/nin-tracking
                </TableCell>
                <TableCell className="font-semibold text-slate-900 text-xs">NIN Tracking</TableCell>
                <TableCell className="font-mono text-xs font-bold text-slate-900">₦50 / query</TableCell>
                <TableCell className="text-xs text-slate-500">Charged on 200 OK lookup</TableCell>
              </TableRow>

              <TableRow className="hover:bg-slate-50 transition-colors">
                <TableCell className="font-mono text-xs text-slate-700">
                  <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded mr-2">POST</span>
                  /api/nin-slip
                </TableCell>
                <TableCell className="font-semibold text-slate-900 text-xs">Automated NIN Slip</TableCell>
                <TableCell className="font-mono text-xs font-bold text-slate-900">₦250 / slip</TableCell>
                <TableCell className="text-xs text-slate-500">A4 PDF & Word document output</TableCell>
              </TableRow>

              <TableRow className="hover:bg-slate-50 transition-colors">
                <TableCell className="font-mono text-xs text-slate-700">
                  <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded mr-2">POST</span>
                  /api/nuban-lookup
                </TableCell>
                <TableCell className="font-semibold text-slate-900 text-xs">NUBAN Resolution</TableCell>
                <TableCell className="font-mono text-xs font-bold text-emerald-700">Free</TableCell>
                <TableCell className="text-xs text-slate-500">100% Free across all commercial banks</TableCell>
              </TableRow>

              <TableRow className="bg-slate-50/50">
                <TableCell className="font-mono text-xs text-slate-700">
                  <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded mr-2">GET</span>
                  /api/balance
                </TableCell>
                <TableCell className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
                  Account Balance
                  <Badge variant="verified" size="sm">FREE</Badge>
                </TableCell>
                <TableCell className="font-mono text-xs font-bold text-emerald-700">Free</TableCell>
                <TableCell className="text-xs text-emerald-700 font-medium">Zero charge always</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Provision Dedicated Account Modal */}
      <Modal
        isOpen={provisionModalOpen}
        onClose={() => setProvisionModalOpen(false)}
        title="Setup Dedicated Virtual Bank Account"
        description="Link your verified NIN and phone number to provision a permanent account for instant bank transfer deposits."
      >
        <form onSubmit={handleProvisionDedicatedAccount} className="space-y-4 mt-2">
          {provisionError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {provisionError}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              National Identification Number (NIN)
            </label>
            <Input
              placeholder="11-digit NIN"
              value={ninInput}
              onChange={(e) => setNinInput(e.target.value.replace(/\D/g, "").slice(0, 11))}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Nigerian Phone Number
            </label>
            <Input
              placeholder="e.g. 08012345678"
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              required
            />
            <p className="text-[11px] text-slate-500 mt-1">Must match the phone number registered with Paystack / BVN.</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={consentAgreed}
                onChange={(e) => setConsentAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <span className="text-xs text-slate-600 leading-relaxed">
                I give consent to Verixa to verify my NIN and phone number for identity compliance to create a Dedicated Virtual Account in accordance with NDPA 2023 regulations.
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setProvisionModalOpen(false)}
              className="px-3.5 py-2 text-xs font-medium rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProvisioning}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer shadow-xs"
            >
              {isProvisioning ? "Provisioning..." : "Create Virtual Account"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Topup Checkout Modal */}
      <Modal
        isOpen={topupModalOpen}
        onClose={() => setTopupModalOpen(false)}
        title="Deposit Funds"
        description="Deposit into your prepaid verification wallet via direct bank transfer or online gateway."
      >
        <div className="space-y-4 mt-2">
          {dva && (
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Bank Transfer (Instant Credit)</span>
                <Badge variant="verified" size="sm">AUTO</Badge>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-mono">{dva.bankName}</span>
                  <span className="font-mono text-lg font-bold text-slate-900">{dva.accountNumber}</span>
                  <span className="text-xs text-slate-600 block">{dva.accountName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyAccount(dva.accountNumber)}
                  className="px-2.5 py-1 text-xs font-semibold rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
                >
                  {copiedAccount ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleTopupCheckout} className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Quick Select Amount
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {["2000", "5000", "10000", "25000"].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTopupAmount(amt)}
                    className={`py-1.5 px-2.5 text-xs font-semibold font-mono rounded-lg border transition-all cursor-pointer ${
                      topupAmount === amt
                        ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    ₦{parseInt(amt, 10).toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Custom Deposit Amount (NGN)
              </label>
              <Input
                type="number"
                min="1000"
                step="500"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                placeholder="e.g. 5000"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1">Minimum top-up is ₦1,000.</p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setTopupModalOpen(false)}
                className="px-3.5 py-2 text-xs font-medium rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <span>{isProcessing ? "Processing..." : `Pay ₦${(parseInt(topupAmount, 10) || 0).toLocaleString()}`}</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  )
}
