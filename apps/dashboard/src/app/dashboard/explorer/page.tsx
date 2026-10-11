"use client"

import * as React from "react"
import { Button, Badge, Card, Tabs } from "@verixa/ui"
import { useAuth } from "../../../lib/auth-context"
import { ApiClient } from "../../../lib/api"

type ApiCategory = "all" | "identity" | "kyb" | "secondary_id" | "financial" | "risk" | "telecom"

interface ApiEndpointConfig {
  key: string
  name: string
  category: ApiCategory
  method: "POST" | "GET"
  path: string
  benchmark: string
  verixaRate: string
  defaultPayload: any
  description: string
}

const ENDPOINTS: ApiEndpointConfig[] = [
  // Core Identity
  {
    key: "nin-verification",
    name: "NIN Verification",
    category: "identity",
    method: "POST",
    path: "/api/nin-verification",
    benchmark: "₦150",
    verixaRate: "₦135",
    description: "Official National Identity Number lookup directly against NIMC database.",
    defaultPayload: {
      nin: "11234567890",
      consent: true,
    },
  },
  {
    key: "bvn-verification",
    name: "BVN Verification",
    category: "identity",
    method: "POST",
    path: "/api/bvn-verification",
    benchmark: "₦100",
    verixaRate: "₦85",
    description: "Instant Bank Verification Number verification against NIBSS registry.",
    defaultPayload: {
      bvn: "22123456789",
      consent: true,
    },
  },
  {
    key: "nin-phone",
    name: "NIN Phone Search",
    category: "identity",
    method: "POST",
    path: "/api/nin-phone",
    benchmark: "₦200",
    verixaRate: "₦185",
    description: "Reverse lookup and corroborate linked National Identity Number via registered phone line.",
    defaultPayload: {
      phone: "08012345678",
      consent: true,
    },
  },
  {
    key: "bvn-phone",
    name: "BVN Phone Search",
    category: "identity",
    method: "POST",
    path: "/api/bvn-phone",
    benchmark: "₦150",
    verixaRate: "₦135",
    description: "Query bank customer records and verified financial profile by registered telephone number.",
    defaultPayload: {
      phone: "08012345678",
      consent: true,
    },
  },
  {
    key: "nin-demography",
    name: "NIN Demography",
    category: "identity",
    method: "POST",
    path: "/api/nin-demography",
    benchmark: "₦250",
    verixaRate: "₦235",
    description: "Full demographic profile including residential address, maiden name, and biometric timestamp.",
    defaultPayload: {
      nin: "11234567890",
      consent: true,
    },
  },
  {
    key: "nin-tracking",
    name: "NIN Tracking",
    category: "identity",
    method: "POST",
    path: "/api/nin-tracking",
    benchmark: "₦200",
    verixaRate: "₦185",
    description: "Track official NIMC slip issuance and demographic status by tracking ID.",
    defaultPayload: {
      tracking_id: "TRK-982183719",
      consent: true,
    },
  },
  {
    key: "balance",
    name: "Account Balance",
    category: "identity",
    method: "GET",
    path: "/api/balance",
    benchmark: "Free",
    verixaRate: "Free",
    description: "Check live wallet credit balance and prepaid metered quota with zero deduction overhead.",
    defaultPayload: null,
  },

  // Corporate & KYB
  {
    key: "cac-basic",
    name: "CAC Basic Lookup",
    category: "kyb",
    method: "POST",
    path: "/api/cac-basic",
    benchmark: "₦250",
    verixaRate: "₦220",
    description: "Validate registered Nigerian company, business name, or incorporated trustee status with CAC.",
    defaultPayload: {
      rc_number: "RC-1928374",
      company_type: "COMPANY",
      consent: true,
    },
  },
  {
    key: "cac-advance",
    name: "CAC Advance (Directors)",
    category: "kyb",
    method: "POST",
    path: "/api/cac-advance",
    benchmark: "₦600",
    verixaRate: "₦540",
    description: "Full corporate record including beneficial ownership, share distribution, and director/shareholder details.",
    defaultPayload: {
      rc_number: "RC-1928374",
      company_type: "COMPANY",
      consent: true,
    },
  },
  {
    key: "tin-verification",
    name: "TIN Tax Verification",
    category: "kyb",
    method: "POST",
    path: "/api/tin-verification",
    benchmark: "₦200",
    verixaRate: "₦180",
    description: "Corroborate corporate or individual Tax Identification Number via JTB / FIRS national database.",
    defaultPayload: {
      tin: "23910294-0001",
      consent: true,
    },
  },

  // Secondary Government IDs
  {
    key: "drivers-license",
    name: "Driver's License (FRSC)",
    category: "secondary_id",
    method: "POST",
    path: "/api/drivers-license",
    benchmark: "₦180",
    verixaRate: "₦160",
    description: "FRSC driver's license record verification, expiry status, and official license photo.",
    defaultPayload: {
      license_number: "AAA001928374",
      date_of_birth: "1988-04-14",
      consent: true,
    },
  },
  {
    key: "voters-card",
    name: "Voter's Card (VIN)",
    category: "secondary_id",
    method: "POST",
    path: "/api/voters-card",
    benchmark: "₦150",
    verixaRate: "₦130",
    description: "INEC national voter register lookup by Voter Identification Number (VIN) and polling unit.",
    defaultPayload: {
      vin: "90F5B12938475620192",
      state: "LAGOS",
      last_name: "OLUTOLA",
      consent: true,
    },
  },
  {
    key: "passport-verification",
    name: "Passport (NIS)",
    category: "secondary_id",
    method: "POST",
    path: "/api/passport-verification",
    benchmark: "₦300",
    verixaRate: "₦270",
    description: "Nigerian Immigration Service (NIS) international passport validity and bio-data match.",
    defaultPayload: {
      passport_number: "A10293847",
      last_name: "OLUTOLA",
      date_of_birth: "1988-04-14",
      consent: true,
    },
  },

  // Financial & Banking
  {
    key: "account-resolve",
    name: "NUBAN Account Resolve",
    category: "financial",
    method: "POST",
    path: "/api/account-resolve",
    benchmark: "₦10",
    verixaRate: "Free",
    description: "Resolve 10-digit Nigerian NUBAN account number across commercial banks and microfinance institutions.",
    defaultPayload: {
      account_number: "0123456789",
      bank_code: "058",
      consent: true,
    },
  },
  {
    key: "credit-score",
    name: "Credit Score & Report",
    category: "financial",
    method: "POST",
    path: "/api/credit-score",
    benchmark: "₦450",
    verixaRate: "₦390",
    description: "Multi-bureau credit score, active debt burden, and loan repayment history via applicant BVN.",
    defaultPayload: {
      bvn: "22198765432",
      phone_number: "08031234567",
      consent: true,
    },
  },

  // Biometrics & Risk
  {
    key: "face-match",
    name: "Face Match & Liveness",
    category: "risk",
    method: "POST",
    path: "/api/face-match",
    benchmark: "₦250",
    verixaRate: "₦220",
    description: "Biometric facial comparison of user selfie against government registry photo with liveness checks.",
    defaultPayload: {
      id_type: "BVN",
      id_number: "22198765432",
      selfie_image_base64: "data:image/jpeg;base64,mockselfie...",
      liveness_check: true,
      consent: true,
    },
  },
  {
    key: "aml-screening",
    name: "AML & PEP Screening",
    category: "risk",
    method: "POST",
    path: "/api/aml-screening",
    benchmark: "₦200",
    verixaRate: "₦175",
    description: "Global sanctions, PEP watchlists, Interpol, and adverse media real-time screening.",
    defaultPayload: {
      name: "CHIDERA EMEKA OLUTOLA",
      date_of_birth: "1988-04-14",
      country: "NG",
      consent: true,
    },
  },
  {
    key: "phone-intelligence",
    name: "SIM Swap & Carrier",
    category: "risk",
    method: "POST",
    path: "/api/phone-intelligence",
    benchmark: "₦150",
    verixaRate: "₦130",
    description: "Carrier lookup, active line status, porting history, and SIM swap detection for fraud prevention.",
    defaultPayload: {
      phone_number: "08031234567",
      consent: true,
    },
  },
  {
    key: "email-risk",
    name: "Email Risk Score",
    category: "risk",
    method: "POST",
    path: "/api/email-risk",
    benchmark: "₦80",
    verixaRate: "₦65",
    description: "Disposable burner email detection, deliverability validation, and domain reputation scoring.",
    defaultPayload: {
      email: "dev@apextech.ng",
      consent: true,
    },
  },

  // Telco & Messaging
  {
    key: "telecom-airtime",
    name: "Airtime Vending",
    category: "telecom",
    method: "POST",
    path: "/api/telecom/airtime",
    benchmark: "Face Value",
    verixaRate: "2.5% Off",
    description: "Automated instant VTU airtime vending to MTN, Airtel, Glo, and 9mobile with developer margins.",
    defaultPayload: {
      phone_number: "08031234567",
      amount: 1000,
      network: "MTN",
      consent: true,
    },
  },
  {
    key: "telecom-data",
    name: "Data Vending",
    category: "telecom",
    method: "POST",
    path: "/api/telecom/data",
    benchmark: "Market Rate",
    verixaRate: "₦220/GB",
    description: "Automated data bundle subscription vending across all Nigerian mobile networks.",
    defaultPayload: {
      phone_number: "08031234567",
      plan: "MTN_1GB",
      consent: true,
    },
  },
  {
    key: "messaging-otp",
    name: "Transactional OTP SMS",
    category: "telecom",
    method: "POST",
    path: "/api/messaging/send-otp",
    benchmark: "₦4.50",
    verixaRate: "₦3.80",
    description: "High-delivery transactional SMS and WhatsApp OTP message dispatch with routing failover.",
    defaultPayload: {
      destination: "08031234567",
      channel: "sms",
      message: "Your Verixa authentication code is 492019. Valid for 10 minutes.",
      consent: true,
    },
  },
]

export default function ApiExplorerPage() {
  const { environment, setEnvironment, refreshBalance } = useAuth()
  const [selectedCategory, setSelectedCategory] = React.useState<ApiCategory>("all")
  const [selectedKey, setSelectedKey] = React.useState<string>("nin-verification")
  
  const filteredEndpoints = React.useMemo(() => {
    if (selectedCategory === "all") return ENDPOINTS
    return ENDPOINTS.filter((e) => e.category === selectedCategory)
  }, [selectedCategory])

  const currentConfig = React.useMemo(() => {
    return ENDPOINTS.find((e) => e.key === selectedKey) || ENDPOINTS[0]
  }, [selectedKey])

  const [requestBody, setRequestBody] = React.useState(
    JSON.stringify(currentConfig.defaultPayload, null, 2)
  )
  const [isLoading, setIsLoading] = React.useState(false)
  const [responseResult, setResponseResult] = React.useState<any | null>(null)
  const [responseMeta, setResponseMeta] = React.useState<{ status: number; latencyMs: number } | null>(null)

  const handleSelectEndpoint = (key: string) => {
    setSelectedKey(key)
    const cfg = ENDPOINTS.find((e) => e.key === key) || ENDPOINTS[0]
    setRequestBody(cfg.defaultPayload ? JSON.stringify(cfg.defaultPayload, null, 2) : "")
    setResponseResult(null)
    setResponseMeta(null)
  }

  const handleExecute = async () => {
    setIsLoading(true)
    setResponseResult(null)
    setResponseMeta(null)
    const startTime = performance.now()

    try {
      const parsedBody = currentConfig.method === "POST" && requestBody.trim() ? JSON.parse(requestBody) : undefined
      const res = await ApiClient.executeDirectApi(currentConfig.path, currentConfig.method, parsedBody)
      const duration = Math.max(12, Math.round(performance.now() - startTime))
      setResponseMeta({ status: 200, latencyMs: duration })
      setResponseResult(res)
      refreshBalance()
    } catch (err: any) {
      const duration = Math.max(15, Math.round(performance.now() - startTime))
      setResponseMeta({ status: 400, latencyMs: duration })
      setResponseResult({
        error: {
          type: "invalid_request_error",
          message: err.message || "Failed to execute API call",
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  const categories: { id: ApiCategory; label: string }[] = [
    { id: "all", label: "All Services (22)" },
    { id: "identity", label: "Core Identity (7)" },
    { id: "kyb", label: "Corporate KYB (3)" },
    { id: "secondary_id", label: "Secondary IDs (3)" },
    { id: "financial", label: "Banking & Credit (2)" },
    { id: "risk", label: "Biometrics & Risk (4)" },
    { id: "telecom", label: "Telco & Messaging (3)" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white font-heading">API Explorer</h1>
            <Badge variant={environment === "live" ? "verified" : "warning"} size="sm">
              {environment.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Interactive developer console to test Verixa identity, business KYB, biometric, and financial endpoints.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
      </div>

      {/* Category Pills & Endpoint Selector Tabs */}
      <div className="glass-card p-4 rounded-2xl border border-white/[0.08] bg-[#0c0e14]/60 backdrop-blur-xl space-y-3">
        <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] pb-3">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1 rounded-full text-xs font-sans transition-all cursor-pointer ${
                selectedCategory === c.id
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold"
                  : "bg-white/[0.03] text-zinc-400 border border-white/[0.06] hover:text-white"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2 max-h-[220px] overflow-y-auto pr-1">
          {filteredEndpoints.map((ep) => {
            const isSelected = ep.key === selectedKey
            return (
              <button
                key={ep.key}
                onClick={() => handleSelectEndpoint(ep.key)}
                className={`p-2.5 rounded-xl text-left transition-all border cursor-pointer ${
                  isSelected
                    ? "bg-white/[0.08] border-emerald-500/50 shadow-lg shadow-emerald-950/20"
                    : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12]"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className={`text-[10px] font-mono font-bold px-1 py-0.2 rounded ${
                    ep.method === "POST" ? "bg-emerald-500/15 text-emerald-400" : "bg-sky-500/15 text-sky-400"
                  }`}>
                    {ep.method}
                  </span>
                  <span className="text-[11px] font-sans font-bold text-emerald-400">
                    {ep.verixaRate}
                  </span>
                </div>
                <div className="text-xs font-semibold text-white truncate">
                  {ep.name}
                </div>
                <div className="text-[10px] font-mono text-zinc-500 truncate">
                  {ep.path}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Explorer Workspace Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Request Panel */}
        <Card className="glass-card bg-[#0c0e14]/70 border border-white/[0.08] p-6 flex flex-col justify-between space-y-6 shadow-2xl rounded-2xl">
          <div className="space-y-4">
            {/* Active Endpoint Info Banner */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    currentConfig.method === "POST"
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                      : "bg-sky-500/15 text-sky-400 border border-sky-500/20"
                  }`}>
                    {currentConfig.method}
                  </span>
                  <span className="text-zinc-200 font-semibold">{currentConfig.path}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  {currentConfig.benchmark !== "Free" && (
                    <span className="text-zinc-500 line-through font-sans text-[11px]">
                      {currentConfig.benchmark}
                    </span>
                  )}
                  <span className="font-sans font-bold text-emerald-400">
                    {currentConfig.verixaRate}
                  </span>
                  {currentConfig.benchmark !== "Free" && (
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/20">
                      -₦15
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                {currentConfig.description}
              </p>
            </div>

            {/* Request Body Editor */}
            {currentConfig.method === "POST" ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-semibold text-zinc-400 uppercase">JSON Request Body</label>
                  <button
                    onClick={() => setRequestBody(JSON.stringify(currentConfig.defaultPayload, null, 2))}
                    className="text-[11px] text-zinc-500 hover:text-zinc-300 font-mono cursor-pointer transition-colors"
                  >
                    Reset Template
                  </button>
                </div>
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  rows={8}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#06070a]/80 p-3.5 font-mono text-xs text-zinc-200 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner"
                />
              </div>
            ) : (
              <div className="p-8 text-center rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-1">
                <span className="text-xs font-mono text-zinc-400 block font-semibold">GET Request - No Payload Required</span>
                <span className="text-[11px] text-zinc-500 block">Queries active authenticated balance with zero rate deductions.</span>
              </div>
            )}
          </div>

          <Button
            variant="emerald"
            size="md"
            className="w-full font-bold h-11 shadow-lg shadow-emerald-950/30"
            onClick={handleExecute}
            isLoading={isLoading}
          >
            ▶ Send Request ({currentConfig.method} {currentConfig.path})
          </Button>
        </Card>

        {/* Response Panel */}
        <Card className="glass-card bg-[#0c0e14]/70 border border-white/[0.08] p-6 flex flex-col justify-between shadow-2xl rounded-2xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <span className="text-xs font-mono font-semibold text-zinc-400 uppercase">Response Inspector</span>
              {responseMeta && (
                <div className="flex items-center gap-2 font-mono text-xs">
                  <Badge variant={responseMeta.status === 200 ? "verified" : "failed"} size="sm">
                    {responseMeta.status} {responseMeta.status === 200 ? "OK" : "ERROR"}
                  </Badge>
                  <span className="text-zinc-500 font-sans">{responseMeta.latencyMs}ms</span>
                </div>
              )}
            </div>

            {responseResult ? (
              <pre className="p-4 rounded-xl bg-[#06070a]/90 font-mono text-xs text-emerald-300/90 overflow-x-auto leading-relaxed border border-white/[0.08] max-h-[380px] shadow-inner">
                {JSON.stringify(responseResult, null, 2)}
              </pre>
            ) : (
              <div className="py-24 text-center text-xs text-zinc-500 font-mono">
                Click &quot;Send Request&quot; to test {currentConfig.path} and view live JSON response.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>Auth: Bearer API_KEY</span>
            <span>Content-Type: application/json</span>
          </div>
        </Card>
      </div>
    </div>
  )
}
