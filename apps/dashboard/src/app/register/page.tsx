"use client"

import * as React from "react"
import Link from "next/link"
import { Button, Input, Logo, Card, AppLink, Badge } from "@verixa/ui"
import { useAuth } from "../../lib/auth-context"

export default function RegisterPage() {
  const { register } = useAuth()
  const [step, setStep] = React.useState<1 | 2 | 3>(1)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Step 1: Business Basics
  const [orgName, setOrgName] = React.useState("")
  const [businessType, setBusinessType] = React.useState("Limited Liability Company (RC)")
  const [rcNumber, setRcNumber] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [password, setPassword] = React.useState("")

  // Step 2: Representative & NIN Standard Data
  const [directorName, setDirectorName] = React.useState("")
  const [directorNin, setDirectorNin] = React.useState("")
  const [directorDob, setDirectorDob] = React.useState("")
  const [useCase, setUseCase] = React.useState("Fintech / Digital Wallet Onboarding")

  // Step 3: Consent & NDPR Compliance
  const [lawfulBasisAgreed, setLawfulBasisAgreed] = React.useState(false)
  const [termsAgreed, setTermsAgreed] = React.useState(false)
  const [officerConsentAgreed, setOfficerConsentAgreed] = React.useState(false)

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (step === 1) {
      if (!orgName.trim() || !email.trim() || !password.trim()) {
        setError("Please fill in all required organization fields.")
        return
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters long.")
        return
      }
      setStep(2)
    } else if (step === 2) {
      if (!directorName.trim() || !directorNin.trim()) {
        setError("Please provide the legal representative name and 11-digit NIN.")
        return
      }
      if (directorNin.trim().length !== 11 || !/^\d+$/.test(directorNin.trim())) {
        setError("Representative NIN must be exactly 11 digits.")
        return
      }
      setStep(3)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!lawfulBasisAgreed || !termsAgreed || !officerConsentAgreed) {
      setError("Please acknowledge all data protection and compliance agreements to proceed.")
      return
    }

    setIsLoading(true)

    const complianceData = {
      businessType,
      rcNumber: rcNumber.trim() || undefined,
      phone: phone.trim() || undefined,
      directorName: directorName.trim(),
      directorNin: directorNin.trim(),
      directorDob: directorDob || undefined,
      useCase,
      lawfulBasisAgreed,
      termsAgreed,
      officerConsentAgreed,
    }

    try {
      await register(email, password, orgName, complianceData)
    } catch (err: any) {
      setError(err.message || "Registration failed. Please verify your details.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-zinc-950 to-zinc-950" />

      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center mb-6">
        <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
          <Logo size="lg" />
        </Link>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">
          Create your Verixa Developer Account
        </h2>
        <p className="mt-1 text-xs text-zinc-400">
          NDPR & CBN Compliant Identity Verification Infrastructure
        </p>

        {/* Step Progress Bar */}
        <div className="mt-6 flex items-center justify-center gap-2 max-w-sm mx-auto">
          <div className="flex-1">
            <div className={`h-1.5 rounded-full transition-all ${step >= 1 ? "bg-emerald-500" : "bg-zinc-800"}`} />
            <span className={`text-[10px] block mt-1 font-medium ${step === 1 ? "text-emerald-400" : "text-zinc-500"}`}>1. Business</span>
          </div>
          <div className="flex-1">
            <div className={`h-1.5 rounded-full transition-all ${step >= 2 ? "bg-emerald-500" : "bg-zinc-800"}`} />
            <span className={`text-[10px] block mt-1 font-medium ${step === 2 ? "text-emerald-400" : "text-zinc-500"}`}>2. Representative</span>
          </div>
          <div className="flex-1">
            <div className={`h-1.5 rounded-full transition-all ${step >= 3 ? "bg-emerald-500" : "bg-zinc-800"}`} />
            <span className={`text-[10px] block mt-1 font-medium ${step === 3 ? "text-emerald-400" : "text-zinc-500"}`}>3. NDPR Consent</span>
          </div>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <Card className="bg-zinc-900/70 border-zinc-800 p-6 sm:p-8 backdrop-blur">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* STEP 1: BUSINESS BASICS */}
          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-4">
              <div className="border-b border-zinc-800/80 pb-3 mb-3">
                <h3 className="text-sm font-bold text-white">Step 1: Organization & Business Profile</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Enter legal business details for tenant provisioning.</p>
              </div>

              <Input
                label="Organization / Legal Company Name *"
                type="text"
                placeholder="Apex Financial Technologies Ltd"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">Entity Structure</label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Limited Liability Company (RC)">Limited Company (RC)</option>
                    <option value="Business Name (BN)">Business Name (BN)</option>
                    <option value="Fintech / Startup">Fintech / Startup</option>
                    <option value="Independent Developer">Independent Developer</option>
                  </select>
                </div>

                <Input
                  label="CAC RC / BN Number (Optional)"
                  type="text"
                  placeholder="RC-1928374"
                  value={rcNumber}
                  onChange={(e) => setRcNumber(e.target.value)}
                />
              </div>

              <Input
                label="Work Email Address *"
                type="email"
                placeholder="compliance@apexfintech.ng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Official Phone Number"
                  type="tel"
                  placeholder="0803 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />

                <Input
                  label="Password (min 8 chars) *"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="emerald"
                size="md"
                className="w-full mt-3"
              >
                Continue to Representative Identification &rarr;
              </Button>
            </form>
          )}

          {/* STEP 2: REPRESENTATIVE & NIN IDENTIFICATION */}
          {step === 2 && (
            <form onSubmit={handleNextStep} className="space-y-4">
              <div className="border-b border-zinc-800/80 pb-3 mb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Step 2: Authorized Representative</h3>
                  <Badge variant="mono" size="sm">NDPA Standard</Badge>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">Designate the compliance officer or company director.</p>
              </div>

              <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                <span className="font-semibold text-zinc-200 block">Why is this required?</span>
                Under Nigeria Data Protection Act (NDPA 2023) regulations and CBN verification guidelines, platforms accessing national registries must register a verified representative for lawful audit trails.
              </div>

              <Input
                label="Representative Full Legal Name (as on NIN) *"
                type="text"
                placeholder="CHIDERA EMEKA OKONKWO"
                value={directorName}
                onChange={(e) => setDirectorName(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Representative 11-digit NIN *"
                  type="text"
                  maxLength={11}
                  placeholder="22198765432"
                  value={directorNin}
                  onChange={(e) => setDirectorNin(e.target.value)}
                  required
                />

                <Input
                  label="Date of Birth"
                  type="date"
                  value={directorDob}
                  onChange={(e) => setDirectorDob(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Intended Verification Use Case *</label>
                <select
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Fintech / Digital Wallet Onboarding">Fintech / Digital Wallet Onboarding</option>
                  <option value="Lending & Credit Risk Assessment">Lending & Credit Risk Assessment</option>
                  <option value="Anti-Money Laundering & KYC">Anti-Money Laundering & KYC</option>
                  <option value="Merchant Verification & Payouts">Merchant Verification & Payouts</option>
                  <option value="HR & Employee Screening">HR & Employee Screening</option>
                  <option value="Gig Economy & Driver Verification">Gig Economy & Driver Verification</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  &larr; Back
                </Button>
                <Button
                  type="submit"
                  variant="emerald"
                  size="md"
                  className="flex-1"
                >
                  Review Compliance &rarr;
                </Button>
              </div>
            </form>
          )}

          {/* STEP 3: NDPR & LEGAL CONSENT */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="border-b border-zinc-800/80 pb-3 mb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Step 3: Lawful Basis & Consent</h3>
                  <Badge variant="verified" size="sm">NDPR Compliant</Badge>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">Confirm legal authorizations and platform terms.</p>
              </div>

              <div className="space-y-3 pt-1">
                <label className="flex items-start gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-950 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={lawfulBasisAgreed}
                    onChange={(e) => setLawfulBasisAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-950"
                  />
                  <div className="text-xs text-zinc-300 leading-relaxed">
                    <span className="font-semibold text-white block">Lawful Basis Guarantee (NDPA 2023)</span>
                    I certify that our organization will only process identity verification queries with express end-user consent or pursuant to lawful statutory requirements under Section 25 of the Nigeria Data Protection Act 2023.
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-950 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-950"
                  />
                  <div className="text-xs text-zinc-300 leading-relaxed">
                    <span className="font-semibold text-white block">Platform Terms & Privacy Policy</span>
                    I agree to the Verixa ID{" "}
                    <AppLink app="www" path="/terms" className="underline text-emerald-400 hover:text-emerald-300">
                      Terms of Service
                    </AppLink>
                    ,{" "}
                    <AppLink app="www" path="/privacy" className="underline text-emerald-400 hover:text-emerald-300">
                      Privacy Policy
                    </AppLink>
                    , and Data Processing Agreement.
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-950 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={officerConsentAgreed}
                    onChange={(e) => setOfficerConsentAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-950"
                  />
                  <div className="text-xs text-zinc-300 leading-relaxed">
                    <span className="font-semibold text-white block">Representative Authorization</span>
                    I authorize Verixa ID to verify the representative NIN ({directorNin || "•••••••••••"}) against official registries to complete organization onboarding.
                  </div>
                </label>
              </div>

              <div className="flex gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setStep(2)}
                  className="flex-1"
                >
                  &larr; Back
                </Button>
                <Button
                  type="submit"
                  variant="emerald"
                  size="md"
                  className="flex-1"
                  isLoading={isLoading}
                >
                  Complete Setup & Get Keys
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-zinc-800/80 text-center">
            <span className="text-xs text-zinc-400">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                Sign in &rarr;
              </Link>
            </span>
          </div>
        </Card>

        <p className="mt-6 text-center text-xs text-zinc-500">
          Protected by AES-256 Envelope Encryption & NDPR Statutory Compliance.
        </p>
      </div>
    </div>
  )
}
