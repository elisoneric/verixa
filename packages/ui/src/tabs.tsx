"use client"

import * as React from "react"
import { cn } from "./utils"

export interface TabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode; badge?: string }[]
  activeTab: string
  onChange: (id: string) => void
  variant?: "pills" | "underline"
  className?: string
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = "underline",
  className,
}: TabsProps) {
  if (variant === "pills") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1 border border-slate-200 shadow-2xs",
          className
        )}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all select-none cursor-pointer",
                isActive
                  ? "bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              {tab.icon}
              {tab.label}
              {tab.badge && (
                <span className="ml-1 rounded bg-slate-200 px-1.5 py-0.2 text-[10px] font-mono text-slate-700">
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex border-b border-slate-200 text-sm font-medium gap-6",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium transition-colors select-none -mb-px cursor-pointer",
              isActive
                ? "border-emerald-600 text-emerald-600 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.badge && (
              <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-600 border border-slate-200">
                {tab.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
