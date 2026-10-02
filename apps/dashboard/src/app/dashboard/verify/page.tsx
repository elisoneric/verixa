"use client"

import * as React from "react"
import { Button, Input, Badge, Card, CardHeader, CardTitle, CardContent, Tabs } from "@verixa/ui"
import { useAuth } from "../../../lib/auth-context"
import { ApiClient } from "../../../lib/api"

export default function ManualVerifyPage() {
  const { environment, setEnvironment, refreshBalance } = useAuth()
  const [service, setService] = React.useState<"bvn" | "nin" | "nuban">("bvn")
  const [bvn, setBvn] = React.useState("22123456789")
  const [firstName, setFirstName] = React.useState("CHIDERA")
  const [nin, setNin] = React.useState("11234567890")
  const [accountNumber, setAccountNumber] = React.useState("0123456789")
  const [bankCode, setBankCode] = React.useState("058")

  const [isLoading, setIsLoading] = React.useState(false)
  const [result, setResult] = React.useState<any | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setResult(null)

    let payload: any = {}
    if (service === "bvn") {
      payload = { bvn, firstName }
    } else if (service === "nin") {
      payload = { nin }
    } else {
      payload = { accountNumber, bankCode }
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
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Manual Verification Workspace
            </h1>
            <Badge variant={environment === "live" ? "verified" : "warning"} size="sm">
              {environment.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Perform individual KYC identity and bank checks directly from your dashboard.
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
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card className="bg-zinc-900/60 border-zinc-800 p-6 space-y-6">
          {/* Service Selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-zinc-400 uppercase">Verification Type</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setService("bvn")}
                className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all ${
                  service === "bvn"
                    ? "bg-zinc-800 border-emerald-500/40 text-emerald-400 font-bold"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400"
                }`}
              >
                BVN
              </button>
              <button
                type="button"
                onClick={() => setService("nin")}
                className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all ${
                  service === "nin"
                    ? "bg-zinc-800 border-sky-500/40 text-sky-400 font-bold"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400"
                }`}
              >
                NIN
              </button>
              <button
                type="button"
                onClick={() => setService("nuban")}
                className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all ${
                  service === "nuban"
                    ? "bg-zinc-800 border-indigo-500/40 text-indigo-400 font-bold"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400"
                }`}
              >
                Bank Account
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-medium">
                {error}
              </div>
            )}

            {service === "bvn" && (
              <>
                <Input
                  label="11-Digit Bank Verification Number (BVN)"
                  placeholder="22123456789"
                  value={bvn}
                  onChange={(e) => setBvn(e.target.value)}
                  maxLength={11}
                  required
                />
                <Input
                  label="First Name (For Fuzzy Name Match)"
                  placeholder="CHIDERA"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  hint="Matches against the official bank registry."
                />
              </>
            )}

            {service === "nin" && (
              <Input
                label="11-Digit National Identification Number (NIN)"
                placeholder="11234567890"
                value={nin}
                onChange={(e) => setNin(e.target.value)}
                maxLength={11}
                required
              />
            )}

            {service === "nuban" && (
              <>
                <Input
                  label="10-Digit NUBAN Account Number"
                  placeholder="0123456789"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  maxLength={10}
                  required
                />
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-300">Bank Institution</label>
                  <select
                    value={bankCode}
                    onChange={(e) => setBankCode(e.target.value)}
                    className="w-full h-9 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
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

            <div className="pt-2">
              <Button
                type="submit"
                variant="emerald"
                size="md"
                className="w-full"
                isLoading={isLoading}
              >
                Perform {service.toUpperCase()} Verification
              </Button>
            </div>
          </form>
        </Card>

        {/* Verification Result Card */}
        <Card className="bg-zinc-900/60 border-zinc-800 p-6 min-h-[360px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <span className="text-xs font-mono text-zinc-400 uppercase">Verification Result</span>
              {result && (
                <Badge variant={result.status === "verified" || result.status === "success" ? "verified" : "failed"} size="sm">
                  {result.status === "verified" || result.status === "success" ? "VERIFIED" : "FAILED"}
                </Badge>
              )}
            </div>

            {result ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] text-zinc-500 font-mono block">REFERENCE ID</span>
                    <span className="text-xs font-mono text-zinc-300 font-bold">
                      {result.meta?.referenceId?.slice(0, 14) || "VX-8F19A02D"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-500 font-mono block">VERIFIED AT</span>
                    <span className="text-xs font-mono text-zinc-300">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 text-xs">
                  {result.data?.first_name && (
                    <div className="flex justify-between border-b border-zinc-800/80 pb-2">
                      <span className="text-zinc-500">Full Name</span>
                      <span className="text-white font-semibold">
                        {result.data.first_name} {result.data.last_name}
                      </span>
                    </div>
                  )}

                  {result.data?.account_name && (
                    <div className="flex justify-between border-b border-zinc-800/80 pb-2">
                      <span className="text-zinc-500">Account Name</span>
                      <span className="text-white font-semibold">
                        {result.data.account_name}
                      </span>
                    </div>
                  )}

                  {result.data?.phone_number && (
                    <div className="flex justify-between border-b border-zinc-800/80 pb-2">
                      <span className="text-zinc-500">Phone Number</span>
                      <span className="text-zinc-300 font-mono">
                        {result.data.phone_number.slice(0, 4)}••••{result.data.phone_number.slice(-3)}
                      </span>
                    </div>
                  )}

                  {result.data?.date_of_birth && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Date of Birth</span>
                      <span className="text-zinc-300 font-mono">
                        {result.data.date_of_birth}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-xs text-zinc-500 font-mono">
                Submit an identity verification query on the left to view the verified customer credentials.
              </div>
            )}
          </div>

          {result && (
            <div className="pt-4 border-t border-zinc-800 flex justify-end">
              <Button
                variant="outline"
                size="xs"
                onClick={() => alert("Verification report downloaded as PDF")}
              >
                Download Verification Report (PDF)
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
