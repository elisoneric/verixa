import type { Metadata } from "next";
import Link from "next/link";
import { Logo, Badge, Button } from "@verixa/ui";

export const metadata: Metadata = {
  title: "NIN Verification API Nigeria | Instant NIMC Validation",
  description:
    "Verify Nigerian National Identification Numbers (NIN) in real time with sub-15ms Smart Cache from ₦38. Fast biometric portrait match, full name, and address resolution via NIMC gateway.",
  alternates: {
    canonical: "https://verixaid.com/nin-verification-api",
  },
  openGraph: {
    title: "NIN Verification API Nigeria | Instant NIMC Validation — Verixa ID",
    description:
      "Verify Nigerian NINs with sub-15ms Smart Cache from ₦38. Resolve verified portraits, names, and residential addresses via official NIMC gateways.",
    url: "https://verixaid.com/nin-verification-api",
    siteName: "Verixa ID",
    images: [{ url: "/icon.svg", width: 1200, height: 630 }],
  },
};

export default function NinVerificationPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How much does NIN verification cost on Verixa ID?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Verixa ID offers NIN lookups starting from ₦38 for cached records and ₦60 for basic live NIMC verification, significantly lower than the standard industry rate of ₦120+."
        }
      },
      {
        "@type": "Question",
        "name": "What data is returned from a Nigerian NIN verification check?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Depending on the verification tier, you receive verified full name, date of birth, gender, telephone number, residential address, state/LGA of origin, and high-resolution citizen portrait photograph."
        }
      },
      {
        "@type": "Question",
        "name": "How fast is the Verixa NIN Verification API?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "With the Verixa Smart Identity Cache, repeat queries resolve in under 15ms. Live primary gateway lookups complete in an average of 400ms to 800ms."
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
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <Logo size="md" />
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link href="/nin-verification-api" className="text-emerald-700 font-bold">NIN API</Link>
            <Link href="/bvn-verification-api" className="hover:text-slate-900 transition-colors">BVN API</Link>
            <Link href="/nin-slip-generator" className="hover:text-slate-900 transition-colors">Slip Generator</Link>
            <Link href="/pricing" className="hover:text-slate-900 transition-colors">Pricing</Link>
            <a href="https://docs.verixaid.com" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">Docs</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" size="sm" className="font-semibold h-9 px-4">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button variant="emerald" size="sm" className="font-semibold h-9 px-4">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-16 md:py-24 px-6 max-w-7xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>NIMC Direct Gateway • Sub-15ms Smart Cache</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
            NIN Verification API for Nigerian Businesses & Developers
          </h1>
          <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Verify 11-digit National Identification Numbers instantly. Resolve portraits, full names, dates of birth, and addresses from just <strong className="text-slate-900">₦38 per check</strong>.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link href="/register">
              <Button variant="emerald" size="lg" className="h-12 px-8 font-bold shadow-lg shadow-emerald-600/20">
                Start Verifying NIN Free &rarr;
              </Button>
            </Link>
            <Link href="/nin-slip-generator">
              <Button variant="outline" size="lg" className="h-12 px-6 font-semibold">
                Generate Official NIN Slips
              </Button>
            </Link>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="py-16 px-6 max-w-7xl mx-auto border-t border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold">
                ₦38
              </div>
              <h3 className="text-lg font-bold text-slate-900">Cached NIN Lookup</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Repeat verifications are served from our distributed Smart Cache at ₦38 with sub-15ms latency, saving you up to 68% on verification costs.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 font-bold">
                ₦60
              </div>
              <h3 className="text-lg font-bold text-slate-900">Live NIMC Basic</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Direct lookup resolving official citizen portrait, surname, given names, date of birth, gender, and telephone number.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold">
                ₦85
              </div>
              <h3 className="text-lg font-bold text-slate-900">NIN Advance</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Comprehensive KYC record returning full street residence address, LGA, state of origin, tracking ID, and next-of-kin records.
              </p>
            </div>
          </div>
        </section>

        {/* API Code Snippet Preview */}
        <section className="py-16 px-6 max-w-7xl mx-auto border-t border-slate-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <Badge variant="verified" size="sm">DEVELOPER FRIENDLY</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Integrate NIN Verification in 3 Lines of Code
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Standard REST JSON interface with instant API key authentication, sandbox test records, and comprehensive SDK documentation.
              </p>
              <div className="pt-2">
                <a href="https://docs.verixaid.com/nin" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold text-sm hover:underline">
                  Read the complete NIN API documentation &rarr;
                </a>
              </div>
            </div>

            <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl font-mono text-xs overflow-x-auto shadow-xl border border-slate-800">
              <p className="text-slate-400 mb-2"># Live cURL Example</p>
              <pre className="text-emerald-400">{`curl -X POST "https://api.verixaid.com/api/v1/kyc/nin" \\
  -H "Authorization: Bearer vx_live_secret..." \\
  -H "Content-Type: application/json" \\
  -d '{"nin": "30882411172"}'`}</pre>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-6 max-w-4xl mx-auto border-t border-slate-200 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Frequently Asked Questions</h2>
            <p className="text-sm text-slate-500">Everything you need to know about NIN verification in Nigeria.</p>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-base">How much does NIN verification cost on Verixa ID?</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Cached checks start from ₦38. Live NIMC basic verification is ₦60, and advance verification with full address is ₦85.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-base">How do I fund my verification wallet?</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                You can choose between Online Payment (card/USSD checkout) or transfer directly to your Dedicated Virtual Account (DVA). Deposits are credited automatically within seconds, and an email receipt is sent instantly.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-base">Is Verixa ID NDPR compliant?</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Yes. All identity lookups are encrypted in transit with TLS 1.3 and at rest with AES-256-GCM in strict compliance with the Nigeria Data Protection Act (NDPA 2023).
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
