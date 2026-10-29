export interface NavLink {
  label: string
  href: string
  badge?: string
}

export interface NavSection {
  title: string
  links: NavLink[]
}

export const DOCS_SECTIONS: NavSection[] = [
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
      { label: "BVN Verification", href: "/bvn", badge: "₦95" },
      { label: "NIN Verification", href: "/nin", badge: "₦125" },
      { label: "NIN Slips & NIMC Card", href: "/slips", badge: "₦250" },
      { label: "Phone Number Intelligence", href: "/phone", badge: "₦85" },
      { label: "Secondary Government IDs", href: "/government-ids" },
    ],
  },
  {
    title: "KYB CORPORATE VERIFICATION",
    links: [
      { label: "CAC Business & TIN", href: "/cac", badge: "₦200" },
    ],
  },
  {
    title: "BANKING & FINANCIAL",
    links: [
      { label: "Bank Account (NUBAN)", href: "/nuban", badge: "Free" },
      { label: "NUBAN KYC Status", href: "/nuban-kyc", badge: "₦25" },
    ],
  },
  {
    title: "BIOMETRICS & RISK INTELLIGENCE",
    links: [
      { label: "Biometrics & AML Screening", href: "/biometrics-aml", badge: "₦150" },
    ],
  },
  {
    title: "VALUE-ADDED SERVICES",
    links: [
      { label: "Airtime & Mobile Data VTU", href: "/airtime-data", badge: "Wholesale" },
      { label: "SMS & WhatsApp OTP", href: "/messaging", badge: "₦5.00" },
    ],
  },
  {
    title: "PLATFORM ARCHITECTURE",
    links: [
      { label: "Smart Identity Cache", href: "/smart-cache", badge: "Sub-15ms" },
      { label: "Wallet Balance API", href: "/balance", badge: "Free" },
      { label: "Billing & Credits", href: "/billing-api" },
      { label: "Redis Idempotency", href: "/idempotency" },
      { label: "Webhooks & Signatures", href: "/webhooks" },
      { label: "Rate Limits", href: "/rate-limits" },
      { label: "Error Reference", href: "/errors" },
      { label: "Upcoming Roadmap", href: "/roadmap" },
    ],
  },
]
