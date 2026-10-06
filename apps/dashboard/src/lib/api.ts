import { getApiUrl } from "@verixa/ui"

export interface ApiUser {
  id: string
  email: string
  org_id: string
  role: string
  org_name: string
  account_type?: "individual" | "developer"
  is_super_admin?: boolean
}

export interface ApiKeyItem {
  id: string
  name: string
  environment: "sandbox" | "live"
  keyPrefix: string
  displayKey: string
  isActive: boolean
  createdAt: string
}

export interface VerificationLogItem {
  id: string
  service: string
  status: string
  environment: string
  provider: string
  isCached?: boolean
  source?: string
  costDeducted?: number
  latencyMs?: number
  idempotencyKey?: string
  createdAt: string
}

export interface BalanceData {
  live: { balance: number; currency: string }
  sandbox: { balance: number; currency: string }
  dedicatedVirtualAccount: {
    bankName: string
    accountNumber: string
    accountName: string
    status: string
    note: string
  }
  tier?: "STARTER" | "GROWTH" | "ENTERPRISE" | "CUSTOM"
  rates?: {
    bvn: number
    nin: number
    nuban: number
    live?: { bvn: number; nin: number; nuban: number }
    cache?: { bvn: number; nin: number; nuban: number }
    cacheSavingsPercent?: number
  }
  bonusPromotion?: {
    active: boolean
    title: string
    discountPercent: number
  } | null
}

export interface TransactionItem {
  id: string
  amount: number
  status: string
  referenceId: string
  description: string
  createdAt: string
}

export class ApiClient {
  private static getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("vrx_token")
  }

  public static async request<T = any>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const baseUrl = getApiUrl()
    const token = this.getToken()

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      const message = errData.message || response.statusText || "Request failed"
      throw new Error(Array.isArray(message) ? message.join(", ") : message)
    }

    return response.json()
  }

  // Auth
  static async login(email: string, pass: string) {
    return this.request<{ access_token: string; user: ApiUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password: pass }),
    })
  }

  static async register(email: string, pass: string, orgName: string, complianceData?: any) {
    return this.request<{ access_token: string; user: ApiUser }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password: pass, orgName, complianceData }),
    })
  }

  static async getMe() {
    return this.request<ApiUser>("/auth/me")
  }

  static async upgradeToDeveloper() {
    return this.request<{ success: boolean; accountType: string }>("/auth/upgrade-developer", {
      method: "POST",
    })
  }

  // API Keys
  static async listApiKeys() {
    return this.request<ApiKeyItem[]>("/auth/api-keys")
  }

  static async generateApiKey(environment: "sandbox" | "live", name?: string) {
    return this.request<{ id: string; rawKey: string; environment: string; createdAt: string }>(
      "/auth/api-keys",
      {
        method: "POST",
        body: JSON.stringify({ environment, name }),
      }
    )
  }

  static async revokeApiKey(id: string) {
    return this.request<{ message: string }>(`/auth/api-keys/${id}`, {
      method: "DELETE",
    })
  }

  // Verifications & Logs
  static async getLogs(params: { service?: string; status?: string; source?: string; page?: number; limit?: number } = {}) {
    const query = new URLSearchParams()
    if (params.service) query.set("service", params.service)
    if (params.status) query.set("status", params.status)
    if (params.source) query.set("source", params.source)
    if (params.page) query.set("page", String(params.page))
    if (params.limit) query.set("limit", String(params.limit))

    return this.request<{ items: VerificationLogItem[]; total: number; page: number; totalPages: number }>(
      `/v1/verify/logs?${query.toString()}`
    )
  }

  static async getLogDetail(id: string) {
    return this.request<any>(`/v1/verify/logs/${id}`)
  }

  static async getMetrics() {
    return this.request<{
      totalRequests: number
      liveRequests?: number
      cacheRequests?: number
      cacheHitRatio?: string
      totalSavingsNgx?: number
      averageLiveLatency?: string
      averageCacheLatency?: string
      successRate: string
      averageLatency?: string
      breakdown: {
        bvn: number
        nin: number
        nuban: number
        live?: { bvn: number; nin: number; nuban: number }
        cache?: { bvn: number; nin: number; nuban: number }
      }
    }>("/v1/verify/metrics")
  }

  static async manualVerify(
    service: "bvn" | "nin" | "nuban" | "phone" | "cac" | "nuban_kyc", 
    environment: "sandbox" | "live", 
    payload: any
  ) {
    return this.request<any>("/v1/verify/manual", {
      method: "POST",
      body: JSON.stringify({ service, environment, payload }),
    })
  }

  // Billing
  static async getBalance() {
    return this.request<BalanceData>("/v1/billing/balance")
  }

  static async getTransactions() {
    return this.request<TransactionItem[]>("/v1/billing/transactions")
  }

  static async fundSandbox(amount = 10000) {
    return this.request<{ balance: number }>("/v1/billing/fund-sandbox", {
      method: "POST",
      body: JSON.stringify({ amount }),
    })
  }

  static async createCheckout(amount: number, reference: string) {
    return this.request<{ url: string }>("/v1/billing/checkout", {
      method: "POST",
      body: JSON.stringify({ amount, reference }),
    })
  }

  // NIN Slip Generator
  static async generateNinSlip(nin: string, format: "pdf" | "docx" | "both" = "both", consent = true) {
    return this.request<{
      status: string
      data: {
        nin: string
        trackingId: string
        fullName: string
        pdfBase64?: string
        docxBase64?: string
      }
      meta: {
        cached: boolean
        cost_ngx: number
        referenceId: string
        latency_ms: number
      }
    }>("/v1/dashboard/slips/nin", {
      method: "POST",
      body: JSON.stringify({ nin, format, consent }),
    })
  }

  // Platform Admin
  static async getAdminMetrics() {
    return this.request<{
      totalOrgs: number
      totalRevenueNgx: number
      totalVerifications: number
      liveVerifications?: number
      cachedVerifications?: number
      cacheHitRatio?: string
      upstreamCallsSaved?: number
      totalSavingsNgx?: number
      successRate: string
      averageLatency: string
    }>("/v1/admin/metrics")
  }

  static async getAdminOrganizations() {
    return this.request<any[]>("/v1/admin/organizations")
  }

  static async upgradeAdminOrgTier(
    orgId: string,
    tier: string,
    customRates?: { bvn?: number; nin?: number; nuban?: number; ninAdvance?: number; ninSlip?: number },
    notifyEmail = true
  ) {
    return this.request<any>(`/v1/admin/organizations/${orgId}/tier`, {
      method: "POST",
      body: JSON.stringify({ tier, customRates, notifyEmail }),
    })
  }

  static async getAdminPricing() {
    return this.request<{
      baseRates: { bvn: number; nin: number; ninAdvance: number; ninSlip: number; nuban: number }
      cacheRates: { bvn: number; nin: number; ninAdvance: number; ninSlip: number; nuban: number }
      cacheSettings: { enabled: boolean; ttlDays: number }
      bonusPromotion: { active: boolean; discountPercent: number; title: string; expiry?: string }
    }>("/v1/admin/pricing")
  }

  static async updateAdminPricing(body: {
    baseRates?: { bvn?: number; nin?: number; ninAdvance?: number; ninSlip?: number; nuban?: number }
    cacheRates?: { bvn?: number; nin?: number; ninAdvance?: number; ninSlip?: number; nuban?: number }
    cacheSettings?: { enabled?: boolean; ttlDays?: number }
    bonusPromotion?: { active: boolean; discountPercent: number; title: string; expiry?: string }
  }) {
    return this.request<any>("/v1/admin/pricing", {
      method: "POST",
      body: JSON.stringify(body),
    })
  }

  static async getAdminProviders() {
    return this.request<any[]>("/v1/admin/providers")
  }

  static async getAdminConfigs() {
    return this.request<any[]>("/v1/admin/config")
  }

  static async updateAdminConfig(key: string, value: string, isSecret = false, description?: string) {
    return this.request<any>("/v1/admin/config", {
      method: "POST",
      body: JSON.stringify({ key, value, isSecret, description }),
    })
  }
}
