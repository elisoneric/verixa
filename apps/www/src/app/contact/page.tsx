"use client"

import * as React from "react";
import Link from "next/link";
import { Button, Input, Logo, AppLink } from "@verixa/ui";

export default function ContactPage() {
  const [submitted, setSubmitted] = React.useState(false);
  const [formData, setFormData] = React.useState({
    fullName: "",
    workEmail: "",
    companyName: "",
    topic: "Technical Support",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Ambient Gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-emerald-600/15 via-teal-600/10 to-transparent blur-3xl opacity-50 rounded-full" />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <Logo size="md" />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <Link href="/" className="hover:text-slate-100 transition-colors">Overview</Link>
            <AppLink app="docs" className="hover:text-slate-100 transition-colors">Documentation</AppLink>
            <Link href="/privacy" className="hover:text-slate-100 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-100 transition-colors">Terms of Service</Link>
          </nav>

          <div className="flex items-center gap-3">
            <AppLink
              app="dashboard"
              path="/login"
              className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 transition-colors"
            >
              Sign In
            </AppLink>
            <AppLink
              app="dashboard"
              path="/dashboard/api-keys"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm px-4 py-2 transition-all shadow-lg shadow-emerald-500/20"
            >
              Get API Keys
            </AppLink>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 lg:py-24 w-full">
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-4">
            DEVELOPER & ENTERPRISE SUPPORT
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white">
            We&apos;re here to help you scale
          </h1>
          <p className="mt-4 text-slate-400 text-base sm:text-lg">
            Have questions about integrating our verification APIs or need custom enterprise pricing? Reach out to our engineering team.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Direct Community & Channel Cards */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-xl font-bold text-white tracking-tight">Direct Channels</h2>

            {/* WhatsApp Card */}
            <a
              href="https://chat.whatsapp.com/verixaid"
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-2xl border border-slate-800 bg-slate-900/60 p-6 hover:border-emerald-500/50 hover:bg-slate-900/90 transition-all shadow-lg shadow-black/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl font-bold">
                    💬
                  </div>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">WhatsApp Community</h3>
                    <p className="text-xs text-slate-400">Join our group for instant developer assistance</p>
                  </div>
                </div>
                <span className="text-emerald-400 font-mono text-sm group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </a>

            {/* Telegram Card */}
            <a
              href="https://t.me/verixaid"
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-2xl border border-slate-800 bg-slate-900/60 p-6 hover:border-sky-500/50 hover:bg-slate-900/90 transition-all shadow-lg shadow-black/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 text-xl font-bold">
                    📢
                  </div>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-sky-400 transition-colors">Telegram Channel</h3>
                    <p className="text-xs text-slate-400">Real-time status updates and changelog</p>
                  </div>
                </div>
                <span className="text-sky-400 font-mono text-sm group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </a>

            {/* Email Cards */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
              <div>
                <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Technical & Integration Support</span>
                <p className="font-medium text-white text-sm mt-0.5">
                  <a href="mailto:support@verixaid.com" className="hover:text-emerald-400 transition-colors">support@verixaid.com</a>
                </p>
              </div>
              <div className="border-t border-slate-800/80 pt-3">
                <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Enterprise & Sales</span>
                <p className="font-medium text-white text-sm mt-0.5">
                  <a href="mailto:sales@verixaid.com" className="hover:text-emerald-400 transition-colors">sales@verixaid.com</a>
                </p>
              </div>
              <div className="border-t border-slate-800/80 pt-3">
                <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Security & Compliance</span>
                <p className="font-medium text-white text-sm mt-0.5">
                  <a href="mailto:security@verixaid.com" className="hover:text-emerald-400 transition-colors">security@verixaid.com</a>
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 sm:p-10 shadow-2xl">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl mx-auto">
                    ✓
                  </div>
                  <h3 className="text-2xl font-bold text-white">Message Received!</h3>
                  <p className="text-slate-400 text-sm max-w-md mx-auto">
                    Thank you for contacting Verixa ID. An integration specialist will get back to your work email within 1 hour.
                  </p>
                  <Button
                    onClick={() => setSubmitted(false)}
                    variant="outline"
                    className="mt-4"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Send us a message</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Fill out the form below and we will route your inquiry to the right engineering lead.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-300">Full Name</label>
                      <Input
                        required
                        placeholder="Ada Lovelace"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-300">Work Email</label>
                      <Input
                        required
                        type="email"
                        placeholder="ada@company.com"
                        value={formData.workEmail}
                        onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                        className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-300">Company Name</label>
                      <Input
                        required
                        placeholder="Acme Fintech Ltd"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-300">Inquiry Topic</label>
                      <select
                        value={formData.topic}
                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                        className="w-full h-10 rounded-md border border-slate-800 bg-slate-950/60 px-3 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="Technical Support">Technical & API Support</option>
                        <option value="Sales / Enterprise Volume">Sales & Enterprise Volume Pricing</option>
                        <option value="Billing & NGX Top-up">Billing & Dedicated Virtual Accounts</option>
                        <option value="Compliance & Security">Compliance & KYC Inquiries</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300">How can we help?</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Tell us about your verification requirements, estimated monthly API volume, or technical questions..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full rounded-md border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base py-3 shadow-lg shadow-emerald-500/20"
                  >
                    Send Inquiry &rarr;
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center sm:items-start gap-2">
            <Logo size="sm" />
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} Verixa ID. B2B Verification Infrastructure.
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-400 font-medium">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact" className="text-emerald-400 font-medium">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
