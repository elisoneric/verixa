"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Logo, Badge } from "@verixa/ui"
import { useAuth } from "../../lib/auth-context"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, token, isLoading, logout } = useAuth()

  React.useEffect(() => {
    if (!isLoading) {
      if (!token) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
      } else if (user && !user.is_super_admin && user.role !== "super_admin" && user.role !== "SuperAdmin") {
        router.push("/dashboard")
      }
    }
  }, [isLoading, token, user, router, pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-rose-600 border-t-transparent" />
          <span className="text-xs font-mono font-medium text-slate-500">
            Verifying operator credentials...
          </span>
        </div>
      </div>
    )
  }

  if (!token) {
    return null
  }

  const navItems = [
    { label: "Platform Overview", href: "/admin", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    { label: "Organizations & Users", href: "/admin/organizations", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
    { label: "Cluster Verification Logs", href: "/admin/logs", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
    { label: "Revenue & Ledger", href: "/admin/revenue", icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" },
    { label: "Pricing & Promos", href: "/admin/pricing", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "Provider Routing & SLAs", href: "/admin/providers", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
    { label: "Upstream Registry Tester", href: "/admin/tester", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" },
    { label: "System Config & SMTP", href: "/admin/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
  ]

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 selection:bg-rose-500/20 selection:text-rose-800">
      {/* Admin Sidebar */}
      <aside className="w-64 flex flex-col fixed inset-y-0 left-0 z-30 border-r border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200 shrink-0">
          <Link href="/admin" className="hover:opacity-90 transition-opacity">
            <Logo size="md" badge="ADMIN" badgeColor="rose" />
          </Link>
        </div>

        <div className="p-4 shrink-0">
          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono font-medium">
            Platform Operator Console
          </div>
        </div>

        <nav className="flex-1 overflow-hidden px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-rose-50 text-rose-700 font-bold border border-rose-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={item.icon} />
                </svg>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-2 shrink-0 mt-auto">
          <button
            onClick={logout}
            title="Sign Out"
            className="w-full justify-center px-3 py-2 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sign Out</span>
          </button>
          <Link
            href="/dashboard"
            className="block text-center rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 py-1.5 text-xs font-semibold text-slate-700 transition-colors"
          >
            &larr; Exit to Customer Portal
          </Link>
        </div>
      </aside>

      {/* Admin Content */}
      <div className="flex-1 flex flex-col min-w-0 pl-64">
        <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-500">Verixa Internal Operations</span>
          <Badge variant="failed" size="sm">SUPER ADMIN PRIVILEGES</Badge>
        </header>

        <main className="flex-1 p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  )
}
