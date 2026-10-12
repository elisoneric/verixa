import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#06070a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_WWW_URL || "https://verixaid.com"),
  title: {
    default: "Verixa ID — High-Throughput Identity & Financial Verification Infrastructure",
    template: "%s | Verixa ID",
  },
  description:
    "Enterprise verification APIs for BVN, NIN, CAC Company Lookup, and Bank Accounts (NUBAN) with automated provider failovers, sub-15ms Smart Identity Caching, and instant developer onboarding.",
  applicationName: "Verixa ID",
  keywords: [
    "BVN verification API",
    "NIN verification API Nigeria",
    "NUBAN bank account validation",
    "CAC business search API",
    "KYC API Nigeria",
    "KYB API Africa",
    "Smart Identity Cache",
    "Dojah alternative",
    "NIMC slip generation",
    "Identity infrastructure",
    "Fintech onboarding Africa",
    "Verixa ID",
  ],
  authors: [{ name: "Verixa Infrastructure Team", url: "https://verixaid.com" }],
  creator: "Verixa ID",
  publisher: "Verixa ID",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    shortcut: "/icon.svg",
    apple: [{ url: "/icon.svg", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://verixaid.com",
    siteName: "Verixa ID",
    title: "Verixa ID — High-Throughput Identity & Financial Verification Infrastructure",
    description:
      "Verify BVN, NIN, CAC, and bank accounts in real time with sub-15ms Smart Identity Caching and automated provider failover. Built for African fintechs and high-growth enterprises.",
    images: [
      {
        url: "/icon.svg",
        width: 1200,
        height: 630,
        alt: "Verixa ID Verification Infrastructure",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Verixa ID — High-Throughput Identity & Financial Verification Infrastructure",
    description:
      "Verify BVN, NIN, CAC, and bank accounts with sub-15ms Smart Identity Caching and automated failover.",
    creator: "@verixaid",
    images: ["/icon.svg"],
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
    canonical: "https://verixaid.com",
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Verixa ID",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "url": "https://verixaid.com",
    "description":
      "Enterprise verification APIs for BVN, NIN, CAC Company Lookup, and Bank Accounts (NUBAN) with automated provider failovers and sub-15ms Smart Identity Caching.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "NGN",
      "description": "Bank account resolution is 100% free with metered rates for identity lookups.",
    },
    "provider": {
      "@type": "Organization",
      "name": "Verixa ID",
      "url": "https://verixaid.com",
      "logo": "https://verixaid.com/icon.svg",
      "sameAs": ["https://twitter.com/verixaid"],
    },
  };

  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased dark`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#06070a] text-zinc-100 font-sans selection:bg-emerald-500/25 selection:text-emerald-300">
        {children}
      </body>
    </html>
  );
}
