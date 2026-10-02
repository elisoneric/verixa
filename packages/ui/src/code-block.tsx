"use client"

import * as React from "react"
import { cn } from "./utils"

export interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  code: string
  language?: string
  title?: string
  showLineNumbers?: boolean
  tabs?: { label: string; code: string; language?: string }[]
}

export function CodeBlock({
  code,
  language = "bash",
  title,
  showLineNumbers = false,
  tabs,
  className,
  ...props
}: CodeBlockProps) {
  const [activeTab, setActiveTab] = React.useState(0)
  const [copied, setCopied] = React.useState(false)

  const currentCode = tabs ? tabs[activeTab].code : code
  const currentLang = tabs ? tabs[activeTab].language || language : language

  const handleCopy = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(currentCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const lines = currentCode.trim().split("\n")

  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden font-mono text-xs text-left",
        className
      )}
      {...props}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/60 px-4 py-2">
        {tabs ? (
          <div className="flex items-center gap-1 -ml-1">
            {tabs.map((tab, idx) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(idx)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium transition-colors select-none",
                  activeTab === idx
                    ? "bg-zinc-800 text-emerald-400 font-semibold border border-zinc-700/80"
                    : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            <span className="text-zinc-400 font-medium">{title || currentLang}</span>
          </div>
        )}

        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title="Copy code"
        >
          {copied ? (
            <span className="text-emerald-400 font-semibold text-[11px]">COPIED</span>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-[11px]">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code contents */}
      <div className="p-4 overflow-x-auto leading-relaxed bg-zinc-950/90 text-zinc-200">
        <pre className="m-0 font-mono">
          <code>
            {lines.map((line, i) => (
              <div key={i} className="table-row">
                {showLineNumbers && (
                  <span className="table-cell select-none pr-4 text-right text-zinc-600 font-mono text-[11px]">
                    {i + 1}
                  </span>
                )}
                <span className="table-cell whitespace-pre">{line}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  )
}
