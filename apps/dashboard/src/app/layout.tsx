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
  themeColor: "#06070a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_DASHBOARD_URL || "https://verixaid.com"),
  title: {
    default: "Developer Console — Verixa ID",
    template: "%s | Verixa ID Console",
  },
  description:
    "Developer console for API keys, Paystack DVA wallet management, verification transaction logs, interactive API explorer, and automated NIN dual-slip generation.",
  applicationName: "Verixa ID Console",
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
    title: "Verixa ID Developer Console",
    description: "Manage API keys, inspect identity lookup audit trails, and top up prepaid verification credits.",
    siteName: "Verixa ID",
    images: [{ url: "/icon.svg", width: 1200, height: 630 }],
  },
  robots: {
    index: false, // Internal console pages should not be indexed by search spiders for privacy
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#06070a] text-zinc-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
