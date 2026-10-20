"use client"

import * as React from "react"
import { Button, Input, Badge, Card, Tabs } from "@verixa/ui"
import { useAuth } from "../../../lib/auth-context"
import { ApiClient } from "../../../lib/api"

export default function ManualVerifyPage() {
  const { environment, setEnvironment, refreshBalance } = useAuth()
  const [service, setService] = React.useState<"bvn" | "nin" | "nuban" | "phone" | "cac">("bvn")
  const [bvn, setBvn] = React.useState("")
  const [nin, setNin] = React.useState("")
  const [accountNumber, setAccountNumber] = React.useState("")
  const [bankCode, setBankCode] = React.useState("058")
  const [phone, setPhone] = React.useState("")
  const [rcNumber, setRcNumber] = React.useState("")
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
      payload = { bvn: bvn.trim(), consent: true }
    } else if (service === "nin") {
      payload = { nin: nin.trim(), consent: true }
    } else if (service === "phone") {
      payload = { phoneNumber: phone.trim(), consent: true }
    } else if (service === "cac") {
      payload = { rcNumber: rcNumber.trim(), companyType, consent: true }
    } else if (service === "nuban") {
      payload = { accountNumber: accountNumber.trim(), bankCode, consent: true }
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-heading">
              Identity Verification
            </h1>
            <Badge variant={environment === "live" ? "verified" : "warning"} size="sm">
              {environment.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Perform authorized individual KYC and bank account lookups.
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
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5 shadow-xs">
          {/* Service Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide block">
              Verification Service
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {(
                [
                  { id: "bvn", label: "BVN" },
                  { id: "nin", label: "NIN" },
                  { id: "phone", label: "Phone" },
                  { id: "cac", label: "CAC" },
                  { id: "nuban", label: "Bank" },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setService(item.id)}
                  className={`h-9 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    service === item.id
                      ? "bg-slate-900 border-slate-900 text-white shadow-2xs font-bold"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            {service === "bvn" && (
              <Input
                label="11-Digit BVN"
                value={bvn}
                onChange={(e) => setBvn(e.target.value)}
                maxLength={11}
                required
              />
            )}

            {service === "nin" && (
              <Input
                label="11-Digit NIN"
                value={nin}
                onChange={(e) => setNin(e.target.value)}
                maxLength={11}
                required
              />
            )}

            {service === "phone" && (
              <Input
                label="Nigerian Phone Number"
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
                  value={rcNumber}
                  onChange={(e) => setRcNumber(e.target.value)}
                  required
                />
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    Company Type
                  </label>
                  <select
                    value={companyType}
                    onChange={(e) => setCompanyType(e.target.value)}
                    className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:border-slate-900 focus:outline-none shadow-2xs cursor-pointer"
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
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  maxLength={10}
                  required
                />
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    Bank
                  </label>
                  <select
                    value={bankCode}
                    onChange={(e) => setBankCode(e.target.value)}
                    className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:border-slate-900 focus:outline-none shadow-2xs cursor-pointer"
                  >
                    <option value="058">Guaranty Trust Bank (058)</option>
                    <option value="011">First Bank of Nigeria (011)</option>
                    <option value="033">United Bank for Africa (033)</option>
                    <option value="057">Zenith Bank (057)</option>
                    <option value="044">Access Bank (044)</option>
                    <option value="070">Fidelity Bank (070)</option>
                    <option value="214">First City Monument Bank (214)</option>
                    <option value="221">Stanbic IBTC Bank (221)</option>
                    <option value="232">Sterling Bank (232)</option>
                    <option value="035">Wema Bank (035)</option>
                    <option value="50211">Kuda Bank (50211)</option>
                    <option value="50515">Moniepoint Microfinance Bank (50515)</option>
                    <option value="999992">OPay / PayCom (999992)</option>
                    <option value="999991">PalmPay (999991)</option>
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
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
              />
              <label htmlFor="manualConsent" className="text-xs text-slate-600 select-none cursor-pointer">
                I confirm applicant consent has been obtained.
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || !consent}
                className="w-full py-2.5 px-4 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isLoading ? "Querying Registry..." : `Verify ${service.toUpperCase()}`}
              </button>
            </div>
          </form>
        </div>

        {/* Verification Result Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 min-h-[380px] flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Registry Result</h2>
              {result && (
                <Badge variant={result.status === "success" || result.status === "verified" ? "verified" : "failed"} size="sm">
                  {result.status === "success" || result.status === "verified" ? "VERIFIED" : "FAILED"}
                </Badge>
              )}
            </div>

            {isLoading && (
              <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                <span className="text-xs font-mono">Querying verification registry...</span>
              </div>
            )}

            {!isLoading && !result && !error && (
              <div className="py-20 text-center text-slate-400">
                <p className="text-xs">Fill out the verification details and submit.</p>
              </div>
            )}

            {!isLoading && result && (
              <div className="mt-4 space-y-2 font-mono text-xs max-h-[380px] overflow-y-auto pr-1">
                {result.data &&
                  Object.entries(result.data).map(([key, val]) => {
                    const isPhoto = key.toLowerCase() === "photo" && typeof val === "string" && val.length > 50
                    const isObject = typeof val === "object" && val !== null
                    return (
                      <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-slate-100 gap-1">
                        <span className="text-slate-500 capitalize">{key.replace(/_/g, " ")}:</span>
                        {isPhoto ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Photo Verified</span>
                            <img
                              src={val.startsWith("data:") ? val : `data:image/jpeg;base64,${val}`}
                              alt="Applicant Portrait"
                              className="h-8 w-8 rounded object-cover border border-emerald-300"
                            />
                          </div>
                        ) : isObject ? (
                          <span className="text-slate-800 font-medium text-[11px] bg-slate-50 px-2 py-1 rounded max-w-[260px] truncate" title={JSON.stringify(val)}>
                            {JSON.stringify(val)}
                          </span>
                        ) : (
                          <span className="text-slate-900 font-semibold">{String(val || "N/A")}</span>
                        )}
                      </div>
                    )
                  })}
              </div>
            )}
          </div>

          {result?.meta && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>LATENCY: {result.meta.latency_ms || 120}ms</span>
              <span>REF: {result.meta.referenceId?.slice(0, 14)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
