"use client"

import * as React from "react"
import { Card, Button, Input, Badge } from "@verixa/ui"
import { ApiClient } from "../../../lib/api"

export default function AdminPricingPage() {
  // 1. Live Base Rates
  const [baseBvn, setBaseBvn] = React.useState("50")
  const [baseNin, setBaseNin] = React.useState("50")
  const [baseNinAdvance, setBaseNinAdvance] = React.useState("140")
  const [baseNinSlip, setBaseNinSlip] = React.useState("270")
  const [baseNuban, setBaseNuban] = React.useState("0")
  const [basePhone, setBasePhone] = React.useState("85")
  const [baseCac, setBaseCac] = React.useState("120")
  const [baseData, setBaseData] = React.useState("220")
  const [baseAirtime, setBaseAirtime] = React.useState("0")
  const [baseSms, setBaseSms] = React.useState("5")

  // 2. Smart Cache Base Rates
  const [cacheBvn, setCacheBvn] = React.useState("20")
  const [cacheNin, setCacheNin] = React.useState("20")
  const [cacheNinAdvance, setCacheNinAdvance] = React.useState("30")
  const [cacheNinSlip, setCacheNinSlip] = React.useState("50")
  const [cacheNuban, setCacheNuban] = React.useState("0")
  const [cachePhone, setCachePhone] = React.useState("30")
  const [cacheCac, setCacheCac] = React.useState("40")
  const [cacheEnabled, setCacheEnabled] = React.useState(true)
  const [cacheTtlDays, setCacheTtlDays] = React.useState("30")

  // 3. Bonus promotion
  const [bonusActive, setBonusActive] = React.useState(false)
  const [bonusPercent, setBonusPercent] = React.useState("20")
  const [bonusTitle, setBonusTitle] = React.useState("Special Developer Bonus Days")
  const [bonusExpiry, setBonusExpiry] = React.useState("")

  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isBroadcasting, setIsBroadcasting] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)

  const fetchPricing = () => {
    ApiClient.getAdminPricing()
      .then((data: any) => {
        if (data?.baseRates) {
          setBaseBvn(String(data.baseRates.bvn ?? 95))
          setBaseNin(String(data.baseRates.nin ?? 95))
          setBaseNinAdvance(String(data.baseRates.ninAdvance ?? 95))
          setBaseNinSlip(String(data.baseRates.ninSlip ?? 250))
          setBaseNuban(String(data.baseRates.nuban ?? 0))
          setBasePhone(String(data.baseRates.phone ?? 50))
          setBaseCac(String(data.baseRates.cac ?? 120))
          setBaseData(String(data.baseRates.data ?? 220))
          setBaseAirtime(String(data.baseRates.airtime ?? 0))
          setBaseSms(String(data.baseRates.sms ?? 5))
        }
        if (data?.cacheRates) {
          setCacheBvn(String(data.cacheRates.bvn ?? 38))
          setCacheNin(String(data.cacheRates.nin ?? 38))
          setCacheNinAdvance(String(data.cacheRates.ninAdvance ?? 38))
          setCacheNinSlip(String(data.cacheRates.ninSlip ?? 50))
          setCacheNuban(String(data.cacheRates.nuban ?? 0))
          setCachePhone(String(data.cacheRates.phone ?? 20))
          setCacheCac(String(data.cacheRates.cac ?? 48))
        }
        if (data?.cacheSettings) {
          setCacheEnabled(data.cacheSettings.enabled !== false)
          setCacheTtlDays(String(data.cacheSettings.ttlDays || 30))
        }
        if (data?.bonusPromotion) {
          setBonusActive(Boolean(data.bonusPromotion.active))
          setBonusPercent(String(data.bonusPromotion.discountPercent || 20))
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
          phone: parseInt(basePhone, 10),
          cac: parseInt(baseCac, 10),
          data: parseInt(baseData, 10),
          airtime: parseInt(baseAirtime, 10),
          sms: parseInt(baseSms, 10),
        },
        cacheRates: {
          bvn: parseInt(cacheBvn, 10),
          nin: parseInt(cacheNin, 10),
          ninAdvance: parseInt(cacheNinAdvance, 10),
          ninSlip: parseInt(cacheNinSlip, 10),
          nuban: parseInt(cacheNuban, 10),
          phone: parseInt(cachePhone, 10),
          cac: parseInt(cacheCac, 10),
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
      setMessage("✓ Rates updated across cluster! Live on docs, landing page, and billing API.")
      fetchPricing()
      setTimeout(() => setMessage(null), 4500)
    } catch (err: any) {
      alert(err.message || "Failed to update pricing")
    } finally {
      setIsSaving(false)
    }
  }

  const handleBroadcastPromo = async () => {
    const pct = parseInt(bonusPercent, 10)
    if (!confirm(`Send promotional email announcement (${pct}% off) to all active developers?`)) return

    setIsBroadcasting(true)
    try {
      const res = await ApiClient.broadcastAdminPromo(pct, bonusTitle)
      alert(`Promotional email dispatched successfully to ${res.sentCount} developer accounts!`)
    } catch (err: any) {
      alert(err.message || "Failed to broadcast promotion")
    } finally {
      setIsBroadcasting(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Pricing & Promotions Matrix</h1>
            <Badge variant="verified" size="sm">LIVE CLUSTER SYNC</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Update base live query fees, Smart Cache hit splits, and scheduled developer discount campaigns. Changes propagate across www, docs, and billing ledger in real time.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Base Rates */}
        <Card className="p-6 bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Live Query Base Rates (Naira / NGX)</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Standard Starter pricing applied when upstream registry lookups are performed.</p>
            </div>
            <Badge variant="mono" size="sm">UPSTREAM REGISTRY</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Input
              label="BVN Verification (₦)"
              type="number"
              value={baseBvn}
              onChange={(e) => setBaseBvn(e.target.value)}
              hint="NIBSS BVN identity resolution"
            />
            <Input
              label="NIN Standard (₦)"
              type="number"
              value={baseNin}
              onChange={(e) => setBaseNin(e.target.value)}
              hint="NIN validation & basic record"
            />
            <Input
              label="NIN Advance Demography (₦)"
              type="number"
              value={baseNinAdvance}
              onChange={(e) => setBaseNinAdvance(e.target.value)}
              hint="Full photo, phone & tracking ID"
            />
            <Input
              label="NIN Slip Generation (₦)"
              type="number"
              value={baseNinSlip}
              onChange={(e) => setBaseNinSlip(e.target.value)}
              hint="A4 dual-slip PDF and DOCX"
            />
            <Input
              label="NUBAN Account Resolution (₦)"
              type="number"
              value={baseNuban}
              onChange={(e) => setBaseNuban(e.target.value)}
              hint="0 for 100% Free"
            />
            <Input
              label="Phone Identity Search (₦)"
              type="number"
              value={basePhone}
              onChange={(e) => setBasePhone(e.target.value)}
              hint="MSISDN phone lookup"
            />
            <Input
              label="CAC Business Lookup (₦)"
              type="number"
              value={baseCac}
              onChange={(e) => setBaseCac(e.target.value)}
              hint="Company & RC verification"
            />
            <Input
              label="Mobile Data per GB (₦)"
              type="number"
              value={baseData}
              onChange={(e) => setBaseData(e.target.value)}
              hint="Wholesale Tier 1 data bundle"
            />
            <Input
              label="SMS Verification (₦)"
              type="number"
              value={baseSms}
              onChange={(e) => setBaseSms(e.target.value)}
              hint="Transactional OTP SMS"
            />
          </div>
        </Card>

        {/* 2. Smart Cache Rates */}
        <Card className="p-6 bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Smart Cache Hit Split (Sub-15ms)</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Discounted rate billed when a customer queries an identity previously verified within the retention window.</p>
            </div>
            <Badge variant="verified" size="sm">REDIS L2 CACHE</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Input
              label="BVN Cache Hit Rate (₦)"
              type="number"
              value={cacheBvn}
              onChange={(e) => setCacheBvn(e.target.value)}
            />
            <Input
              label="NIN Cache Hit Rate (₦)"
              type="number"
              value={cacheNin}
              onChange={(e) => setCacheNin(e.target.value)}
            />
            <Input
              label="NIN Advance Cache Hit (₦)"
              type="number"
              value={cacheNinAdvance}
              onChange={(e) => setCacheNinAdvance(e.target.value)}
            />
            <Input
              label="NIN Slip Cache Hit (₦)"
              type="number"
              value={cacheNinSlip}
              onChange={(e) => setCacheNinSlip(e.target.value)}
            />
            <Input
              label="Phone Search Cache Hit (₦)"
              type="number"
              value={cachePhone}
              onChange={(e) => setCachePhone(e.target.value)}
            />
            <Input
              label="CAC Cache Hit (₦)"
              type="number"
              value={cacheCac}
              onChange={(e) => setCacheCac(e.target.value)}
            />
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={cacheEnabled}
                onChange={(e) => setCacheEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 dark:border-zinc-700 text-emerald-500 focus:ring-emerald-500"
              />
              <span className="font-semibold text-slate-900 dark:text-white">Enable Tenant L2 Smart Cache Engine</span>
            </label>

            <div className="flex items-center gap-2">
              <span>Cache TTL:</span>
              <input
                type="number"
                value={cacheTtlDays}
                onChange={(e) => setCacheTtlDays(e.target.value)}
                className="w-16 px-2 py-1 text-xs rounded border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white font-mono"
              />
              <span>Days</span>
            </div>
          </div>
        </Card>

        {/* 3. Promotional Bonus Days & Rate Slash */}
        <Card className="p-6 bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Promotional Bonus Days & Rate Slash</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Instantly slashes live rates across all endpoints and triggers announcement banners on the landing page and developer consoles.
              </p>
            </div>
            <Badge variant={bonusActive ? "verified" : "neutral"} size="sm">
              {bonusActive ? "PROMO ACTIVE" : "INACTIVE"}
            </Badge>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={bonusActive}
                onChange={(e) => setBonusActive(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 dark:border-zinc-700 text-emerald-500 focus:ring-emerald-500"
              />
              <span className="font-semibold text-slate-900 dark:text-white text-xs">
                Activate Promotional Rate Slash Across Cluster
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Discount Percentage (%)"
                type="number"
                value={bonusPercent}
                onChange={(e) => setBonusPercent(e.target.value)}
                hint="e.g. 20 for 20% off all queries"
              />
              <Input
                label="Campaign Banner Title"
                type="text"
                value={bonusTitle}
                onChange={(e) => setBonusTitle(e.target.value)}
                hint="e.g. Flash Developer Bonus Week"
              />
              <Input
                label="Expiration Date (Optional)"
                type="text"
                placeholder="e.g. Oct 31, 2026"
                value={bonusExpiry}
                onChange={(e) => setBonusExpiry(e.target.value)}
                hint="Display date for banner countdown"
              />
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-slate-100 dark:border-zinc-800">
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Announce this promotional window directly to all registered tenant accounts via email.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBroadcastPromo}
                isLoading={isBroadcasting}
                className="text-rose-600 dark:text-rose-400"
              >
                Broadcast Promo Email
              </Button>
            </div>
          </div>
        </Card>

        {/* 4. Tier Savings Preview */}
        <Card className="p-6 bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider">
            Effective Rates by Customer Tier Preview
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-mono">
                  <th className="py-2">Tier</th>
                  <th className="py-2">BVN Live</th>
                  <th className="py-2">NIN Live</th>
                  <th className="py-2">NIN Advance</th>
                  <th className="py-2">NIN Slip</th>
                  <th className="py-2">NUBAN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/60 font-mono">
                <tr>
                  <td className="py-2.5 font-bold text-slate-900 dark:text-white">STARTER (Standard)</td>
                  <td>₦{baseBvn}</td>
                  <td>₦{baseNin}</td>
                  <td>₦{baseNinAdvance}</td>
                  <td>₦{baseNinSlip}</td>
                  <td className="text-emerald-500 font-bold">Free</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-blue-600 dark:text-blue-400">GROWTH (10% Off)</td>
                  <td>₦{Math.round(parseInt(baseBvn || "95") * 0.9)}</td>
                  <td>₦{Math.round(parseInt(baseNin || "95") * 0.9)}</td>
                  <td>₦{Math.round(parseInt(baseNinAdvance || "95") * 0.9)}</td>
                  <td>₦{Math.round(parseInt(baseNinSlip || "250") * 0.9)}</td>
                  <td className="text-emerald-500 font-bold">Free</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-emerald-600 dark:text-emerald-400">ENTERPRISE (30% Off)</td>
                  <td>₦{Math.round(parseInt(baseBvn || "95") * 0.7)}</td>
                  <td>₦{Math.round(parseInt(baseNin || "95") * 0.7)}</td>
                  <td>₦{Math.round(parseInt(baseNinAdvance || "95") * 0.7)}</td>
                  <td>₦{Math.round(parseInt(baseNinSlip || "250") * 0.7)}</td>
                  <td className="text-emerald-500 font-bold">Free</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="emerald"
            size="md"
            isLoading={isSaving}
          >
            Deploy Pricing Changes Across Cluster
          </Button>
        </div>
      </form>
    </div>
  )
}
