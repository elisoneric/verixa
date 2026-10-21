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
  themeColor: "#ffffff",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_WWW_URL || "https://verixaid.com"),
  title: {
    default: "Verixa ID — Low-Cost NIN & BVN Verification APIs Nigeria",
    template: "%s | Verixa ID",
  },
  description:
    "Low-cost, high-reliability NIN & BVN verification APIs for Nigerian businesses. Instant automated NIN slip generation, free NUBAN bank account resolution, CAC company lookup, and sub-15ms Smart Cache from ₦38.",
  applicationName: "Verixa ID",
  keywords: [
    "NIN and BVN API",
    "NIN and BVN API low cost",
    "low cost NIN API Nigeria",
    "cheapest BVN verification API",
    "cheap NIN verification API Nigeria",
    "NIN verification API",
    "BVN validation API",
    "free NUBAN API Nigeria",
    "automated NIN slip generator",
    "KYC API Nigeria",
    "KYB business verification API",
    "Nigeria identity verification API",
    "Smart Identity Cache",
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
    title: "Verixa ID — Low-Cost NIN & BVN Verification APIs Nigeria",
    description:
      "Low-cost, high-reliability NIN & BVN verification APIs for Nigerian businesses. Free NUBAN bank resolution, instant NIN slips, and sub-15ms Smart Cache from ₦38.",
    images: [
      {
        url: "https://verixaid.com/icon.svg",
        width: 1200,
        height: 630,
        alt: "Verixa ID — Low-Cost NIN & BVN Verification APIs Nigeria",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Verixa ID — Low-Cost NIN & BVN Verification APIs Nigeria",
    description:
      "Low-cost NIN & BVN verification APIs with sub-15ms Smart Identity Cache and free NUBAN resolution.",
    creator: "@verixaid",
    images: ["https://verixaid.com/icon.svg"],
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
          "Verixa Nigeria"
        ],
        "description": "Low-Cost NIN, BVN & Identity Verification APIs for African Fintechs and Businesses",
        "publisher": {
          "@id": "https://verixaid.com/#organization"
        },
        "inLanguage": "en-US"
      },
      {
        "@type": "Organization",
        "@id": "https://verixaid.com/#organization",
        "name": "Verixa ID",
        "url": "https://verixaid.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://verixaid.com/icon.svg",
          "width": 64,
          "height": 64
        },
        "sameAs": [
          "https://twitter.com/verixaid",
          "https://github.com/elisoneric/verixa"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "email": "support@verixaid.com",
          "contactType": "customer service"
        }
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://verixaid.com/#software",
        "name": "Verixa ID API",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "All",
        "url": "https://verixaid.com",
        "description": "Low-cost NIN, BVN, CAC, and NUBAN bank account resolution APIs with sub-15ms Smart Identity Cache and automated provider failovers.",
        "offers": {
          "@type": "AggregateOffer",
          "priceCurrency": "NGN",
          "lowPrice": "0",
          "highPrice": "250",
          "offerCount": "10",
          "description": "Free NUBAN resolution. NIN verification from ₦38 with Smart Cache, BVN validation from ₦38, NIN slips ₦250."
        }
      }
    ]
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
        {children}
      </body>
    </html>
  );
}
