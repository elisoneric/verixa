import * as React from "react"
import { cn } from "./utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "ghost"
    | "destructive"
    | "link"
    | "emerald"
    | "subtle"
    | "pill"
    | "glassy"
    | "emerald-pill"
  size?: "xs" | "sm" | "md" | "lg" | "pill-sm" | "pill-md"
  isLoading?: boolean
  prefixIcon?: React.ReactNode
  suffixIcon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      isLoading = false,
      prefixIcon,
      suffixIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer"

    const variants = {
      default:
        "bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm active:scale-[0.99] border border-zinc-900 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 dark:border-zinc-200",
      emerald:
        "bg-emerald-600 text-white font-semibold hover:bg-emerald-500 shadow-sm shadow-emerald-600/20 active:scale-[0.99]",
      secondary:
        "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 dark:border-zinc-700",
      subtle:
        "bg-zinc-100/80 text-zinc-700 hover:bg-zinc-200/80 hover:text-zinc-900 border border-zinc-200 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:bg-zinc-800/80 dark:hover:text-white dark:border-zinc-800",
      outline:
        "border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50 hover:text-zinc-950 shadow-2xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white",
      ghost:
        "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/70",
      destructive:
        "bg-rose-600 text-white hover:bg-rose-500 shadow-sm shadow-rose-600/20",
      link:
        "text-emerald-600 dark:text-emerald-400 underline-offset-4 hover:underline p-0 h-auto font-normal",
      pill:
        "bg-white text-zinc-950 hover:bg-zinc-200 rounded-full font-semibold shadow-sm active:scale-[0.99]",
      glassy:
        "bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 border border-white/[0.08] rounded-full backdrop-blur-md active:scale-[0.99]",
      "emerald-pill":
        "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-full shadow-sm shadow-emerald-500/20 active:scale-[0.99]",
    }

    const sizes = {
      xs: "h-8 px-3 text-xs gap-1.5 rounded-md",
      sm: "h-9 px-3.5 text-xs gap-2 rounded-lg",
      md: "h-11 px-5 text-sm gap-2 rounded-lg font-medium",
      lg: "h-12 px-6 text-base gap-2.5 rounded-xl font-semibold",
      "pill-sm": "h-9 px-4 text-xs gap-2 rounded-full",
      "pill-md": "h-10 px-5 text-[13px] gap-2 rounded-full",
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          prefixIcon
        )}
        {children}
        {!isLoading && suffixIcon}
      </button>
    )
  }
)
Button.displayName = "Button"
