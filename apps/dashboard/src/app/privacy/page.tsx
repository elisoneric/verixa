"use client"

import Link from "next/link"
import { Logo, Button } from "@verixa/ui"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-emerald-500/25 selection:text-emerald-300">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <Logo size="md" />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/terms">
              <span className="text-xs text-slate-600 hover:text-slate-900 transition-colors">Terms of Service</span>
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-mono mb-4">
            REGULATORY COMPLIANCE • NDPA / NDPR
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Privacy Policy
          </h1>
          <p className="mt-2 text-slate-500 text-sm">
            Last Updated: August 2026 • Effective Version 1.2
          </p>
        </div>

        <div className="space-y-10 text-slate-700 leading-relaxed text-sm sm:text-base">
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              1. Overview & Commitment to Data Protection
            </h2>
            <p>
              Verixa ID (&quot;Verixa&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) provides business-to-business (B2B) identity, financial verification, and developer API aggregation infrastructure. We take data privacy and security with the utmost seriousness.
            </p>
            <p>
              This Privacy Policy explains how personal and corporate data is collected, processed, encrypted, and safeguarded when businesses (&quot;Customers&quot;, &quot;Developers&quot;) access our APIs and management consoles.
            </p>
            <p>
              Our operations adhere strictly to the <strong>Nigeria Data Protection Act (NDPA 2023)</strong> and NDPC regulatory guidelines. All identity verifications require explicit applicant consent, with automated audit trails and zero unauthorized data persistence.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              2. Data Controller vs. Data Processor Role
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>You (Our Customer/Client)</strong> act as the <strong>Data Controller</strong> for end-user identity queries submitted via our verification APIs (such as BVN, NIN, and bank account numbers). You warrant that you have obtained lawful consent from applicants prior to initiating verification.
              </li>
              <li>
                <strong>Verixa ID</strong> operates strictly as a <strong>Data Processor</strong> on your behalf, transmitting requests securely to authorized repositories and certified verification networks.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              3. Information We Collect & Process
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 my-3">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                <h3 className="font-bold text-slate-900 text-sm mb-1.5">A. Customer Account Data</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Corporate email addresses, business name, authorized administrator contact info, securely hashed credentials, and billing records for purchasing NGX credits.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                <h3 className="font-bold text-slate-900 text-sm mb-1.5">B. Verification API Payloads</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Bank Verification Numbers (BVN), National Identification Numbers (NIN), Nigerian Uniform Bank Account Numbers (NUBAN), and demographics submitted for authorized queries.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              4. Security Architecture & Data Safeguards
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Zero Upstream Credential Exposure:</strong> Customers never receive direct credentials to upstream databases. All provider keys are securely stored server-side.</li>
              <li><strong>Cryptographic Key Hashing:</strong> Customer API keys are cryptographically generated and hashed using industry-standard bcrypt. Raw secrets cannot be retrieved from our database after generation.</li>
              <li><strong>Strict Encryption:</strong> All communication is enforced via TLS 1.3 encryption in transit, with AES-256 database encryption at rest.</li>
              <li><strong>Zero Unauthorized Retention:</strong> Identity queries are processed strictly for verification fulfillment and audit logging with applicant consent.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              5. Third-Party Upstream Providers
            </h2>
            <p>
              To complete identity and financial verifications, Verixa ID securely routes requests through authorized identity verification partners (e.g., licensed providers and certified payment switches like Paystack for dedicated virtual account funding).
            </p>
            <p>
              We do not sell, rent, or trade personal data to third parties for marketing or advertising purposes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              6. Contact & Data Protection
            </h2>
            <p>
              For inquiries regarding privacy, compliance audits, or data rights under NDPA, reach out to our team:
            </p>
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-1.5 shadow-xs">
              <p className="font-bold text-slate-900 text-sm">Verixa ID Privacy & Compliance</p>
              <p className="text-xs text-slate-500">Email: <a href="mailto:privacy@verixaid.com" className="text-emerald-600 hover:underline">privacy@verixaid.com</a></p>
              <p className="text-xs text-slate-500">Security: <a href="mailto:security@verixaid.com" className="text-emerald-600 hover:underline">security@verixaid.com</a></p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 bg-slate-100 text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Verixa ID. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-slate-900">Terms of Service</Link>
            <Link href="/login" className="hover:text-slate-900">Sign In</Link>
            <Link href="/register" className="hover:text-slate-900">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
