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
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25",
    rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25",
    indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25",
    sky: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/25",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25",
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
              className="fill-gray-900 dark:fill-white"
            />
            {/* Geometric V shape with verification shield tick */}
            <path
              d="M9 10.5L16 23L23 10.5H19L16 16.5L13 10.5H9Z"
              className="fill-white dark:fill-gray-950"
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
        <span className={cn("text-gray-950 dark:text-white font-sans", currentSize.text)}>
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
