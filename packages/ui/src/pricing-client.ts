import * as React from "react"
import { getApiUrl } from "./utils"

export interface PricingRates {
  bvn: number
  nin: number
  ninAdvance: number
  ninSlip: number
  nuban: number
  phone: number
  cac: number
  airtime: number
  data: number
  sms: number
}

export interface PricingCacheRates {
  bvn: number
  nin: number
  ninAdvance: number
  ninSlip: number
  nuban: number
  phone: number
  cac: number
}

export interface BonusPromotion {
  active: boolean
  discountPercent: number
  title: string
  expiry?: string | null
}

export interface PricingData {
  baseRates: PricingRates
  cacheRates: PricingCacheRates
  cacheSettings: {
    enabled: boolean
    ttlDays: number
  }
  tierDiscounts: {
    growthDiscountPercent: number
    enterpriseDiscountPercent: number
  }
  bonusPromotion: BonusPromotion
}

export const DEFAULT_PRICING: PricingData = {
  baseRates: {
    bvn: 95,
    nin: 95,
    ninAdvance: 95,
    ninSlip: 250,
    nuban: 0,
    phone: 50,
    cac: 120,
    airtime: 0,
    data: 220,
    sms: 5,
  },
  cacheRates: {
    bvn: 38,
    nin: 38,
    ninAdvance: 38,
    ninSlip: 50,
    nuban: 0,
    phone: 20,
    cac: 48,
  },
  cacheSettings: {
    enabled: true,
    ttlDays: 30,
  },
  tierDiscounts: {
    growthDiscountPercent: 10,
    enterpriseDiscountPercent: 30,
  },
  bonusPromotion: {
    active: false,
    discountPercent: 0,
    title: "Special Developer Bonus Days",
    expiry: null,
  },
}

let cachedPricing: PricingData | null = null
let fetchPromise: Promise<PricingData> | null = null

export async function fetchLivePricing(): Promise<PricingData> {
  if (cachedPricing) return cachedPricing

  if (fetchPromise) return fetchPromise

  fetchPromise = (async () => {
    try {
      const url = getApiUrl("/v1/pricing")
      const controller = typeof AbortController !== "undefined" ? new AbortController() : null
      const timer = controller ? setTimeout(() => controller.abort(), 3500) : null

      const res = await fetch(url, {
        signal: controller?.signal,
        headers: { Accept: "application/json" },
      })
      if (timer) clearTimeout(timer)

      if (res.ok) {
        const data = await res.json()
        if (data?.baseRates) {
          cachedPricing = {
            baseRates: { ...DEFAULT_PRICING.baseRates, ...data.baseRates },
            cacheRates: { ...DEFAULT_PRICING.cacheRates, ...data.cacheRates },
            cacheSettings: { ...DEFAULT_PRICING.cacheSettings, ...data.cacheSettings },
            tierDiscounts: { ...DEFAULT_PRICING.tierDiscounts, ...data.tierDiscounts },
            bonusPromotion: { ...DEFAULT_PRICING.bonusPromotion, ...data.bonusPromotion },
          }
          return cachedPricing
        }
      }
    } catch {
      // Fallback silently
    } finally {
      fetchPromise = null
    }
    return DEFAULT_PRICING
  })()

  return fetchPromise
}

export function formatPriceString(amount: number, unit = ""): string {
  if (amount === 0) return "Free (₦0.00)"
  const unitStr = unit ? ` ${unit}` : ""
  return `₦${amount.toLocaleString()}${unitStr}`
}

export function useLivePricing() {
  const [pricing, setPricing] = React.useState<PricingData>(cachedPricing || DEFAULT_PRICING)
  const [isLoading, setIsLoading] = React.useState(!cachedPricing)

  React.useEffect(() => {
    let isMounted = true
    fetchLivePricing().then((data) => {
      if (isMounted) {
        setPricing(data)
        setIsLoading(false)
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  return { pricing, isLoading }
}
