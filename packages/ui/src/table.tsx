import * as React from "react"
import { cn } from "./utils"

export function Table({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="relative w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-xs">
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
        "border-b border-slate-200 bg-slate-50/90 text-slate-600 text-xs uppercase tracking-wider font-mono font-semibold",
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
      className={cn("divide-y divide-slate-100 font-sans", className)}
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
        "transition-colors hover:bg-slate-50/80 data-[state=selected]:bg-slate-100",
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
        "h-11 px-4 text-left align-middle font-semibold text-slate-700 [&:has([role=checkbox])]:pr-0",
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
        "p-4 align-middle text-slate-800 [&:has([role=checkbox])]:pr-0",
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

