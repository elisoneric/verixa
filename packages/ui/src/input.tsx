"use client"

import * as React from "react"
import { cn } from "./utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  prefixIcon?: React.ReactNode
  suffixIcon?: React.ReactNode
  copyable?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      hint,
      error,
      prefixIcon,
      suffixIcon,
      copyable,
      value,
      defaultValue,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId()
    const [copied, setCopied] = React.useState(false)

    const handleCopy = () => {
      const textToCopy = String(value || defaultValue || "")
      if (textToCopy && typeof navigator !== "undefined") {
        navigator.clipboard.writeText(textToCopy)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-zinc-300 select-none"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {prefixIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-zinc-500">
              {prefixIcon}
            </div>
          )}

          <input
            id={inputId}
            type={type}
            value={value}
            defaultValue={defaultValue}
            className={cn(
              "flex h-9 w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 shadow-sm transition-all focus-visible:outline-none focus-visible:border-emerald-500/80 focus-visible:ring-2 focus-visible:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50",
              prefixIcon && "pl-9",
              (suffixIcon || copyable) && "pr-10",
              error &&
                "border-rose-500/80 focus-visible:border-rose-500 focus-visible:ring-rose-500/20",
              className
            )}
            ref={ref}
            {...props}
          />

          {copyable && (
            <button
              type="button"
              onClick={handleCopy}
              className="absolute right-2 p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-colors"
              title="Copy to clipboard"
            >
              {copied ? (
                <span className="text-[10px] font-mono text-emerald-400 font-semibold px-1">
                  COPIED
                </span>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              )}
            </button>
          )}

          {!copyable && suffixIcon && (
            <div className="absolute right-3 flex items-center text-zinc-500">
              {suffixIcon}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-xs text-rose-400 font-medium">{error}</p>
        ) : hint ? (
          <p className="text-xs text-zinc-500">{hint}</p>
        ) : null}
      </div>
    )
  }
)
Input.displayName = "Input"
