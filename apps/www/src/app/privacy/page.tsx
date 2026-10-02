import Link from "next/link";
import { Logo, AppLink } from "@verixa/ui";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Background Gradient Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-emerald-600/15 via-sky-600/10 to-transparent blur-3xl opacity-50 rounded-full" />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <Logo size="md" />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <Link href="/" className="hover:text-slate-100 transition-colors">Overview</Link>
            <AppLink app="docs" className="hover:text-slate-100 transition-colors">Documentation</AppLink>
            <Link href="/terms" className="hover:text-slate-100 transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-slate-100 transition-colors">Contact</Link>
          </nav>

          <div className="flex items-center gap-3">
            <AppLink
              app="dashboard"
              path="/login"
              className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 transition-colors"
            >
              Sign In
            </AppLink>
            <AppLink
              app="dashboard"
              path="/dashboard/api-keys"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm px-4 py-2 transition-all shadow-lg shadow-emerald-500/20"
            >
              Get API Keys
            </AppLink>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 lg:py-24">
        {/* Header Header Info */}
        <div className="border-b border-slate-800 pb-8 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-4">
            COMPLIANCE • NDPA / NDPR
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
            Privacy Policy
          </h1>
          <p className="mt-4 text-slate-400 text-base leading-relaxed">
            Last Updated: August 24, 2026 • Effective Version 1.2
          </p>
        </div>

        {/* Policy Body */}
        <div className="space-y-12 text-slate-300 leading-relaxed text-sm sm:text-base">
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              1. Overview & Commitment to Data Protection
            </h2>
            <p>
              Verixa ID (&quot;Verixa&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) provides business-to-business (B2B) identity, financial verification, and developer API aggregation infrastructure. We take data privacy and security with the utmost seriousness.
            </p>
            <p>
              This Privacy Policy explains how personal and corporate data is collected, processed, encrypted, and safeguarded when businesses (&quot;Customers&quot;, &quot;Developers&quot;) access our APIs, websites (<code className="text-emerald-400 font-mono text-xs">verixaid.com</code>), and management portals.
            </p>
            <p>
              Our operations adhere to the <strong>Nigeria Data Protection Act (NDPA 2023)</strong>, the <strong>Nigeria Data Protection Regulation (NDPR)</strong>, and international data protection standards.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              2. Data Controller vs. Data Processor Role
            </h2>
            <p>
              Under applicable data protection frameworks:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-300">
              <li>
                <strong>You (Our Customer/Client)</strong> act as the <strong>Data Controller</strong> for end-user identity queries submitted via our verification APIs (such as BVN, NIN, and bank account numbers of your users). You are responsible for ensuring lawful consent is obtained from end-users before verification.
              </li>
              <li>
                <strong>Verixa ID</strong> operates strictly as a <strong>Data Processor</strong> on your behalf, transmitting requests securely to authorized government identity repositories and certified verification providers.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              3. Information We Collect & Process
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 my-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <h3 className="font-bold text-white text-base mb-2">A. Customer Account Data</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Corporate email addresses, business name, authorized administrator contact information, hashed credentials, and billing records for purchasing NGX API credits.
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <h3 className="font-bold text-white text-base mb-2">B. Verification API Payloads</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Bank Verification Numbers (BVN), National Identification Numbers (NIN), Nigerian Uniform Bank Account Numbers (NUBAN), and full names submitted for verification.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              4. Security Architecture & Encryption
            </h2>
            <p>
              Security is the cornerstone of the Verixa ID architecture:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-300">
              <li>
                <strong>Zero Upstream Credential Exposure:</strong> Customers never receive direct credentials to upstream databases. All provider keys are securely stored server-side.
              </li>
              <li>
                <strong>Cryptographic Key Hashing:</strong> Customer API keys are cryptographically generated and salted using industry-grade bcrypt hashing. Raw secrets cannot be retrieved from our database.
              </li>
              <li>
                <strong>Encryption In-Transit & At-Rest:</strong> All API communication is strictly enforced via TLS 1.3 encryption. Internal database stores utilize AES-256 encryption at rest.
              </li>
              <li>
                <strong>Idempotency & Double-Charge Protection:</strong> Verification requests utilize an encrypted Redis cache to prevent duplicate transactions and accidental replay attacks.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              5. Third-Party Upstream Providers & Disclosures
            </h2>
            <p>
              To complete identity and financial verifications, Verixa ID securely routes requests through authorized identity verification partners (e.g., licensed providers and certified payment switches such as Paystack for dedicated virtual account funding).
            </p>
            <p>
              We do not sell, rent, or trade personal information to any third parties for marketing or advertising purposes.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              6. Data Subject Rights
            </h2>
            <p>
              Pursuant to the Nigeria Data Protection Act (NDPA), individuals whose information is processed through our platform hold rights to request access, rectification, or erasure of their personal data, exercisable through the respective Data Controller (our Customer) or by reaching our Data Protection team.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              7. Contact & Data Protection Officer
            </h2>
            <p>
              If you have any questions regarding this Privacy Policy, compliance audits, or data rights, please contact our Data Protection Officer:
            </p>
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 space-y-2">
              <p className="font-semibold text-white">Verixa ID Data Privacy Team</p>
              <p className="text-sm text-slate-400">Email: <a href="mailto:privacy@verixaid.com" className="text-emerald-400 hover:underline">privacy@verixaid.com</a> / <a href="mailto:dpo@verixaid.com" className="text-emerald-400 hover:underline">dpo@verixaid.com</a></p>
              <p className="text-sm text-slate-400">Security Inquiries: <a href="mailto:security@verixaid.com" className="text-emerald-400 hover:underline">security@verixaid.com</a></p>
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
            <Link href="/privacy" className="text-emerald-400 font-medium">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
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
