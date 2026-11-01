"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Logo, Badge, AppLink, CommandPalette, CommandItem, getDocsUrl } from "@verixa/ui"
import { useAuth } from "../lib/auth-context"
import { ApiClient } from "../lib/api"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, environment, setEnvironment, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [cmdOpen, setCmdOpen] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [isUpgrading, setIsUpgrading] = React.useState(false)

  // Global Command Palette Items (Zero emojis, clean and concise)
  const commandItems: CommandItem[] = [
    {
      id: "nav-overview",
      title: "Dashboard Overview",
      subtitle: "Metrics and account status",
      category: "Navigation",
      shortcut: "G O",
      onSelect: () => router.push("/dashboard"),
    },
    {
      id: "nav-keys",
      title: "API Keys",
      subtitle: "Sandbox and live key management",
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
      title: "Identity Verification",
      subtitle: "Lookup NIN, BVN, and Account data",
      category: "Verification",
      shortcut: "G V",
      onSelect: () => router.push("/dashboard/verify"),
    },
    {
      id: "nav-slips",
      title: "Slip Generator",
      subtitle: "Standard PDF and Word slips",
      category: "Verification",
      shortcut: "G S",
      onSelect: () => router.push("/dashboard/slips"),
    },
    {
      id: "nav-logs",
      title: "Audit Logs",
      subtitle: "Inspect lookup transaction logs",
      category: "Verification",
      shortcut: "G L",
      onSelect: () => router.push("/dashboard/logs"),
    },
    {
      id: "nav-billing",
      title: "Wallet & Billing",
      subtitle: "Deposit funds and rate schedules",
      category: "Navigation",
      shortcut: "G B",
      onSelect: () => router.push("/dashboard/billing"),
    },
    {
      id: "nav-webhooks",
      title: "Webhooks",
      subtitle: "Endpoints and signing secrets",
      category: "Developer",
      shortcut: "G W",
      onSelect: () => router.push("/dashboard/webhooks"),
    },
    {
      id: "nav-docs",
      title: "Documentation",
      subtitle: "API references and integration guides",
      category: "Help & Docs",
      onSelect: () => window.open(getDocsUrl(), "_blank"),
    },
  ]

  // Listen for Cmd+K / Ctrl+K
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

  // Close mobile drawer on route change
  React.useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const isIndividual = user?.account_type === "individual"
  const isPlatformSuperAdmin = Boolean(
    user?.role === "super_admin" || user?.role === "SuperAdmin" || user?.is_super_admin === true
  )

  const handleUpgradeToDeveloper = async () => {
    setIsUpgrading(true)
    try {
      await ApiClient.upgradeToDeveloper()
      alert("Upgraded to Developer Account! API Keys are now unlocked.")
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
        title: "Services",
        items: [
          { label: "Overview", href: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
          { label: "Slip Generator", href: "/dashboard/slips", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
          { label: "Verification", href: "/dashboard/verify", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "History Logs", href: "/dashboard/logs", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
        ],
      },
      {
        title: "Wallet & Billing",
        items: [
          { label: "Dedicated Account / Top Up", href: "/dashboard/billing", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
          { label: "Transactions", href: "/dashboard/transactions", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
        ],
      },
    ]
    : [
      {
        title: "Develop",
        items: [
          { label: "Overview", href: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
          { label: "API Keys", href: "/dashboard/api-keys", icon: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" },
          { label: "API Explorer", href: "/dashboard/explorer", icon: "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
          { label: "Webhooks", href: "/dashboard/webhooks", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
        ],
      },
      {
        title: "Verify",
        items: [
          { label: "Verification", href: "/dashboard/verify", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "Slip Generator", href: "/dashboard/slips", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
          { label: "Audit Logs", href: "/dashboard/logs", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
        ],
      },
      {
        title: "Wallet & Billing",
        items: [
          { label: "Credits & Top-up", href: "/dashboard/billing", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
          { label: "Transactions", href: "/dashboard/transactions", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
        ],
      },
      {
        title: "Settings",
        items: [
          { label: "Team Members", href: "/dashboard/team", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
          { label: "Organization", href: "/dashboard/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
        ],
      },
    ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white text-slate-800">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200 shrink-0">
        <Link href="/dashboard" className="hover:opacity-90 transition-opacity">
          <Logo size="md" />
        </Link>
        <span className="font-mono text-[10px] tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-semibold">
          LIVE
        </span>
      </div>

      {/* Environment Selector Switch */}
      <div className="p-3 border-b border-slate-100">
        <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setEnvironment("sandbox")}
            className={`flex-1 py-1 text-xs font-mono font-medium rounded-md transition-all cursor-pointer ${environment === "sandbox"
                ? "bg-white text-amber-700 font-bold border border-amber-200 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
              }`}
          >
            Sandbox
          </button>
          <button
            type="button"
            onClick={() => setEnvironment("live")}
            className={`flex-1 py-1 text-xs font-mono font-medium rounded-md transition-all cursor-pointer ${environment === "live"
                ? "bg-emerald-600 text-white font-bold shadow-xs"
                : "text-slate-600 hover:text-slate-900"
              }`}
          >
            Live
          </button>
        </div>
      </div>

      {/* Navigation Groups - Static, non-scrollable desktop layout */}
      <div className="flex-1 overflow-hidden px-3 py-2.5 space-y-3">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-0.5">
            <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {section.title}
            </span>
            {section.items.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isActive
                      ? "bg-slate-900 text-white font-medium shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                >
                  <svg
                    className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-white" : "text-slate-500"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={item.icon} />
                  </svg>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}

        {/* Upgrade Banner for Individual Users */}
        {isIndividual && (
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900">Developer API</span>
              <Badge variant="verified" size="sm">UPGRADE</Badge>
            </div>
            <p className="text-[11px] text-emerald-700 leading-tight">
              Unlock automated API keys, webhooks, and REST explorer.
            </p>
            <button
              type="button"
              onClick={handleUpgradeToDeveloper}
              disabled={isUpgrading}
              className="w-full py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
            >
              {isUpgrading ? "Upgrading..." : "Enable API Access"}
            </button>
          </div>
        )}

        {/* Super Admin Console */}
        {isPlatformSuperAdmin && (
          <div className="pt-2 border-t border-slate-100">
            <Link
              href="/admin"
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
            >
              <span className="font-semibold">Admin Console</span>
              <Badge variant="failed" size="sm">SUPER</Badge>
            </Link>
          </div>
        )}
      </div>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/70 shrink-0 mt-auto">
        <div className="flex items-center justify-between">
          <div className="truncate pr-2">
            <p className="text-xs font-semibold text-slate-900 truncate">
              {user?.org_name || "Verixa Account"}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {user?.email || "Active User"}
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            title="Sign Out"
            className="p-1.5 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )

  // Lock body scroll when mobile menu is open
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileMenuOpen])

  // Mobile Bottom Navigation items (5 primary items)
  const mobileNavItems = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      isActive: pathname === "/dashboard",
    },
    {
      label: "Verify",
      href: "/dashboard/verify",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      isActive: pathname.startsWith("/dashboard/verify"),
    },
    {
      label: "Slips",
      href: "/dashboard/slips",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
        </svg>
      ),
      isActive: pathname.startsWith("/dashboard/slips"),
    },
    {
      label: "Billing",
      href: "/dashboard/billing",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      isActive: pathname.startsWith("/dashboard/billing") || pathname.startsWith("/dashboard/transactions"),
    },
  ]

  return (
    <div className="flex min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500/20 selection:text-emerald-900 relative">
      {/* Global Cmd+K Palette */}
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} items={commandItems} />

      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 z-30 border-r border-slate-200 bg-white overflow-hidden shadow-xs">
        <SidebarContent />
      </aside>

      {/* Mobile Slide-Out Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-in panel */}
          <div className="relative w-72 max-w-[85vw] h-full bg-white shadow-2xl flex flex-col z-10 border-r border-slate-200">
            {/* Close button at top right */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-20"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-full lg:pl-64 overflow-x-hidden">
        {/* Pinned Top Header (Never moves off screen on mobile) */}
        <header className="sticky top-0 z-30 h-16 w-full max-w-full border-b border-slate-200 bg-white/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between gap-2 shadow-2xs shrink-0">
          {/* Mobile hamburger & brand */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
              aria-label="Open navigation menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Mobile Logo Branding */}
            <div className="lg:hidden flex items-center shrink-0">
              <Link href="/dashboard" className="flex items-center">
                <Logo size="sm" badge="CONSOLE" badgeColor="emerald" />
              </Link>
            </div>

            {/* Quick search button */}
            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Search...</span>
              <kbd className="ml-2 rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-500 shadow-2xs">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Header Navigation Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
            {/* Quick mobile search trigger */}
            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              className="sm:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Quick Environment Indicator */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100/80 border border-slate-200 px-2 py-1 rounded-full">
              <span className={`w-2 h-2 rounded-full ${environment === "live" ? "bg-emerald-500" : "bg-amber-500"}`} />
              <span className="capitalize font-medium text-[11px] sm:text-xs">{environment}</span>
            </div>

            {/* Documentation Link */}
            <AppLink
              app="docs"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg hover:bg-slate-100"
            >
              <span>Docs</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </AppLink>
          </div>
        </header>

        {/* Page Body Viewport (pb-24 on mobile prevents overlap with fixed bottom nav, md:pb-8 on desktop) */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-7xl w-full mx-auto min-w-0 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Fixed Thumb-Friendly Mobile Bottom Navigation Bar (< 768px viewports, hidden on md+) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {mobileNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`min-h-[46px] min-w-[46px] flex-1 flex flex-col items-center justify-center gap-1 rounded-xl py-1 text-[11px] font-medium transition-all active:scale-95 cursor-pointer relative ${item.isActive
                  ? "text-emerald-700 font-bold bg-emerald-50/80"
                  : "text-slate-600 hover:text-slate-900 active:bg-slate-100"
                }`}
            >
              {item.isActive && (
                <span className="absolute top-1 w-1.5 h-1.5 rounded-full bg-emerald-600" />
              )}
              <div className={item.isActive ? "text-emerald-600 mt-1" : "text-slate-500"}>
                {item.icon}
              </div>
              <span className="tracking-tight leading-none">{item.label}</span>
            </Link>
          ))}

          {/* 5. More / Menu Item (Opens existing mobile slide-out drawer) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation drawer"
            className={`min-h-[46px] min-w-[46px] flex-1 flex flex-col items-center justify-center gap-1 rounded-xl py-1 text-[11px] font-medium transition-all active:scale-95 cursor-pointer relative ${mobileMenuOpen
                ? "text-emerald-700 font-bold bg-emerald-50/80"
                : "text-slate-600 hover:text-slate-900 active:bg-slate-100"
              }`}
          >
            <div className="relative text-slate-500">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {isPlatformSuperAdmin && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </div>
            <span className="tracking-tight leading-none">Menu</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
