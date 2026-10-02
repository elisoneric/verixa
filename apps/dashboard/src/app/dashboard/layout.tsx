"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "../../lib/auth-context"
import { DashboardShell } from "../../components/dashboard-shell"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, token, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  React.useEffect(() => {
    if (!isLoading && !token) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [isLoading, token, router, pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-emerald-600 border-t-transparent dark:border-emerald-400" />
          <span className="text-xs font-mono font-medium text-slate-500 dark:text-zinc-400">
            Authenticating session...
          </span>
        </div>
      </div>
    )
  }

  if (!token) {
    return null
  }

  return <DashboardShell>{children}</DashboardShell>
}
