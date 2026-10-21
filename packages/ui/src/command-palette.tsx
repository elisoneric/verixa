"use client"

import * as React from "react"
import { cn } from "./utils"

export interface CommandItem {
  id: string
  title: string
  subtitle?: string
  icon?: React.ReactNode
  badge?: string
  shortcut?: string
  category: "Navigation" | "Verification" | "Developer" | "Help & Docs"
  onSelect: () => void
}

export interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  items: CommandItem[]
}

export function CommandPalette({ isOpen, onClose, items }: CommandPaletteProps) {
  const [query, setQuery] = React.useState("")
  const [selectedIndex, setSelectedIndex] = React.useState(0)

  const filteredItems = React.useMemo(() => {
    if (!query.trim()) return items
    const q = query.toLowerCase()
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q)
    )
  }, [items, query])

  React.useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        if (isOpen) onClose()
      }
      if (!isOpen) return

      if (e.key === "Escape") {
        onClose()
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev === 0 ? (filteredItems.length ? filteredItems.length - 1 : 0) : prev - 1
        )
      } else if (e.key === "Enter") {
        e.preventDefault()
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].onSelect()
          onClose()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose, filteredItems, selectedIndex])

  if (!isOpen) return null

  // Group by category
  const categories = Array.from(new Set(filteredItems.map((i) => i.category)))

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-50 w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-2 text-slate-900 shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center border-b border-slate-100 px-3 py-2.5">
          <svg className="w-5 h-5 text-slate-400 mr-2.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, search logs, or go to page..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-mono text-slate-500">
            ESC
          </kbd>
        </div>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-4">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No matching commands or pages found.
            </div>
          ) : (
            categories.map((cat) => {
              const catItems = filteredItems.filter((i) => i.category === cat)
              return (
                <div key={cat} className="space-y-1">
                  <div className="px-2 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                    {cat}
                  </div>
                  {catItems.map((item) => {
                    const globalIdx = filteredItems.indexOf(item)
                    const isSelected = selectedIndex === globalIdx
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          item.onSelect()
                          onClose()
                        }}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        className={cn(
                          "w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors select-none cursor-pointer",
                          isSelected
                            ? "bg-slate-100 text-slate-900 font-medium"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          {item.icon ? (
                            <span className="text-slate-500">{item.icon}</span>
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          )}
                          <div>
                            <div className="text-xs sm:text-sm font-medium">{item.title}</div>
                            {item.subtitle && (
                              <div className="text-[11px] text-slate-400 truncate">
                                {item.subtitle}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          {item.badge && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-600 border border-slate-200">
                              {item.badge}
                            </span>
                          )}
                          {item.shortcut && (
                            <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-mono text-slate-500">
                              {item.shortcut}
                            </kbd>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
