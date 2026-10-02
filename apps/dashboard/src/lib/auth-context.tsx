"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { ApiClient, ApiUser, BalanceData } from "./api"

interface AuthContextType {
  user: ApiUser | null
  token: string | null
  environment: "sandbox" | "live"
  balance: BalanceData | null
  isLoading: boolean
  setEnvironment: (env: "sandbox" | "live") => void
  login: (email: string, pass: string) => Promise<void>
  register: (email: string, pass: string, orgName: string, complianceData?: any) => Promise<void>
  logout: () => void
  refreshBalance: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<ApiUser | null>(null)
  const [token, setToken] = React.useState<string | null>(null)
  const [environment, setEnvironmentState] = React.useState<"sandbox" | "live">("sandbox")
  const [balance, setBalance] = React.useState<BalanceData | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const refreshBalance = React.useCallback(async () => {
    try {
      if (localStorage.getItem("vrx_token")) {
        const bal = await ApiClient.getBalance()
        setBalance(bal)
      }
    } catch {
      // Ignore balance refresh error if not logged in
    }
  }, [])

  React.useEffect(() => {
    const savedToken = localStorage.getItem("vrx_token")
    const savedEnv = (localStorage.getItem("vrx_env") as "sandbox" | "live") || "sandbox"
    setEnvironmentState(savedEnv)

    if (savedToken) {
      setToken(savedToken)
      ApiClient.getMe()
        .then((userData) => {
          setUser(userData)
          refreshBalance()
        })
        .catch(() => {
          // Token expired
          localStorage.removeItem("vrx_token")
          setToken(null)
          setUser(null)
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [refreshBalance])

  const setEnvironment = (env: "sandbox" | "live") => {
    setEnvironmentState(env)
    localStorage.setItem("vrx_env", env)
  }

  const login = async (email: string, pass: string) => {
    const res = await ApiClient.login(email, pass)
    localStorage.setItem("vrx_token", res.access_token)
    setToken(res.access_token)
    setUser(res.user)
    await refreshBalance()
    router.push("/dashboard")
  }

  const register = async (email: string, pass: string, orgName: string, complianceData?: any) => {
    const res = await ApiClient.register(email, pass, orgName, complianceData)
    localStorage.setItem("vrx_token", res.access_token)
    setToken(res.access_token)
    setUser(res.user)
    await refreshBalance()
    router.push("/onboarding")
  }

  const logout = () => {
    localStorage.removeItem("vrx_token")
    setToken(null)
    setUser(null)
    setBalance(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        environment,
        balance,
        isLoading,
        setEnvironment,
        login,
        register,
        logout,
        refreshBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
