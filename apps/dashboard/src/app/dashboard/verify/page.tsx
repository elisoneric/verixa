"use client"

import * as React from "react"
import { Button, Input, Badge, Card, Tabs } from "@verixa/ui"
import { useAuth } from "../../../lib/auth-context"
import { ApiClient } from "../../../lib/api"

export default function ManualVerifyPage() {
  const { environment, setEnvironment, refreshBalance } = useAuth()
  const [service, setService] = React.useState<"bvn" | "nin" | "nuban" | "phone" | "cac">("bvn")
  const [bvn, setBvn] = React.useState("22123456789")
  const [firstName, setFirstName] = React.useState("CHIDERA")
  const [nin, setNin] = React.useState("11234567890")
  const [accountNumber, setAccountNumber] = React.useState("0123456789")
  const [bankCode, setBankCode] = React.useState("058")
  const [phone, setPhone] = React.useState("08012345678")
  const [rcNumber, setRcNumber] = React.useState("1234567")
  const [companyType, setCompanyType] = React.useState("COMPANY")
  const [consent, setConsent] = React.useState(true)

  const [isLoading, setIsLoading] = React.useState(false)
  const [result, setResult] = React.useState<any | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!consent) {
      setError("Applicant consent is required to perform verification.")
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    let payload: any = {}
    if (service === "bvn") {
      payload = { bvn, firstName, consent: true }
    } else if (service === "nin") {
      payload = { nin, consent: true }
    } else if (service === "phone") {
      payload = { phoneNumber: phone, consent: true }
    } else if (service === "cac") {
      payload = { rcNumber, companyType, consent: true }
    } else {
      payload = { accountNumber, bankCode, consent: true }
    }

    try {
      const res = await ApiClient.manualVerify(service, environment, payload)
      setResult(res)
      refreshBalance()
    } catch (err: any) {
      setError(err.message || "Verification request failed.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Identity Verification
            </h1>
            <Badge variant={environment === "live" ? "verified" : "warning"} size="sm">
              {environment.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Perform individual KYC identity and bank account checks.
          </p>
        </div>

        <Tabs
          variant="pills"
          activeTab={environment}
          onChange={(id) => setEnvironment(id as "sandbox" | "live")}
          tabs={[
            { id: "sandbox", label: "Sandbox" },
            { id: "live", label: "Live" },
          ]}
        />
      </div>

      {/* Main Form Grid */}
      <div className="grid md:grid-cols-2 gap-6 items-start">
        <Card className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 p-6 space-y-5 shadow-xs">
          {/* Service Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wide">
              Verification Service
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setService("bvn")}
                className={`h-10 text-xs font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                  service === "bvn"
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold shadow-2xs"
                    : "bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50"
                }`}
              >
                BVN
              </button>
              <button
                type="button"
                onClick={() => setService("nin")}
                className={`h-10 text-xs font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                  service === "nin"
                    ? "bg-sky-50 dark:bg-sky-950/40 border-sky-500 text-sky-700 dark:text-sky-400 font-bold shadow-2xs"
                    : "bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50"
                }`}
              >
                NIN
              </button>
              <button
                type="button"
                onClick={() => setService("phone")}
                className={`h-10 text-xs font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                  service === "phone"
                    ? "bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-700 dark:text-amber-400 font-bold shadow-2xs"
                    : "bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50"
                }`}
              >
                Phone
              </button>
              <button
                type="button"
                onClick={() => setService("cac")}
                className={`h-10 text-xs font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                  service === "cac"
                    ? "bg-purple-50 dark:bg-purple-950/40 border-purple-500 text-purple-700 dark:text-purple-400 font-bold shadow-2xs"
                    : "bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50"
                }`}
              >
                CAC Company
              </button>
              <button
                type="button"
                onClick={() => setService("nuban")}
                className={`h-10 text-xs font-semibold rounded-lg border text-center transition-all cursor-pointer sm:col-span-2 ${
                  service === "nuban"
                    ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-400 font-bold shadow-2xs"
                    : "bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50"
                }`}
              >
                Bank (NUBAN)
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/25 text-rose-700 dark:text-rose-400 text-xs font-medium">
                {error}
              </div>
            )}

            {service === "bvn" && (
              <>
                <Input
                  label="11-Digit BVN"
                  placeholder="22123456789"
                  value={bvn}
                  onChange={(e) => setBvn(e.target.value)}
                  maxLength={11}
                  required
                />
                <Input
                  label="First Name (For Matching)"
                  placeholder="CHIDERA"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </>
            )}

            {service === "nin" && (
              <Input
                label="11-Digit NIN"
                placeholder="11234567890"
                value={nin}
                onChange={(e) => setNin(e.target.value)}
                maxLength={11}
                required
              />
            )}

            {service === "phone" && (
              <Input
                label="Nigerian Phone Number"
                placeholder="08012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={14}
                required
              />
            )}

            {service === "cac" && (
              <>
                <Input
                  label="CAC Registration / RC Number"
                  placeholder="1234567"
                  value={rcNumber}
                  onChange={(e) => setRcNumber(e.target.value)}
                  required
                />
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wide">
                    Company Type
                  </label>
                  <select
                    value={companyType}
                    onChange={(e) => setCompanyType(e.target.value)}
                    className="w-full h-10 rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-xs text-slate-900 dark:text-white focus:border-purple-500 focus:outline-none shadow-2xs"
                  >
                    <option value="COMPANY">Limited Liability Company (RC)</option>
                    <option value="BUSINESS_NAME">Business Name (BN)</option>
                    <option value="INCORPORATED_TRUSTEES">Incorporated Trustees (IT / NGO)</option>
                    <option value="LIMITED_PARTNERSHIP">Limited Partnership (LP)</option>
                    <option value="LIMITED_LIABILITY_PARTNERSHIP">Limited Liability Partnership (LLP)</option>
                  </select>
                </div>
              </>
            )}

            {service === "nuban" && (
              <>
                <Input
                  label="10-Digit Account Number"
                  placeholder="0123456789"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  maxLength={10}
                  required
                />
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wide">
                    Bank
                  </label>
                  <select
                    value={bankCode}
                    onChange={(e) => setBankCode(e.target.value)}
                    className="w-full h-11 rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 text-sm text-slate-900 dark:text-zinc-100 focus:border-emerald-600 focus:outline-none shadow-2xs"
                  >
                    <option value="058">Guaranty Trust Bank (058)</option>
                    <option value="011">First Bank of Nigeria (011)</option>
                    <option value="033">United Bank for Africa (033)</option>
                    <option value="057">Zenith Bank (057)</option>
                    <option value="044">Access Bank (044)</option>
                    <option value="999">Titan Trust Bank (999)</option>
                  </select>
                </div>
              </>
            )}

            {/* Consent Checkbox */}
            <div className="flex items-center gap-2 pt-1 pb-1">
              <input
                type="checkbox"
                id="manualConsent"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="manualConsent" className="text-xs text-slate-600 dark:text-zinc-400 select-none cursor-pointer">
                I confirm applicant consent has been obtained.
              </label>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="emerald"
                size="md"
                className="w-full font-semibold h-11"
                disabled={isLoading || !consent}
              >
                {isLoading ? "Querying Registry..." : `Verify ${service.toUpperCase()}`}
              </Button>
            </div>
          </form>
        </Card>

        {/* Verification Result Card */}
        <Card className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 p-6 min-h-[380px] flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Registry Result</h3>
              {result && (
                <Badge variant={result.status === "success" || result.status === "verified" ? "verified" : "failed"} size="sm">
                  {result.status === "success" || result.status === "verified" ? "VERIFIED" : "FAILED"}
                </Badge>
              )}
            </div>

            {isLoading && (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                <span className="text-xs font-mono">Querying official registry...</span>
              </div>
            )}

            {!isLoading && !result && !error && (
              <div className="py-20 text-center text-slate-400 dark:text-zinc-500">
                <p className="text-xs">Fill out the verification details and submit.</p>
              </div>
            )}

            {!isLoading && result && (
              <div className="mt-4 space-y-3 font-mono text-xs">
                {result.data &&
                  Object.entries(result.data).map(([key, val]) => (
                    <div key={key} className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800/60">
                      <span className="text-slate-500 dark:text-zinc-500 capitalize">{key.replace(/_/g, " ")}:</span>
                      <span className="text-slate-900 dark:text-zinc-200 font-semibold">{String(val || "N/A")}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {result?.meta && (
            <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>LATENCY: {result.meta.latency_ms || 120}ms</span>
              <span>REF: {result.meta.referenceId?.slice(0, 14)}</span>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
