"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { DOCS_SECTIONS } from "../lib/navigation"

export function DocsSidebar() {
  const pathname = usePathname()

  // Track which sections are expanded. Default: section containing current pathname is expanded, plus GET STARTED.
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {}
    DOCS_SECTIONS.forEach((sec) => {
      const hasActiveLink = sec.links.some((l) => l.href === pathname)
      initialState[sec.title] = hasActiveLink || sec.title === "GET STARTED" || sec.title === "KYC IDENTITY VERIFICATION"
    })
    return initialState
  })

  // Whenever pathname changes, ensure that section is open
  React.useEffect(() => {
    DOCS_SECTIONS.forEach((sec) => {
      if (sec.links.some((l) => l.href === pathname)) {
        setOpenSections((prev) => ({ ...prev, [sec.title]: true }))
      }
    })
  }, [pathname])

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  return (
    <nav className="h-full flex flex-col justify-between overflow-hidden select-none pr-1">
      <div className="space-y-3 overflow-hidden">
        {DOCS_SECTIONS.map((sec) => {
          const isOpen = Boolean(openSections[sec.title])
          const hasActiveLink = sec.links.some((l) => l.href === pathname)

          return (
            <div key={sec.title} className="space-y-1">
              <button
                type="button"
                onClick={() => toggleSection(sec.title)}
                className={`w-full flex items-center justify-between text-left px-2 py-1 rounded-md text-[11px] font-mono font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  hasActiveLink
                    ? "text-emerald-700 bg-emerald-50/70"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/60"
                }`}
              >
                <span className="truncate">{sec.title}</span>
                <svg
                  className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-90 text-emerald-600" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {isOpen && (
                <div className="space-y-0.5 pl-2 border-l border-slate-200/80 ml-2">
                  {sec.links.map((link) => {
                    const isActive = pathname === link.href

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center justify-between rounded-md px-2 py-1 text-xs transition-colors ${
                          isActive
                            ? "bg-slate-900 text-white font-medium shadow-2xs"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        }`}
                      >
                        <span className="truncate">{link.label}</span>
                        {link.badge && (
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded border shrink-0 ml-1.5 ${
                              isActive
                                ? "bg-slate-800 text-emerald-300 border-slate-700"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Bottom Console Shortcut */}
      <div className="pt-3 border-t border-slate-200 shrink-0 mt-2">
        <a
          href="/dashboard"
          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-semibold transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <span>💻</span>
            <span>Developer Console</span>
          </span>
          <span className="text-slate-400">&rarr;</span>
        </a>
      </div>
    </nav>
  )
}

