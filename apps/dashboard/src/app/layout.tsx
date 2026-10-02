import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../lib/auth-context";
import { ThemeProvider } from "../lib/theme-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Verixa — Identity Verification & Official NIN Slip Engine",
  description: "Enterprise identity, KYC verification, and official NIMC NIN slip engine for Nigerian businesses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-700 dark:selection:text-emerald-300">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
