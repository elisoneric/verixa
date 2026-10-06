import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Logo, AppLink } from "@verixa/ui";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Verixa ID Documentation — Developer API Reference",
  description: "Official integration guides, API schemas, and SDKs for BVN, NIN, and Bank Account verification.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sections = [
    {
      title: "GET STARTED",
      links: [
        { label: "Introduction", href: "/" },
        { label: "Authentication", href: "/authentication" },
        { label: "Environments", href: "/environments" },
      ],
    },
    {
      title: "VERIFICATION APIS",
      links: [
        { label: "BVN Verification", href: "/bvn" },
        { label: "NIN Verification", href: "/nin" },
        { label: "Phone Number Lookup", href: "/phone" },
        { label: "CAC Business Verification", href: "/cac" },
        { label: "NUBAN Resolve", href: "/nuban" },
        { label: "NUBAN KYC Status", href: "/nuban-kyc" },
        { label: "Upcoming APIs (Roadmap)", href: "/roadmap" },
      ],
    },
    {
      title: "VALUE-ADDED SERVICES",
      links: [
        { label: "SMS & WhatsApp Messaging", href: "/messaging" },
        { label: "Airtime & Mobile Data", href: "/airtime-data" },
      ],
    },
    {
      title: "PLATFORM GUIDES",
      links: [
        { label: "Billing & Payment API", href: "/billing-api" },
        { label: "Smart Identity Cache", href: "/smart-cache" },
        { label: "Redis Idempotency", href: "/idempotency" },
        { label: "Webhooks & Signatures", href: "/webhooks" },
        { label: "Rate Limits", href: "/rate-limits" },
        { label: "Error Taxonomy", href: "/errors" },
      ],
    },
  ];

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}>
      <body className="min-h-screen bg-[#09090b] text-zinc-100 font-sans flex flex-col selection:bg-emerald-500/25 selection:text-emerald-300">
        {/* Sleek Glassy Floating Header (docs.x.ai Parity) */}
        <header className="fixed inset-x-0 top-0 z-50 transition-colors">
          {/* Top Vignette Gradient */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-px h-24 bg-gradient-to-b from-black/80 via-black/40 to-transparent"
          />

          {/* Glass Shell */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/[0.08]"
          />

          <div className="relative mx-auto w-full px-4 sm:px-6 lg:px-8 max-w-7xl">
            <nav className="flex items-center justify-between gap-4 h-16">
              {/* Left Logo */}
              <div className="flex items-center gap-3 shrink-0">
                <Link href="/" className="inline-flex items-center focus-visible:outline-none">
                  <Logo size="md" badge="DOCS" badgeColor="emerald" />
                </Link>
              </div>

              {/* Center Segmented Selector (like docs.x.ai API / SDKs / Guides) */}
              <div className="hidden md:flex items-center gap-1">
                <Link
                  href="/"
                  className="rounded-full px-3 py-1.5 text-[13px] font-medium text-white bg-white/[0.08] transition-colors"
                >
                  API Reference
                </Link>
                <Link
                  href="/environments"
                  className="rounded-full px-3 py-1.5 text-[13px] font-medium text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  Environments
                </Link>
                <Link
                  href="/smart-cache"
                  className="rounded-full px-3 py-1.5 text-[13px] font-medium text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  Smart Cache
                </Link>
                <Link
                  href="/roadmap"
                  className="rounded-full px-3 py-1.5 text-[13px] font-medium text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  Roadmap
                </Link>
              </div>

              {/* Right Action Cluster */}
              <div className="flex items-center gap-2 sm:gap-3">
                <AppLink
                  app="www"
                  path="/"
                  className="hidden sm:inline-flex items-center justify-center rounded-full px-4 py-2 text-[13px] font-medium text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  Main Site
                </AppLink>

                <AppLink
                  app="dashboard"
                  path="/dashboard"
                  className="hidden sm:inline-flex items-center justify-center rounded-full px-4 py-2 text-[13px] font-medium text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all"
                >
                  Console
                </AppLink>

                <AppLink
                  app="dashboard"
                  path="/dashboard/api-keys"
                  className="inline-flex items-center justify-center rounded-full px-4 py-2 text-[13px] font-semibold bg-white hover:bg-zinc-200 text-zinc-950 transition-all shadow-sm"
                >
                  Get API Key
                </AppLink>
              </div>
            </nav>
          </div>
        </header>

        {/* Two-Panel Layout with Top Offset for Fixed Header */}
        <div className="pt-16 flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          {/* Left Navigation Sidebar */}
          <aside className="hidden md:block w-64 shrink-0 border-r border-white/[0.08] py-8 pr-6 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
            <nav className="space-y-6">
              {sections.map((sec) => (
                <div key={sec.title} className="space-y-1.5">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500 block px-2.5">
                    {sec.title}
                  </span>
                  <div className="space-y-0.5">
                    {sec.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block rounded-lg px-2.5 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </aside>

          {/* Main Documentation Body */}
          <main className="flex-1 min-w-0 py-8 md:px-10 lg:px-12 max-w-4xl">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
