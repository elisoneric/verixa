import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function getBaseHost(): { isProd: boolean; hostname: string; protocol: string } {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname
    const protocol = window.location.protocol
    const isProd =
      hostname !== "localhost" &&
      hostname !== "127.0.0.1" &&
      !hostname.startsWith("192.168.") &&
      !hostname.endsWith(".local")

    return { isProd, hostname, protocol }
  }

  // SSR Fallback
  const isProd = process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_VERIXA_ENV !== "local"
  return {
    isProd,
    hostname: isProd ? "verixa.esam.com.ng" : "localhost",
    protocol: isProd ? "https:" : "http:",
  }
}

export function getDashboardUrl(path = ""): string {
  if (process.env.NEXT_PUBLIC_DASHBOARD_URL) {
    return process.env.NEXT_PUBLIC_DASHBOARD_URL.replace(/\/$/, "") + path
  }
  const { isProd, hostname, protocol } = getBaseHost()
  if (isProd) {
    return "https://verixa.esam.com.ng" + path
  }
  return `${protocol}//${hostname}:3000${path}`
}

export function getDocsUrl(path = ""): string {
  if (process.env.NEXT_PUBLIC_DOCS_URL) {
    return process.env.NEXT_PUBLIC_DOCS_URL.replace(/\/$/, "") + path
  }
  const { isProd, hostname, protocol } = getBaseHost()
  if (isProd) {
    return "https://docs-verixa.esam.com.ng" + path
  }
  return `${protocol}//${hostname}:3002${path}`
}

export function getWwwUrl(path = ""): string {
  if (process.env.NEXT_PUBLIC_WWW_URL) {
    return process.env.NEXT_PUBLIC_WWW_URL.replace(/\/$/, "") + path
  }
  const { isProd, hostname, protocol } = getBaseHost()
  if (isProd) {
    return "https://verixa.esam.com.ng" + path
  }
  return `${protocol}//${hostname}:3001${path}`
}

export function getApiUrl(path = ""): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "") + path
  }
  const { isProd, hostname, protocol } = getBaseHost()
  if (isProd) {
    return "https://api-verixa.esam.com.ng" + path
  }
  return `${protocol}//${hostname}:4000${path}`
}

