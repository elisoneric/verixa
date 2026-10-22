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
    benchmark: "₦125",
    verixaRate: "₦125",
    description: "National Identity Number verification lookup.",
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
    benchmark: "₦95",
    verixaRate: "₦95",
    description: "Bank Verification Number verification against NIBSS registry.",
    defaultPayload: {
      bvn: "22222222222",
      consent: true,
    },
  },
  {
    key: "nin-phone",
    name: "NIN Phone Search",
    category: "identity",
    method: "POST",
    path: "/api/nin-phone",
    benchmark: "₦50",
    verixaRate: "₦50",
    description: "Lookup linked National Identity Number via registered phone line.",
    defaultPayload: {
      phone: "09011111111",
      consent: true,
    },
  },
  {
    key: "bvn-phone",
    name: "BVN Phone Search",
    category: "identity",
    method: "POST",
    path: "/api/bvn-phone",
    benchmark: "₦50",
    verixaRate: "₦50",
    description: "Query bank customer records by registered telephone number.",
    defaultPayload: {
      phone: "09011111111",
      consent: true,
    },
  },
  {
    key: "nin-demography",
    name: "NIN Demography",
    category: "identity",
    method: "POST",
    path: "/api/nin-demography",
    benchmark: "₦125",
    verixaRate: "₦125",
    description: "Full demographic profile including residential address and name details.",
    defaultPayload: {
      nin: "70123456789",
      consent: true,
    },
  },
  {
    key: "nin-tracking",
    name: "NIN Tracking",
    category: "identity",
    method: "POST",
    path: "/api/nin-tracking",
    benchmark: "₦50",
    verixaRate: "₦50",
    description: "Validation by NIMC tracking ID reference.",
    defaultPayload: {
      trackingId: "WN123456789",
      consent: true,
    },
  },
  {
    key: "nin-slip",
    name: "NIN Slip Generation",
    category: "identity",
    method: "POST",
    path: "/api/nin-slip",
    benchmark: "₦270",
    verixaRate: "₦250",
    description: "High-resolution PDF and Word identity slip output.",
    defaultPayload: {
      nin: "70123456789",
      format: "both",
      consent: true,
    },
  },

  // Banking & Financial
  {
    key: "nuban-lookup",
    name: "NUBAN Resolution",
    category: "financial",
    method: "POST",
    path: "/api/nuban-lookup",
    benchmark: "Free",
    verixaRate: "Free",
    description: "Instant 10-digit account name resolution across commercial banks and microfinance.",
    defaultPayload: {
      account_number: "0123456789",
      bank_code: "058",
      consent: true,
    },
  },
  {
    key: "balance-check",
    name: "Wallet Balance",
    category: "financial",
    method: "GET",
    path: "/api/balance",
    benchmark: "Free",
    verixaRate: "Free",
    description: "Check available Live and Sandbox prepaid NGX credits.",
    defaultPayload: null,
  },

  // Corporate KYB
  {
    key: "cac-lookup",
    name: "CAC Basic Search",
    category: "kyb",
    method: "POST",
    path: "/api/cac-lookup",
    benchmark: "₦150",
    verixaRate: "₦120",
    description: "Official Corporate Affairs Commission corporate entity verification.",
    defaultPayload: {
      rc_number: "1234567",
      company_type: "COMPANY",
      consent: true,
    },
  },
  {
    key: "cac-advance",
    name: "CAC Advance Profile",
    category: "kyb",
    method: "POST",
    path: "/api/cac-advance",
    benchmark: "₦300",
    verixaRate: "₦250",
    description: "Full corporate profile with directors, shareholders, and registered office.",
    defaultPayload: {
      rc_number: "1234567",
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
    benchmark: "₦100",
    verixaRate: "₦90",
    description: "Joint Tax Board and FIRS official Tax Identification Number validation.",
    defaultPayload: {
      tin: "12345678-0001",
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
    benchmark: "₦120",
    verixaRate: "₦95",
    description: "Federal Road Safety Commission driver license validation.",
    defaultPayload: {
      license_number: "AAA12345AA00",
      dob: "1990-01-01",
      consent: true,
    },
  },
  {
    key: "voters-card",
    name: "Voter's Card (INEC)",
    category: "secondary_id",
    method: "POST",
    path: "/api/voters-card",
    benchmark: "₦100",
    verixaRate: "₦80",
    description: "INEC permanent voter card verification.",
    defaultPayload: {
      vin: "90F5B12345678901234",
      last_name: "OLUTOLA",
      state: "Lagos",
      consent: true,
    },
  },
  {
    key: "passport-verification",
    name: "International Passport",
    category: "secondary_id",
    method: "POST",
    path: "/api/passport-verification",
    benchmark: "₦180",
    verixaRate: "₦150",
    description: "Nigeria Immigration Service standard international passport validation.",
    defaultPayload: {
      passport_number: "A12345678",
      last_name: "OLUTOLA",
      dob: "1988-04-14",
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
    description: "Biometric facial comparison of user selfie against government registry photo.",
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
    description: "Global sanctions, PEP watchlists, and adverse media screening.",
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
    description: "Carrier lookup, active status, porting history, and SIM swap detection.",
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
    description: "Disposable burner email detection and deliverability validation.",
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
    description: "Automated instant VTU airtime vending across Nigerian networks.",
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
    description: "Automated data bundle subscription vending across mobile networks.",
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
    description: "High-delivery transactional SMS and WhatsApp OTP message dispatch.",
    defaultPayload: {
      destination: "08031234567",
      channel: "sms",
      message: "Your authentication code is 492019. Valid for 10 minutes.",
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
    { id: "all", label: "All Services" },
    { id: "identity", label: "Core Identity" },
    { id: "kyb", label: "Corporate KYB" },
    { id: "secondary_id", label: "Secondary IDs" },
    { id: "financial", label: "Banking" },
    { id: "risk", label: "Biometrics & Risk" },
    { id: "telecom", label: "Telco & Messaging" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-heading">
              API Explorer
            </h1>
            <Badge variant={environment === "live" ? "verified" : "warning"} size="sm">
              {environment.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Interactive developer console to test verification endpoints with live responses.
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

      {/* Category Pills & Endpoint Selector Tabs */}
      <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-3">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                selectedCategory === c.id
                  ? "bg-slate-900 text-white shadow-2xs font-bold"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-[220px] overflow-y-auto pr-1">
          {filteredEndpoints.map((ep) => {
            const isSelected = ep.key === selectedKey
            return (
              <button
                key={ep.key}
                onClick={() => handleSelectEndpoint(ep.key)}
                className={`p-2.5 rounded-xl text-left transition-all border cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                    : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className={`text-[10px] font-mono font-bold px-1 py-0.5 rounded ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : ep.method === "POST" ? "bg-slate-100 text-slate-800" : "bg-sky-50 text-sky-700"
                  }`}>
                    {ep.method}
                  </span>
                  <span className={`text-[11px] font-mono font-bold ${isSelected ? "text-emerald-300" : "text-slate-900"}`}>
                    {ep.verixaRate}
                  </span>
                </div>
                <div className={`text-xs font-semibold truncate ${isSelected ? "text-white" : "text-slate-900"}`}>
                  {ep.name}
                </div>
                <div className={`text-[10px] font-mono truncate ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
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
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 flex flex-col justify-between space-y-5 shadow-xs">
          <div className="space-y-4">
            {/* Active Endpoint Info Banner */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="px-2 py-0.5 rounded font-bold bg-slate-200 text-slate-900">
                    {currentConfig.method}
                  </span>
                  <span className="text-slate-900 font-semibold">{currentConfig.path}</span>
                </div>
                <span className="font-mono text-xs font-bold text-slate-900">
                  {currentConfig.verixaRate}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {currentConfig.description}
              </p>
            </div>

            {/* Request Body Editor */}
            {currentConfig.method === "POST" ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 uppercase">JSON Request Body</label>
                  <button
                    onClick={() => setRequestBody(JSON.stringify(currentConfig.defaultPayload, null, 2))}
                    className="text-[11px] text-slate-500 hover:text-slate-800 font-mono cursor-pointer transition-colors"
                  >
                    Reset Template
                  </button>
                </div>
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  rows={8}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 font-mono text-xs text-slate-900 focus:border-slate-900 focus:bg-white focus:outline-none transition-all shadow-inner"
                />
              </div>
            ) : (
              <div className="p-8 text-center rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <span className="text-xs font-mono text-slate-700 block font-semibold">GET Request - No Payload Required</span>
                <span className="text-[11px] text-slate-500 block">Queries authenticated endpoint data.</span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleExecute}
            disabled={isLoading}
            className="w-full py-2.5 px-4 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isLoading ? "Executing..." : `Send Request (${currentConfig.method} ${currentConfig.path})`}
          </button>
        </div>

        {/* Response Panel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 flex flex-col justify-between shadow-xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-semibold text-slate-700 uppercase">Response Inspector</span>
              {responseMeta && (
                <div className="flex items-center gap-2 font-mono text-xs">
                  <Badge variant={responseMeta.status === 200 ? "verified" : "failed"} size="sm">
                    {responseMeta.status} {responseMeta.status === 200 ? "OK" : "ERROR"}
                  </Badge>
                  <span className="text-slate-500">{responseMeta.latencyMs}ms</span>
                </div>
              )}
            </div>

            {responseResult ? (
              <pre className="p-4 rounded-xl bg-slate-900 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed border border-slate-800 max-h-[380px] shadow-xs">
                {JSON.stringify(responseResult, null, 2)}
              </pre>
            ) : (
              <div className="py-24 text-center text-xs text-slate-400 font-mono">
                Click &quot;Send Request&quot; to test {currentConfig.path} and view live response.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Auth: Bearer API_KEY</span>
            <span>Content-Type: application/json</span>
          </div>
        </div>
      </div>
    </div>
  )
}
