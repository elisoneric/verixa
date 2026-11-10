import type { Metadata } from "next";
import Link from "next/link";
import { Logo, Badge, Button } from "@verixa/ui";
import { PublicHeader } from "@/components/public-header";

export const metadata: Metadata = {
  title: "BVN Verification API Nigeria | Instant CBN Validation",
  description:
    "Verify Nigerian Bank Verification Numbers (BVN) in real time starting from ₦100 on API. Biometric portrait retrieval, date of birth, and identity match via official gateways.",
  alternates: {
    canonical: "https://verixaid.com/bvn-verification-api",
  },
  openGraph: {
    title: "BVN Verification API Nigeria | Instant CBN Validation — Verixa ID",
    description:
      "Verify Nigerian BVNs in real time starting from ₦100 on API. Resolve full names, date of birth, telephone numbers, and portrait photographs instantly.",
    url: "https://verixaid.com/bvn-verification-api",
    siteName: "Verixa ID",
    images: [{ url: "/icon.svg", width: 1200, height: 630 }],
  },
};

export default function BvnVerificationPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How much does BVN verification cost on Verixa ID?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "BVN verification starts from ₦100 on API."
        }
      },
      {
        "@type": "Question",
        "name": "What details are returned from a BVN validation check?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A standard BVN validation returns the customer's verified full name (first name, middle name, surname), date of birth, registered telephone number, gender, and high-resolution biometric portrait."
        }
      },
      {
        "@type": "Question",
        "name": "Can I verify BVN with face biometric matching?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, Verixa ID provides an automated biometric selfie face-match endpoint (POST /api/v1/kyc/bvn/verify) that compares a live selfie image against the citizen's official BVN photo with an instant confidence score."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-800">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Top Header */}
      <PublicHeader />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-16 md:py-24 px-6 max-w-7xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>NIBSS / CBN Direct Gateway • Sub-15ms Smart Cache</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
            BVN Verification API for Nigerian Fintechs & Businesses
          </h1>
          <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Verify 11-digit Bank Verification Numbers with official biometric photo, full name, and date of birth. Starts from ₦100 on API.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link href="/register">
              <Button variant="emerald" size="lg" className="h-12 px-8 font-bold shadow-lg shadow-emerald-600/20">
                Start Verifying BVN Free &rarr;
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg" className="h-12 px-6 font-semibold">
                View Verification Rates
              </Button>
            </Link>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="py-16 px-6 max-w-7xl mx-auto border-t border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold">
                API
              </div>
              <h3 className="text-lg font-bold text-slate-900">Developer API Access</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                High-throughput REST API with 99.9% uptime. Starts from ₦100 on API with instant JSON response.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 font-bold">
                BVN
              </div>
              <h3 className="text-lg font-bold text-slate-900">Official BVN Validation</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Direct lookup resolving official citizen portrait, first name, middle name, surname, DOB, gender, and verified details.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 font-bold">
                1:1
              </div>
              <h3 className="text-lg font-bold text-slate-900">Biometric Face Match</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Compare user selfie photos against the official BVN database portrait with instant similarity score and anti-spoofing validation.
              </p>
            </div>
          </div>
        </section>

        {/* API Code Snippet Preview */}
        <section className="py-16 px-6 max-w-7xl mx-auto border-t border-slate-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <Badge variant="verified" size="sm">ENTERPRISE COMPLIANCE</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Secure & NDPR Compliant BVN Verification
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Encrypted in transit and at rest. Perfect for user onboarding, KYC compliance, loan disbursement, and fraud prevention.
              </p>
              <div className="pt-2">
                <a href="https://docs.verixaid.com/bvn" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold text-sm hover:underline">
                  Read the complete BVN API documentation &rarr;
                </a>
              </div>
            </div>

            <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl font-mono text-xs overflow-x-auto shadow-xl border border-slate-800">
              <p className="text-slate-400 mb-2"># Live cURL Example</p>
              <pre className="text-emerald-400">{`curl -X POST "https://api.verixaid.com/api/v1/kyc/bvn" \\
  -H "x-api-key: vx_live_secret..." \\
  -H "Content-Type: application/json" \\
  -d '{"bvn": "22604012847", "consent": true}'`}</pre>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-6 max-w-4xl mx-auto border-t border-slate-200 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Frequently Asked Questions</h2>
            <p className="text-sm text-slate-500">Everything you need to know about BVN verification in Nigeria.</p>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-base">How much does BVN verification cost on Verixa ID?</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                BVN verification starts from ₦100 on API.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-base">How can I top up my verification balance?</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                You can fund your prepaid balance anytime via Online Payment (instant card checkout) or transfer directly to your Dedicated Virtual Account (DVA). Deposits are credited automatically with instant email confirmation.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-base">What happens if an invalid BVN is queried?</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                If a BVN does not exist or fails validation, you are not charged full rate, and repeat queries are served instantly.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Verixa ID. Low-cost identity verification APIs Nigeria.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-900">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-900">Terms of Service</Link>
            <Link href="/pricing" className="hover:text-slate-900">Pricing</Link>
            <a href="https://docs.verixaid.com" className="hover:text-slate-900">Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

