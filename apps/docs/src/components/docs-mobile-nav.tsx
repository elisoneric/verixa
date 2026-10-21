"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Logo, getWwwUrl, getDashboardUrl } from "@verixa/ui"
import { DOCS_SECTIONS } from "../lib/navigation"

export function DocsMobileNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)

  const mainSiteUrl = getWwwUrl("/")
  const dashboardUrl = getDashboardUrl("/dashboard")

  // Close drawer on path change
  React.useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Lock body scroll when drawer is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Find active link label
  const activeLink = DOCS_SECTIONS.flatMap((s) => s.links).find((l) => l.href === pathname)
  const activeTitle = activeLink ? activeLink.label : "Overview"

  return (
    <>
      {/* Mobile Sticky Sub-Bar for Quick Drawer Access */}
      <div className="md:hidden sticky top-16 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 px-3.5 py-2 flex items-center justify-between gap-2 shadow-2xs">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200/90 active:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors shadow-2xs cursor-pointer select-none"
        >
          <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          <span>Menu</span>
          <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
            21 APIs
          </span>
        </button>

        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium truncate max-w-[180px]">
          <span className="text-slate-400">Page:</span>
          <span className="truncate font-semibold text-slate-900">{activeTitle}</span>
        </div>
      </div>

      {/* Slide-Out Drawer Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative w-80 max-w-[85vw] h-full bg-white shadow-2xl flex flex-col z-10 border-r border-slate-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <Logo size="sm" badge="DOCS" badgeColor="emerald" />
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                aria-label="Close documentation menu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Quick Navigation Action Buttons */}
            <div className="p-3 border-b border-slate-100 flex flex-col gap-2 shrink-0 bg-slate-50/40">
              <a
                href={mainSiteUrl}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-colors shadow-2xs"
              >
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Main Website</span>
              </a>

              <a
                href={dashboardUrl}
                className="w-full text-center py-2 px-3 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors shadow-2xs"
              >
                Developer Console &rarr;
              </a>
            </div>

            {/* All 21 API Endpoints Categorized Navigation */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {DOCS_SECTIONS.map((sec) => (
                <div key={sec.title} className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block px-2.5">
                    {sec.title}
                  </span>
                  <div className="space-y-0.5">
                    {sec.links.map((link) => {
                      const isActive = pathname === link.href
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                            isActive
                              ? "bg-slate-900 text-white font-semibold shadow-xs"
                              : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                          }`}
                        >
                          <span className="truncate">{link.label}</span>
                          {link.badge && (
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ml-2 shrink-0 ${
                                isActive
                                  ? "bg-white/20 text-white"
                                  : "bg-slate-100 text-slate-600 border border-slate-200"
                              }`}
                            >
                              {link.badge}
                            </span>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Drawer Footer */}
            <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] font-mono text-slate-500 text-center shrink-0">
              Verixa ID API Platform v1.2.0
            </div>
          </div>
        </div>
      )}
    </>
  )
}
