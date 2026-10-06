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
      <body className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
        {/* Header */}
        <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
          <div className="flex h-16 items-center px-6 sm:px-8 max-w-7xl mx-auto w-full justify-between">
            <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
              <Logo size="md" badge="DOCS" badgeColor="sky" />
            </Link>

            <div className="flex items-center space-x-4 text-xs font-medium">
              <AppLink
                app="dashboard"
                className="text-zinc-400 hover:text-white transition-colors"
              >
                Dashboard
              </AppLink>
              <AppLink
                app="dashboard"
                path="/dashboard/api-keys"
                className="rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-3.5 py-1.5 transition-colors shadow-sm"
              >
                Get API Key
              </AppLink>
            </div>
          </div>
        </header>

        {/* Two-Panel Layout */}
        <div className="flex-1 flex max-w-7xl mx-auto w-full px-6 sm:px-8">
          {/* Left Navigation Sidebar */}
          <aside className="hidden md:block w-60 shrink-0 border-r border-zinc-800/80 py-8 pr-6 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
            <nav className="space-y-6">
              {sections.map((sec) => (
                <div key={sec.title} className="space-y-1.5">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500">
                    {sec.title}
                  </span>
                  <div className="space-y-1">
                    {sec.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block rounded-lg px-2.5 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-zinc-900/60 transition-colors"
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
