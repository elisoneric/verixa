"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Logo, Badge } from "@verixa/ui"
import { useAuth } from "../../lib/auth-context"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuth()

  const navItems = [
    { label: "Platform Overview", href: "/admin", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    { label: "Organizations", href: "/admin/organizations", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
    { label: "Pricing & Bonus Days", href: "/admin/pricing", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "Provider Health", href: "/admin/providers", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
    { label: "System Config & Secrets", href: "/admin/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
  ]

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 selection:bg-rose-500/30 selection:text-rose-300">
      {/* Admin Sidebar */}
      <aside className="w-64 flex flex-col border-r border-zinc-800 bg-zinc-950 shrink-0">
        <div className="h-16 px-6 flex items-center justify-between border-b border-zinc-800">
          <Link href="/admin" className="hover:opacity-90 transition-opacity">
            <Logo size="md" badge="ADMIN" badgeColor="rose" />
          </Link>
        </div>

        <div className="p-4">
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
            Platform Operator Console
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-zinc-900 text-rose-400 font-semibold border border-zinc-800"
                    : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
                }`}
              >
                <svg className="w-4 h-4 text-zinc-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={item.icon} />
                </svg>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800 bg-zinc-900/30">
          <Link
            href="/dashboard"
            className="block text-center rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 py-2 text-xs font-semibold text-zinc-300 transition-colors"
          >
            &larr; Exit to Customer Portal
          </Link>
        </div>
      </aside>

      {/* Admin Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-zinc-800 bg-zinc-950 px-8 flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-400">Verixa Internal Operations</span>
          <Badge variant="failed" size="sm">SUPER ADMIN PRIVILEGES</Badge>
        </header>

        <main className="flex-1 p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  )
}
