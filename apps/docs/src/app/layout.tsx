import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Logo, AppLink, GlassyHeader } from "@verixa/ui";
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
        <GlassyHeader
          logoBadge="DOCS"
          logoBadgeColor="emerald"
          customCenter={
            <div className="flex items-center gap-1">
              <Link
                href="/"
                className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-white bg-white/[0.08] transition-colors"
              >
                API Reference
              </Link>
              <Link
                href="/environments"
                className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                Environments
              </Link>
              <Link
                href="/smart-cache"
                className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                Smart Cache
              </Link>
              <Link
                href="/airtime-data"
                className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                Airtime & Data
              </Link>
              <Link
                href="/roadmap"
                className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                Roadmap
              </Link>
            </div>
          }
          secondaryCta={{
            label: "Main Site",
            app: "www",
            path: "/",
          }}
          primaryCta={{
            label: "Get API Key",
            app: "dashboard",
            path: "/dashboard/api-keys",
          }}
        />

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
