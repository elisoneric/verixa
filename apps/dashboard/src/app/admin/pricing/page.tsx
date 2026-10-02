"use client"

import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Badge } from "@verixa/ui"
import { ApiClient } from "../../../lib/api"

export default function AdminPricingPage() {
  // 1. Live Base Rates
  const [baseBvn, setBaseBvn] = React.useState("50")
  const [baseNin, setBaseNin] = React.useState("50")
  const [baseNinAdvance, setBaseNinAdvance] = React.useState("140")
  const [baseNinSlip, setBaseNinSlip] = React.useState("270")
  const [baseNuban, setBaseNuban] = React.useState("10")

  // 2. Smart Cache Base Rates
  const [cacheBvn, setCacheBvn] = React.useState("20")
  const [cacheNin, setCacheNin] = React.useState("20")
  const [cacheNinAdvance, setCacheNinAdvance] = React.useState("30")
  const [cacheNinSlip, setCacheNinSlip] = React.useState("50")
  const [cacheNuban, setCacheNuban] = React.useState("5")
  const [cacheEnabled, setCacheEnabled] = React.useState(true)
  const [cacheTtlDays, setCacheTtlDays] = React.useState("30")

  // 3. Bonus promotion
  const [bonusActive, setBonusActive] = React.useState(false)
  const [bonusPercent, setBonusPercent] = React.useState("50")
  const [bonusTitle, setBonusTitle] = React.useState("Special Developer Bonus Days")
  const [bonusExpiry, setBonusExpiry] = React.useState("")

  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)

  const fetchPricing = () => {
    ApiClient.getAdminPricing()
      .then((data) => {
        if (data?.baseRates) {
          setBaseBvn(String(data.baseRates.bvn || 50))
          setBaseNin(String(data.baseRates.nin || 50))
          setBaseNinAdvance(String(data.baseRates.ninAdvance || 140))
          setBaseNinSlip(String(data.baseRates.ninSlip || 270))
          setBaseNuban(String(data.baseRates.nuban || 10))
        }
        if (data?.cacheRates) {
          setCacheBvn(String(data.cacheRates.bvn || 20))
          setCacheNin(String(data.cacheRates.nin || 20))
          setCacheNinAdvance(String(data.cacheRates.ninAdvance || 30))
          setCacheNinSlip(String(data.cacheRates.ninSlip || 50))
          setCacheNuban(String(data.cacheRates.nuban || 5))
        }
        if (data?.cacheSettings) {
          setCacheEnabled(data.cacheSettings.enabled !== false)
          setCacheTtlDays(String(data.cacheSettings.ttlDays || 30))
        }
        if (data?.bonusPromotion) {
          setBonusActive(data.bonusPromotion.active)
          setBonusPercent(String(data.bonusPromotion.discountPercent || 50))
          setBonusTitle(data.bonusPromotion.title || "Special Developer Bonus Days")
          setBonusExpiry(data.bonusPromotion.expiry || "")
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }

  React.useEffect(() => {
    fetchPricing()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      await ApiClient.updateAdminPricing({
        baseRates: {
          bvn: parseInt(baseBvn, 10),
          nin: parseInt(baseNin, 10),
          ninAdvance: parseInt(baseNinAdvance, 10),
          ninSlip: parseInt(baseNinSlip, 10),
          nuban: parseInt(baseNuban, 10),
        },
        cacheRates: {
          bvn: parseInt(cacheBvn, 10),
          nin: parseInt(cacheNin, 10),
          ninAdvance: parseInt(cacheNinAdvance, 10),
          ninSlip: parseInt(cacheNinSlip, 10),
          nuban: parseInt(cacheNuban, 10),
        },
        cacheSettings: {
          enabled: cacheEnabled,
          ttlDays: parseInt(cacheTtlDays, 10) || 30,
        },
        bonusPromotion: {
          active: bonusActive,
          discountPercent: parseInt(bonusPercent, 10),
          title: bonusTitle,
          expiry: bonusExpiry || undefined,
        },
      })
      setMessage("Pricing schedule and Smart Cache settings saved successfully!")
      fetchPricing()
      setTimeout(() => setMessage(null), 3500)
    } catch (err: any) {
      alert(err.message || "Failed to update pricing")
    } finally {
      setIsSaving(false)
    }
  }

  // Calculate Cache Savings Percentages
  const bvnLiveNum = parseInt(baseBvn || "50", 10)
  const bvnCacheNum = parseInt(cacheBvn || "20", 10)
  const bvnSavings = Math.max(0, Math.round(((bvnLiveNum - bvnCacheNum) / bvnLiveNum) * 100))

  const ninLiveNum = parseInt(baseNin || "50", 10)
  const ninCacheNum = parseInt(cacheNin || "20", 10)
  const ninSavings = Math.max(0, Math.round(((ninLiveNum - ninCacheNum) / ninLiveNum) * 100))

  const nubanLiveNum = parseInt(baseNuban || "10", 10)
  const nubanCacheNum = parseInt(cacheNuban || "5", 10)
  const nubanSavings = Math.max(0, Math.round(((nubanLiveNum - nubanCacheNum) / nubanLiveNum) * 100))

  // Slashed promo preview calculations
  const discountFactor = bonusActive ? 1 - parseInt(bonusPercent || "0", 10) / 100 : 1
  const slashedBvn = Math.max(1, Math.round(bvnLiveNum * discountFactor))
  const slashedNin = Math.max(1, Math.round(ninLiveNum * discountFactor))
  const slashedNuban = Math.max(1, Math.round(nubanLiveNum * discountFactor))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Global Pricing & Smart Cache Billing</h1>
            <Badge variant={bonusActive ? "verified" : "mono"} size="sm">
              {bonusActive ? "PROMO ACTIVE" : "STANDARD PRICING"}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Configure live upstream rates, set discounted Smart Cache hit fees, and manage cluster caching policies.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Base Live Upstream Prices */}
        <Card className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 p-6 shadow-xs">
          <CardHeader className="p-0 pb-4 border-b border-slate-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base text-slate-900 dark:text-white">1. Live Upstream Verification Fees (₦ / NGX)</CardTitle>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Standard fee charged when a verification query misses cache and queries upstream registries (Dojah / NIMC / NIBSS).
                </p>
              </div>
              <Badge variant="mono" size="sm">LIVE LOOKUP</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Input
              label="Live BVN Basic (₦)"
              type="number"
              value={baseBvn}
              onChange={(e) => setBaseBvn(e.target.value)}
              required
            />
            <Input
              label="Live NIN Basic (₦)"
              type="number"
              value={baseNin}
              onChange={(e) => setBaseNin(e.target.value)}
              required
            />
            <Input
              label="Live NIN Advance (₦)"
              type="number"
              value={baseNinAdvance}
              onChange={(e) => setBaseNinAdvance(e.target.value)}
              required
            />
            <Input
              label="Live NIN Slip PDF (₦)"
              type="number"
              value={baseNinSlip}
              onChange={(e) => setBaseNinSlip(e.target.value)}
              required
            />
            <Input
              label="Live NUBAN Resolution (₦)"
              type="number"
              value={baseNuban}
              onChange={(e) => setBaseNuban(e.target.value)}
              required
            />
          </CardContent>
        </Card>

        {/* 2. Smart Identity Cache Pricing & Settings */}
        <Card className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 p-6 shadow-xs">
          <CardHeader className="p-0 pb-4 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base text-slate-900 dark:text-white">2. Smart Identity Cache Pricing & Rules</CardTitle>
                <Badge variant="verified" size="sm" className="gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  COST SAVER
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                When a client verifies an identity previously queried within the TTL window, response is served instantly from memory without querying Dojah.
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-zinc-950 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-2xs">
              <input
                type="checkbox"
                checked={cacheEnabled}
                onChange={(e) => setCacheEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-emerald-500 focus:ring-emerald-500"
              />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {cacheEnabled ? "Smart Cache ENABLED" : "Smart Cache Disabled"}
              </span>
            </label>
          </CardHeader>

          <CardContent className="p-0 pt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <Input
                label="Cache BVN Hit (₦)"
                type="number"
                value={cacheBvn}
                onChange={(e) => setCacheBvn(e.target.value)}
                required
              />
              <Input
                label="Cache NIN Hit (₦)"
                type="number"
                value={cacheNin}
                onChange={(e) => setCacheNin(e.target.value)}
                required
              />
              <Input
                label="Cache NIN Adv (₦)"
                type="number"
                value={cacheNinAdvance}
                onChange={(e) => setCacheNinAdvance(e.target.value)}
                required
              />
              <Input
                label="Cache NIN Slip (₦)"
                type="number"
                value={cacheNinSlip}
                onChange={(e) => setCacheNinSlip(e.target.value)}
                required
              />
              <Input
                label="Cache NUBAN (₦)"
                type="number"
                value={cacheNuban}
                onChange={(e) => setCacheNuban(e.target.value)}
                required
              />
              <Input
                label="Cache TTL Duration (Days)"
                type="number"
                min={1}
                max={365}
                value={cacheTtlDays}
                onChange={(e) => setCacheTtlDays(e.target.value)}
                required
              />
            </div>

            {/* Live vs Cache Savings Preview */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Client Savings via Smart Identity Cache
                </span>
                <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                  TTL: {cacheTtlDays} Days • Latency: &lt;15ms
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-lg bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                    <span>BVN Lookup</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">-{bvnSavings}%</span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="text-base font-bold text-slate-900 dark:text-white">₦{cacheBvn}</span>
                    <span className="text-xs line-through text-slate-400 dark:text-zinc-500">₦{baseBvn}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">cache</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                    <span>NIN Verification</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">-{ninSavings}%</span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="text-base font-bold text-slate-900 dark:text-white">₦{cacheNin}</span>
                    <span className="text-xs line-through text-slate-400 dark:text-zinc-500">₦{baseNin}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">cache</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                    <span>NUBAN Account</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">-{nubanSavings}%</span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="text-base font-bold text-slate-900 dark:text-white">₦{cacheNuban}</span>
                    <span className="text-xs line-through text-slate-400 dark:text-zinc-500">₦{baseNuban}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">cache</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Bonus Days / Flash Sales */}
        <Card className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 p-6 shadow-xs">
          <CardHeader className="p-0 pb-4 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-base text-slate-900 dark:text-white">3. Bonus Days Promotional Rate Slash</CardTitle>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Automatically discount live API verification rates across all tenants and display dashboard banners.
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-zinc-950 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-2xs">
              <input
                type="checkbox"
                checked={bonusActive}
                onChange={(e) => setBonusActive(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-emerald-500 focus:ring-emerald-500"
              />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {bonusActive ? "Promo ENABLED" : "Promo Disabled"}
              </span>
            </label>
          </CardHeader>

          <CardContent className="p-0 pt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Discount Percentage (%)"
                type="number"
                min={5}
                max={90}
                value={bonusPercent}
                onChange={(e) => setBonusPercent(e.target.value)}
                disabled={!bonusActive}
              />
              <Input
                label="Campaign Title / Banner Headline"
                type="text"
                value={bonusTitle}
                onChange={(e) => setBonusTitle(e.target.value)}
                disabled={!bonusActive}
              />
              <Input
                label="Promotion Expiry Date (Optional)"
                type="date"
                value={bonusExpiry}
                onChange={(e) => setBonusExpiry(e.target.value)}
                disabled={!bonusActive}
              />
            </div>

            {/* Live Slashed Rates Preview */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Effective Rate Preview During Campaign</span>
                {bonusActive && (
                  <Badge variant="verified" size="sm">
                    {bonusPercent}% OFF ACTIVE
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4 pt-2 text-xs">
                <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs">
                  <span className="text-slate-500 dark:text-zinc-500 block text-[10px]">BVN Verification</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-base font-bold text-slate-900 dark:text-white">₦{slashedBvn}</span>
                    {bonusActive && <span className="text-xs line-through text-slate-400 dark:text-zinc-500">₦{baseBvn}</span>}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs">
                  <span className="text-slate-500 dark:text-zinc-500 block text-[10px]">NIN Verification</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-base font-bold text-slate-900 dark:text-white">₦{slashedNin}</span>
                    {bonusActive && <span className="text-xs line-through text-slate-400 dark:text-zinc-500">₦{baseNin}</span>}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs">
                  <span className="text-slate-500 dark:text-zinc-500 block text-[10px]">NUBAN Resolution</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-base font-bold text-slate-900 dark:text-white">₦{slashedNuban}</span>
                    {bonusActive && <span className="text-xs line-through text-slate-400 dark:text-zinc-500">₦{baseNuban}</span>}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="submit"
            variant="emerald"
            size="md"
            isLoading={isSaving}
          >
            Save & Publish Pricing Schedule
          </Button>
        </div>
      </form>
    </div>
  )
}
