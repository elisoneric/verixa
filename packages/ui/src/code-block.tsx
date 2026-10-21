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

  const currentCode = tabs ? tabs[activeTab]?.code ?? code : code
  const currentLang = tabs ? tabs[activeTab]?.language || language : language

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(currentCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const lines = currentCode ? currentCode.replace(/\r\n/g, "\n").split("\n") : []
  // Trim trailing empty line if code ends with newline
  if (lines.length > 1 && lines[lines.length - 1].trim() === "") {
    lines.pop()
  }

  const displayTitle = title ? title.toUpperCase() : (currentLang ? `${currentLang.toUpperCase()} EXAMPLE` : "CODE")

  return (
    <div
      className={cn(
        "group relative rounded-xl border border-slate-800 bg-[#07090e] shadow-xl overflow-hidden font-mono text-left my-4 transition-all",
        className
      )}
      {...props}
    >
      {/* Header bar matching the dashboard api keys terminal style */}
      <div className="flex items-center justify-between border-b border-slate-800/90 bg-[#0d111a] px-4 py-2.5 select-none min-h-[42px]">
        <div className="flex items-center gap-3 min-w-0">
          {/* Terminal 3-dot window controls */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-3 h-3 rounded-full bg-[#ef4444] inline-block shadow-2xs" />
            <span className="w-3 h-3 rounded-full bg-[#f59e0b] inline-block shadow-2xs" />
            <span className="w-3 h-3 rounded-full bg-[#10b981] inline-block shadow-2xs" />
          </div>

          {tabs && tabs.length > 0 ? (
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 ml-1">
              {tabs.map((tab, idx) => (
                <button
                  key={tab.label}
                  type="button"
                  onClick={() => setActiveTab(idx)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-all cursor-pointer whitespace-nowrap",
                    activeTab === idx
                      ? "bg-slate-800 text-emerald-400 font-bold shadow-xs border border-slate-700/80"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  )}
                >
                  {tab.label.toUpperCase()}
                </button>
              ))}
            </div>
          ) : (
            <span className="text-xs font-mono font-semibold tracking-wider uppercase text-slate-400 truncate pl-0.5">
              {displayTitle}
            </span>
          )}
        </div>

        {/* Copy action button */}
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer shrink-0 ml-3 font-sans font-medium select-none",
            copied
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 border border-transparent"
          )}
          title="Copy code to clipboard"
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-[11px] font-semibold text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-xs">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code viewport with rock-solid table alignment */}
      <div className="p-4 sm:p-5 overflow-x-auto bg-[#07090e]">
        <table className="w-full border-collapse font-mono text-xs sm:text-[13px] leading-relaxed text-left">
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className="hover:bg-white/[0.02]">
                {showLineNumbers && (
                  <td className="w-8 select-none pr-3.5 pl-0 py-0.5 text-right align-top text-slate-600 font-mono text-[11px]">
                    {i + 1}
                  </td>
                )}
                <td className="py-0.5 px-0 align-top whitespace-pre text-slate-200 font-mono">
                  {line || "\u00A0"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
