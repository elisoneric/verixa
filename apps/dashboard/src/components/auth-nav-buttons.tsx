"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@verixa/ui"
import { useAuth } from "../lib/auth-context"

export function AuthNavButtons() {
  const { token } = useAuth()

  if (token) {
    return (
      <Link href="/dashboard">
        <Button variant="emerald" size="sm" className="font-semibold h-9 px-4">
          Dashboard &rarr;
        </Button>
      </Link>
    )
  }

  return (
    <>
      <Link href="/login">
        <Button variant="outline" size="sm" className="font-semibold h-9 px-3 sm:px-4">
          Sign In
        </Button>
      </Link>
      <Link href="/register" className="hidden sm:inline-block">
        <Button variant="emerald" size="sm" className="font-semibold h-9 px-4">
          Create Account
        </Button>
      </Link>
    </>
  )
}

