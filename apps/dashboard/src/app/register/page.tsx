"use client"

import * as React from "react"
import Link from "next/link"
import { Button, Input, Logo, Card, Badge } from "@verixa/ui"
import { useAuth } from "../../lib/auth-context"

type AccountType = "individual" | "developer"

export default function RegisterPage() {
  const { register } = useAuth()
  const [accountType, setAccountType] = React.useState<AccountType>("individual")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Individual Form Fields
  const [indFullName, setIndFullName] = React.useState("")
  const [indNin, setIndNin] = React.useState("")
  const [indEmail, setIndEmail] = React.useState("")
  const [indPhone, setIndPhone] = React.useState("")
  const [indPassword, setIndPassword] = React.useState("")
  const [indConsent, setIndConsent] = React.useState(false)

  // Developer Form Fields
  const [devOrgName, setDevOrgName] = React.useState("")
  const [devBusinessType, setDevBusinessType] = React.useState("Limited Liability Company (RC)")
  const [devRcNumber, setDevRcNumber] = React.useState("")
  const [devEmail, setDevEmail] = React.useState("")
  const [devPhone, setDevPhone] = React.useState("")
  const [devPassword, setDevPassword] = React.useState("")
  const [devDirectorName, setDevDirectorName] = React.useState("")
  const [devDirectorNin, setDevDirectorNin] = React.useState("")
  const [devLawfulBasisAgreed, setDevLawfulBasisAgreed] = React.useState(false)
  const [devTermsAgreed, setDevTermsAgreed] = React.useState(false)

  const handleIndividualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!indFullName.trim() || !indNin.trim() || !indEmail.trim() || !indPassword.trim()) {
      setError("Please fill in your name, 11-digit NIN, email, and password.")
      return
    }

    if (indNin.trim().length !== 11 || !/^\d+$/.test(indNin.trim())) {
      setError("Your NIN must be exactly 11 digits.")
      return
    }

    if (indPassword.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    if (!indConsent) {
      setError("Please confirm your authorization for NIN verification and DVA generation.")
      return
    }

    setIsLoading(true)
    try {
      await register(
        indEmail.trim(),
        indPassword,
        indFullName.trim(),
        {
          accountType: "individual",
          fullName: indFullName.trim(),
          nin: indNin.trim(),
          phone: indPhone.trim() || undefined,
          consent: true,
          lawfulBasisAgreed: true,
        }
      )
    } catch (err: any) {
      setError(err.message || "Registration failed. Please verify your details.")
      setIsLoading(false)
    }
  }

  const handleDeveloperSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!devOrgName.trim() || !devEmail.trim() || !devPassword.trim()) {
      setError("Please enter your organization name, work email, and password.")
      return
    }

    if (!devDirectorName.trim() || !devDirectorNin.trim()) {
      setError("Please provide the authorized representative's name and 11-digit NIN.")
      return
    }

    if (devDirectorNin.trim().length !== 11 || !/^\d+$/.test(devDirectorNin.trim())) {
      setError("Representative NIN must be exactly 11 digits.")
      return
    }

    if (devPassword.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    if (!devLawfulBasisAgreed || !devTermsAgreed) {
      setError("Please agree to the NDPA lawful basis guarantee and platform terms.")
      return
    }

    setIsLoading(true)
    try {
      await register(
        devEmail.trim(),
        devPassword,
        devOrgName.trim(),
        {
          accountType: "developer",
          businessType: devBusinessType,
          rcNumber: devRcNumber.trim() || undefined,
          phone: devPhone.trim() || undefined,
          directorName: devDirectorName.trim(),
          directorNin: devDirectorNin.trim(),
          lawfulBasisAgreed: true,
          termsAgreed: true,
          consent: true,
        }
      )
    } catch (err: any) {
      setError(err.message || "Registration failed. Please check your credentials.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center mb-6">
        <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
          <Logo size="lg" />
        </Link>
        <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Create your Verixa Account
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
          Fast verification, automated official NIMC slips, and instant DVA settlement
        </p>

        {/* Account Type Segmented Tab */}
        <div className="mt-6 p-1 bg-slate-200/80 dark:bg-zinc-900 rounded-xl border border-slate-300 dark:border-zinc-800 grid grid-cols-2 gap-1 max-w-sm mx-auto">
          <button
            type="button"
            onClick={() => { setAccountType("individual"); setError(null); }}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              accountType === "individual"
                ? "bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-xs border border-slate-200 dark:border-zinc-700"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Individual / User
          </button>
          <button
            type="button"
            onClick={() => { setAccountType("developer"); setError(null); }}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              accountType === "developer"
                ? "bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-xs border border-slate-200 dark:border-zinc-700"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Developer & API
          </button>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <Card className="bg-white dark:bg-zinc-900/80 border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/25 text-rose-700 dark:text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* INDIVIDUAL ACCOUNT FORM */}
          {accountType === "individual" && (
            <form onSubmit={handleIndividualSubmit} className="space-y-4">
              <div className="border-b border-slate-200 dark:border-zinc-800 pb-3 mb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Individual Workspace</h3>
                  <Badge variant="verified" size="sm">NIN + DVA READY</Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Instant access to NIN Slips, BVN tools, and free NUBAN resolution.
                </p>
              </div>

              <Input
                label="Full Legal Name (as on your NIN) *"
                type="text"
                placeholder="OLUWASEUN ADEKUNLE BELLO"
                value={indFullName}
                onChange={(e) => setIndFullName(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="11-Digit National ID Number (NIN) *"
                  type="text"
                  maxLength={11}
                  placeholder="22198765432"
                  value={indNin}
                  onChange={(e) => setIndNin(e.target.value)}
                  hint="Required for dedicated Titan Trust Bank DVA"
                  required
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="0803 123 4567"
                  value={indPhone}
                  onChange={(e) => setIndPhone(e.target.value)}
                />
              </div>

              <Input
                label="Email Address *"
                type="email"
                placeholder="seun.bello@gmail.com"
                value={indEmail}
                onChange={(e) => setIndEmail(e.target.value)}
                required
              />

              <Input
                label="Password (minimum 8 characters) *"
                type="password"
                placeholder="••••••••••••"
                value={indPassword}
                onChange={(e) => setIndPassword(e.target.value)}
                required
              />

              <div className="p-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60 text-xs space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={indConsent}
                    onChange={(e) => setIndConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-zinc-700 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-slate-600 dark:text-zinc-300 leading-relaxed text-[11px]">
                    I confirm my name and 11-digit NIN are accurate and authorize Verixa to verify my identity for dedicated bank account issuance & slip generation.
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                variant="emerald"
                size="md"
                className="w-full font-bold h-11"
                isLoading={isLoading}
              >
                Create Individual Account &rarr;
              </Button>

              <p className="text-[11px] text-center text-slate-500 dark:text-zinc-400">
                Need automated API keys later? You can upgrade to a Developer account anytime in 1 click.
              </p>
            </form>
          )}

          {/* DEVELOPER ACCOUNT FORM */}
          {accountType === "developer" && (
            <form onSubmit={handleDeveloperSubmit} className="space-y-4">
              <div className="border-b border-slate-200 dark:border-zinc-800 pb-3 mb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Developer & Organization</h3>
                  <Badge variant="mono" size="sm">REST API + WEBHOOKS</Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Instant sandbox API keys, live keys, and dedicated high-volume rate limits.
                </p>
              </div>

              <Input
                label="Organization / Company / App Name *"
                type="text"
                placeholder="Apex Technologies Ltd"
                value={devOrgName}
                onChange={(e) => setDevOrgName(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">Entity Type</label>
                  <select
                    value={devBusinessType}
                    onChange={(e) => setDevBusinessType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none h-11"
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
                  value={devRcNumber}
                  onChange={(e) => setDevRcNumber(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Work Email Address *"
                  type="email"
                  placeholder="dev@apextech.ng"
                  value={devEmail}
                  onChange={(e) => setDevEmail(e.target.value)}
                  required
                />

                <Input
                  label="Official Telephone"
                  type="tel"
                  placeholder="0803 123 4567"
                  value={devPhone}
                  onChange={(e) => setDevPhone(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Representative Full Name *"
                  type="text"
                  placeholder="CHIDERA EMEKA"
                  value={devDirectorName}
                  onChange={(e) => setDevDirectorName(e.target.value)}
                  required
                />

                <Input
                  label="Representative 11-digit NIN *"
                  type="text"
                  maxLength={11}
                  placeholder="22198765432"
                  value={devDirectorNin}
                  onChange={(e) => setDevDirectorNin(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Password (minimum 8 characters) *"
                type="password"
                placeholder="••••••••••••"
                value={devPassword}
                onChange={(e) => setDevPassword(e.target.value)}
                required
              />

              <div className="space-y-2 p-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60 text-[11px]">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={devLawfulBasisAgreed}
                    onChange={(e) => setDevLawfulBasisAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-zinc-700 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-slate-600 dark:text-zinc-300 leading-relaxed">
                    I certify that our organization processes identity verifications strictly with end-user consent pursuant to Section 25 of the Nigeria Data Protection Act (NDPA 2023).
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={devTermsAgreed}
                    onChange={(e) => setDevTermsAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-zinc-700 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-slate-600 dark:text-zinc-300 leading-relaxed">
                    I agree to the Verixa Terms of Service, Privacy Policy, and Dedicated Virtual Account settlement conditions.
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                variant="emerald"
                size="md"
                className="w-full font-bold h-11"
                isLoading={isLoading}
              >
                Create Developer Account &rarr;
              </Button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-zinc-800 text-center">
            <span className="text-xs text-slate-500 dark:text-zinc-400">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                Sign in &rarr;
              </Link>
            </span>
          </div>
        </Card>
      </div>
    </div>
  )
}
