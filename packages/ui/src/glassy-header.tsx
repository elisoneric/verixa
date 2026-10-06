"use client"

import * as React from "react"
import Link from "next/link"
import { Logo } from "./logo"
import { AppLink } from "./app-link"
import { cn } from "./utils"

export interface NavDropdownItem {
  label: string
  href?: string
  app?: "www" | "dashboard" | "docs"
  path?: string
  description?: string
  badge?: string
  external?: boolean
}

export interface NavItem {
  label: string
  href?: string
  app?: "www" | "dashboard" | "docs"
  path?: string
  dropdown?: NavDropdownItem[]
}

export interface GlassyHeaderProps {
  logoBadge?: string
  logoBadgeColor?: "emerald" | "rose" | "indigo" | "sky" | "amber"
  navItems?: NavItem[]
  onSearchClick?: () => void
  searchPlaceholder?: string
  secondaryCta?: {
    label: string
    href?: string
    app?: "www" | "dashboard" | "docs"
    path?: string
  }
  primaryCta?: {
    label: string
    href?: string
    app?: "www" | "dashboard" | "docs"
    path?: string
  }
  className?: string
  customCenter?: React.ReactNode
}

export function GlassyHeader({
  logoBadge = "API",
  logoBadgeColor = "emerald",
  navItems,
  onSearchClick,
  searchPlaceholder = "Search documentation...",
  secondaryCta = {
    label: "Contact Sales",
    href: "/contact",
  },
  primaryCta = {
    label: "Get your API key",
    app: "dashboard",
    path: "/register",
  },
  className,
  customCenter,
}: GlassyHeaderProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null)
  const dropdownTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = (label: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current)
    }
    setActiveDropdown(label)
  }

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 150)
  }

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 duration-200 transition-all border-b border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]",
        className
      )}
      style={{
        backgroundColor: "rgba(9, 9, 11, 0.65)",
        backdropFilter: "blur(20px) saturate(190%)",
        WebkitBackdropFilter: "blur(20px) saturate(190%)",
      }}
    >
      {/* Luminous Hairline Specular Highlight along Top */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
      />

      {/* Luminous Hairline Glow along Bottom */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"
      />

      <div className="relative mx-auto w-full px-4 lg:px-6 max-w-7xl">
        <nav className="flex items-center justify-between gap-4 h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/"
              className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md"
            >
              <Logo size="md" badge={logoBadge} badgeColor={logoBadgeColor} />
            </Link>
          </div>

          {/* Center Nav / Custom Center Content */}
          {customCenter ? (
            <div className="hidden md:flex items-center gap-1 flex-1 justify-center max-w-2xl">
              {customCenter}
            </div>
          ) : navItems && navItems.length > 0 ? (
            <div className="hidden md:flex items-center gap-1 relative">
              {navItems.map((item) => {
                const hasDropdown = item.dropdown && item.dropdown.length > 0
                return (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => hasDropdown && handleMouseEnter(item.label)}
                    onMouseLeave={() => hasDropdown && handleMouseLeave()}
                  >
                    {item.app ? (
                      <AppLink
                        app={item.app}
                        path={item.path}
                        className={cn(
                          "flex items-center gap-1 px-3 py-1.5 text-[13px] font-medium text-zinc-300 hover:text-white transition-colors rounded-full hover:bg-white/[0.08]",
                          activeDropdown === item.label && "text-white bg-white/[0.08]"
                        )}
                      >
                        {item.label}
                        {hasDropdown && (
                          <svg
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={cn(
                              "size-3 transition-transform duration-150",
                              activeDropdown === item.label && "rotate-180"
                            )}
                          >
                            <polyline points="4,6 8,10 12,6" />
                          </svg>
                        )}
                      </AppLink>
                    ) : item.href ? (
                      <a
                        href={item.href}
                        className={cn(
                          "flex items-center gap-1 px-3 py-1.5 text-[13px] font-medium text-zinc-300 hover:text-white transition-colors rounded-full hover:bg-white/[0.08]",
                          activeDropdown === item.label && "text-white bg-white/[0.08]"
                        )}
                      >
                        {item.label}
                        {hasDropdown && (
                          <svg
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={cn(
                              "size-3 transition-transform duration-150",
                              activeDropdown === item.label && "rotate-180"
                            )}
                          >
                            <polyline points="4,6 8,10 12,6" />
                          </svg>
                        )}
                      </a>
                    ) : (
                      <button
                        type="button"
                        className={cn(
                          "flex items-center gap-1 px-3 py-1.5 text-[13px] font-medium text-zinc-300 hover:text-white transition-colors rounded-full hover:bg-white/[0.08] cursor-pointer",
                          activeDropdown === item.label && "text-white bg-white/[0.08]"
                        )}
                      >
                        {item.label}
                        {hasDropdown && (
                          <svg
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={cn(
                              "size-3 transition-transform duration-150",
                              activeDropdown === item.label && "rotate-180"
                            )}
                          >
                            <polyline points="4,6 8,10 12,6" />
                          </svg>
                        )}
                      </button>
                    )}

                    {/* Glassy Popover Dropdown */}
                    {hasDropdown && activeDropdown === item.label && (
                      <div className="absolute top-full left-0 pt-2 z-50 min-w-[260px] animate-in fade-in zoom-in-95 duration-100">
                        <div
                          className="rounded-2xl border border-white/[0.12] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
                          style={{
                            backgroundColor: "rgba(12, 12, 15, 0.88)",
                            backdropFilter: "blur(24px) saturate(190%)",
                            WebkitBackdropFilter: "blur(24px) saturate(190%)",
                          }}
                        >
                          <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 px-3 py-1.5 font-semibold">
                            {item.label}
                          </div>
                          <div className="space-y-0.5">
                            {item.dropdown?.map((sub) => {
                              const content = (
                                <div className="group flex flex-col px-3 py-2 rounded-xl hover:bg-white/[0.08] transition-colors">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[13px] font-medium text-zinc-200 group-hover:text-white">
                                      {sub.label}
                                    </span>
                                    {sub.badge && (
                                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                        {sub.badge}
                                      </span>
                                    )}
                                  </div>
                                  {sub.description && (
                                    <span className="text-[11px] text-zinc-400 group-hover:text-zinc-300 transition-colors line-clamp-1 mt-0.5">
                                      {sub.description}
                                    </span>
                                  )}
                                </div>
                              )

                              if (sub.app) {
                                return (
                                  <AppLink
                                    key={sub.label}
                                    app={sub.app}
                                    path={sub.path}
                                    className="block"
                                    onClick={() => setActiveDropdown(null)}
                                  >
                                    {content}
                                  </AppLink>
                                )
                              }
                              return (
                                <a
                                  key={sub.label}
                                  href={sub.href || "#"}
                                  className="block"
                                  onClick={() => setActiveDropdown(null)}
                                >
                                  {content}
                                </a>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : null}

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger Button (optional) */}
            {onSearchClick && (
              <button
                type="button"
                onClick={onSearchClick}
                className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white text-xs transition-colors"
              >
                <svg
                  className="size-3.5 shrink-0 stroke-[2]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
                <span className="truncate max-w-[120px]">{searchPlaceholder}</span>
                <kbd className="hidden sm:inline-block rounded border border-white/[0.12] bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-mono text-zinc-300">
                  ⌘K
                </kbd>
              </button>
            )}

            {/* Secondary Soft Pill Button */}
            {secondaryCta && (
              <div className="hidden sm:block">
                {secondaryCta.app ? (
                  <AppLink
                    app={secondaryCta.app}
                    path={secondaryCta.path}
                    className="inline-flex items-center justify-center rounded-full px-4 py-2 text-[13px] font-medium text-zinc-200 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] transition-all backdrop-blur-md shadow-xs"
                  >
                    {secondaryCta.label}
                  </AppLink>
                ) : (
                  <Link
                    href={secondaryCta.href || "#"}
                    className="inline-flex items-center justify-center rounded-full px-4 py-2 text-[13px] font-medium text-zinc-200 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] transition-all backdrop-blur-md shadow-xs"
                  >
                    {secondaryCta.label}
                  </Link>
                )}
              </div>
            )}

            {/* Primary Solid High-Contrast Pill Button */}
            {primaryCta && (
              <div>
                {primaryCta.app ? (
                  <AppLink
                    app={primaryCta.app}
                    path={primaryCta.path}
                    className="inline-flex items-center justify-center rounded-full px-4 sm:px-5 py-2 text-[13px] font-semibold bg-white hover:bg-zinc-200 text-zinc-950 transition-all shadow-md active:scale-[0.99]"
                  >
                    {primaryCta.label}
                  </AppLink>
                ) : (
                  <Link
                    href={primaryCta.href || "#"}
                    className="inline-flex items-center justify-center rounded-full px-4 sm:px-5 py-2 text-[13px] font-semibold bg-white hover:bg-zinc-200 text-zinc-950 transition-all shadow-md active:scale-[0.99]"
                  >
                    {primaryCta.label}
                  </Link>
                )}
              </div>
            )}

            {/* Mobile Drawer Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle Navigation Menu"
              className="md:hidden p-2 rounded-full border border-white/[0.1] bg-white/[0.05] text-zinc-300 hover:text-white hover:bg-white/[0.1] transition-colors"
            >
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer Glassy Dropdown */}
      {mobileOpen && (
        <div
          className="md:hidden border-b border-white/[0.1] px-6 py-6 space-y-4 animate-in slide-in-from-top-4 duration-150"
          style={{
            backgroundColor: "rgba(9, 9, 11, 0.95)",
            backdropFilter: "blur(24px) saturate(190%)",
            WebkitBackdropFilter: "blur(24px) saturate(190%)",
          }}
        >
          {navItems && navItems.length > 0 && (
            <div className="space-y-2">
              {navItems.map((item) => (
                <div key={item.label} className="space-y-1">
                  {item.app ? (
                    <AppLink
                      app={item.app}
                      path={item.path}
                      onClick={() => setMobileOpen(false)}
                      className="block text-sm font-medium text-zinc-300 hover:text-white py-1"
                    >
                      {item.label}
                    </AppLink>
                  ) : (
                    <a
                      href={item.href || "#"}
                      onClick={() => setMobileOpen(false)}
                      className="block text-sm font-medium text-zinc-300 hover:text-white py-1"
                    >
                      {item.label}
                    </a>
                  )}

                  {item.dropdown && (
                    <div className="pl-4 space-y-1 border-l border-zinc-800">
                      {item.dropdown.map((sub) => (
                        <a
                          key={sub.label}
                          href={sub.href || "#"}
                          onClick={() => setMobileOpen(false)}
                          className="block text-xs text-zinc-400 hover:text-zinc-200 py-1"
                        >
                          {sub.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t border-white/[0.08] flex flex-col gap-2.5">
            {secondaryCta && (
              <Link
                href={secondaryCta.href || "/contact"}
                onClick={() => setMobileOpen(false)}
                className="w-full text-center py-2.5 text-xs font-medium text-zinc-200 border border-white/[0.08] rounded-full bg-white/[0.04]"
              >
                {secondaryCta.label}
              </Link>
            )}
            {primaryCta && (
              <AppLink
                app={primaryCta.app || "dashboard"}
                path={primaryCta.path || "/register"}
                onClick={() => setMobileOpen(false)}
                className="w-full text-center py-2.5 text-xs font-semibold bg-white text-zinc-950 rounded-full"
              >
                {primaryCta.label}
              </AppLink>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
