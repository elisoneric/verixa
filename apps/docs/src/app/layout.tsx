import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import Link from "next/link";
import { DocsHeader } from "../components/docs-header";
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
  themeColor: "#ffffff",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_DOCS_URL || "https://docs.verixaid.com"),
  title: {
    default: "Verixa ID Docs — Low-Cost NIN, BVN & Identity API Reference",
    template: "%s | Verixa ID Docs",
  },
  description:
    "Official developer documentation, curl examples, and REST endpoints for low-cost NIN verification (₦125), BVN validation (₦95), automated NIN slips (₦250), free NUBAN resolution, and sub-15ms Smart Identity Cache (₦38).",
  applicationName: "Verixa ID Docs",
  keywords: [
    "NIN and BVN API",
    "NIN and BVN API low cost",
    "low cost NIN API Nigeria",
    "cheap BVN verification API Nigeria",
    "lowest cost identity API Nigeria",
    "NIN verification API reference",
    "BVN validation API docs",
    "free NUBAN API Nigeria",
    "automated NIN slip API",
    "KYC API Nigeria",
    "Smart Identity Cache documentation",
    "Verixa ID Docs",
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
    title: "Verixa ID Docs — Low-Cost NIN, BVN & Identity API Reference",
    description:
      "Official developer documentation and curl examples for low-cost NIN, BVN, CAC, and NUBAN APIs in Nigeria.",
    siteName: "Verixa ID Docs",
    images: [{ url: "https://docs.verixaid.com/icon.svg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Verixa ID Docs — Low-Cost NIN, BVN & Identity API Reference",
    description: "Explore low-cost endpoints for NIN, BVN, CAC, and NUBAN resolution.",
    creator: "@verixaid",
    images: ["https://docs.verixaid.com/icon.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://docs.verixaid.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Google Search Console Site Name & Breadcrumbs Schema
  const docsJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://docs.verixaid.com/#website",
        "url": "https://docs.verixaid.com",
        "name": "Verixa ID Docs",
        "alternateName": [
          "Verixa Documentation",
          "Verixa API Reference",
          "Verixa Docs"
        ],
        "description": "Developer Documentation & API Reference for Low-Cost NIN, BVN, CAC, and Banking APIs",
        "publisher": {
          "@type": "Organization",
          "name": "Verixa ID",
          "url": "https://verixaid.com",
          "logo": "https://verixaid.com/icon.svg"
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://docs.verixaid.com/#breadcrumbs",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Verixa ID",
            "item": "https://verixaid.com"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "API Documentation",
            "item": "https://docs.verixaid.com"
          }
        ]
      }
    ]
  };

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
        { label: "BVN Verification", href: "/bvn" },
        { label: "NIN Verification", href: "/nin" },
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
        { label: "Biometrics & AML Screening", href: "/biometrics-aml" },
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
    <html lang="en" className={`${inter.variable} ${outfit.variable} antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(docsJsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-emerald-500/20 selection:text-emerald-900">
        {/* Modern Docs Header with Back to Homepage */}
        <DocsHeader />

        {/* Two-Panel Layout with Top Offset for Fixed Header */}
        <div className="pt-16 flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          {/* Left Navigation Sidebar */}
          <aside className="hidden md:block w-64 shrink-0 border-r border-slate-200 py-8 pr-6 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
            <nav className="space-y-6">
              {sections.map((sec) => (
                <div key={sec.title} className="space-y-1.5">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 block px-2.5">
                    {sec.title}
                  </span>
                  <div className="space-y-0.5">
                    {sec.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block rounded-lg px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
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
