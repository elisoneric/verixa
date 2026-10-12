"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Logo, Badge, AppLink, CommandPalette, CommandItem, getDocsUrl } from "@verixa/ui"
import { useAuth } from "../lib/auth-context"
import { ApiClient } from "../lib/api"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, environment, setEnvironment, balance, logout } = useAuth()
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
      subtitle: "Generate standard PDF & Word slips",
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
    <div className="flex min-h-screen bg-[#06070a] text-zinc-100 font-sans selection:bg-emerald-500/25 selection:text-emerald-300 relative">
      {/* Ambient glowing mesh backdrop */}
      <div aria-hidden="true" className="fixed inset-0 mesh-glow pointer-events-none -z-10 opacity-60" />
      <div aria-hidden="true" className="fixed inset-0 grid-backdrop pointer-events-none -z-10 opacity-30" />

      {/* Global Cmd+K Palette */}
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} items={commandItems} />

      {/* Desktop Sidebar (Glass Sidebar) */}
      <aside className="hidden lg:flex w-64 flex-col h-screen sticky top-0 border-r border-white/[0.08] bg-[#080a0f]/85 backdrop-blur-2xl shrink-0 overflow-hidden">
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-white/[0.08]">
          <Link href="/dashboard" className="hover:opacity-90 transition-opacity">
            <Logo size="md" />
          </Link>
          <span className="font-mono text-[10px] tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            SOVEREIGN
          </span>
        </div>

        {/* Environment Selector Switch */}
        <div className="p-4 border-b border-white/[0.08]">
          <div className="flex items-center justify-between p-1 bg-black/40 rounded-xl border border-white/[0.08]">
            <button
              onClick={() => setEnvironment("sandbox")}
              className={`flex-1 py-1.5 text-xs font-mono font-medium rounded-lg transition-all cursor-pointer ${
                environment === "sandbox"
                  ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 shadow-xs"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Sandbox
            </button>
            <button
              onClick={() => setEnvironment("live")}
              className={`flex-1 py-1.5 text-xs font-mono font-medium rounded-lg transition-all cursor-pointer ${
                environment === "live"
                  ? "bg-emerald-500 text-zinc-950 font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Live
            </button>
          </div>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <span className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                {section.title}
              </span>
              {section.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? "bg-white/[0.08] text-white font-bold border border-white/[0.12] shadow-xs"
                        : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    <svg className={`w-4 h-4 shrink-0 ${isActive ? "text-emerald-400" : "text-zinc-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="glass-card p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300">Developer API</span>
                <Badge variant="verified" size="sm">UPGRADE</Badge>
              </div>
              <p className="text-[11px] text-zinc-400 leading-tight">
                Unlock automated API keys, webhooks, and REST explorer.
              </p>
              <button
                onClick={handleUpgradeToDeveloper}
                disabled={isUpgrading}
                className="btn-pill-primary !w-full !py-1.5 !text-xs cursor-pointer"
              >
                {isUpgrading ? "Upgrading..." : "Enable API Access →"}
              </button>
            </div>
          )}

          {/* Platform Admin Link ONLY for Super Admins */}
          {isPlatformSuperAdmin && (
            <div className="pt-2 border-t border-white/[0.08]">
              <Link
                href="/admin"
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
              >
                <span className="font-mono font-semibold">Admin Console</span>
                <Badge variant="failed" size="sm">SUPER</Badge>
              </Link>
            </div>
          )}
        </div>

        {/* User Footer Card */}
        <div className="p-4 border-t border-white/[0.08] bg-[#0c0e14]/50 shrink-0 mt-auto">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">
                {user?.org_name || "Verixa Organization"}
              </p>
              <p className="text-[11px] font-mono text-zinc-400 truncate">
                {user?.email || "Active User"}
              </p>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-white/[0.06] transition-colors cursor-pointer"
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
        <header className="glass-header sticky top-0 z-30 h-16 border-b border-white/[0.08] bg-[#06070a]/80 backdrop-blur-xl px-6 flex items-center justify-between gap-4">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Search Trigger Button */}
          <button
            type="button"
            onClick={() => setCmdOpen(true)}
            className="hidden sm:flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-zinc-400 hover:text-white transition-all cursor-pointer shadow-xs"
          >
            <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Search workspace...</span>
            <kbd className="ml-3 rounded border border-white/[0.12] bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-zinc-300">
              ⌘K
            </kbd>
          </button>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Live Balance Pill */}
            <Link
              href="/dashboard/billing"
              className="flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] transition-colors shadow-xs"
            >
              <div className="text-right">
                <span className="text-[10px] font-mono text-zinc-400 uppercase block leading-none">
                  {environment} Balance
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  ₦{currentBalance.toLocaleString()} NGX
                </span>
              </div>
              <span className="text-zinc-400">|</span>
              <span className="text-[11px] font-semibold text-zinc-300 hover:text-emerald-400 transition-colors">
                + Top up
              </span>
            </Link>

            {/* Docs link */}
            <AppLink
              app="docs"
              className="hidden sm:inline-flex items-center text-xs font-semibold text-zinc-400 hover:text-white transition-colors px-2"
            >
              Docs →
            </AppLink>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-white/[0.1] bg-[#09090b]/95 backdrop-blur-2xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <Logo size="sm" />
              <button onClick={() => setMobileMenuOpen(false)} className="text-zinc-400 hover:text-white p-1 rounded-md">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setEnvironment("sandbox"); setMobileMenuOpen(false); }}
                className={`py-2 text-xs font-mono rounded-lg border transition-colors ${environment === "sandbox" ? "bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold" : "bg-white/[0.04] text-zinc-400 border-white/[0.08]"}`}
              >
                Sandbox
              </button>
              <button
                onClick={() => { setEnvironment("live"); setMobileMenuOpen(false); }}
                className={`py-2 text-xs font-mono rounded-lg border transition-colors ${environment === "live" ? "bg-emerald-500 text-zinc-950 font-bold border-emerald-500" : "bg-white/[0.04] text-zinc-400 border-white/[0.08]"}`}
              >
                Live
              </button>
            </div>

            <div className="space-y-1">
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-zinc-300 hover:text-white py-1.5 px-2 rounded-md hover:bg-white/[0.04]">Overview</Link>
              <Link href="/dashboard/api-keys" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-zinc-300 hover:text-white py-1.5 px-2 rounded-md hover:bg-white/[0.04]">API Keys</Link>
              <Link href="/dashboard/explorer" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-zinc-300 hover:text-white py-1.5 px-2 rounded-md hover:bg-white/[0.04]">API Explorer</Link>
              <Link href="/dashboard/verify" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-zinc-300 hover:text-white py-1.5 px-2 rounded-md hover:bg-white/[0.04]">Manual Workspace</Link>
              <Link href="/dashboard/logs" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-zinc-300 hover:text-white py-1.5 px-2 rounded-md hover:bg-white/[0.04]">Verification Logs</Link>
              <Link href="/dashboard/billing" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-zinc-300 hover:text-white py-1.5 px-2 rounded-md hover:bg-white/[0.04]">Billing & Credits</Link>
              <Link href="/dashboard/webhooks" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-zinc-300 hover:text-white py-1.5 px-2 rounded-md hover:bg-white/[0.04]">Webhooks</Link>
              <Link href="/dashboard/settings" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-zinc-300 hover:text-white py-1.5 px-2 rounded-md hover:bg-white/[0.04]">Settings</Link>
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex justify-between items-center">
              <span className="text-xs text-zinc-400">{user?.email}</span>
              <button onClick={logout} className="text-xs text-rose-400 font-semibold">Sign Out</button>
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
