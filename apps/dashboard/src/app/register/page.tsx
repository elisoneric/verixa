"use client"

import * as React from "react"
import Link from "next/link"
import Script from "next/script"
import { useSearchParams } from "next/navigation"
import { Input, Logo } from "@verixa/ui"
import { useAuth } from "../../lib/auth-context"

declare global {
  interface Window {
    google?: any
  }
}

function RegisterForm() {
  const { register, loginWithGoogle } = useAuth()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get("redirect") || "/dashboard"
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [termsAgreed, setTermsAgreed] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [gisLoaded, setGisLoaded] = React.useState(false)

  const handleGoogleCredentialResponse = React.useCallback(
    async (response: any) => {
      if (!response?.credential) {
        setError("No Google credential received.")
        return
      }
      setIsGoogleLoading(true)
      setError(null)
      try {
        await loginWithGoogle(response.credential, redirectUrl)
      } catch (err: any) {
        setError(err.message || "Google authentication failed. Please check your credentials.")
        setIsGoogleLoading(false)
      }
    },
    [loginWithGoogle, redirectUrl]
  )

  const initGoogle = React.useCallback(() => {
    if (typeof window !== "undefined" && window.google?.accounts?.id && googleClientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        })
        const container = document.getElementById("google-register-button-container")
        if (container) {
          container.innerHTML = ""
          window.google.accounts.id.renderButton(container, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "signup_with",
            shape: "pill",
            width: 380,
          })
        }
      } catch (e) {
        console.error("Failed to initialize Google Identity Services", e)
      }
    }
  }, [googleClientId, handleGoogleCredentialResponse])

  React.useEffect(() => {
    if (gisLoaded || (typeof window !== "undefined" && window.google?.accounts?.id)) {
      initGoogle()
    }
  }, [gisLoaded, initGoogle])

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
      await register(
        email.trim(),
        password,
        name.trim(),
        {
          accountType: "developer",
          lawfulBasisAgreed: true,
          termsAgreed: true,
        },
        redirectUrl
      )
    } catch (err: any) {
      const msg = String(err?.message || "")
      if (
        msg.includes("Failed to fetch") ||
        msg.includes("Load failed") ||
        msg.includes("NetworkError") ||
        msg.includes("network error")
      ) {
        setError("Unable to connect to the Verixa server. Please check your network connection.")
      } else {
        setError(msg || "Registration failed. Please check your details.")
      }
      setIsLoading(false)
    }
  }

  const handleManualGoogleClick = () => {
    if (!googleClientId) {
      setError("Google Sign-In is not configured on this deployment. Please register with your email address.")
      return
    }

    if (typeof window !== "undefined" && window.google?.accounts?.id) {
      initGoogle()
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed()) {
          setError("Google Sign-In popup was suppressed. Please use the Google button or email registration.")
        }
      })
    } else {
      setError("Google authentication service is still initializing.")
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative font-sans selection:bg-emerald-500/20 selection:text-emerald-900">
      {Boolean(googleClientId) && (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={() => {
            setGisLoaded(true)
            initGoogle()
          }}
        />
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
          <Logo size="lg" />
        </Link>
        <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-heading">
          Create your account
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Or{" "}
          <Link
            href={`/login${redirectUrl !== "/dashboard" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
            className="font-semibold text-slate-900 hover:underline"
          >
            sign in to an existing account
          </Link>
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-xs">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Google Identity Services Container */}
          {Boolean(googleClientId) && (
            <>
              <div className="flex flex-col items-center">
                <div id="google-register-button-container" className="w-full flex justify-center min-h-[44px]" />

                {!gisLoaded && (
                  <button
                    type="button"
                    onClick={handleManualGoogleClick}
                    disabled={isGoogleLoading || isLoading}
                    className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-800 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
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
                    <span>{isGoogleLoading ? "Verifying with Google..." : "Sign up with Google"}</span>
                  </button>
                )}
              </div>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-slate-400 font-mono text-[11px]">
                    or register with email
                  </span>
                </div>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Organization or Full Name
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Work Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-[11px] text-slate-500 mt-1">Must be at least 8 characters.</p>
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                />
                <span className="text-slate-600 text-xs leading-relaxed">
                  I agree to the{" "}
                  <Link href="/terms" className="underline hover:text-slate-900">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="underline hover:text-slate-900">Privacy Policy</Link>.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-colors mt-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <span className="text-xs text-slate-500">
              Already have an account?{" "}
              <Link
                href={`/login${redirectUrl !== "/dashboard" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
                className="font-semibold text-slate-900 hover:underline"
              >
                Sign in →
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <RegisterForm />
    </React.Suspense>
  )
}
