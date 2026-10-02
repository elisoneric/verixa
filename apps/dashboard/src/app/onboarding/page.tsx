"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button, Badge, Card, CodeBlock, Logo, AppLink } from "@verixa/ui"
import { useAuth } from "../../lib/auth-context"
import { ApiClient } from "../../lib/api"

export default function OnboardingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeStep, setActiveStep] = React.useState(1)
  const [testResult, setTestResult] = React.useState<any | null>(null)
  const [isRunningTest, setIsRunningTest] = React.useState(false)

  const runFirstVerification = async () => {
    setIsRunningTest(true)
    try {
      const res = await ApiClient.manualVerify("bvn", "sandbox", {
        bvn: "22123456789",
        firstName: "CHIDERA",
      })
      setTestResult(res)
      setActiveStep(4)
    } catch (e: any) {
      setTestResult({ status: "failed", error: e.message })
    } finally {
      setIsRunningTest(false)
    }
  }

  const steps = [
    {
      id: 1,
      title: "Account & Organization Created",
      description: `Welcome, ${user?.org_name || "Partner"}! Your dedicated account and sandbox environment have been provisioned.`,
      status: "completed",
    },
    {
      id: 2,
      title: "Sandbox Credits Credited",
      description: "100,000 NGX test credits have been loaded into your sandbox wallet.",
      status: "completed",
    },
    {
      id: 3,
      title: "Run Your First Test Verification",
      description: "Trigger a live sandbox BVN verification query to see how the normalized payload returns.",
      status: activeStep >= 3 ? (activeStep > 3 ? "completed" : "current") : "pending",
    },
    {
      id: 4,
      title: "Integration & Production Readiness",
      description: "Copy your API keys, inspect webhooks, and start integrating into your backend.",
      status: activeStep >= 4 ? "current" : "pending",
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        <div className="text-center">
          <Logo size="lg" />
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Quickstart Developer Setup
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
            Follow this 2-minute guide to make your first verification request.
          </p>
        </div>

        {/* Steps Checklist Card */}
        <Card className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="space-y-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`p-4 rounded-xl border transition-all ${
                  step.status === "completed"
                    ? "bg-emerald-50/70 border-emerald-300 dark:bg-zinc-950/80 dark:border-emerald-500/30"
                    : step.status === "current"
                    ? "bg-slate-50 border-slate-300 dark:bg-zinc-900 dark:border-zinc-700 shadow-2xs"
                    : "bg-slate-50/50 border-slate-200 dark:bg-zinc-950/40 dark:border-zinc-800/60 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        step.status === "completed"
                          ? "bg-emerald-500 text-white"
                          : step.status === "current"
                          ? "bg-slate-800 text-white dark:bg-zinc-700 dark:text-white"
                          : "bg-slate-200 text-slate-500 dark:bg-zinc-800 dark:text-zinc-500"
                      }`}
                    >
                      {step.status === "completed" ? (
                        <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        step.id
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{step.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{step.description}</p>
                    </div>
                  </div>

                  {step.status === "completed" ? (
                    <Badge variant="verified" size="sm">COMPLETED</Badge>
                  ) : step.status === "current" ? (
                    <Badge variant="mono" size="sm">IN PROGRESS</Badge>
                  ) : (
                    <Badge variant="neutral" size="sm">PENDING</Badge>
                  )}
                </div>

                {/* Step 3 Interactive Action */}
                {step.id === 3 && activeStep === 3 && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-zinc-800 space-y-3">
                    <p className="text-xs font-mono text-slate-600 dark:text-zinc-400">
                      POST /v1/verify/bvn &#123; "bvn": "22123456789", "firstName": "CHIDERA" &#125;
                    </p>
                    <Button
                      variant="emerald"
                      size="sm"
                      onClick={runFirstVerification}
                      isLoading={isRunningTest}
                      className="flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Execute Test Verification Request
                    </Button>
                  </div>
                )}

                {/* Step 3 Completed Result Display */}
                {step.id === 3 && testResult && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-zinc-800">
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold block mb-2">
                      RESPONSE JSON (200 OK):
                    </span>
                    <pre className="p-3 rounded-lg bg-slate-900 dark:bg-zinc-950 font-mono text-xs text-emerald-400 dark:text-emerald-300 overflow-x-auto border border-slate-800 dark:border-zinc-800">
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <AppLink app="docs" className="text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white transition-colors">
              Read Developer Integration Docs &rarr;
            </AppLink>
            <Button
              variant="default"
              size="md"
              onClick={() => router.push("/dashboard")}
            >
              Go to Dashboard &rarr;
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
