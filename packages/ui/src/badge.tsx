import * as React from "react"
import { cn } from "./utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "verified"
    | "failed"
    | "warning"
    | "info"
    | "neutral"
    | "outline"
    | "mono"
  size?: "sm" | "md"
  dot?: boolean
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default:
      "bg-slate-900 text-white border-slate-800 shadow-2xs",
    verified:
      "bg-emerald-50 text-emerald-700 border-emerald-200/80 font-medium",
    failed:
      "bg-rose-50 text-rose-700 border-rose-200/80 font-medium",
    warning:
      "bg-amber-50 text-amber-700 border-amber-200/80 font-medium",
    info:
      "bg-sky-50 text-sky-700 border-sky-200/80 font-medium",
    neutral:
      "bg-slate-100 text-slate-700 border-slate-200 font-medium",
    outline:
      "bg-transparent text-slate-600 border-slate-200",
    mono:
      "bg-slate-100 text-slate-800 font-mono border-slate-200 text-[11px]",
  }

  const dotColors = {
    default: "bg-slate-400",
    verified: "bg-emerald-500 animate-pulse",
    failed: "bg-rose-500",
    warning: "bg-amber-500",
    info: "bg-sky-500",
    neutral: "bg-slate-400",
    outline: "bg-slate-400",
    mono: "bg-emerald-500",
  }

  const sizes = {
    sm: "px-2 py-0.5 text-[11px] gap-1.5",
    md: "px-2.5 py-1 text-xs gap-1.5",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-md border tracking-tight select-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColors[variant])}
        />
      )}
      {children}
    </span>
  )
}
