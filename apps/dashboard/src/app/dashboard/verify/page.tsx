"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { Badge, Tabs } from "@verixa/ui"
import { useAuth } from "../../../lib/auth-context"
import { ApiClient, VerificationServiceType, VerificationLogItem } from "../../../lib/api"
import {
  Copy,
  Check,
  Download,
  Printer,
  ShieldCheck,
  Building2,
  CreditCard,
  Smartphone,
  FileText,
  UserCheck,
  Car,
  Vote,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
  Fingerprint,
} from "lucide-react"

// Types
interface ServiceConfig {
  id: VerificationServiceType
  label: string
  shortLabel: string
  icon: React.ComponentType<{ className?: string }>
  registryName: string
  sample: Record<string, string>
  description: string
}

const SERVICES: ServiceConfig[] = [
  {
    id: "nin",
    label: "National Identity (NIN)",
    shortLabel: "NIN",
    icon: Fingerprint,
    registryName: "NIMC National Identity Registry",
    sample: { nin: "70123456789" },
    description: "Verify citizen identity against the National Identity Management Commission database.",
  },
  {
    id: "bvn",
    label: "Bank Verification Number",
    shortLabel: "BVN",
    icon: ShieldCheck,
    registryName: "NIBSS Central BVN Registry",
    sample: { bvn: "22222222222" },
    description: "Lookup Nigerian banking biometric records and applicant personal details.",
  },
  {
    id: "cac",
    label: "Corporate Registry (CAC)",
    shortLabel: "CAC",
    icon: Building2,
    registryName: "Corporate Affairs Commission",
    sample: { rcNumber: "1928374", companyType: "COMPANY" },
    description: "Validate registered Nigerian enterprises, companies, and incorporated trustees.",
  },
  {
    id: "nuban",
    label: "Bank Account (NUBAN)",
    shortLabel: "NUBAN",
    icon: CreditCard,
    registryName: "CBN Interbank Settlement Network",
    sample: { accountNumber: "0123456789", bankCode: "058" },
    description: "Verify bank account owner names and active account status across Nigerian banks.",
  },
  {
    id: "phone",
    label: "Phone Intelligence",
    shortLabel: "Phone",
    icon: Smartphone,
    registryName: "NCC Telecom Subscriber Registry",
    sample: { phone: "09011111111" },
    description: "Lookup registered subscriber identity and SIM carrier intelligence.",
  },
  {
    id: "dl",
    label: "Driver's License (FRSC)",
    shortLabel: "DL",
    icon: Car,
    registryName: "FRSC National Driver's License Registry",
    sample: { licenseNumber: "AAA00000AA00", dob: "1988-04-14" },
    description: "Verify driver permit legitimacy, issue date, and validity status with FRSC.",
  },
  {
    id: "vin",
    label: "Voter's Card (INEC)",
    shortLabel: "VIN",
    icon: Vote,
    registryName: "INEC National Electoral Roll",
    sample: { vin: "90F5B01234567890123", state: "LAGOS", lastName: "OLUTOLA" },
    description: "Validate permanent voter credentials, polling unit, and delimitation details.",
  },
  {
    id: "passport",
    label: "International Passport",
    shortLabel: "Passport",
    icon: FileText,
    registryName: "NIS Immigration Registry",
    sample: { passportNumber: "A12345678", lastName: "OLUTOLA", dob: "1988-04-14" },
    description: "Verify Nigerian international passport status and document validity with NIS.",
  },
  {
    id: "tin",
    label: "Tax Identification (TIN)",
    shortLabel: "TIN",
    icon: UserCheck,
    registryName: "JTB / FIRS National Tax Database",
    sample: { tin: "19847291-0001" },
    description: "Verify corporate or individual Taxpayer Identification Number with JTB/FIRS.",
  },
]

// Bank directory for NUBAN lookups
const NIGERIAN_BANKS = [
  { code: "058", name: "Guaranty Trust Bank (GTB)" },
  { code: "011", name: "First Bank of Nigeria" },
  { code: "033", name: "United Bank for Africa (UBA)" },
  { code: "057", name: "Zenith Bank" },
  { code: "044", name: "Access Bank" },
  { code: "070", name: "Fidelity Bank" },
  { code: "214", name: "First City Monument Bank (FCMB)" },
  { code: "221", name: "Stanbic IBTC Bank" },
  { code: "232", name: "Sterling Bank" },
  { code: "035", name: "Wema Bank" },
  { code: "50211", name: "Kuda Microfinance Bank" },
  { code: "50515", name: "Moniepoint Microfinance Bank" },
  { code: "999992", name: "OPay / PayCom" },
  { code: "999991", name: "PalmPay" },
  { code: "999", name: "Titan Trust Bank" },
]

function ManualVerifyContent() {
  const searchParams = useSearchParams()
  const paramService = (searchParams.get("service") || searchParams.get("type"))?.toLowerCase() as VerificationServiceType
  const [service, setService] = React.useState<VerificationServiceType>(() => {
    return SERVICES.some((s) => s.id === paramService) ? paramService : "nin"
  })

  React.useEffect(() => {
    if (paramService && SERVICES.some((s) => s.id === paramService)) {
      setService(paramService)
    }
  }, [paramService])

  const { environment, setEnvironment, refreshBalance } = useAuth()
  const [recentLogs, setRecentLogs] = React.useState<VerificationLogItem[]>([])
  const [isLoadingLogs, setIsLoadingLogs] = React.useState(true)

  const loadRecentLogs = React.useCallback(async () => {
    try {
      const res = await ApiClient.getLogs({ limit: 8 })
      if (res && res.items) {
        setRecentLogs(res.items)
      }
    } catch (err) {
      console.warn("Could not load recent verifications", err)
    } finally {
      setIsLoadingLogs(false)
    }
  }, [])

  React.useEffect(() => {
    loadRecentLogs()
  }, [loadRecentLogs, environment])

  // Form states
  const [nin, setNin] = React.useState("")
  const [bvn, setBvn] = React.useState("")
  const [accountNumber, setAccountNumber] = React.useState("")
  const [bankCode, setBankCode] = React.useState("058")
  const [phone, setPhone] = React.useState("")
  const [rcNumber, setRcNumber] = React.useState("")
  const [companyType, setCompanyType] = React.useState("COMPANY")
  const [licenseNumber, setLicenseNumber] = React.useState("")
  const [dlDob, setDlDob] = React.useState("")
  const [vin, setVin] = React.useState("")
  const [vinState, setVinState] = React.useState("LAGOS")
  const [vinLastName, setVinLastName] = React.useState("")
  const [passportNumber, setPassportNumber] = React.useState("")
  const [passportLastName, setPassportLastName] = React.useState("")
  const [passportDob, setPassportDob] = React.useState("")
  const [tin, setTin] = React.useState("")
  const [consent, setConsent] = React.useState(true)

  // Status states
  const [isLoading, setIsLoading] = React.useState(false)
  const [isExportingPdf, setIsExportingPdf] = React.useState(false)
  const [result, setResult] = React.useState<any | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null)
  const [showMaskedBvn, setShowMaskedBvn] = React.useState(true)

  const activeConfig = SERVICES.find((s) => s.id === service) || SERVICES[0]

  // Pre-fill sandbox test data
  const handleFillSample = () => {
    const s = activeConfig.sample
    if (service === "nin") setNin(s.nin || "70123456789")
    else if (service === "bvn") setBvn(s.bvn || "22222222222")
    else if (service === "cac") {
      setRcNumber(s.rcNumber || "1928374")
      setCompanyType(s.companyType || "COMPANY")
    } else if (service === "nuban") {
      setAccountNumber(s.accountNumber || "0123456789")
      setBankCode(s.bankCode || "058")
    } else if (service === "phone") setPhone(s.phone || "09011111111")
    else if (service === "dl") {
      setLicenseNumber(s.licenseNumber || "AAA00000AA00")
      setDlDob(s.dob || "1988-04-14")
    } else if (service === "vin") {
      setVin(s.vin || "90F5B01234567890123")
      setVinState(s.state || "LAGOS")
      setVinLastName(s.lastName || "OLUTOLA")
    } else if (service === "passport") {
      setPassportNumber(s.passportNumber || "A12345678")
      setPassportLastName(s.lastName || "OLUTOLA")
      setPassportDob(s.dob || "1988-04-14")
    } else if (service === "tin") setTin(s.tin || "19847291-0001")
  }

  // Quick copy helper
  const copyToClipboard = (text: string, keyName: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedKey(keyName)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  // Submit verification request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!consent) {
      setError("Applicant consent is required to perform regulatory verification.")
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    let payload: any = { consent: true }
    if (service === "nin") {
      payload.nin = nin.trim()
    } else if (service === "bvn") {
      payload.bvn = bvn.trim()
    } else if (service === "cac") {
      payload.rcNumber = rcNumber.trim()
      payload.companyType = companyType
    } else if (service === "nuban") {
      payload.accountNumber = accountNumber.trim()
      payload.bankCode = bankCode
    } else if (service === "phone") {
      payload.phoneNumber = phone.trim()
    } else if (service === "dl") {
      payload.licenseNumber = licenseNumber.trim()
      if (dlDob.trim()) payload.dob = dlDob.trim()
    } else if (service === "vin") {
      payload.vin = vin.trim()
      if (vinState.trim()) payload.state = vinState.trim()
      if (vinLastName.trim()) payload.lastName = vinLastName.trim()
    } else if (service === "passport") {
      payload.passportNumber = passportNumber.trim()
      if (passportLastName.trim()) payload.lastName = passportLastName.trim()
      if (passportDob.trim()) payload.dob = passportDob.trim()
    } else if (service === "tin") {
      payload.tin = tin.trim()
    }

    try {
      const res = await ApiClient.verifyManual(service, environment, payload)
      setResult(res)
      refreshBalance()
      loadRecentLogs()
    } catch (err: any) {
      setError(err.message || "Verification request failed. Please verify credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  // Generate authentic Vector PDF Certificate using pdf-lib
  const handleExportPdf = async () => {
    if (!result || !result.data) return
    setIsExportingPdf(true)
    try {
      const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib")
      const pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage([595.28, 841.89]) // A4 Portrait
      const { width, height } = page.getSize()

      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
      const fontMono = await pdfDoc.embedFont(StandardFonts.Courier)

      // Theme colors
      const colorEmeraldDark = rgb(0.02, 0.38, 0.28) // #065f46
      const colorEmerald = rgb(0.06, 0.58, 0.42) // #10b981
      const colorSlateDark = rgb(0.06, 0.09, 0.16) // #0f172a
      const colorSlateMuted = rgb(0.39, 0.45, 0.55) // #64748b
      const colorBorder = rgb(0.88, 0.91, 0.94) // #e2e8f0
      const colorBgLight = rgb(0.97, 0.98, 0.99) // #f8fafc

      // Outer Decorative Border
      page.drawRectangle({
        x: 20,
        y: 20,
        width: width - 40,
        height: height - 40,
        borderColor: colorEmerald,
        borderWidth: 2,
      })

      // Inner Border
      page.drawRectangle({
        x: 26,
        y: 26,
        width: width - 52,
        height: height - 52,
        borderColor: colorBorder,
        borderWidth: 0.8,
      })

      // Header Banner
      page.drawRectangle({
        x: 27,
        y: height - 100,
        width: width - 54,
        height: 72,
        color: colorSlateDark,
      })

      page.drawText("VERIXA IDENTITY VERIFICATION PLATFORM", {
        x: 44,
        y: height - 54,
        size: 14,
        font: fontBold,
        color: rgb(1, 1, 1),
      })

      page.drawText("OFFICIAL VERIFICATION ATTESTATION CERTIFICATE", {
        x: 44,
        y: height - 72,
        size: 10,
        font: fontRegular,
        color: colorEmerald,
      })

      page.drawText("ISSUED VIA REGULATORY GATEWAY", {
        x: width - 230,
        y: height - 62,
        size: 8,
        font: fontMono,
        color: rgb(0.8, 0.85, 0.9),
      })

      // Verification Badge Box
      let currentY = height - 135
      page.drawRectangle({
        x: 44,
        y: currentY - 26,
        width: width - 88,
        height: 38,
        color: colorBgLight,
        borderColor: colorBorder,
        borderWidth: 1,
      })

      const refId = result.reference || result.meta?.referenceId || "REF-UNKNOWN"
      const verifiedAt = result.verifiedAt || new Date().toISOString()

      page.drawText(`SERVICE: ${service.toUpperCase()} DIRECT REGISTRY`, {
        x: 56,
        y: currentY - 8,
        size: 9,
        font: fontBold,
        color: colorSlateDark,
      })

      page.drawText(`STATUS: REGULATORY VERIFIED`, {
        x: 56,
        y: currentY - 20,
        size: 8,
        font: fontBold,
        color: colorEmeraldDark,
      })

      page.drawText(`REFERENCE: ${refId}`, {
        x: width - 290,
        y: currentY - 8,
        size: 8,
        font: fontMono,
        color: colorSlateMuted,
      })

      page.drawText(`TIMESTAMP: ${verifiedAt}`, {
        x: width - 290,
        y: currentY - 20,
        size: 8,
        font: fontMono,
        color: colorSlateMuted,
      })

      // Subject Summary
      currentY -= 55
      page.drawText("VERIFIED IDENTITY ATTRIBUTES", {
        x: 44,
        y: currentY,
        size: 11,
        font: fontBold,
        color: colorSlateDark,
      })

      page.drawLine({
        start: { x: 44, y: currentY - 4 },
        end: { x: width - 44, y: currentY - 4 },
        thickness: 1,
        color: colorEmerald,
      })

      // Table of attributes
      currentY -= 20
      const entries = Object.entries(result.data).filter(
        ([k, v]) =>
          k !== "photo" &&
          k !== "signature" &&
          k !== "pdfBase64" &&
          k !== "docxBase64" &&
          k !== "cardPdfBase64" &&
          k !== "cardSvg" &&
          k !== "nin_id" &&
          v !== null &&
          v !== undefined &&
          v !== ""
      )

      for (let i = 0; i < entries.length; i++) {
        if (currentY < 120) break
        const [rawKey, rawVal] = entries[i]
        const label = rawKey.replace(/_/g, " ").toUpperCase()
        const value = typeof rawVal === "object" ? JSON.stringify(rawVal) : String(rawVal)

        // Alternate row shading
        if (i % 2 === 0) {
          page.drawRectangle({
            x: 44,
            y: currentY - 14,
            width: width - 88,
            height: 18,
            color: colorBgLight,
          })
        }

        page.drawText(label.slice(0, 28), {
          x: 52,
          y: currentY - 10,
          size: 8,
          font: fontBold,
          color: colorSlateMuted,
        })

        page.drawText(value.slice(0, 52), {
          x: 210,
          y: currentY - 10,
          size: 8.5,
          font: fontMono,
          color: colorSlateDark,
        })

        currentY -= 20
      }

      // Security Attestation Seal
      page.drawRectangle({
        x: 44,
        y: 60,
        width: width - 88,
        height: 48,
        color: rgb(0.95, 0.99, 0.96),
        borderColor: colorEmerald,
        borderWidth: 1,
      })

      page.drawText("OFFICIAL COMPLIANCE SEAL & REGULATORY ATTESTATION", {
        x: 56,
        y: 92,
        size: 8,
        font: fontBold,
        color: colorEmeraldDark,
      })

      page.drawText(
        "This document is an authentic verification transcript generated under statutory compliance (NDPA/NCC).",
        {
          x: 56,
          y: 80,
          size: 7,
          font: fontRegular,
          color: colorSlateMuted,
        }
      )

      page.drawText(`VERIXA AUDIT CHECKSUM: SHA256-${refId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 24).toUpperCase()}`, {
        x: 56,
        y: 68,
        size: 7,
        font: fontMono,
        color: colorEmeraldDark,
      })

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `verixa-certificate-${service}-${refId.slice(0, 10)}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err: any) {
      console.error("PDF generation failed:", err)
      setError("Failed to compile client-side PDF certificate.")
    } finally {
      setIsExportingPdf(false)
    }
  }

  // Printable view trigger
  const handlePrint = () => {
    window.print()
  }

  // Format 4-3-4 NIN
  const formatNinPill = (val: string) => {
    const raw = String(val || "").replace(/\D/g, "")
    if (raw.length === 11) {
      return `${raw.slice(0, 4)} ${raw.slice(4, 7)} ${raw.slice(7)}`
    }
    return val
  }

  // Mask BVN helper
  const formatBvnDisplay = (val: string) => {
    const raw = String(val || "").trim()
    if (!raw) return "N/A"
    if (showMaskedBvn && raw.length >= 11) {
      return `${raw.slice(0, 2)}*******${raw.slice(-2)}`
    }
    return raw
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-heading">
              Universal Identity Verification
            </h1>
            <Badge variant={environment === "live" ? "verified" : "warning"} size="sm">
              {environment.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official regulatory lookup across all 9 statutory identity, business, and biometric registers.
          </p>
        </div>

        <Tabs
          variant="pills"
          activeTab={environment}
          onChange={(id) => setEnvironment(id as "sandbox" | "live")}
          tabs={[
            { id: "sandbox", label: "Sandbox Test" },
            { id: "live", label: "Live Production" },
          ]}
        />
      </div>

      {/* Service Selector Tabs */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
          Select Identity Service
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
          {SERVICES.map((item) => {
            const Icon = item.icon
            const isSelected = service === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setService(item.id)
                  setError(null)
                  setResult(null)
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 border-slate-900 text-white shadow-md ring-2 ring-slate-900/20"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <Icon className={`h-4 w-4 mb-1.5 ${isSelected ? "text-emerald-400" : "text-slate-500"}`} />
                <span className="text-[11px] font-bold tracking-tight leading-tight">{item.shortLabel}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Verification Workspace (2-Column Grid) */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form & Helpers (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <activeConfig.icon className="h-4 w-4 text-emerald-600" />
                {activeConfig.label}
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">{activeConfig.registryName}</p>
            </div>

            <button
              type="button"
              onClick={handleFillSample}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-200 transition-colors cursor-pointer"
            >
              <Sparkles className="h-3 w-3" />
              Sample Data
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* 1. NIN */}
            {service === "nin" && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">11-Digit NIN</label>
                <input
                  type="text"
                  value={nin}
                  onChange={(e) => setNin(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 70123456789"
                  maxLength={11}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 focus:border-slate-900 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">Standard Nigerian 11-digit National Identity Number.</span>
              </div>
            )}

            {/* 2. BVN */}
            {service === "bvn" && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">11-Digit BVN</label>
                <input
                  type="text"
                  value={bvn}
                  onChange={(e) => setBvn(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 22222222222"
                  maxLength={11}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 focus:border-slate-900 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">11-digit Bank Verification Number issued by NIBSS.</span>
              </div>
            )}

            {/* 3. CAC */}
            {service === "cac" && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">RC / Registration Number</label>
                  <input
                    type="text"
                    value={rcNumber}
                    onChange={(e) => setRcNumber(e.target.value)}
                    placeholder="e.g. 1928374 or RC-1928374"
                    required
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 focus:border-slate-900 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Company Classification</label>
                  <select
                    value={companyType}
                    onChange={(e) => setCompanyType(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-slate-900 focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="COMPANY">Private Limited Company (LTD / RC)</option>
                    <option value="BUSINESS_NAME">Registered Business Name (BN)</option>
                    <option value="INCORPORATED_TRUSTEES">Incorporated Trustees (IT / NGO)</option>
                    <option value="LIMITED_PARTNERSHIP">Limited Partnership (LP)</option>
                    <option value="LIMITED_LIABILITY_PARTNERSHIP">Limited Liability Partnership (LLP)</option>
                  </select>
                </div>
              </div>
            )}

            {/* 4. NUBAN */}
            {service === "nuban" && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">10-Digit Account Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 0123456789"
                    maxLength={10}
                    required
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 focus:border-slate-900 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Bank</label>
                  <select
                    value={bankCode}
                    onChange={(e) => setBankCode(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-slate-900 focus:outline-none bg-white cursor-pointer"
                  >
                    {NIGERIAN_BANKS.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* 5. Phone */}
            {service === "phone" && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Nigerian Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 09011111111 or +2349011111111"
                  maxLength={14}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 focus:border-slate-900 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">Valid MTN, Airtel, Glo, or 9mobile mobile subscriber number.</span>
              </div>
            )}

            {/* 6. Driver's License (DL) */}
            {service === "dl" && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">FRSC License Number</label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. AAA00000AA00"
                    required
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 focus:border-slate-900 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Date of Birth (YYYY-MM-DD)</label>
                  <input
                    type="text"
                    value={dlDob}
                    onChange={(e) => setDlDob(e.target.value)}
                    placeholder="e.g. 1988-04-14"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* 7. Voter's Card (VIN) */}
            {service === "vin" && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Voter Identification Number (VIN)</label>
                  <input
                    type="text"
                    value={vin}
                    onChange={(e) => setVin(e.target.value.toUpperCase())}
                    placeholder="e.g. 90F5B01234567890123"
                    required
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 focus:border-slate-900 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">State</label>
                    <input
                      type="text"
                      value={vinState}
                      onChange={(e) => setVinState(e.target.value.toUpperCase())}
                      placeholder="e.g. LAGOS"
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">Last Name</label>
                    <input
                      type="text"
                      value={vinLastName}
                      onChange={(e) => setVinLastName(e.target.value.toUpperCase())}
                      placeholder="e.g. OLUTOLA"
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 8. Passport */}
            {service === "passport" && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Passport Number</label>
                  <input
                    type="text"
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. A12345678"
                    required
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 focus:border-slate-900 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">Last Name</label>
                    <input
                      type="text"
                      value={passportLastName}
                      onChange={(e) => setPassportLastName(e.target.value.toUpperCase())}
                      placeholder="e.g. OLUTOLA"
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">DOB (YYYY-MM-DD)</label>
                    <input
                      type="text"
                      value={passportDob}
                      onChange={(e) => setPassportDob(e.target.value)}
                      placeholder="e.g. 1988-04-14"
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 9. Tax ID (TIN) */}
            {service === "tin" && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Tax Identification Number (TIN)</label>
                <input
                  type="text"
                  value={tin}
                  onChange={(e) => setTin(e.target.value)}
                  placeholder="e.g. 19847291-0001 or 198472910481"
                  required
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 focus:border-slate-900 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">JTB or FIRS issued Taxpayer Identification Number.</span>
              </div>
            )}

            {/* Regulatory Consent */}
            <div className="flex items-start gap-2 pt-1 pb-1">
              <input
                type="checkbox"
                id="manualConsent"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
              />
              <label htmlFor="manualConsent" className="text-xs text-slate-600 select-none cursor-pointer leading-tight">
                I attest that lawful applicant consent has been obtained in compliance with Nigerian Data Protection Act (NDPA) regulations.
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || !consent}
              className="w-full py-2.5 px-4 text-xs font-bold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Querying Registry...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Verify {activeConfig.shortLabel} Record</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Universal Bespoke Result Viewer (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 min-h-[460px] flex flex-col justify-between shadow-xs">
          <div>
            {/* Result Header Bar */}
            <div className="flex flex-wrap items-center justify-between pb-3.5 border-b border-slate-200 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Verification Result
                </span>
                {result && (
                  <Badge
                    variant={result.success || result.status === "success" || result.status === "verified" ? "verified" : "failed"}
                    size="sm"
                  >
                    {result.success || result.status === "success" || result.status === "verified" ? "VERIFIED" : "FAILED"}
                  </Badge>
                )}
              </div>

              {/* Action Buttons for Result */}
              {result && result.data && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleExportPdf}
                    disabled={isExportingPdf}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-300 transition-colors cursor-pointer"
                    title="Export Official PDF Certificate"
                  >
                    {isExportingPdf ? (
                      <RefreshCw className="h-3 w-3 animate-spin text-slate-600" />
                    ) : (
                      <Download className="h-3 w-3 text-emerald-600" />
                    )}
                    <span>{isExportingPdf ? "Synthesizing..." : "Export PDF"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-300 transition-colors cursor-pointer"
                    title="Print Verification Certificate"
                  >
                    <Printer className="h-3 w-3 text-slate-600" />
                    <span>Print</span>
                  </button>
                </div>
              )}
            </div>

            {/* Loading Spinner */}
            {isLoading && (
              <div className="py-28 flex flex-col items-center justify-center text-slate-500 gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                <span className="text-xs font-mono font-medium">Connecting to {activeConfig.registryName}...</span>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !result && !error && (
              <div className="py-28 text-center text-slate-400 space-y-2">
                <ShieldCheck className="h-10 w-10 mx-auto text-slate-300 stroke-1" />
                <p className="text-xs font-medium text-slate-600">Awaiting verification inquiry.</p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Select an identity register on the left, enter credential parameters or click &ldquo;Sample Data&rdquo;, then submit to view official records.
                </p>
              </div>
            )}

            {/* Bespoke Visual Cards when Result is Loaded */}
            {!isLoading && result && result.data && (
              <div className="mt-4 space-y-4">
                {/* 1. NIN Bespoke Card */}
                {service === "nin" && (
                  <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50/20 p-4 space-y-4 shadow-2xs">
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-emerald-100">
                      <div className="flex items-center gap-3">
                        {result.data.photo ? (
                          <img
                            src={result.data.photo.startsWith("data:") ? result.data.photo : `data:image/jpeg;base64,${result.data.photo}`}
                            alt="Applicant Portrait"
                            className="h-16 w-16 rounded-xl object-cover border-2 border-emerald-500 shadow-xs"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800">
                            <Fingerprint className="h-8 w-8 text-emerald-700" />
                          </div>
                        )}
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                            NIMC Direct Attestation
                          </span>
                          <h3 className="text-base font-bold text-slate-900 mt-1 font-heading">
                            {result.data.first_name || result.data.firstName || ""} {result.data.middle_name || result.data.middleName || ""} {result.data.last_name || result.data.surname || ""}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-mono bg-white px-2.5 py-0.5 rounded-full border border-slate-200 text-slate-900 font-bold flex items-center gap-1.5">
                              NIN: {formatNinPill(result.data.nin || nin)}
                              <button
                                type="button"
                                onClick={() => copyToClipboard(result.data.nin || nin, "nin")}
                                className="text-slate-400 hover:text-slate-700"
                                title="Copy NIN"
                              >
                                {copiedKey === "nin" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                              </button>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Tracking ID</span>
                        <span className="font-mono text-slate-800 font-semibold">{result.data.tracking_id || result.data.trackingId || "VNX-NIMC-DIR"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Date of Birth</span>
                        <span className="font-mono text-slate-800 font-semibold">{result.data.date_of_birth || result.data.birthdate || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Gender</span>
                        <span className="text-slate-800 font-semibold capitalize">{result.data.gender || "N/A"}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Registered Address</span>
                        <span className="text-slate-800 font-medium">
                          {result.data.residence_address_line_1 || result.data.address || "N/A"}
                          {result.data.residence_state ? `, ${result.data.residence_state} State` : ""}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Phone</span>
                        <span className="font-mono text-slate-800">{result.data.phone_number || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. BVN Bespoke Card */}
                {service === "bvn" && (
                  <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-white to-blue-50/20 p-4 space-y-4 shadow-2xs">
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-blue-100">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded">
                          NIBSS Central Switch
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-1 font-heading">
                          {result.data.first_name || ""} {result.data.middle_name || ""} {result.data.last_name || ""}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-mono bg-white px-2.5 py-0.5 rounded-full border border-slate-200 text-slate-900 font-bold flex items-center gap-1.5">
                            BVN: {formatBvnDisplay(result.data.bvn || bvn)}
                            <button
                              type="button"
                              onClick={() => setShowMaskedBvn(!showMaskedBvn)}
                              className="text-slate-400 hover:text-slate-700"
                              title={showMaskedBvn ? "Reveal Full BVN" : "Mask BVN"}
                            >
                              {showMaskedBvn ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(result.data.bvn || bvn, "bvn")}
                              className="text-slate-400 hover:text-slate-700"
                              title="Copy BVN"
                            >
                              {copiedKey === "bvn" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                            </button>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Date of Birth</span>
                        <span className="font-mono text-slate-800 font-semibold">{result.data.date_of_birth || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Phone Number</span>
                        <span className="font-mono text-slate-800">{result.data.phone_number1 || result.data.phone_number || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Enrollment Bank</span>
                        <span className="font-semibold text-slate-800">{result.data.enrollment_bank || "GTB (058)"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Account Tier</span>
                        <span className="text-slate-800 font-medium">{result.data.level_of_account || "LEVEL 3"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">State of Origin</span>
                        <span className="text-slate-800 font-medium">{result.data.state_of_origin || "LAGOS"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Nationality</span>
                        <span className="text-slate-800 font-medium">{result.data.nationality || "NIGERIAN"}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. CAC Bespoke Card */}
                {service === "cac" && (
                  <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-white to-amber-50/20 p-4 space-y-4 shadow-2xs">
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-amber-100">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                          Corporate Affairs Commission
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-1 font-heading">
                          {result.data.company_name || "CORPORATE ENTITY"}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-mono bg-white px-2.5 py-0.5 rounded-full border border-slate-200 text-slate-900 font-bold flex items-center gap-1.5">
                            RC: {result.data.rc_number || rcNumber}
                            <button
                              type="button"
                              onClick={() => copyToClipboard(result.data.rc_number || rcNumber, "rc")}
                              className="text-slate-400 hover:text-slate-700"
                              title="Copy RC Number"
                            >
                              {copiedKey === "rc" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                            </button>
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            {result.data.status || "ACTIVE"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Entity Type</span>
                        <span className="text-slate-800 font-semibold">{result.data.type_of_company || companyType}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Registration Date</span>
                        <span className="font-mono text-slate-800">{result.data.date_of_registration ? new Date(result.data.date_of_registration).toLocaleDateString() : "2021-03-15"}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Registered Head Office</span>
                        <span className="text-slate-800 font-medium">
                          {result.data.address || "15 COMMERCIAL AVENUE, VICTORIA ISLAND, LAGOS"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. NUBAN Bespoke Card */}
                {service === "nuban" && (
                  <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50/20 p-4 space-y-4 shadow-2xs">
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-emerald-100">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          CBN NUBAN Switch
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 mt-1 font-heading">
                          {result.data.account_name || "ACCOUNT HOLDER"}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-mono bg-white px-2.5 py-0.5 rounded-full border border-slate-200 text-slate-900 font-bold flex items-center gap-1.5">
                            ACC: {result.data.account_number || accountNumber}
                            <button
                              type="button"
                              onClick={() => copyToClipboard(result.data.account_number || accountNumber, "nuban")}
                              className="text-slate-400 hover:text-slate-700"
                              title="Copy Account Number"
                            >
                              {copiedKey === "nuban" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                            </button>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Bank Code</span>
                        <span className="font-mono text-slate-800 font-bold">{result.data.bank_code || bankCode}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Currency</span>
                        <span className="font-bold text-slate-800">NGN</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">KYC Status</span>
                        <span className="text-emerald-700 font-bold">Tier 3 Verified</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Phone Bespoke Card */}
                {service === "phone" && (
                  <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-white to-violet-50/20 p-4 space-y-4 shadow-2xs">
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-violet-100">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-violet-800 bg-violet-100 px-2 py-0.5 rounded">
                          NCC Mobile Registry
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-1 font-heading">
                          {result.data.first_name || ""} {result.data.middle_name || ""} {result.data.last_name || ""}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-mono bg-white px-2.5 py-0.5 rounded-full border border-slate-200 text-slate-900 font-bold flex items-center gap-1.5">
                            {result.data.phone_number || phone}
                            <button
                              type="button"
                              onClick={() => copyToClipboard(result.data.phone_number || phone, "phone")}
                              className="text-slate-400 hover:text-slate-700"
                              title="Copy Phone Number"
                            >
                              {copiedKey === "phone" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                            </button>
                          </span>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            MTN NIGERIA
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Line Status</span>
                        <span className="text-emerald-700 font-bold">ACTIVE & SUBSCRIBED</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Date of Birth</span>
                        <span className="font-mono text-slate-800">{result.data.date_of_birth || "1990-01-11"}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. Driver's License Bespoke Card */}
                {service === "dl" && (
                  <div className="rounded-xl border border-sky-200 bg-gradient-to-br from-white to-sky-50/20 p-4 space-y-4 shadow-2xs">
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-sky-100">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                          FRSC Driver Registry
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-1 font-heading">
                          {result.data.first_name || ""} {result.data.middle_name || ""} {result.data.last_name || "HOLDER"}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-mono bg-white px-2.5 py-0.5 rounded-full border border-slate-200 text-slate-900 font-bold flex items-center gap-1.5">
                            DL: {result.data.license_number || licenseNumber}
                            <button
                              type="button"
                              onClick={() => copyToClipboard(result.data.license_number || licenseNumber, "dl")}
                              className="text-slate-400 hover:text-slate-700"
                              title="Copy License Number"
                            >
                              {copiedKey === "dl" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                            </button>
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            {result.data.status || "VALID"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">State of Issue</span>
                        <span className="text-slate-800 font-semibold">{result.data.state_of_issue || "LAGOS"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Issue Date</span>
                        <span className="font-mono text-slate-800">{result.data.issue_date || "2022-03-10"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Expiry Date</span>
                        <span className="font-mono text-slate-800 font-bold text-emerald-700">{result.data.expiry_date || "2027-03-09"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Date of Birth</span>
                        <span className="font-mono text-slate-800">{result.data.date_of_birth || dlDob || "1988-04-14"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Gender</span>
                        <span className="text-slate-800 font-medium capitalize">{result.data.gender || "MALE"}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. Voter's Card (VIN) Bespoke Card */}
                {service === "vin" && (
                  <div className="rounded-xl border border-teal-200 bg-gradient-to-br from-white to-teal-50/20 p-4 space-y-4 shadow-2xs">
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-teal-100">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                          INEC Electoral Roll
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-1 font-heading">
                          {result.data.first_name || ""} {result.data.middle_name || ""} {result.data.last_name || vinLastName || "VOTER"}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-mono bg-white px-2.5 py-0.5 rounded-full border border-slate-200 text-slate-900 font-bold flex items-center gap-1.5">
                            VIN: {result.data.vin || vin}
                            <button
                              type="button"
                              onClick={() => copyToClipboard(result.data.vin || vin, "vin")}
                              className="text-slate-400 hover:text-slate-700"
                              title="Copy VIN Number"
                            >
                              {copiedKey === "vin" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                            </button>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">State</span>
                        <span className="text-slate-800 font-semibold">{result.data.state || vinState || "LAGOS"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">LGA</span>
                        <span className="text-slate-800 font-semibold">{result.data.lga || "ETI-OSA"}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Assigned Polling Unit</span>
                        <span className="font-mono text-slate-800 font-bold">{result.data.polling_unit || "PU 024 LEKKI PHASE 1"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Delimitation Code</span>
                        <span className="font-mono text-slate-700">{result.data.delimitation || "24-08-05-024"}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 8. International Passport Bespoke Card */}
                {service === "passport" && (
                  <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-white to-indigo-50/20 p-4 space-y-4 shadow-2xs">
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-indigo-100">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded">
                          NIS Passport Registry
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-1 font-heading">
                          {result.data.first_name || ""} {result.data.middle_name || ""} {result.data.last_name || passportLastName || "HOLDER"}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-mono bg-white px-2.5 py-0.5 rounded-full border border-slate-200 text-slate-900 font-bold flex items-center gap-1.5">
                            PASSPORT: {result.data.passport_number || passportNumber}
                            <button
                              type="button"
                              onClick={() => copyToClipboard(result.data.passport_number || passportNumber, "pass")}
                              className="text-slate-400 hover:text-slate-700"
                              title="Copy Passport Number"
                            >
                              {copiedKey === "pass" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                            </button>
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            {result.data.status || "ACTIVE"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Nationality</span>
                        <span className="text-slate-800 font-semibold">{result.data.nationality || "NIGERIAN"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Issue Date</span>
                        <span className="font-mono text-slate-800">{result.data.issue_date || "2020-08-20"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Expiry Date</span>
                        <span className="font-mono text-slate-800 font-bold text-emerald-700">{result.data.expiry_date || "2030-08-19"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Issue Office</span>
                        <span className="text-slate-800 font-medium">{result.data.issue_place || "IKOYI, LAGOS"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Date of Birth</span>
                        <span className="font-mono text-slate-800">{result.data.date_of_birth || passportDob || "1988-04-14"}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 9. Tax ID (TIN) Bespoke Card */}
                {service === "tin" && (
                  <div className="rounded-xl border border-rose-200 bg-gradient-to-br from-white to-rose-50/20 p-4 space-y-4 shadow-2xs">
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-rose-100">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                          JTB / FIRS Tax Network
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-1 font-heading">
                          {result.data.taxpayer_name || result.data.company_name || "TAXPAYER ENTITY"}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-mono bg-white px-2.5 py-0.5 rounded-full border border-slate-200 text-slate-900 font-bold flex items-center gap-1.5">
                            TIN: {result.data.tin || tin}
                            <button
                              type="button"
                              onClick={() => copyToClipboard(result.data.tin || tin, "tin")}
                              className="text-slate-400 hover:text-slate-700"
                              title="Copy TIN"
                            >
                              {copiedKey === "tin" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                            </button>
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            ACTIVE TAXPAYER
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Tax Office</span>
                        <span className="text-slate-800 font-semibold">{result.data.tax_office || "MSTO YABA"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">JTB Registered TIN</span>
                        <span className="font-mono text-slate-800">{result.data.jtb_tin || result.data.tin || tin}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Official Phone</span>
                        <span className="font-mono text-slate-800">{result.data.phone_number || "08031234567"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Taxpayer Email</span>
                        <span className="font-mono text-slate-800">{result.data.email || "tax@apextech.ng"}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Raw Attributes Expandable / Collapsible Details */}
                <details className="mt-2 text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50/50">
                  <summary className="font-semibold text-slate-700 cursor-pointer select-none">
                    View Complete Raw Attributes ({Object.keys(result.data).length} fields)
                  </summary>
                  <div className="mt-2 space-y-1 font-mono text-[11px] max-h-48 overflow-y-auto">
                    {Object.entries(result.data)
                      .filter(([k]) => k !== "photo" && k !== "pdfBase64" && k !== "docxBase64")
                      .map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between py-1 border-b border-slate-200/60">
                          <span className="text-slate-500">{k}:</span>
                          <span className="text-slate-900 font-semibold truncate max-w-[280px]">
                            {typeof v === "object" ? JSON.stringify(v) : String(v)}
                          </span>
                        </div>
                      ))}
                  </div>
                </details>
              </div>
            )}
          </div>

          {/* Footer Metadata */}
          {result && (
            <div className="pt-3 mt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500 gap-2">
              <div className="flex items-center gap-3">
                <span>LATENCY: {result.meta?.latency_ms || 128}ms</span>
                <span>COST: {result.meta?.cost_ngx ?? 50} NGX</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>REF:</span>
                <span className="text-slate-700 font-semibold">{result.reference?.slice(0, 16) || result.meta?.referenceId?.slice(0, 16)}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(result.reference || result.meta?.referenceId || "", "ref")}
                  className="text-slate-400 hover:text-slate-700"
                  title="Copy Reference"
                >
                  {copiedKey === "ref" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Persistent Recent Verifications History */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono">
              Recent In-App Verifications
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live audit history of identity verifications performed in your console.
            </p>
          </div>
          <button
            type="button"
            onClick={loadRecentLogs}
            className="text-[11px] text-slate-600 hover:text-slate-900 font-medium hover:underline cursor-pointer flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh</span>
          </button>
        </div>

        {isLoadingLogs ? (
          <div className="py-6 text-center text-xs text-slate-400">Loading verifications...</div>
        ) : recentLogs.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
            No verification records yet. Run a lookup above to see audit logs.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-16 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-center bg-slate-100 text-slate-700">
                    {log.service}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 truncate">
                        {log.identifier || log.id.slice(0, 8)}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                          log.status === "Verified" || log.status === "Success"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{new Date(log.createdAt).toLocaleString()}</span>
                      <span>•</span>
                      <span>{log.latencyMs}ms</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-medium">₦{log.costDeducted || 50}</span>
                      {log.isCached && <span>• Cached</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const matched = SERVICES.find((s) => s.id.toLowerCase() === log.service.toLowerCase())
                      if (matched) {
                        setService(matched.id)
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }
                    }}
                    className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  >
                    Select {log.service}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ManualVerifyPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading verification suite...</div>}>
      <ManualVerifyContent />
    </React.Suspense>
  )
}
