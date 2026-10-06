import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#09090b] text-zinc-100 font-sans selection:bg-emerald-500/25 selection:text-emerald-300">
        {children}
      </body>
    </html>
  );
}
