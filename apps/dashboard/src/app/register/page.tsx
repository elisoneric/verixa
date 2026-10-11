"use client"

import * as React from "react"
import Link from "next/link"
import { Input, Logo } from "@verixa/ui"
import { useAuth } from "../../lib/auth-context"

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth()
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [termsAgreed, setTermsAgreed] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in your name, email, and password.")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    if (!termsAgreed) {
      setError("Please agree to the Terms of Service and Privacy Policy.")
      return
    }

    setIsLoading(true)
    try {
      await register(email.trim(), password, name.trim(), {
        accountType: "developer",
        lawfulBasisAgreed: true,
        termsAgreed: true,
      })
    } catch (err: any) {
      setError(err.message || "Registration failed. Please check your details.")
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setError(null)
    try {
      await loginWithGoogle()
    } catch (err: any) {
      setError(err.message || "Google sign in failed.")
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#06070a] text-zinc-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative font-sans selection:bg-emerald-500/25 selection:text-emerald-300">
      <div aria-hidden="true" className="fixed inset-0 mesh-glow pointer-events-none -z-10 opacity-70" />
      <div aria-hidden="true" className="fixed inset-0 grid-backdrop pointer-events-none -z-10 opacity-35" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
          <Logo size="lg" />
        </Link>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white font-heading">
          Create your account
        </h2>
        <p className="mt-1 text-xs text-zinc-400">
          Or{" "}
          <Link href="/login" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
            sign in to an existing account
          </Link>
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-card bg-[#0e1118]/70 border border-white/[0.08] p-6 sm:p-8 rounded-2xl shadow-2xl backdrop-blur-2xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.12] text-sm font-semibold text-white transition-all shadow-xs cursor-pointer active:scale-[0.99] disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}</span>
          </button>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.08]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#0e1118] px-2 text-zinc-500 font-mono text-[11px]">
                or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Organization or Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Work Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-white/[0.2] bg-black/40 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-zinc-400 text-xs leading-relaxed">
                  I agree to the{" "}
                  <Link href="/terms" className="underline hover:text-white">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="underline hover:text-white">Privacy Policy</Link>.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="btn-pill-primary !w-full !py-3 !text-sm !font-bold h-11 cursor-pointer mt-2 shadow-[0_0_20px_rgba(255,255,255,0.25)]"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/[0.08] text-center">
            <span className="text-xs text-zinc-400">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-emerald-400 hover:underline">
                Sign in →
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
