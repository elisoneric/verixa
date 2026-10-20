import * as React from "react"
import { cn } from "./utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "flat"
}

export function Card({
  className,
  variant = "default",
  ...props
}: CardProps) {
  const variantStyles = {
    default: "rounded-2xl border border-slate-200/90 bg-white text-slate-900 shadow-xs transition-all",
    glass: "rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-xs hover:border-slate-300 hover:shadow-md transition-all duration-200",
    flat: "rounded-2xl border border-slate-200/60 bg-slate-50/60 text-slate-900",
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
        "font-heading text-lg font-bold leading-none tracking-tight text-slate-900",
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
      className={cn("text-xs sm:text-sm text-slate-500 leading-relaxed", className)}
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
      className={cn("flex items-center p-6 pt-0 border-t border-slate-100 mt-4", className)}
      {...props}
    />
  )
}
