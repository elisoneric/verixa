"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Logo, Badge, Button, AppLink, CommandPalette, CommandItem, getDocsUrl } from "@verixa/ui"
import { useAuth } from "../lib/auth-context"
import { useTheme } from "../lib/theme-context"
import { ApiClient } from "../lib/api"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, environment, setEnvironment, balance, logout, refreshBalance } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const [cmdOpen, setCmdOpen] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  // Shortcuts & Global Command Palette Items
  const commandItems: CommandItem[] = [
    {
      id: "nav-overview",
      title: "Dashboard Overview",
      subtitle: "Metrics, balances, and recent activity",
      category: "Navigation",
      shortcut: "G O",
      onSelect: () => router.push("/dashboard"),
    },
    {
      id: "nav-keys",
      title: "API Keys",
      subtitle: "Generate and manage sandbox & live keys",
      category: "Developer",
      shortcut: "G K",
      onSelect: () => router.push("/dashboard/api-keys"),
    },
    {
      id: "nav-explorer",
      title: "API Explorer",
      subtitle: "Interactive developer query console",
      category: "Developer",
      shortcut: "G E",
      onSelect: () => router.push("/dashboard/explorer"),
    },
    {
      id: "nav-verify",
      title: "Manual Verification Workspace",
      subtitle: "Perform authorized manual identity lookups",
      category: "Verification",
      shortcut: "G V",
      onSelect: () => router.push("/dashboard/verify"),
    },
    {
      id: "nav-slips",
      title: "NIN Slip Generator",
      subtitle: "Generate official NIMC PDF & Word slips",
      category: "Verification",
      shortcut: "G S",
      onSelect: () => router.push("/dashboard/slips"),
    },
    {
      id: "nav-logs",
      title: "Verification Logs",
      subtitle: "Search and inspect audit logs",
      category: "Verification",
      shortcut: "G L",
      onSelect: () => router.push("/dashboard/logs"),
    },
    {
      id: "nav-billing",
      title: "Billing & NGX Credits",
      subtitle: "Dedicated bank account & add funds",
      category: "Navigation",
      shortcut: "G B",
      onSelect: () => router.push("/dashboard/billing"),
    },
    {
      id: "nav-webhooks",
      title: "Webhooks",
      subtitle: "Manage event endpoints and signing keys",
      category: "Developer",
      shortcut: "G W",
      onSelect: () => router.push("/dashboard/webhooks"),
    },
    {
      id: "nav-docs",
      title: "API Documentation",
      subtitle: "View integration guides and schemas",
      category: "Help & Docs",
      onSelect: () => window.open(getDocsUrl(), "_blank"),
    },
  ]

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCmdOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const currentBalance =
    environment === "live"
      ? balance?.live.balance ?? 0
      : balance?.sandbox.balance ?? 100000

  const [isUpgrading, setIsUpgrading] = React.useState(false)

  const isIndividual = user?.account_type === "individual"
  const isPlatformSuperAdmin = Boolean(
    user?.role === "super_admin" || user?.role === "SuperAdmin" || user?.is_super_admin === true
  )

  const handleUpgradeToDeveloper = async () => {
    setIsUpgrading(true)
    try {
      await ApiClient.upgradeToDeveloper()
      alert("Successfully upgraded to Developer Account! API Keys and Developer tools are now unlocked.")
      window.location.reload()
    } catch (e: any) {
      alert(e.message || "Failed to upgrade account")
    } finally {
      setIsUpgrading(false)
    }
  }

  const navSections = isIndividual
    ? [
        {
          title: "SERVICES & SLIPS",
          items: [
            { label: "Overview", href: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
            { label: "NIN Slip Generator", href: "/dashboard/slips", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
            { label: "Verification Tools", href: "/dashboard/verify", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
            { label: "Slips & Lookups History", href: "/dashboard/logs", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
          ],
        },
        {
          title: "BILLING & WALLET",
          items: [
            { label: "Dedicated Account / Top Up", href: "/dashboard/billing", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
            { label: "Transactions", href: "/dashboard/transactions", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
          ],
        },
      ]
    : [
        {
          title: "DEVELOP",
          items: [
            { label: "Overview", href: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
            { label: "API Keys", href: "/dashboard/api-keys", icon: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" },
            { label: "API Explorer", href: "/dashboard/explorer", icon: "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
            { label: "Webhooks", href: "/dashboard/webhooks", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
          ],
        },
        {
          title: "VERIFY",
          items: [
            { label: "Manual Workspace", href: "/dashboard/verify", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
            { label: "NIN Slip Generator", href: "/dashboard/slips", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
            { label: "Verification Logs", href: "/dashboard/logs", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
          ],
        },
        {
          title: "BILLING & USAGE",
          items: [
            { label: "Credits & Top-up", href: "/dashboard/billing", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
            { label: "Transactions", href: "/dashboard/transactions", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
          ],
        },
        {
          title: "SETTINGS",
          items: [
            { label: "Team Members", href: "/dashboard/team", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
            { label: "Organization", href: "/dashboard/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
          ],
        },
      ]

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-100 selection:bg-emerald-500/30 selection:text-emerald-800 dark:selection:text-emerald-300">
      {/* Global Cmd+K Palette */}
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} items={commandItems} />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 shrink-0">
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200 dark:border-zinc-800/80">
          <Link href="/dashboard" className="hover:opacity-90 transition-opacity">
            <Logo size="md" />
          </Link>
        </div>

        {/* Environment Selector Switch */}
        <div className="p-4 border-b border-slate-200 dark:border-zinc-800/60">
          <div className="flex items-center justify-between p-1 bg-slate-100 dark:bg-zinc-900/90 rounded-lg border border-slate-200 dark:border-zinc-800">
            <button
              onClick={() => setEnvironment("sandbox")}
              className={`flex-1 py-1.5 text-xs font-mono font-medium rounded-md transition-all ${
                environment === "sandbox"
                  ? "bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 font-semibold shadow-2xs border border-amber-200 dark:border-zinc-700/60"
                  : "text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              Sandbox
            </button>
            <button
              onClick={() => setEnvironment("live")}
              className={`flex-1 py-1.5 text-xs font-mono font-medium rounded-md transition-all ${
                environment === "live"
                  ? "bg-emerald-500 text-white dark:bg-emerald-500/20 dark:text-emerald-400 font-semibold shadow-2xs border border-emerald-500/30"
                  : "text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              Live
            </button>
          </div>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <span className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                {section.title}
              </span>
              {section.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-emerald-50 text-emerald-900 font-bold border border-emerald-200 shadow-2xs dark:bg-zinc-900 dark:text-white dark:border-zinc-800/90"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-200"
                    }`}
                  >
                    <svg className={`w-4 h-4 shrink-0 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-zinc-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={item.icon} />
                    </svg>
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          ))}

          {/* Individual Upgrade Banner */}
          {isIndividual && (
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-zinc-900 border border-emerald-200 dark:border-emerald-800/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">Developer API</span>
                <Badge variant="verified" size="sm">UPGRADE</Badge>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-tight">
                Unlock automated API keys, webhooks, and REST explorer.
              </p>
              <button
                onClick={handleUpgradeToDeveloper}
                disabled={isUpgrading}
                className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
              >
                {isUpgrading ? "Upgrading..." : "Enable API Access &rarr;"}
              </button>
            </div>
          )}

          {/* Platform Admin Link ONLY for Super Admins */}
          {isPlatformSuperAdmin && (
            <div className="pt-2 border-t border-slate-200 dark:border-zinc-800/80">
              <Link
                href="/admin"
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/20 transition-colors"
              >
                <span className="font-mono font-semibold">Admin Console</span>
                <Badge variant="failed" size="sm">SUPER</Badge>
              </Link>
            </div>
          )}
        </div>

        {/* User Footer Card */}
        <div className="p-4 border-t border-slate-200 dark:border-zinc-800/80 bg-slate-50 dark:bg-zinc-900/30">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">
                {user?.org_name || "Verixa Organization"}
              </p>
              <p className="text-[11px] font-mono text-slate-500 dark:text-zinc-500 truncate">
                {user?.email || "developer@verixaid.com"}
              </p>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-200 dark:text-zinc-400 dark:hover:text-rose-400 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content View */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 border-b border-slate-200 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/80 backdrop-blur-md px-6 flex items-center justify-between gap-4">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-900"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Quick Search / Cmd+K trigger */}
          <button
            onClick={() => setCmdOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:border-slate-400 dark:hover:border-zinc-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Search workspace...</span>
            <kbd className="ml-4 rounded border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-600 dark:text-zinc-300 shadow-2xs">
              ⌘K
            </kbd>
          </button>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              className="flex items-center justify-center h-10 w-10 rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shadow-2xs cursor-pointer"
            >
              {theme === "light" ? (
                <svg className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            {/* Live Balance Chip */}
            <Link
              href="/dashboard/billing"
              className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 hover:border-slate-400 dark:hover:border-zinc-700 shadow-2xs transition-colors"
            >
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-500 uppercase block leading-none">
                  {environment} Balance
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {currentBalance.toLocaleString()} NGX
                </span>
              </div>
              <span className="text-slate-300 dark:text-zinc-600">|</span>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                + Top up
              </span>
            </Link>

            {/* Docs link */}
            <AppLink
              app="docs"
              className="hidden sm:inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors px-2"
            >
              Docs &rarr;
            </AppLink>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
              <Logo size="sm" />
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-md">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setEnvironment("sandbox"); setMobileMenuOpen(false); }}
                className={`py-2 text-xs font-mono rounded-lg border transition-colors ${environment === "sandbox" ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/30 font-bold" : "bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800"}`}
              >
                Sandbox
              </button>
              <button
                onClick={() => { setEnvironment("live"); setMobileMenuOpen(false); }}
                className={`py-2 text-xs font-mono rounded-lg border transition-colors ${environment === "live" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30 font-bold" : "bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800"}`}
              >
                Live
              </button>
            </div>

            <div className="space-y-1">
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white py-1.5 px-2 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-900">Overview</Link>
              <Link href="/dashboard/api-keys" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white py-1.5 px-2 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-900">API Keys</Link>
              <Link href="/dashboard/explorer" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white py-1.5 px-2 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-900">API Explorer</Link>
              <Link href="/dashboard/verify" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white py-1.5 px-2 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-900">Manual Workspace</Link>
              <Link href="/dashboard/logs" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white py-1.5 px-2 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-900">Verification Logs</Link>
              <Link href="/dashboard/billing" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white py-1.5 px-2 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-900">Billing & Credits</Link>
              <Link href="/dashboard/webhooks" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white py-1.5 px-2 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-900">Webhooks</Link>
              <Link href="/dashboard/settings" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white py-1.5 px-2 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-900">Settings</Link>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex justify-between items-center">
              <span className="text-xs text-slate-500 dark:text-zinc-400">{user?.email}</span>
              <button onClick={logout} className="text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 font-semibold">Sign Out</button>
            </div>
          </div>
        )}

        {/* Page Body Viewport */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
