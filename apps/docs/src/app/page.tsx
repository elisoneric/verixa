import Link from "next/link"
import { Badge, CodeBlock } from "@verixa/ui"

export default function DocsHomePage() {
  return (
    <div className="space-y-12">
      {/* Hero / Overview Header */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="verified">DEVELOPER HUB</Badge>
          <span className="text-xs font-mono text-zinc-500">v1.2.0 API SPECIFICATION</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Verixa ID Developer Platform
        </h1>
        <p className="mt-3 text-base sm:text-lg text-zinc-400 leading-relaxed max-w-3xl">
          Unified, usage-based identity verification, KYB, biometric face match, and telecom APIs built for African fintechs and high-growth platforms. Engineered with universal REST taxonomy and sub-15ms Smart Identity Caching.
        </p>

        {/* Highlight Architecture Cards */}
        <div className="grid sm:grid-cols-3 gap-3 mt-6">
          <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02]">
            <span className="text-xs font-mono text-emerald-400 block mb-1">Universal REST Standard</span>
            <p className="text-xs text-zinc-300">
              Drop-in endpoint taxonomy (<code className="text-emerald-300 font-mono">/api/v1/kyc/...</code>), headers (<code className="text-emerald-300 font-mono">Authorization</code> + optional <code className="text-emerald-300 font-mono">AppId</code>), and standardized JSON envelope.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02]">
            <span className="text-xs font-mono text-sky-400 block mb-1">Smart Identity Cache</span>
            <p className="text-xs text-zinc-300">
              Sub-15ms cached lookups with 50% automated fee reduction on repeat queries within your tenant partition.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02]">
            <span className="text-xs font-mono text-amber-400 block mb-1">Prepaid NGX Metering</span>
            <p className="text-xs text-zinc-300">
              Predictable per-call usage deductions from your organization wallet. Zero hidden subscription overheads.
            </p>
          </div>
        </div>
      </div>

      {/* Core API Directory */}
      <div className="space-y-4 pt-6 border-t border-white/[0.08]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">Active API Endpoints & Usage Rates</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Standard rates across live government registries and 50% discounted Smart Cache hits.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              UNIVERSAL REST TAXONOMY
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30">
              SUB-15MS CACHE
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-zinc-950/60 overflow-hidden divide-y divide-white/[0.06] text-xs font-mono">
          {/* Identity & KYC Group Header */}
          <div className="bg-white/[0.03] px-4 py-2.5 text-[11px] uppercase tracking-wider text-emerald-400 font-bold font-sans">
            1. Identity & Government KYC Lookups
          </div>

          {/* 1. BVN Validate / Match */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/25">
                GET
              </span>
              <div>
                <span className="text-white font-semibold font-sans">BVN Validation (Match Details)</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/v1/kyc/bvn?bvn=...</code>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-bold font-sans text-sm">₦95.00</span>
              <span className="text-zinc-500 font-sans text-xs">/ ₦38.00 cache</span>
            </div>
          </div>

          {/* 2. BVN Full Profile */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/25">
                GET
              </span>
              <div>
                <span className="text-white font-semibold font-sans">BVN Full Lookup</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/v1/kyc/bvn/full?bvn=...</code>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-bold font-sans text-sm">₦95.00</span>
              <span className="text-zinc-500 font-sans text-xs">/ ₦38.00 cache</span>
            </div>
          </div>

          {/* 3. BVN Advance */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/25">
                GET
              </span>
              <div>
                <span className="text-white font-semibold font-sans">BVN Advance (Branch & Account Level)</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/v1/kyc/bvn/advance?bvn=...</code>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-bold font-sans text-sm">₦125.00</span>
              <span className="text-zinc-500 font-sans text-xs">/ ₦50.00 cache</span>
            </div>
          </div>

          {/* 4. BVN Face Match */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                POST
              </span>
              <div>
                <span className="text-white font-semibold font-sans">BVN + Selfie Facial Verification</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/v1/kyc/bvn/verify</code>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-bold font-sans text-sm">₦150.00</span>
              <span className="text-zinc-500 font-sans text-xs">/ ₦60.00 cache</span>
            </div>
          </div>

          {/* 5. NIN Basic */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/25">
                GET
              </span>
              <div>
                <span className="text-white font-semibold font-sans">NIN Basic Lookup</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/v1/kyc/nin?nin=...</code>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-bold font-sans text-sm">₦125.00</span>
              <span className="text-zinc-500 font-sans text-xs">/ ₦50.00 cache</span>
            </div>
          </div>

          {/* 6. NIN Advance */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/25">
                GET
              </span>
              <div>
                <span className="text-white font-semibold font-sans">NIN Advance (Photo, Address & Next-of-Kin)</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/v1/kyc/nin/advance?nin=...</code>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-bold font-sans text-sm">₦125.00</span>
              <span className="text-zinc-500 font-sans text-xs">/ ₦50.00 cache</span>
            </div>
          </div>

          {/* 7. NIN Premium */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/25">
                GET
              </span>
              <div>
                <span className="text-white font-semibold font-sans">NIN Premium Profile</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/v1/kyc/nin/premium?nin=...</code>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-bold font-sans text-sm">₦125.00</span>
              <span className="text-zinc-500 font-sans text-xs">/ ₦50.00 cache</span>
            </div>
          </div>

          {/* 8. NIN Slip */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/25">
                GET
              </span>
              <div>
                <span className="text-white font-semibold font-sans">NIN Slip Record</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/v1/kyc/nin/nin_slip?nin=...</code>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-bold font-sans text-sm">₦150.00</span>
              <span className="text-zinc-500 font-sans text-xs">/ ₦60.00 cache</span>
            </div>
          </div>

          {/* 9. NIN Face Match */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                POST
              </span>
              <div>
                <span className="text-white font-semibold font-sans">NIN + Selfie Facial Verification</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/v1/kyc/nin/verify</code>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-bold font-sans text-sm">₦150.00</span>
              <span className="text-zinc-500 font-sans text-xs">/ ₦60.00 cache</span>
            </div>
          </div>

          {/* 10. Phone Number Basic */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/25">
                GET
              </span>
              <div>
                <span className="text-white font-semibold font-sans">Phone Number Basic Lookup</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/v1/kyc/phone_number/basic?phone_number=...</code>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-bold font-sans text-sm">₦50.00</span>
              <span className="text-zinc-500 font-sans text-xs">/ ₦20.00 cache</span>
            </div>
          </div>

          {/* 11. Phone Number Full */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/25">
                GET
              </span>
              <div>
                <span className="text-white font-semibold font-sans">Phone Carrier & Demographics</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/v1/kyc/phone_number?phone_number=...</code>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-bold font-sans text-sm">₦95.00</span>
              <span className="text-zinc-500 font-sans text-xs">/ ₦38.00 cache</span>
            </div>
          </div>

          {/* Banking & NUBAN Group Header */}
          <div className="bg-white/[0.03] px-4 py-2.5 text-[11px] uppercase tracking-wider text-emerald-400 font-bold font-sans border-t border-b border-white/[0.08]">
            2. Banking Intelligence & NUBAN
          </div>

          {/* 12. Account Resolve */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/25">
                GET
              </span>
              <div>
                <span className="text-white font-semibold font-sans">NUBAN Account Name Resolve</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/v1/kyc/account?account_number=...&bank_code=...</code>
              </div>
            </div>
            <span className="text-emerald-400 font-bold font-sans text-sm">Free (₦0.00)</span>
          </div>

          {/* 13. NUBAN KYC Status */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/25">
                GET
              </span>
              <div>
                <span className="text-white font-semibold font-sans">NUBAN Tier & KYC Level Status</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/v1/kyc/nuban/status?account_number=...&bank_code=...</code>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-bold font-sans text-sm">₦35.00</span>
              <span className="text-zinc-500 font-sans text-xs">/ ₦14.00 cache</span>
            </div>
          </div>

          {/* Corporate KYB Group Header */}
          <div className="bg-white/[0.03] px-4 py-2.5 text-[11px] uppercase tracking-wider text-emerald-400 font-bold font-sans border-t border-b border-white/[0.08]">
            3. Corporate Affairs & Business KYB (CAC & TIN)
          </div>

          {/* 14. CAC Basic */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/25">
                GET
              </span>
              <div>
                <span className="text-white font-semibold font-sans">CAC Basic Company Lookup</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/v1/kyc/cac/basic?rc_number=...&company_type=...</code>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-bold font-sans text-sm">₦120.00</span>
              <span className="text-zinc-500 font-sans text-xs">/ ₦48.00 cache</span>
            </div>
          </div>

          {/* 15. CAC Advance */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/25">
                GET
              </span>
              <div>
                <span className="text-white font-semibold font-sans">CAC Advance (Directors, Shareholders & Shares)</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/v1/kyc/cac/advance?rc_number=...&company_type=...</code>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-bold font-sans text-sm">₦250.00</span>
              <span className="text-zinc-500 font-sans text-xs">/ ₦100.00 cache</span>
            </div>
          </div>

          {/* 16. TIN Verification */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/25">
                GET
              </span>
              <div>
                <span className="text-white font-semibold font-sans">TIN Tax ID Verification (JTB / FIRS)</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/v1/kyc/tin?tin=...</code>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-bold font-sans text-sm">₦90.00</span>
              <span className="text-zinc-500 font-sans text-xs">/ ₦36.00 cache</span>
            </div>
          </div>

          {/* Secondary Government IDs Group Header */}
          <div className="bg-white/[0.03] px-4 py-2.5 text-[11px] uppercase tracking-wider text-emerald-400 font-bold font-sans border-t border-b border-white/[0.08]">
            4. Secondary Government IDs (FRSC / INEC / NIS)
          </div>

          {/* 17. Driver's License */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/25">
                GET
              </span>
              <div>
                <span className="text-white font-semibold font-sans">Driver's License (FRSC)</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/v1/kyc/dl?license_number=...&dob=...</code>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-bold font-sans text-sm">₦95.00</span>
              <span className="text-zinc-500 font-sans text-xs">/ ₦38.00 cache</span>
            </div>
          </div>

          {/* 18. Voter's Card */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/25">
                GET
              </span>
              <div>
                <span className="text-white font-semibold font-sans">Voter's Card (VIN / INEC)</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/v1/kyc/vin?vin=...&state=...&last_name=...</code>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-bold font-sans text-sm">₦80.00</span>
              <span className="text-zinc-500 font-sans text-xs">/ ₦32.00 cache</span>
            </div>
          </div>

          {/* 19. Passport */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/25">
                GET
              </span>
              <div>
                <span className="text-white font-semibold font-sans">International Passport (NIS)</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/v1/kyc/passport?passport_number=...&last_name=...&dob=...</code>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-bold font-sans text-sm">₦150.00</span>
              <span className="text-zinc-500 font-sans text-xs">/ ₦60.00 cache</span>
            </div>
          </div>

          {/* Biometrics & Risk Group Header */}
          <div className="bg-white/[0.03] px-4 py-2.5 text-[11px] uppercase tracking-wider text-emerald-400 font-bold font-sans border-t border-b border-white/[0.08]">
            5. Biometrics, Anti-Fraud & Compliance Screening
          </div>

          {/* 20. Photo ID Face Match */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                POST
              </span>
              <div>
                <span className="text-white font-semibold font-sans">Photo ID Face Match & Liveness</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/v1/kyc/photoid/verify</code>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-bold font-sans text-sm">₦120.00</span>
              <span className="text-zinc-500 font-sans text-xs">/ ₦48.00 cache</span>
            </div>
          </div>

          {/* 21. AML Screening */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                POST
              </span>
              <div>
                <span className="text-white font-semibold font-sans">AML, PEP & Sanctions Screening</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/v1/aml/screening</code>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-bold font-sans text-sm">₦150.00</span>
              <span className="text-zinc-500 font-sans text-xs">/ ₦60.00 cache</span>
            </div>
          </div>

          {/* 22. Credit Score */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/25">
                GET
              </span>
              <div>
                <span className="text-white font-semibold font-sans">Multi-Bureau Credit Score</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/v1/credit/bvn?bvn=...</code>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-bold font-sans text-sm">₦250.00</span>
              <span className="text-zinc-500 font-sans text-xs">/ ₦100.00 cache</span>
            </div>
          </div>

          {/* 23. Email Risk */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/25">
                GET
              </span>
              <div>
                <span className="text-white font-semibold font-sans">Email Risk & Deliverability Intelligence</span>
                <code className="block text-zinc-400 text-[11px] mt-0.5">/api/v1/kyc/email?email=...</code>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-bold font-sans text-sm">₦30.00</span>
              <span className="text-zinc-500 font-sans text-xs">/ ₦12.00 cache</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Minute Quickstart */}
      <div className="space-y-4 pt-6 border-t border-white/[0.08]">
        <h2 className="text-base font-semibold text-white tracking-tight">5-Minute Quickstart</h2>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Verixa implements standard REST authentication headers. Obtain your Sandbox or Live credentials from your Console dashboard and include your secret key in the <code className="text-emerald-400 font-mono text-xs">Authorization</code> header (with or without the <code className="text-zinc-300 font-mono text-xs">Bearer</code> prefix) alongside your optional <code className="text-emerald-400 font-mono text-xs">AppId</code>. Mandatory regulatory applicant consent (<code className="text-emerald-300 font-mono text-xs">&quot;consent&quot;: true</code>) is included across all payloads.
        </p>

        <CodeBlock
          language="bash"
          title="Making your first BVN lookup (POST with JSON Body)"
          code={`curl -X POST "https://api.verixaid.com/api/v1/kyc/bvn" \\
  -H "Authorization: vrx_live_9f83a8f1e2b4c6d8_a1b2c3d4..." \\
  -H "AppId: app_6a7b8c9d0e1f" \\
  -H "Content-Type: application/json" \\
  -d '{
    "bvn": "22123456789",
    "first_name": "CHIDERA",
    "consent": true
  }'`}
        />

        <div className="space-y-2 pt-2">
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block">Standardized JSON Response</span>
          <CodeBlock
            language="json"
            title="HTTP 200 OK"
            code={`{
  "status": "success",
  "entity": {
    "bvn": "22123456789",
    "first_name": "CHIDERA",
    "last_name": "OLUTOLA",
    "date_of_birth": "1988-04-14",
    "phone_number1": "08039218492",
    "gender": "Male"
  },
  "billed_amount": 95,
  "cached": false,
  "meta": {
    "request_id": "vx_req_8f19a02d",
    "service": "bvn",
    "latency_ms": 142,
    "environment": "live"
  }
}`}
          />
        </div>
      </div>

      {/* Next steps grid */}
      <div className="pt-6 border-t border-white/[0.08] grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Link
          href="/authentication"
          className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.14] transition-all block group"
        >
          <span className="text-xs font-medium text-white group-hover:text-emerald-400 transition-colors block">
            Authentication & Headers &rarr;
          </span>
          <span className="text-[11px] text-zinc-500 mt-1 block">API Key & Bearer auth headers</span>
        </Link>
        <Link
          href="/bvn"
          className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.14] transition-all block group"
        >
          <span className="text-xs font-medium text-white group-hover:text-emerald-400 transition-colors block">
            BVN Verification &rarr;
          </span>
          <span className="text-[11px] text-zinc-500 mt-1 block">Field match, advance & selfies</span>
        </Link>
        <Link
          href="/nin"
          className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.14] transition-all block group"
        >
          <span className="text-xs font-medium text-white group-hover:text-emerald-400 transition-colors block">
            NIN Verification &rarr;
          </span>
          <span className="text-[11px] text-zinc-500 mt-1 block">5 tiers: basic, advance, slip, face</span>
        </Link>
        <Link
          href="/smart-cache"
          className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.14] transition-all block group"
        >
          <span className="text-xs font-medium text-white group-hover:text-emerald-400 transition-colors block">
            Smart Identity Cache &rarr;
          </span>
          <span className="text-[11px] text-zinc-500 mt-1 block">Save 50% with sub-15ms hits</span>
        </Link>
      </div>
    </div>
  )
}
