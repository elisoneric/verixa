"use client"

import Link from "next/link"
import { Logo, Button } from "@verixa/ui"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-emerald-500/25 selection:text-emerald-300">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <Logo size="md" />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/privacy">
              <span className="text-xs text-slate-600 hover:text-slate-900 transition-colors">Privacy Policy</span>
            </Link>
            <Link href="/register">
              <Button variant="emerald" size="sm" className="font-semibold">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 sm:py-16">
        <div className="border-b border-slate-200 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600 text-xs font-mono mb-4">
            LEGAL AGREEMENT • B2B TERMS
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Terms of Service
          </h1>
          <p className="mt-2 text-slate-500 text-sm">
            Last Updated: August 2026 • Effective Version 1.2
          </p>
        </div>

        <div className="space-y-10 text-slate-700 leading-relaxed text-sm sm:text-base">
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              1. Agreement to Terms
            </h2>
            <p>
              These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between your organization (&quot;Customer&quot;, &quot;Developer&quot;, &quot;you&quot;) and Verixa ID (&quot;Verixa&quot;, &quot;we&quot;, &quot;us&quot;) governing access to and use of the Verixa identity verification API platform, developer console, documentation, and associated services.
            </p>
            <p>
              By creating an account, generating API keys, or invoking verification endpoints, you acknowledge that you have read, understood, and agree to be bound by these Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              2. Acceptable Use & Compliance Warranties
            </h2>
            <p>
              You expressly warrant and agree that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Lawful Consent:</strong> You shall obtain verifiable, informed consent from end-users before querying their Bank Verification Number (BVN), National Identification Number (NIN), or bank account details in accordance with applicable laws (including NDPA 2023).
              </li>
              <li>
                <strong>Prohibited Purposes:</strong> You shall not use Verixa for identity theft, unauthorized surveillance, data scraping, harassment, or financial fraud.
              </li>
              <li>
                <strong>API Key Confidentiality:</strong> You are solely responsible for maintaining the confidentiality of your Verixa API keys. You must never expose secret keys in client-side code (browsers or mobile binaries).
              </li>
              <li>
                <strong>Regulatory Compliance Alignment:</strong> Verixa operates under strict Nigeria Data Protection Act (NDPA) and NDPC regulatory guidelines. All identity verifications require explicit applicant consent, with automated audit trails and zero unauthorized data persistence.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              3. The NGX Credit System, Pricing & Billing
            </h2>
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3 shadow-xs">
              <h3 className="font-bold text-slate-900 text-base">NGX Credit Architecture</h3>
              <ul className="list-disc pl-6 space-y-2 text-xs sm:text-sm text-slate-600">
                <li><strong>1 NGX = ₦1.00 NGN:</strong> NGX points represent prepaid computational credits utilized for metered API queries.</li>
                <li><strong>Dedicated Virtual Account (DVA) Funding:</strong> Organizations are provisioned a dedicated bank account powered by Paystack. Transfers automatically credit your live NGX balance 24/7.</li>
                <li><strong>Zero Charges on Failed Requests:</strong> Each verification call checks your balance atomically. If a verification request cannot be resolved, your NGX credit balance is not deducted.</li>
                <li><strong>Non-Expiring Credits:</strong> Purchased NGX credits do not expire as long as your account remains in good standing.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              4. Service Availability & Uptime
            </h2>
            <p>
              Verixa strives for a <strong>99.9% API uptime Service Level Agreement (SLA)</strong>. Our platform incorporates multi-provider failover to shield your business from individual upstream outages.
            </p>
            <p>
              However, scheduled maintenance, government registry maintenance windows, or national telecommunication switch downtime may occasionally affect latency.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              5. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by applicable law, Verixa ID and its affiliates shall not be liable for any indirect, incidental, or consequential damages resulting from lost revenue, business interruption, or upstream government database inaccuracies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              6. Governing Law & Jurisdiction
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              7. Legal Notices & Contact
            </h2>
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-1.5 shadow-xs">
              <p className="font-bold text-slate-900 text-sm">Verixa ID Legal & Compliance</p>
              <p className="text-xs text-slate-500">Email: <a href="mailto:legal@verixaid.com" className="text-emerald-600 hover:underline">legal@verixaid.com</a></p>
              <p className="text-xs text-slate-500">Support: <a href="mailto:support@verixaid.com" className="text-emerald-600 hover:underline">support@verixaid.com</a></p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 bg-slate-100 text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Verixa ID. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-900">Privacy Policy</Link>
            <Link href="/login" className="hover:text-slate-900">Sign In</Link>
            <Link href="/register" className="hover:text-slate-900">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
