import type { Metadata } from "next";
import Link from "next/link";
import { Logo, Badge, Button } from "@verixa/ui";

export const metadata: Metadata = {
  title: "NIN Slip Generator & NIMC Card Download | Verixa ID",
  description:
    "Generate and download official Nigerian Standard NIN Slips and NIMC Premium Plastic Cards online. Instant vector PDF generation, clean print-ready A4 layouts, and sub-100ms processing.",
  alternates: {
    canonical: "https://verixaid.com/nin-slip-generator",
  },
  openGraph: {
    title: "NIN Slip Generator & NIMC Card Download | Verixa ID",
    description:
      "Generate and download official Nigerian Standard NIN Slips and NIMC Premium Plastic Cards online with instant vector PDF generation.",
    url: "https://verixaid.com/nin-slip-generator",
    siteName: "Verixa ID",
    images: [{ url: "/icon.svg", width: 1200, height: 630 }],
  },
};

export default function NinSlipGeneratorPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What NIN slip formats can I generate on Verixa ID?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Verixa ID generates three official document tiers: 1) Standard NIN Slip (Full residential address, A4 printable PDF), 2) NIMC Card (Authentic ID-1 card document), and 3) NIMC Card Premium (Synthesized plastic card with authentic OCR-B typography and printable A4 overlay)."
        }
      },
      {
        "@type": "Question",
        "name": "How much does it cost to generate a NIN slip or card?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Standard NIN Slips are ₦250, NIMC Cards are ₦300, and NIMC Card Premium is ₦350 on the web dashboard (or ₦120 programmatically via API). Regenerating an already cached document is discounted to just ₦50."
        }
      },
      {
        "@type": "Question",
        "name": "How long does document generation take?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Document synthesis is ultra-fast. Cached slips generate in under 100 milliseconds, and live lookups complete in 2 to 3 seconds with immediate vector PDF download."
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
            <Link href="/nin-verification-api" className="hover:text-slate-900 transition-colors">NIN API</Link>
            <Link href="/bvn-verification-api" className="hover:text-slate-900 transition-colors">BVN API</Link>
            <Link href="/nin-slip-generator" className="text-emerald-700 font-bold">Slip Generator</Link>
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
            <span>Instant Vector PDF • Print-Ready Documents</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
            Automated NIN Slip Generator & NIMC Card Download
          </h1>
          <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Generate official Standard NIN Slips, NIMC Cards, and Premium Plastic Cards instantly. Clean vector layouts, high-res photos, and instant PDF download. Starts from ₦250 for NIN Slip.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link href="/register">
              <Button variant="emerald" size="lg" className="h-12 px-8 font-bold shadow-lg shadow-emerald-600/20">
                Generate Slip Now &rarr;
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg" className="h-12 px-6 font-semibold">
                View Slip Pricing
              </Button>
            </Link>
          </div>
        </section>

        {/* 3 Slip Formats Showcase */}
        <section className="py-16 px-6 max-w-7xl mx-auto border-t border-slate-200">
          <div className="text-center space-y-2 mb-12">
            <Badge variant="verified" size="sm">OFFICIAL FORMATS</Badge>
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-900">Choose Your Document Format</h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              Select between standard A4 government slips or ID-1 wallet cards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Format 1: Premium Plastic Card */}
            <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-sm space-y-4 relative">
              <div className="absolute top-4 right-4">
                <Badge variant="verified" size="sm">POPULAR</Badge>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold">
                ₦350
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">NIMC Card Premium</h3>
                <p className="text-xs font-mono text-emerald-700 font-semibold">UI ₦350 • API ₦120</p>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Modern plastic wallet card with authentic OCR-B 10 BT vector typography, 4 background security watermarks, and printable A4 folding template.
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-1.5">✓ Native TrueType vector typography</li>
                <li className="flex items-center gap-1.5">✓ 4-3-4 spaced 11-digit NIN</li>
                <li className="flex items-center gap-1.5">✓ Printable A4 cutting template</li>
              </ul>
            </div>

            {/* Format 2: Authentic NIMC Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 font-bold">
                ₦300
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">NIMC Card</h3>
                <p className="text-xs font-mono text-sky-700 font-semibold">₦300 / card</p>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Authentic official digital identity card document resolved directly via primary registry with verified portrait and citizen credentials.
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-1.5">✓ Official ID-1 card dimensions</li>
                <li className="flex items-center gap-1.5">✓ Primary registry resolution</li>
                <li className="flex items-center gap-1.5">✓ Instant high-res PDF</li>
              </ul>
            </div>

            {/* Format 3: Standard NIN Slip */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold">
                ₦250
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Standard NIN Slip</h3>
                <p className="text-xs font-mono text-slate-600 font-semibold">Starts from ₦250 for NIN Slip</p>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Official standard government A4 paper slip with complete residential street address, LGA, state of origin, tracking ID, and citizen portrait.
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-1.5">✓ Full residential street address</li>
                <li className="flex items-center gap-1.5">✓ State & LGA of origin</li>
                <li className="flex items-center gap-1.5">✓ Standard government A4 layout</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Instant Slip Generation Workflow */}
        <section className="py-16 px-6 max-w-7xl mx-auto border-t border-slate-200">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">How It Works in 3 Simple Steps</h2>
            <p className="text-sm text-slate-500">From NIN to official downloadable PDF in under 5 seconds.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <span className="text-3xl font-extrabold text-emerald-600 font-mono">01</span>
              <h4 className="font-bold text-slate-900 text-base">Select Document Tier</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Choose between Standard NIN Slip (with full address), NIMC Card, or NIMC Card Premium from the dropdown.
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-3xl font-extrabold text-emerald-600 font-mono">02</span>
              <h4 className="font-bold text-slate-900 text-base">Enter 11-digit NIN</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Input the citizen's National Identification Number. The system instantly verifies credentials against official gateways.
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-3xl font-extrabold text-emerald-600 font-mono">03</span>
              <h4 className="font-bold text-slate-900 text-base">Download Vector PDF</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Review the instant zero-lag preview and click Download PDF for your print-ready official document.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-6 max-w-4xl mx-auto border-t border-slate-200 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Frequently Asked Questions</h2>
            <p className="text-sm text-slate-500">Everything you need to know about generating NIN slips and cards.</p>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-base">Can I regenerate a previously generated slip?</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Yes! Any document previously verified in your organization can be regenerated and downloaded on-demand from your audit history at a discounted rate of just ₦50.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-base">How do I fund my account for generating slips?</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                You can fund your wallet via Online Payment (card checkout) or send a transfer to your Dedicated Virtual Account (DVA). Deposits are credited automatically with instant email confirmation.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-base">Can developers automate slip generation via API?</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Yes! Developers can programmatically generate slips and cards via POST /api/slips/nin or GET /api/v1/kyc/nin/premium, returning vector PDFs or base64 raster images.
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

