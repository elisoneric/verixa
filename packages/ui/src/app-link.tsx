"use client"

import * as React from "react"
import { getDashboardUrl, getDocsUrl, getWwwUrl, getApiUrl } from "./utils"

export interface AppLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  app?: "dashboard" | "docs" | "www" | "api"
  path?: string
}

export function AppLink({
  app = "dashboard",
  path = "",
  href,
  children,
  onClick,
  ...props
}: AppLinkProps) {
  const computeUrl = React.useCallback(() => {
    if (href) return href
    if (app === "dashboard") return getDashboardUrl(path)
    if (app === "docs") return getDocsUrl(path)
    if (app === "www") return getWwwUrl(path)
    if (app === "api") return getApiUrl(path)
    return "#"
  }, [app, path, href])

  const [targetHref, setTargetHref] = React.useState<string>(computeUrl)

  React.useEffect(() => {
    setTargetHref(computeUrl())
  }, [computeUrl])

  return (
    <a
      href={targetHref}
      suppressHydrationWarning
      onClick={(e) => {
        // Ensure latest URL on click
        const latest = computeUrl()
        if (latest !== targetHref) {
          setTargetHref(latest)
        }
        if (onClick) onClick(e)
      }}
      {...props}
    >
      {children}
    </a>
  )
}
