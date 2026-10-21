"use client"

import * as React from "react"

type Theme = "light"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (t: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme] = React.useState<Theme>("light")

  React.useEffect(() => {
    // Pure light mode enforcement
    if (typeof window !== "undefined") {
      localStorage.removeItem("vrx_theme")
      document.documentElement.classList.remove("dark")
      document.documentElement.classList.add("light")
    }
  }, [])

  const setTheme = () => {
    // No-op: pure light mode only
  }

  const toggleTheme = () => {
    // No-op: pure light mode only
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return ctx
}
