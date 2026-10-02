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
        else {
          // Open trigger can be handled by parent
        }
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
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-50 w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-950 p-2 text-zinc-100 shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center border-b border-zinc-800/80 px-3 py-2">
          <svg className="w-5 h-5 text-zinc-400 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, search logs, or go to page..."
            className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
            ESC
          </kbd>
        </div>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-4">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              No matching commands or pages found.
            </div>
          ) : (
            categories.map((cat) => {
              const catItems = filteredItems.filter((i) => i.category === cat)
              return (
                <div key={cat} className="space-y-1">
                  <div className="px-2 text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-500">
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
                          "w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors select-none",
                          isSelected
                            ? "bg-zinc-800 text-white font-medium"
                            : "text-zinc-300 hover:bg-zinc-900"
                        )}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          {item.icon ? (
                            <span className="text-zinc-400">{item.icon}</span>
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          )}
                          <div>
                            <div className="text-xs sm:text-sm font-medium">{item.title}</div>
                            {item.subtitle && (
                              <div className="text-[11px] text-zinc-400 truncate">
                                {item.subtitle}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          {item.badge && (
                            <span className="rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 border border-zinc-800">
                              {item.badge}
                            </span>
                          )}
                          {item.shortcut && (
                            <kbd className="rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
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
