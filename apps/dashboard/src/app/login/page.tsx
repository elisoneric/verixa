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

function LoginForm() {
  const { login, loginWithGoogle } = useAuth()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get("redirect") || "/dashboard"
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
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
        const container = document.getElementById("google-button-container")
        if (container) {
          container.innerHTML = ""
          window.google.accounts.id.renderButton(container, {
            type: "standard",
            theme: "filled_black",
            size: "large",
            text: "continue_with",
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
    setIsLoading(true)

    try {
      await login(email, password, redirectUrl)
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your email and password.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualGoogleClick = () => {
    if (!googleClientId) {
      setError("Google Sign-In is not configured on this deployment. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID or sign in using your work email.")
      return
    }

    if (typeof window !== "undefined" && window.google?.accounts?.id) {
      initGoogle()
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed()) {
          setError("Google Sign-In popup was suppressed. Please use the Google button or email login.")
        }
      })
    } else {
      setError("Google authentication service is still initializing. Please try again in a few seconds.")
    }
  }

  return (
    <div className="min-h-screen bg-[#06070a] text-zinc-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative font-sans selection:bg-emerald-500/25 selection:text-emerald-300">
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

      {/* Ambient glow in dark mode */}
      <div aria-hidden="true" className="fixed inset-0 mesh-glow pointer-events-none -z-10 opacity-70" />
      <div aria-hidden="true" className="fixed inset-0 grid-backdrop pointer-events-none -z-10 opacity-35" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
          <Logo size="lg" />
        </Link>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white font-heading">
          Sign in to your account
        </h2>
        <p className="mt-1 text-xs text-zinc-400">
          Or{" "}
          <Link
            href={`/register${redirectUrl !== "/dashboard" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
            className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            create a new account free
          </Link>
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="glass-card bg-[#0e1118]/70 border border-white/[0.08] p-6 sm:p-8 rounded-2xl shadow-2xl backdrop-blur-2xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Google Identity Services Container - only shown when Google client ID is configured */}
          {Boolean(googleClientId) && (
            <>
              <div className="flex flex-col items-center">
                <div id="google-button-container" className="w-full flex justify-center min-h-[44px]" />

                {!gisLoaded && (
                  <button
                    type="button"
                    onClick={handleManualGoogleClick}
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
                    <span>{isGoogleLoading ? "Verifying with Google..." : "Continue with Google"}</span>
                  </button>
                )}
              </div>

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
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Work Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="!text-white !bg-[#121620] !border-white/[0.12] focus:!border-emerald-500"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="!text-white !bg-[#121620] !border-white/[0.12] focus:!border-emerald-500"
              required
            />

            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="btn-pill-primary !w-full !py-3 !text-sm !font-bold mt-2 shadow-[0_0_20px_rgba(255,255,255,0.25)] cursor-pointer"
            >
              {isLoading ? "Signing in..." : "Sign In to Dashboard"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-400">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-white">Terms of Service</Link> and{" "}
          <Link href="/privacy" className="underline hover:text-white">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#06070a]" />}>
      <LoginForm />
    </React.Suspense>
  )
}
