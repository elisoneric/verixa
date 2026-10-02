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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        <div className="text-center">
          <Logo size="lg" />
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white">
            Quickstart Developer Setup
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Follow this 2-minute guide to make your first verification request.
          </p>
        </div>

        {/* Steps Checklist Card */}
        <Card className="bg-zinc-900/60 border-zinc-800 p-6 sm:p-8 space-y-6">
          <div className="space-y-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`p-4 rounded-xl border transition-all ${
                  step.status === "completed"
                    ? "bg-zinc-950/80 border-emerald-500/30"
                    : step.status === "current"
                    ? "bg-zinc-900 border-zinc-700"
                    : "bg-zinc-950/40 border-zinc-800/60 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        step.status === "completed"
                          ? "bg-emerald-500 text-zinc-950"
                          : step.status === "current"
                          ? "bg-zinc-700 text-white"
                          : "bg-zinc-800 text-zinc-500"
                      }`}
                    >
                      {step.status === "completed" ? "✓" : step.id}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{step.title}</h4>
                      <p className="text-xs text-zinc-400 mt-0.5">{step.description}</p>
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
                  <div className="mt-4 pt-4 border-t border-zinc-800 space-y-3">
                    <p className="text-xs font-mono text-zinc-400">
                      POST /v1/verify/bvn &#123; "bvn": "22123456789", "firstName": "CHIDERA" &#125;
                    </p>
                    <Button
                      variant="emerald"
                      size="sm"
                      onClick={runFirstVerification}
                      isLoading={isRunningTest}
                    >
                      ⚡ Execute Test Verification Request
                    </Button>
                  </div>
                )}

                {/* Step 3 Completed Result Display */}
                {step.id === 3 && testResult && (
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <span className="text-[11px] font-mono text-emerald-400 block mb-2">
                      RESPONSE JSON (200 OK):
                    </span>
                    <pre className="p-3 rounded-lg bg-zinc-950 font-mono text-xs text-emerald-300 overflow-x-auto">
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <AppLink app="docs" className="text-xs text-zinc-400 hover:text-white transition-colors">
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
