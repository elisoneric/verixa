"use client"

import * as React from "react"
import Link from "next/link"
import { Button, Input, Logo, Card, CardHeader, CardContent, CardTitle, CardDescription, AppLink } from "@verixa/ui"
import { useAuth } from "../../lib/auth-context"

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await login(email, password)
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your email and password.")
    } finally {
      setIsLoading(false)
    }
  }

  const fillDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail)
    setPassword(demoPass)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-zinc-950 to-zinc-950" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
          <Logo size="lg" />
        </Link>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">
          Sign in to your account
        </h2>
        <p className="mt-1 text-xs text-zinc-400">
          Or{" "}
          <Link href="/register" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
            create a new organization free
          </Link>
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="bg-zinc-900/60 border-zinc-800 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-medium">
                {error}
              </div>
            )}

            <Input
              label="Work Email"
              type="email"
              placeholder="developer@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="emerald"
              size="md"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Sign In to Dashboard
            </Button>
          </form>

          {/* Demo Quick Fill Helper */}
          <div className="mt-8 pt-6 border-t border-zinc-800/80">
            <span className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-2 text-center">
              Quick Test Credentials
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount("developer@verixaid.com", "Password123!")}
                className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-left text-xs text-zinc-400 hover:text-white transition-colors"
              >
                <div className="font-semibold text-zinc-200">Developer</div>
                <div className="text-[10px] font-mono text-zinc-500">developer@verixaid.com</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount("admin@verixaid.com", "AdminPass123!")}
                className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-left text-xs text-zinc-400 hover:text-white transition-colors"
              >
                <div className="font-semibold text-rose-300">Super Admin</div>
                <div className="text-[10px] font-mono text-zinc-500">admin@verixaid.com</div>
              </button>
            </div>
          </div>
        </Card>

        <p className="mt-6 text-center text-xs text-zinc-500">
          Protected by bank-grade AES-256 encryption. By signing in, you agree to our{" "}
          <AppLink app="www" path="/terms" className="underline hover:text-zinc-300">Terms</AppLink> and{" "}
          <AppLink app="www" path="/privacy" className="underline hover:text-zinc-300">Privacy Policy</AppLink>.
        </p>
      </div>
    </div>
  )
}
