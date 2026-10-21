import * as React from "react"
import { cn } from "./utils"

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
  badge?: string
  badgeColor?: "emerald" | "rose" | "indigo" | "sky" | "amber"
  showIcon?: boolean
  href?: string
}

export function Logo({
  size = "md",
  badge = "ID",
  badgeColor = "emerald",
  showIcon = true,
  className,
  ...props
}: LogoProps) {
  const sizeClasses = {
    sm: {
      container: "gap-1.5",
      icon: "w-6 h-6",
      text: "text-base font-bold tracking-tight",
      badge: "text-[10px] px-1 py-0.2 rounded font-mono font-semibold tracking-wide",
    },
    md: {
      container: "gap-2",
      icon: "w-7 h-7",
      text: "text-lg font-extrabold tracking-tight",
      badge: "text-xs px-1.5 py-0.5 rounded-md font-mono font-semibold tracking-wide",
    },
    lg: {
      container: "gap-2.5",
      icon: "w-9 h-9",
      text: "text-2xl font-black tracking-tight",
      badge: "text-xs px-2 py-0.5 rounded-md font-mono font-bold tracking-wider",
    },
  }

  const badgeColorClasses = {
    emerald: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    rose: "bg-rose-50 text-rose-700 border border-rose-200",
    indigo: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    sky: "bg-sky-50 text-sky-700 border border-sky-200",
    amber: "bg-amber-50 text-amber-700 border border-amber-200",
  }

  const currentSize = sizeClasses[size]

  return (
    <div
      className={cn(
        "inline-flex items-center select-none",
        currentSize.container,
        className
      )}
      {...props}
    >
      {showIcon && (
        <div className="relative flex items-center justify-center">
          <svg
            className={cn("shrink-0", currentSize.icon)}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              width="32"
              height="32"
              rx="8"
              className="fill-slate-900"
            />
            {/* Geometric V shape with verification shield tick */}
            <path
              d="M9 10.5L16 23L23 10.5H19L16 16.5L13 10.5H9Z"
              className="fill-white"
            />
            <path
              d="M17.5 17L21 21L26 15"
              stroke="#10B981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <span className={cn("text-slate-950 font-sans", currentSize.text)}>
          VERIXA
        </span>
        {badge && (
          <span
            className={cn(
              "uppercase transition-colors",
              currentSize.badge,
              badgeColorClasses[badgeColor]
            )}
          >
            {badge}
          </span>
        )}
      </div>
    </div>
  )
}
