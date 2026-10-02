"use client"

import * as React from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (t: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("light")

  React.useEffect(() => {
    // Default to light theme, unless user previously chose dark
    const savedTheme = (localStorage.getItem("vrx_theme") as Theme) || "light"
    setThemeState(savedTheme)
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem("vrx_theme", newTheme)
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light"
    setTheme(next)
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
