import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Verixa ID — B2B Identity & Financial Verification Infrastructure",
  description: "Enterprise verification APIs for BVN, NIN, and Bank Accounts (NUBAN) with 99.9% uptime, automated multi-provider failovers, and instant prepaid NGX credits.",
  keywords: ["BVN verification API", "NIN verification", "NUBAN bank account check", "KYC Nigeria", "Identity infrastructure Africa", "Verixa ID"],
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
      <body className="min-h-full flex flex-col bg-[#06070a] text-zinc-100 font-sans selection:bg-emerald-500/25 selection:text-emerald-300">
        {children}
      </body>
    </html>
  );
}
