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

  const currentBalance =
    environment === "live"
      ? balance?.live.balance ?? 0
      : balance?.sandbox.balance ?? 100000

  const dva = balance?.dedicatedVirtualAccount;

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
      setProvisionError("Applicant consent is required under NDPA regulations.")
      return
    }

    setIsProvisioning(true)
    try {
      await ApiClient.provisionDedicatedAccount(ninInput.trim(), phoneInput.trim(), true)
      await refreshBalance()
      setProvisionModalOpen(false)
      alert("Dedicated Paystack Virtual Account provisioned successfully!")
    } catch (err: any) {
      setProvisionError(err.message || "Failed to provision dedicated account.")
    } finally {
      setIsProvisioning(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Promotional Flash Sale Banner if active */}
      {balance?.bonusPromotion?.active && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight">{balance.bonusPromotion.title}</span>
                <Badge variant="verified" size="sm">
                  {balance.bonusPromotion.discountPercent}% OFF ACTIVE
                </Badge>
              </div>
              <p className="text-xs text-emerald-300/80 mt-0.5">
                Limited promotional top-up discount automatically applied on instant checkout.
              </p>
            </div>
          </div>
          <Button size="sm" variant="emerald" onClick={() => setTopupModalOpen(true)} className="shrink-0 font-semibold">
            Top Up &rarr;
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Billing & NGX Credits
            </h1>
            <Badge variant="verified" size="sm">
              1 NGX = ₦1.00
            </Badge>
            <Badge variant={tier === "ENTERPRISE" ? "verified" : tier === "GROWTH" ? "info" : "mono"} size="sm">
              {tier} PLAN
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
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
        <Card className="glass-card bg-[#0e1118]/70 border border-white/[0.08] p-6 flex flex-col justify-between shadow-xl backdrop-blur-xl rounded-2xl">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider">
                {environment} Available Balance
              </span>
              <Badge variant={environment === "live" ? "verified" : "warning"} size="sm">
                {environment.toUpperCase()}
              </Badge>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold font-mono text-white tracking-tight">
                {currentBalance.toLocaleString()}
              </span>
              <span className="text-sm font-mono text-emerald-400 font-bold">NGX</span>
            </div>

            <p className="text-xs text-zinc-400 mt-2">
              Equivalent to <strong className="text-white">₦{currentBalance.toLocaleString()}.00 NGN</strong>
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-zinc-400">
            <span>Prepaid metered deductions</span>
            <span>Zero charges on failed requests</span>
          </div>
        </Card>

        {/* Dedicated Virtual Account (DVA) Card */}
        <Card className="glass-card bg-[#0e1118]/70 border border-white/[0.08] p-6 flex flex-col justify-between shadow-xl backdrop-blur-xl rounded-2xl">
          {dva ? (
            <div>
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">PAYSTACK DEDICATED ACCOUNT</span>
                  <h4 className="text-sm font-bold text-white">{dva.bankName}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="verified" size="sm">AUTO-CREDIT</Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-xs text-zinc-400">Dedicated Account Number</span>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="font-mono text-2xl font-bold text-white tracking-widest">
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
                  <span className="text-xs text-zinc-400">Account Beneficiary</span>
                  <p className="text-xs font-semibold text-zinc-200">{dva.accountName}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-[11px] text-zinc-400">
                  {dva.note}
                </p>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setProvisionModalOpen(true)}
                  className="shrink-0 text-[11px]"
                >
                  Update NIN / Phone &rarr;
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">PAYSTACK DEDICATED ACCOUNT</span>
                    <h4 className="text-sm font-bold text-white">Direct Virtual Account Funding</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="neutral" size="sm">NOT PROVISIONED</Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Automate live wallet funding via direct bank transfer. Provision a dedicated virtual bank account with applicant NIN and phone number.
                  </p>
                  <Button
                    variant="emerald"
                    size="sm"
                    onClick={() => setProvisionModalOpen(true)}
                    className="mt-2 font-semibold"
                  >
                    + Provision Dedicated Account
                  </Button>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-white/[0.08] text-[11px] text-zinc-400">
                Transfers auto-credit your Live NGX balance instantly via Paystack.
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Pricing Rates Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">Active Metered Rate Schedule ({tier} Plan)</h3>
            </div>
            <p className="text-xs text-zinc-400">Unit costs charged per successful verification. Zero charges on failed lookups.</p>
          </div>
          <AppLink app="www" path="/contact" className="text-xs text-emerald-400 hover:text-emerald-300 underline font-medium">
            Contact Sales for Custom Volume Tier &rarr;
          </AppLink>
        </div>

        <div className="rounded-xl border border-white/[0.08] overflow-hidden bg-[#0c0e14]/70 backdrop-blur-md">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/[0.08] bg-[#0e1118]/80 text-zinc-400">
                <TableHead>Method & Endpoint</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Active Rate</TableHead>
                <TableHead>Billing Policy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-white/[0.06]">
              <TableRow className="hover:bg-white/[0.02] transition-colors">
                <TableCell className="font-mono text-xs">
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 mr-2">POST</span>
                  <span className="text-zinc-200">/api/nin-verification</span>
                </TableCell>
                <TableCell className="font-medium text-white">NIN Verification</TableCell>
                <TableCell className="font-sans font-bold text-emerald-400">₦95 / query</TableCell>
                <TableCell className="text-xs text-zinc-400">Charged on 200 OK lookup</TableCell>
              </TableRow>

              <TableRow className="hover:bg-white/[0.02] transition-colors">
                <TableCell className="font-mono text-xs">
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 mr-2">POST</span>
                  <span className="text-zinc-200">/api/bvn-verification</span>
                </TableCell>
                <TableCell className="font-medium text-white">BVN Verification</TableCell>
                <TableCell className="font-sans font-bold text-emerald-400">₦95 / query</TableCell>
                <TableCell className="text-xs text-zinc-400">Charged on 200 OK lookup</TableCell>
              </TableRow>

              <TableRow className="hover:bg-white/[0.02] transition-colors">
                <TableCell className="font-mono text-xs">
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 mr-2">POST</span>
                  <span className="text-zinc-200">/api/nin-phone</span>
                </TableCell>
                <TableCell className="font-medium text-white">NIN Phone Search</TableCell>
                <TableCell className="font-sans font-bold text-emerald-400">₦50 / query</TableCell>
                <TableCell className="text-xs text-zinc-400">Charged on 200 OK lookup</TableCell>
              </TableRow>

              <TableRow className="hover:bg-white/[0.02] transition-colors">
                <TableCell className="font-mono text-xs">
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 mr-2">POST</span>
                  <span className="text-zinc-200">/api/bvn-phone</span>
                </TableCell>
                <TableCell className="font-medium text-white">BVN Phone Search</TableCell>
                <TableCell className="font-sans font-bold text-emerald-400">₦50 / query</TableCell>
                <TableCell className="text-xs text-zinc-400">Charged on 200 OK lookup</TableCell>
              </TableRow>

              <TableRow className="hover:bg-white/[0.02] transition-colors">
                <TableCell className="font-mono text-xs">
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 mr-2">POST</span>
                  <span className="text-zinc-200">/api/nin-demography</span>
                </TableCell>
                <TableCell className="font-medium text-white">NIN Demography</TableCell>
                <TableCell className="font-sans font-bold text-emerald-400">₦95 / query</TableCell>
                <TableCell className="text-xs text-zinc-400">Charged on 200 OK lookup</TableCell>
              </TableRow>

              <TableRow className="hover:bg-white/[0.02] transition-colors">
                <TableCell className="font-mono text-xs">
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 mr-2">POST</span>
                  <span className="text-zinc-200">/api/nin-tracking</span>
                </TableCell>
                <TableCell className="font-medium text-white">NIN Tracking</TableCell>
                <TableCell className="font-sans font-bold text-emerald-400">₦50 / query</TableCell>
                <TableCell className="text-xs text-zinc-400">Charged on 200 OK lookup</TableCell>
              </TableRow>

              <TableRow className="hover:bg-white/[0.02] transition-colors">
                <TableCell className="font-mono text-xs">
                  <span className="text-sky-400 font-bold bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20 mr-2">POST</span>
                  <span className="text-zinc-200">/api/nin-slip</span>
                </TableCell>
                <TableCell className="font-medium text-white">Automated NIN Slip</TableCell>
                <TableCell className="font-sans font-bold text-sky-400">₦250 / slip</TableCell>
                <TableCell className="text-xs text-zinc-400">A4 PDF & Word document output</TableCell>
              </TableRow>

              <TableRow className="hover:bg-white/[0.02] transition-colors">
                <TableCell className="font-mono text-xs">
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 mr-2">POST</span>
                  <span className="text-zinc-200">/api/nuban-lookup</span>
                </TableCell>
                <TableCell className="font-medium text-white">NUBAN Resolution</TableCell>
                <TableCell className="font-sans font-bold text-emerald-400">Free</TableCell>
                <TableCell className="text-xs text-zinc-400">100% Free across all banks</TableCell>
              </TableRow>

              <TableRow className="bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors">
                <TableCell className="font-mono text-xs">
                  <span className="text-sky-400 font-bold bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20 mr-2">GET</span>
                  <span className="text-zinc-200">/api/balance</span>
                </TableCell>
                <TableCell className="font-medium text-white flex items-center gap-2">
                  Account Balance
                  <Badge variant="verified" size="sm">FREE</Badge>
                </TableCell>
                <TableCell className="font-sans font-bold text-emerald-400">Free</TableCell>
                <TableCell className="text-xs text-emerald-400">Zero Charge Always</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Provision Dedicated Account Modal */}
      <Modal
        isOpen={provisionModalOpen}
        onClose={() => setProvisionModalOpen(false)}
        title="Provision Dedicated Paystack Account"
        description="Link your verified NIN and phone number to create a dedicated NUBAN account in your name."
      >
        <form onSubmit={handleProvisionDedicatedAccount} className="space-y-4 mt-2">
          {provisionError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {provisionError}
            </div>
          )}

          <Input
            label="National Identification Number (NIN)"
            placeholder="11-digit NIN"
            value={ninInput}
            onChange={(e) => setNinInput(e.target.value.replace(/\D/g, "").slice(0, 11))}
            className="!text-white !bg-[#121620] !border-white/[0.12]"
            required
          />

          <Input
            label="Phone Number"
            placeholder="e.g. 08012345678"
            type="tel"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            className="!text-white !bg-[#121620] !border-white/[0.12]"
            required
          />

          <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={consentAgreed}
                onChange={(e) => setConsentAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-white/[0.2] bg-black/40 text-emerald-500 focus:ring-emerald-500"
              />
              <span className="text-xs text-zinc-300 leading-relaxed">
                I give consent to Verixa to verify my NIN and phone number for identity compliance to provision a Dedicated Virtual Account with Paystack in compliance with the Nigeria Data Protection Act (NDPA 2023).
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setProvisionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="emerald"
              size="sm"
              isLoading={isProvisioning}
            >
              Provision Dedicated NUBAN
            </Button>
          </div>
        </form>
      </Modal>

      {/* Topup Modal */}
      <Modal
        isOpen={topupModalOpen}
        onClose={() => setTopupModalOpen(false)}
        title="Fund Live Wallet Balance"
        description="Transfer to your dedicated virtual account or initialize online checkout."
      >
        <div className="space-y-4 mt-2">
          {/* Primary Recommended Method: Dedicated Account */}
          {dva ? (
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400">RECOMMENDED: AUTOMATED BANK TRANSFER</span>
                <Badge variant="verified" size="sm">INSTANT CREDIT</Badge>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Transfer directly from your bank app or USSD to your Paystack Dedicated Account. Your live NGX balance is auto-credited immediately upon settlement:
              </p>
              <div className="p-3 rounded-lg bg-[#0e1118] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-400 block uppercase font-mono">Bank Name</span>
                    <span className="text-xs font-bold text-white">{dva.bankName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block uppercase font-mono">Beneficiary</span>
                    <span className="text-xs font-semibold text-zinc-300">{dva.accountName}</span>
                  </div>
                </div>
                <div className="pt-2 flex items-center justify-between border-t border-white/[0.08]">
                  <div>
                    <span className="text-[10px] text-zinc-400 block uppercase font-mono">Dedicated Account</span>
                    <span className="font-mono text-base font-extrabold text-emerald-400 tracking-wider">{dva.accountNumber}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => {
                      navigator.clipboard.writeText(dva.accountNumber)
                      alert(`Account number ${dva.accountNumber} copied to clipboard!`)
                    }}
                  >
                    Copy Number
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-400">AUTOMATED BANK TRANSFER</span>
                <Badge variant="neutral" size="sm">NOT PROVISIONED</Badge>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                You do not have a dedicated virtual account provisioned yet. Provision your account to enable instant bank transfers, or fund via card below.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-1 border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                onClick={() => {
                  setTopupModalOpen(false)
                  setProvisionModalOpen(true)
                }}
              >
                + Provision Dedicated Account
              </Button>
            </div>
          )}

          {/* Secondary Method: Online Paystack */}
          <form onSubmit={handleTopupCheckout} className="space-y-3 pt-2 border-t border-white/[0.08]">
            <span className="text-xs font-semibold text-zinc-300 block">Alternative: Online Card / Gateway Checkout</span>
            <Input
              label="Deposit Amount (NGN / NGX)"
              type="number"
              min="1000"
              step="1000"
              value={topupAmount}
              onChange={(e) => setTopupAmount(e.target.value)}
              className="!text-white !bg-[#121620] !border-white/[0.12]"
              hint="1 NGX = ₦1.00 NGN. Minimum topup is ₦1,000."
              required
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
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
