import * as React from "react"
import { cn } from "./utils"

export function Table({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="relative w-full overflow-auto rounded-xl border border-zinc-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0c0c0e]/90 backdrop-blur-md shadow-xs">
      <table
        className={cn("w-full caption-bottom text-sm text-left", className)}
        {...props}
      />
    </div>
  )
}

export function TableHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        "border-b border-zinc-200/80 dark:border-white/[0.08] bg-zinc-50/80 dark:bg-zinc-900/80 text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider font-mono",
        className
      )}
      {...props}
    />
  )
}

export function TableBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={cn("divide-y divide-zinc-100 dark:divide-white/[0.06] font-sans", className)}
      {...props}
    />
  )
}

export function TableRow({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "transition-colors hover:bg-zinc-50/70 dark:hover:bg-white/[0.03] data-[state=selected]:bg-zinc-100 dark:data-[state=selected]:bg-white/[0.06]",
        className
      )}
      {...props}
    />
  )
}

export function TableHead({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "h-10 px-4 text-left align-middle font-medium text-zinc-500 dark:text-zinc-400 [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

export function TableCell({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        "p-4 align-middle text-zinc-800 dark:text-zinc-300 [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

export function TableCaption({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableCaptionElement>) {
  return (
    <caption
      className={cn("mt-4 text-xs text-zinc-400 dark:text-zinc-500", className)}
      {...props}
    />
  )
}

