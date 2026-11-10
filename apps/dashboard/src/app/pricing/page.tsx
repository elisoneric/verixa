import type { Metadata } from "next";
import Link from "next/link";
import { Logo, Badge, Button } from "@verixa/ui";
import { PublicHeader } from "@/components/public-header";

export const metadata: Metadata = {
  title: "Identity Verification Pricing Nigeria | Transparent Rates — Verixa ID",
  description:
    "Lowest identity verification pricing in Nigeria. NIN verification starts from ₦120 on API, BVN validation starts from ₦100 on API, Standard NIN Slip starts from ₦250, and 100% free NUBAN resolution.",
  alternates: {
    canonical: "https://verixaid.com/pricing",
  },
  openGraph: {
    title: "Identity Verification Pricing Nigeria | Transparent Rates — Verixa ID",
    description:
      "Lowest identity verification rates in Nigeria. NIN starts from ₦120 on API, BVN starts from ₦100 on API, slips from ₦250, free NUBAN resolution, and zero monthly maintenance fees.",
    url: "https://verixaid.com/pricing",
    siteName: "Verixa ID",
    images: [{ url: "/icon.svg", width: 1200, height: 630 }],
  },
};

export default function PricingPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Are there any setup fees or monthly subscription charges?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. Verixa ID operates on a transparent pay-as-you-go model. There are zero setup fees, zero monthly maintenance charges, and no minimum monthly spend."
        }
      },
      {
        "@type": "Question",
        "name": "How does the Smart Identity Cache pricing work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "When you verify a NIN or BVN, you get instant real-time resolution with sub-15ms cached responses and transparent pay-as-you-go billing."
        }
      },
      {
        "@type": "Question",
        "name": "How can I deposit funds into my verification wallet?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can fund your wallet via Online Payment (card or USSD checkout) or send a direct bank transfer to your Dedicated Virtual Account (DVA). Deposits are credited automatically within seconds, and an email confirmation is sent immediately."
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
            <span>Zero Setup Fees • Zero Monthly Maintenance • Pay As You Go</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
            Transparent Pricing Built for Nigerian Scale
          </h1>
          <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Transparent, low-cost verification rates with zero subscription lock-in. Scale your customer onboarding effortlessly.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link href="/register">
              <Button variant="emerald" size="lg" className="h-12 px-8 font-bold shadow-lg shadow-emerald-600/20">
                Create Free Account &rarr;
              </Button>
            </Link>
            <a href="https://docs.verixaid.com" target="_blank" rel="noreferrer">
              <Button variant="outline" size="lg" className="h-12 px-6 font-semibold">
                Explore Documentation
              </Button>
            </a>
          </div>
        </section>

        {/* Pricing Comparison Table */}
        <section className="py-16 px-6 max-w-5xl mx-auto border-t border-slate-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Per-Verification Rate Schedule</h3>
                <p className="text-xs text-slate-500">Transparent rates with volume discounts for API developers</p>
              </div>
              <Badge variant="verified" size="sm">TRANSPARENT BILLING</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/70">
                    <th className="py-3.5 px-6">Verification Service</th>
                    <th className="py-3.5 px-6">API Rate</th>
                    <th className="py-3.5 px-6">UI Console Rate</th>
                    <th className="py-3.5 px-6">Industry Competitors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-xs">
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-4 px-6 font-sans font-semibold text-slate-900 text-sm">NIN Verification API</td>
                    <td className="py-4 px-6 font-bold text-emerald-700 bg-emerald-50/40">Starts from ₦120 on API</td>
                    <td className="py-4 px-6 text-slate-900 font-sans font-medium">₦150 / query</td>
                    <td className="py-4 px-6 text-slate-400 line-through">₦150 – ₦250</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-4 px-6 font-sans font-semibold text-slate-900 text-sm">BVN Validation API</td>
                    <td className="py-4 px-6 font-bold text-emerald-700 bg-emerald-50/40">Starts from ₦100 on API</td>
                    <td className="py-4 px-6 text-slate-900 font-sans font-medium">₦120 / query</td>
                    <td className="py-4 px-6 text-slate-400 line-through">₦150 – ₦200</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-4 px-6 font-sans font-semibold text-slate-900 text-sm">Standard NIN Slip (A4 Printable PDF)</td>
                    <td className="py-4 px-6 font-bold text-sky-700 bg-sky-50/40">Starts from ₦250 for NIN Slip</td>
                    <td className="py-4 px-6 text-slate-900 font-sans font-medium">₦250 / slip</td>
                    <td className="py-4 px-6 text-slate-400 line-through">₦350 – ₦500</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-4 px-6 font-sans font-semibold text-slate-900 text-sm">NIMC Card (ID-1 Digital Card)</td>
                    <td className="py-4 px-6 font-bold text-sky-700 bg-sky-50/40">₦300 / card</td>
                    <td className="py-4 px-6 text-slate-900 font-sans font-medium">₦300 / card</td>
                    <td className="py-4 px-6 text-slate-400 line-through">₦500 – ₦1,000</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-4 px-6 font-sans font-semibold text-slate-900 text-sm">NIMC Card Premium (Plastic Image + A4 Sheet)</td>
                    <td className="py-4 px-6 font-bold text-purple-700 bg-purple-50/40">₦120 on API</td>
                    <td className="py-4 px-6 text-slate-900 font-sans font-medium">₦350 / card</td>
                    <td className="py-4 px-6 text-slate-400 line-through">₦800 – ₦1,500</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-4 px-6 font-sans font-semibold text-slate-900 text-sm">NUBAN Bank Account Resolution</td>
                    <td className="py-4 px-6 font-bold text-emerald-700 bg-emerald-50/40">100% Free (₦0)</td>
                    <td className="py-4 px-6 text-emerald-700 font-bold">100% Free (₦0)</td>
                    <td className="py-4 px-6 text-slate-400 line-through">₦10 – ₦25</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Payment & Funding Methods */}
        <section className="py-16 px-6 max-w-5xl mx-auto border-t border-slate-200">
          <div className="text-center space-y-2 mb-12">
            <Badge variant="verified" size="sm">FLEXIBLE WALLET FUNDING</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Two Easy Ways to Fund Your Balance</h2>
            <p className="text-sm text-slate-500">Deposit credits on demand with instant automated crediting.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold">
                💳
              </div>
              <h3 className="text-lg font-bold text-slate-900">Online Payment</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Pay instantly with your debit card, Apple Pay, or USSD checkout. Funds credit to your live verification balance in real time.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 font-bold">
                🏦
              </div>
              <h3 className="text-lg font-bold text-slate-900">Dedicated Virtual Account (DVA)</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Every organization is provisioned a dedicated bank transfer account. Simply send money from any Nigerian banking app — your balance credits automatically within seconds and you receive an instant email notification.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-6 max-w-4xl mx-auto border-t border-slate-200 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Frequently Asked Questions</h2>
            <p className="text-sm text-slate-500">Everything you need to know about billing and pricing.</p>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-base">Is there any minimum deposit?</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                The minimum deposit is just ₦1,000, allowing businesses of all sizes to start verifying identity records without capital lock-in.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-base">Do credits expire?</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                No! Deposited credits never expire. They remain securely in your wallet until you use them for verification or document generation.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-base">How does automated DVA deposit pickup work?</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                When you transfer funds to your Dedicated Virtual Account from any banking app (OPay, Moniepoint, GTBank, etc.), our system receives an instant webhook, validates the deposit, tops up your balance, and sends a transaction confirmation receipt to your registered email.
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
            <Link href="/pricing" className="hover:text-slate-900 font-bold text-slate-900">Pricing</Link>
            <a href="https://docs.verixaid.com" className="hover:text-slate-900">Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

