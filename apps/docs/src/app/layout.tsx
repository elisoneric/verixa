import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import Link from "next/link";
import { Logo, AppLink, GlassyHeader } from "@verixa/ui";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#06070a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_DOCS_URL || "https://docs.verixaid.com"),
  title: {
    default: "Documentation & API Reference — Verixa ID",
    template: "%s | Verixa ID Docs",
  },
  description:
    "Comprehensive developer documentation, endpoint reference, curl examples, and architecture guides for BVN, NIN, CAC, NUBAN, and biometric verification APIs.",
  applicationName: "Verixa ID Docs",
  keywords: [
    "Verixa API documentation",
    "BVN API integration",
    "NIN API Nigeria",
    "NUBAN lookup docs",
    "KYC API reference",
    "Universal Identity API",
    "Smart Identity Cache documentation",
  ],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    shortcut: "/icon.svg",
    apple: [{ url: "/icon.svg", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    title: "Verixa ID Documentation — Developer API Reference",
    description:
      "Interactive endpoint documentation and implementation guides for African identity verification APIs.",
    siteName: "Verixa ID Docs",
    images: [{ url: "/icon.svg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Verixa ID Documentation & API Reference",
    description: "Explore 23+ endpoints for identity, KYB, and bank account resolution.",
    creator: "@verixaid",
    images: ["/icon.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
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
        { label: "Introduction & Overview", href: "/" },
        { label: "Authentication & Headers", href: "/authentication" },
        { label: "Environments & Base URLs", href: "/environments" },
      ],
    },
    {
      title: "KYC IDENTITY VERIFICATION",
      links: [
        { label: "BVN Verification (4 Tiers)", href: "/bvn" },
        { label: "NIN Verification (5 Tiers)", href: "/nin" },
        { label: "Phone Number Intelligence", href: "/phone" },
        { label: "Secondary Government IDs", href: "/government-ids" },
      ],
    },
    {
      title: "KYB CORPORATE VERIFICATION",
      links: [
        { label: "CAC Business & TIN", href: "/cac" },
      ],
    },
    {
      title: "BANKING & FINANCIAL",
      links: [
        { label: "Bank Account (NUBAN)", href: "/nuban" },
        { label: "NUBAN KYC Status", href: "/nuban-kyc" },
      ],
    },
    {
      title: "BIOMETRICS & RISK INTELLIGENCE",
      links: [
        { label: "Biometrics, AML & Credit", href: "/biometrics-aml" },
      ],
    },
    {
      title: "VALUE-ADDED SERVICES",
      links: [
        { label: "Airtime & Mobile Data VTU", href: "/airtime-data" },
        { label: "SMS & WhatsApp OTP", href: "/messaging" },
      ],
    },
    {
      title: "PLATFORM ARCHITECTURE",
      links: [
        { label: "Smart Identity Cache", href: "/smart-cache" },
        { label: "Wallet Balance API", href: "/balance" },
        { label: "Billing & Credits", href: "/billing-api" },
        { label: "Redis Idempotency", href: "/idempotency" },
        { label: "Webhooks & Signatures", href: "/webhooks" },
        { label: "Rate Limits", href: "/rate-limits" },
        { label: "Error Reference", href: "/errors" },
        { label: "Upcoming Roadmap", href: "/roadmap" },
      ],
    },
  ];

  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} antialiased dark`}>
      <body className="min-h-screen bg-[#06070a] text-zinc-100 font-sans flex flex-col selection:bg-emerald-500/25 selection:text-emerald-300">
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
