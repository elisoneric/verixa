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
  identifier?: string
  format?: string
  createdAt: string
}

export type VerificationServiceType =
  | "nin"
  | "bvn"
  | "nuban"
  | "phone"
  | "cac"
  | "nuban_kyc"
  | "tin"
  | "dl"
  | "vin"
  | "passport"

export interface VerificationResultPayload<T = Record<string, any>> {
  success: boolean
  status?: string
  service: string
  reference: string
  verifiedAt: string
  data: T
  meta?: {
    cached?: boolean
    cost_ngx?: number
    latency_ms?: number
    environment?: string
    provider?: string
    referenceId?: string
    [key: string]: any
  }
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
  } | null
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

    let response: Response
    try {
      response = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers,
      })
    } catch (netErr: any) {
      console.error("Network request failed to:", `${baseUrl}${path}`, netErr)
      throw new Error(
        "Unable to connect to the Verixa server. Please verify your network connection or ensure the API gateway is online."
      )
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      if (response.status === 401 || response.status === 403) {
        const rawMsg = errData.message || ""
        if (
          !rawMsg ||
          rawMsg.toLowerCase().includes("invalid credentials") ||
          rawMsg.toLowerCase().includes("unauthorized")
        ) {
          throw new Error("Invalid email or password. Please double-check your credentials.")
        }
        throw new Error(Array.isArray(rawMsg) ? rawMsg.join(", ") : rawMsg)
      }
      if (response.status === 502 || response.status === 503 || response.status === 504) {
        throw new Error(
          "The verification server is temporarily unreachable or restarting. Please try again in a moment."
        )
      }
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

  static async googleLogin(credential: string) {
    return this.request<{ access_token: string; user: ApiUser }>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
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
    service: VerificationServiceType | string, 
    environment: "sandbox" | "live", 
    payload: any
  ): Promise<VerificationResultPayload> {
    return this.request<VerificationResultPayload>("/v1/verify/manual", {
      method: "POST",
      body: JSON.stringify({ service, environment, payload }),
    })
  }

  static async verifyManual(
    service: VerificationServiceType | string, 
    environment: "sandbox" | "live", 
    payload: any
  ): Promise<VerificationResultPayload> {
    return this.manualVerify(service, environment, payload)
  }

  // Direct Verification Endpoints
  static async executeDirectApi(
    path: string,
    method: "POST" | "GET" | string,
    payload?: any,
    environment: "live" | "sandbox" | string = "live"
  ) {
    const isGet = method.toUpperCase() === "GET"
    let url = path
    if (isGet && payload) {
      const q = new URLSearchParams()
      for (const [k, v] of Object.entries(payload)) {
        if (v !== undefined && v !== null && v !== "") {
          q.set(k, String(v))
        }
      }
      if (q.toString()) {
        url += (url.includes("?") ? "&" : "?") + q.toString()
      }
    }
    // Redundant fail-safe: pass environment query params for reverse proxies & extensions
    url += (url.includes("?") ? "&" : "?") + `env=${environment}&mode=${environment}`

    return this.request<any>(url, {
      method,
      headers: {
        "x-environment": environment,
        "x-mode": environment,
      },
      ...(isGet ? {} : { body: payload ? JSON.stringify(payload) : undefined }),
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

  static async provisionDedicatedAccount(nin: string, phone: string, consent: boolean) {
    return this.request<{
      message: string
      dedicatedVirtualAccount: {
        bankName: string
        accountNumber: string
        accountName: string
        status: string
        note: string
        isCustom?: boolean
      }
    }>("/v1/billing/dedicated-account", {
      method: "POST",
      body: JSON.stringify({ nin, phone, consent }),
    })
  }

  // NIN Slip Generator
  static async lookupNinIdentity(nin: string, consent = true) {
    return this.request<{
      success: boolean
      status: string
      trackingId: string
      fullName: string
      firstName: string
      surname: string
      middleName?: string
      gender?: string
      birthdate?: string
      nin: string
      photoBase64?: string
      data: {
        nin: string
        trackingId: string
        fullName: string
        firstName: string
        surname: string
        middleName?: string
        gender?: string
        birthdate?: string
        photoBase64?: string
      }
      meta: {
        cached: boolean
        cost_ngx: number
        referenceId: string
        latency_ms: number
      }
    }>("/v1/dashboard/slips/nin/lookup", {
      method: "POST",
      body: JSON.stringify({ nin, consent }),
    })
  }

  static async generateNinSlip(
    nin: string,
    format: "pdf" | "card" | "slip" | "both" | "docx" | string = "both",
    consent = true,
    options?: { cardType?: "card" | "slip"; fileType?: "pdf" | "docx" | "both" }
  ) {
    const cardType = options?.cardType || (format === "card" ? "card" : (format === "slip" ? "slip" : undefined))
    const fileType = options?.fileType

    return this.request<{
      success: boolean
      status: string
      trackingId: string
      fullName: string
      nin: string
      photoBase64?: string
      slipType: "card" | "slip"
      pdfBase64?: string
      docxBase64?: string
      svgContent?: string
      cardPdfBase64?: string
      cardSvg?: string
      slipSvg?: string
      data: {
        nin: string
        trackingId: string
        fullName: string
        firstName?: string
        surname?: string
        middleName?: string
        photoBase64?: string
        slipType?: "card" | "slip"
        pdfBase64?: string
        nin_id?: string
        slipSvg?: string
        cardPdfBase64?: string
        cardSvg?: string
        svgContent?: string
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
      body: JSON.stringify({ nin, format, consent, cardType, fileType }),
    })
  }

  static getSlipDownloadUrl(nin: string, format: "pdf" | "docx" | "card" = "pdf", type?: "card" | "slip") {
    const baseUrl = getApiUrl()
    const typeParam = type ? `&type=${type}` : ""
    return `${baseUrl}/v1/dashboard/slips/nin/${nin}/download?format=${format}${typeParam}`
  }

  static async downloadSlipBlob(nin: string, format: "pdf" | "docx" | "card" = "pdf", type?: "card" | "slip"): Promise<Blob> {
    const baseUrl = getApiUrl()
    const token = this.getToken()
    const typeParam = type ? `&type=${type}` : ""
    const res = await fetch(`${baseUrl}/v1/dashboard/slips/nin/${nin}/download?format=${format}${typeParam}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) throw new Error("Failed to download document from server")
    return res.blob()
  }

  static async downloadHistoricalSlip(
    logId: string,
    format: "card" | "slip" = "slip",
    fileType: "pdf" = "pdf"
  ): Promise<{ blob: Blob; filename: string }> {
    return this.downloadOnDemandSlip(logId, format, fileType)
  }

  static async downloadOnDemandSlip(
    logId: string,
    format: "card" | "slip",
    fileType: "pdf" | "docx"
  ): Promise<{ blob: Blob; filename: string }> {
    const baseUrl = getApiUrl()
    const token = this.getToken()
    const endpoint = token ? `${baseUrl}/v1/dashboard/slips/on-demand` : `${baseUrl}/v1/slips/on-demand`
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ logId, format, fileType }),
    })

    if (!res.ok) {
      let errMsg = "Failed to generate on-demand document"
      try {
        const errJson = await res.json()
        if (errJson?.message) {
          errMsg = Array.isArray(errJson.message) ? errJson.message.join(", ") : errJson.message
        }
      } catch {
        // fallback to default
      }
      throw new Error(errMsg)
    }

    const contentDisposition = res.headers.get("content-disposition") || ""
    let filename = `NIN_${format === "card" ? "Card" : "Slip"}_${logId.slice(0, 8)}.${fileType}`
    const match = contentDisposition.match(/filename="?([^";]+)"?/i)
    if (match && match[1]) {
      filename = match[1].replace(/["']/g, "").trim()
    }

    const blob = await res.blob()
    return { blob, filename }
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
      baseRates: {
        bvn: number
        nin: number
        ninAdvance: number
        ninSlip: number
        nuban: number
        phone?: number
        cac?: number
        data?: number
        airtime?: number
        sms?: number
      }
      cacheRates: {
        bvn: number
        nin: number
        ninAdvance: number
        ninSlip: number
        nuban: number
        phone?: number
        cac?: number
      }
      cacheSettings: { enabled: boolean; ttlDays: number }
      bonusPromotion: { active: boolean; discountPercent: number; title: string; expiry?: string }
    }>("/v1/admin/pricing")
  }

  static async updateAdminPricing(body: {
    baseRates?: Record<string, number | undefined>
    cacheRates?: Record<string, number | undefined>
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

  static async getAdminRevenue() {
    return this.request<{
      totalDepositedNgx: number
      totalConsumedNgx: number
      realCostSpentNgx?: number
      netProfitNgx?: number
      profitMarginPercent?: number
      cacheSavingsNgx?: number
      depositsToday: number
      depositsThisWeek: number
      depositsThisMonth: number
      netReserveNgx: number
      dojahRates?: Record<string, number>
      upstreamRates?: Record<string, number>
      margins?: Record<string, any>
      breakdownByService?: Record<string, any>
      recentTransactions: Array<{
        id: string
        amount: number
        status: string
        description: string
        referenceId?: string
        orgName: string
        orgId: string
        environment: string
        createdAt: string
      }>
    }>("/v1/admin/revenue")
  }

  static async getAdminLogs(params?: {
    limit?: number
    offset?: number
    serviceType?: string
    status?: string
    orgId?: string
  }) {
    const q = new URLSearchParams()
    if (params?.limit) q.set("limit", String(params.limit))
    if (params?.offset) q.set("offset", String(params.offset))
    if (params?.serviceType) q.set("serviceType", params.serviceType)
    if (params?.status) q.set("status", params.status)
    if (params?.orgId) q.set("orgId", params.orgId)
    const qs = q.toString() ? `?${q.toString()}` : ""
    return this.request<{
      total: number
      limit: number
      offset: number
      logs: Array<{
        id: string
        orgId: string
        orgName: string
        serviceType: string
        status: string
        isCached: boolean
        source: string
        upstreamProvider: string
        costDeducted: number
        latencyMs: number
        createdAt: string
      }>
    }>(`/v1/admin/logs${qs}`)
  }

  static async getAdminOrgUsers(orgId: string) {
    return this.request<Array<{
      id: string
      email: string
      role: string
      createdAt: string
    }>>(`/v1/admin/organizations/${orgId}/users`)
  }

  static async adjustAdminOrgBalance(
    orgId: string,
    amount: number,
    environment: "live" | "sandbox",
    reason?: string,
    notifyEmail = true
  ) {
    return this.request<any>(`/v1/admin/organizations/${orgId}/balance`, {
      method: "POST",
      body: JSON.stringify({ amount, environment, reason, notifyEmail }),
    })
  }

  static async updateAdminOrgStatus(orgId: string, status: "active" | "suspended") {
    return this.request<any>(`/v1/admin/organizations/${orgId}/status`, {
      method: "POST",
      body: JSON.stringify({ status }),
    })
  }

  static async updateAdminOrgOverdraft(orgId: string, allowOverdraft: boolean, overdraftLimit?: number) {
    return this.request<any>(`/v1/admin/organizations/${orgId}/overdraft`, {
      method: "POST",
      body: JSON.stringify({ allowOverdraft, overdraftLimit }),
    })
  }

  static async broadcastAdminPromo(discountPercent: number, title: string) {
    return this.request<any>("/v1/admin/pricing/broadcast", {
      method: "POST",
      body: JSON.stringify({ discountPercent, title }),
    })
  }

  static async testAdminSmtp(to: string, customConfig?: any) {
    return this.request<{ success: boolean; message: string; messageId?: string }>("/v1/admin/notifications/test", {
      method: "POST",
      body: JSON.stringify({ to, customConfig }),
    })
  }

  static async getUpstreamPricing() {
    return this.request<{
      rates: {
        nin: number
        ninAdvance: number
        ninPremium: number
        ninSlip: number
        bvn: number
        bvnAdvance: number
        cac: number
        phone: number
        nuban: number
      }
      margins: Record<string, { buyCost: number; sellPrice: number; margin: number; marginPercent: number }>
    }>("/v1/admin/pricing/upstream")
  }

  static async updateUpstreamPricing(rates: Record<string, number>) {
    return this.request<any>("/v1/admin/pricing/upstream", {
      method: "POST",
      body: JSON.stringify({ rates }),
    })
  }

  static async getDojahPricing() {
    return this.getUpstreamPricing()
  }

  static async updateDojahPricing(rates: Record<string, number>) {
    return this.updateUpstreamPricing(rates)
  }
}
