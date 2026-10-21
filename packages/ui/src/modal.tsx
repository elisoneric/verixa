"use client"

import * as React from "react"
import { cn } from "./utils"

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  maxWidth?: "sm" | "md" | "lg" | "xl"
  size?: "sm" | "md" | "lg" | "xl"
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  maxWidth,
  size = "md",
}: ModalProps) {
  const modalRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        onClose()
      } else if (e.key === "Enter" && !e.shiftKey) {
        const activeTag = document.activeElement?.tagName?.toLowerCase()
        if (activeTag !== "textarea") {
          const submitBtn = modalRef.current?.querySelector('button[type="submit"]') as HTMLButtonElement | null
          if (submitBtn && !submitBtn.disabled) {
            e.preventDefault()
            submitBtn.click()
          }
        }
      }
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

  const effectiveSize = maxWidth || size || "md"
  const maxWidthPixelMap: Record<string, string> = {
    sm: "380px",
    md: "480px",
    lg: "600px",
    xl: "720px",
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        style={{ maxWidth: maxWidthPixelMap[effectiveSize] || "480px", width: "100%" }}
        className={cn(
          "relative z-50 w-full mx-auto my-auto rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl transition-all duration-200",
          className
        )}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {title && (
          <div className="mb-4 pr-6">
            <h3 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h3>
            {description && (
              <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}

        <div>{children}</div>
      </div>
    </div>
  )
}
