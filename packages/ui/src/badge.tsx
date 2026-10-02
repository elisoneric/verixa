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
      "bg-zinc-800 text-zinc-200 border-zinc-700/80",
    verified:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
    failed:
      "bg-rose-500/10 text-rose-400 border-rose-500/25",
    warning:
      "bg-amber-500/10 text-amber-400 border-amber-500/25",
    info:
      "bg-sky-500/10 text-sky-400 border-sky-500/25",
    neutral:
      "bg-zinc-900/80 text-zinc-400 border-zinc-800",
    outline:
      "bg-transparent text-zinc-400 border-zinc-700",
    mono:
      "bg-zinc-900 text-zinc-300 font-mono border-zinc-800",
  }

  const dotColors = {
    default: "bg-zinc-400",
    verified: "bg-emerald-400 animate-pulse",
    failed: "bg-rose-400",
    warning: "bg-amber-400",
    info: "bg-sky-400",
    neutral: "bg-zinc-500",
    outline: "bg-zinc-400",
    mono: "bg-emerald-400",
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
