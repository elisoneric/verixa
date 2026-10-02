"use client"

import * as React from "react"
import { cn } from "./utils"

export interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  width?: "sm" | "md" | "lg" | "xl"
}

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  width = "lg",
}: DrawerProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.body.style.overflow = "unset"
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const widthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div
          className={cn(
            "w-screen bg-white dark:bg-zinc-950 border-l border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 shadow-2xl flex flex-col h-full",
            widthClasses[width],
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800/80 px-6 py-4 bg-slate-50 dark:bg-zinc-900/50">
            <div>
              {title && (
                <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h3>
              )}
              {description && (
                <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">{children}</div>
        </div>
      </div>
    </div>
  )
}
