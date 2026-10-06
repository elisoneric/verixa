import Link from "next/link";
import { Logo, AppLink, GlassyHeader } from "@verixa/ui";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col selection:bg-emerald-500/25 selection:text-emerald-300">
      {/* Sleek Glassy Floating Header */}
      <GlassyHeader
        logoBadge="LEGAL"
        logoBadgeColor="sky"
        navItems={[
          { label: "Overview", app: "www", path: "/" },
          { label: "Documentation", app: "docs", path: "/" },
          { label: "Privacy Policy", href: "/privacy" },
          { label: "Contact", href: "/contact" },
        ]}
        secondaryCta={{
          label: "Contact",
          href: "/contact",
        }}
        primaryCta={{
          label: "Get API Key",
          app: "dashboard",
          path: "/register",
        }}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-6 pt-28 pb-16 lg:pt-32 lg:pb-24">
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-8 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono mb-4">
            LEGAL AGREEMENT • B2B TERMS
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
            Terms of Service
          </h1>
          <p className="mt-4 text-slate-400 text-base leading-relaxed">
            Last Updated: August 24, 2026 • Effective Version 1.2
          </p>
        </div>

        {/* Terms Content */}
        <div className="space-y-12 text-slate-300 leading-relaxed text-sm sm:text-base">
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              1. Agreement to Terms
            </h2>
            <p>
              These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between your organization (&quot;Customer&quot;, &quot;Developer&quot;, &quot;you&quot;) and Verixa ID (&quot;Verixa&quot;, &quot;we&quot;, &quot;us&quot;) governing access to and use of the Verixa identity verification API platform, dashboard, documentation, and associated developer infrastructure.
            </p>
            <p>
              By creating an account, generating API keys, or integrating our endpoints, you acknowledge that you have read, understood, and agree to be bound by these Terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              2. Acceptable Use Policy & Compliance Warranties
            </h2>
            <p>
              You expressly warrant and agree that:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-300">
              <li>
                <strong>Lawful Consent:</strong> You shall obtain verifiable, informed consent from end-users before querying their Bank Verification Number (BVN), National Identification Number (NIN), or financial account details in accordance with applicable laws (including NDPA 2023).
              </li>
              <li>
                <strong>Prohibited Purposes:</strong> You shall not use Verixa ID for identity theft, unauthorized surveillance, data scraping, harassment, or financial fraud.
              </li>
              <li>
                <strong>API Security:</strong> You are solely responsible for maintaining the confidentiality of your Verixa API keys. You must never expose secret keys in client-side code (browsers or mobile binaries).
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              3. The NGX Credit System, Pricing & Billing
            </h2>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
              <h3 className="font-bold text-white text-lg">NGX Credit Architecture</h3>
              <p className="text-sm text-slate-300">
                To simplify billing and provide compliance safety, Verixa ID utilizes <strong>NGX API Credit Points</strong>:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm text-slate-400">
                <li><strong>1 NGX = 1 NGN:</strong> NGX points represent prepaid computational credits utilized for API queries.</li>
                <li><strong>Dedicated Virtual Account (DVA) Funding:</strong> Organizations can instantly fund their wallet by transferring NGN to their dedicated account powered by Paystack. Credits are allocated automatically via real-time webhooks.</li>
                <li><strong>Pre-Flight & Metered Deductions:</strong> Each verification call checks your balance atomically. <strong>If a verification fails or is invalid, your NGX credit balance is not charged.</strong></li>
                <li><strong>Rollover & Non-Refundability:</strong> Purchased NGX credits do not expire as long as your account remains active, but are non-refundable once purchased.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              4. Service Availability & Provider-Agnostic SLA
            </h2>
            <p>
              Verixa ID strives for a <strong>99.9% API uptime Service Level Agreement (SLA)</strong>. Our platform incorporates automatic failovers between certified identity verification providers to shield your business from individual upstream outages.
            </p>
            <p>
              However, scheduled maintenance, government registry downtime, or extreme telecommunication switch failures may occasionally impact latency.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              5. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by applicable law, Verixa ID and its affiliates shall not be liable for any indirect, punitive, incidental, or consequential damages resulting from lost revenue, business interruption, or upstream government database inaccuracies.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              6. Governing Law & Jurisdiction
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes arising under these Terms shall be resolved through binding commercial arbitration in Lagos, Nigeria.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              7. Legal Notices & Contact
            </h2>
            <p>
              For legal inquiries, contract amendments, or enterprise master service agreements (MSA), contact our legal department:
            </p>
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 space-y-2">
              <p className="font-semibold text-white">Verixa ID Legal & Compliance</p>
              <p className="text-sm text-slate-400">Email: <a href="mailto:legal@verixaid.com" className="text-emerald-400 hover:underline">legal@verixaid.com</a></p>
              <p className="text-sm text-slate-400">General Support: <a href="mailto:support@verixaid.com" className="text-emerald-400 hover:underline">support@verixaid.com</a></p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center sm:items-start gap-2">
            <Logo size="sm" />
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} Verixa ID. B2B Verification Infrastructure.
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-400 font-medium">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-emerald-400 font-medium">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
