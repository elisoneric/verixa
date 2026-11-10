import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../lib/auth-context";
import { ThemeProvider } from "../lib/theme-context";

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
  themeColor: "#ffffff",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_DASHBOARD_URL || "https://verixaid.com"),
  verification: {
    google: "googlef8be8c2862597e1b",
  },
  title: {
    default: "Verixa ID — Low-Cost NIN & BVN Verification APIs Nigeria",
    template: "%s | Verixa ID",
  },
  description:
    "Low-cost, high-reliability NIN & BVN verification APIs for Nigerian businesses. Instant automated standard NIN slip and NIMC plastic card generation, and free NUBAN bank account resolution.",
  applicationName: "Verixa ID",
  keywords: [
    "NIN verification API Nigeria",
    "BVN verification API Nigeria",
    "NIN validation API",
    "BVN validation API",
    "automated NIN slip generator",
    "NIMC card download online",
    "NIMC premium card generator",
    "free NUBAN API Nigeria",
    "low cost KYC API Nigeria",
    "Verixa ID",
  ],
  icons: {
    icon: [
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    shortcut: "/favicon-48x48.png",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://verixaid.com",
    title: "Verixa ID — Low-Cost NIN & BVN Verification APIs Nigeria",
    description: "Low-cost, high-reliability NIN & BVN verification APIs and instant slip generation for Nigerian businesses.",
    siteName: "Verixa ID",
    images: [{ url: "/icon.svg", width: 1200, height: 630, alt: "Verixa ID" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Verixa ID — Low-Cost NIN & BVN Verification APIs Nigeria",
    description: "Low-cost NIN & BVN verification APIs and instant slip generation for Nigerian businesses.",
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
  // Schema.org Structured Data optimized for Google Search Console Site Names & Rich Results
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://verixaid.com/#website",
        "url": "https://verixaid.com",
        "name": "Verixa ID",
        "alternateName": [
          "Verixa",
          "Verixa Identity Platform",
          "Verixa API",
        ],
        "description": "Low-cost, high-reliability NIN & BVN verification APIs and instant slip generator for Nigerian businesses and developers.",
        "publisher": {
          "@type": "Organization",
          "name": "Verixa ID",
          "url": "https://verixaid.com",
          "logo": {
            "@type": "ImageObject",
            "url": "https://verixaid.com/icon.svg",
          },
        },
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://verixaid.com/#software",
        "name": "Verixa ID Verification API",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "All",
        "url": "https://verixaid.com",
        "offers": {
          "@type": "Offer",
          "price": "100.00",
          "priceCurrency": "NGN",
          "description": "Low-cost NIN and BVN identity verification APIs and instant slip generation.",
        },
      },
    ],
  };

  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500/20 selection:text-emerald-900">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
