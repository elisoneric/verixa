import * as React from "react"
import { cn } from "./utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "flat"
}

export function Card({
  className,
  variant = "glass",
  ...props
}: CardProps) {
  const variantStyles = {
    default: "rounded-2xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#0c0e14]/80 text-zinc-900 dark:text-zinc-100 shadow-xs backdrop-blur-md",
    glass: "rounded-2xl border border-white/[0.08] bg-[#0e1118]/65 text-zinc-100 backdrop-blur-xl shadow-lg transition-all duration-200 hover:border-white/[0.16] hover:bg-[#121620]/80 hover:-translate-y-0.5 hover:shadow-2xl",
    flat: "rounded-2xl border border-white/[0.06] bg-transparent text-zinc-100",
  }

  return (
    <div
      className={cn(variantStyles[variant], className)}
      {...props}
    />
  )
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "font-heading text-lg font-bold leading-none tracking-tight text-white",
        className
      )}
      {...props}
    />
  )
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-xs sm:text-sm text-zinc-400 leading-relaxed", className)}
      {...props}
    />
  )
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center p-6 pt-0 border-t border-white/[0.07] mt-4", className)}
      {...props}
    />
  )
}
