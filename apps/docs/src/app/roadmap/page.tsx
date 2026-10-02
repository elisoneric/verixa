import { Badge, Card, CardHeader, CardTitle, CardContent } from "@verixa/ui"

export default function RoadmapDocsPage() {
  const futureApis = [
    {
      name: "CAC Corporate Entity (KYB)",
      endpoint: "POST /v1/verify/cac",
      category: "BUSINESS KYB",
      status: "IN SANDBOX PREVIEW",
      statusVariant: "warning" as const,
      description: "Direct Corporate Affairs Commission (CAC) registry lookup. Validate RC numbers, Business Names (BN), incorporation dates, registered office address, and beneficial ownership / company directors.",
      fields: ["rc_number", "company_name", "incorporation_date", "directors", "shareholders", "status"],
    },
    {
      name: "Driver's License Verification (FRSC)",
      endpoint: "POST /v1/verify/drivers-license",
      category: "INDIVIDUAL KYC",
      status: "COMING SOON",
      statusVariant: "neutral" as const,
      description: "Federal Road Safety Corps (FRSC) driver's license verification. Returns license holder full name, DOB, issue date, expiry date, state of issuance, and facial photo.",
      fields: ["license_number", "full_name", "date_of_birth", "expiry_date", "photo_url"],
    },
    {
      name: "International Passport (NIS)",
      endpoint: "POST /v1/verify/passport",
      category: "INDIVIDUAL KYC",
      status: "COMING SOON",
      statusVariant: "neutral" as const,
      description: "Nigerian Immigration Service (NIS) passport validation. Validates standard international travel document authenticity and holder biographical information.",
      fields: ["passport_number", "first_name", "last_name", "nationality", "expiry_date"],
    },
    {
      name: "Voter's Card Verification (INEC PVC)",
      endpoint: "POST /v1/verify/pvc",
      category: "INDIVIDUAL KYC",
      status: "COMING SOON",
      statusVariant: "neutral" as const,
      description: "Independent National Electoral Commission Permanent Voter's Card (PVC) validation against the national register of voters.",
      fields: ["vin_number", "full_name", "polling_unit", "ward", "lga", "state"],
    },
    {
      name: "Biometric Face Match & Liveness",
      endpoint: "POST /v1/verify/biometrics/face-match",
      category: "AI & BIOMETRICS",
      status: "DEVELOPMENT",
      statusVariant: "mono" as const,
      description: "1:1 AI biometric facial matching. Compares a user-submitted selfie or liveness video stream against the official photo on their NIN or BVN government record with passive anti-spoofing.",
      fields: ["confidence_score", "match_result", "liveness_detected", "spoof_risk"],
    },
    {
      name: "Tax Identification Number (TIN / FIRS)",
      endpoint: "POST /v1/verify/tin",
      category: "TAX & COMPLIANCE",
      status: "DEVELOPMENT",
      statusVariant: "mono" as const,
      description: "Federal Inland Revenue Service (FIRS) and Joint Tax Board (JTB) validation for corporate and individual taxpayer identification numbers.",
      fields: ["tin", "taxpayer_name", "tax_office", "filing_status", "registration_date"],
    },
    {
      name: "Telecom MSISDN Phone KYC",
      endpoint: "POST /v1/verify/phone",
      category: "TELECOM KYC",
      status: "COMING SOON",
      statusVariant: "neutral" as const,
      description: "Validate mobile subscriber identity against Nigerian Communications Commission (NCC) telecom SIM registration records across MTN, Airtel, Glo, and 9mobile.",
      fields: ["phone_number", "registered_name", "network_carrier", "sim_activation_date"],
    },
    {
      name: "Address Verification & Geolocation",
      endpoint: "POST /v1/verify/address",
      category: "PHYSICAL AUDIT",
      status: "EXPLORING",
      statusVariant: "mono" as const,
      description: "Automated utility bill OCR parsing and physical address verification with GPS coordinates and verified landmark cross-referencing.",
      fields: ["verified_address", "meter_number", "lga", "state", "geolocation_match"],
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="mono">API ROADMAP</Badge>
          <span className="font-mono text-xs text-zinc-500">EXPANDING PRODUCT SUITE</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Upcoming Identity & Compliance APIs
        </h1>
        <p className="mt-2 text-base text-zinc-400 leading-relaxed">
          Verixa ID is expanding beyond BVN, NIN, and Bank Accounts. Explore the roadmap of upcoming African identity, corporate KYB, biometric, and tax verification endpoints.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {futureApis.map((api) => (
          <Card key={api.endpoint} className="p-6 bg-zinc-900/60 border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge variant={api.statusVariant} size="sm">
                  {api.status}
                </Badge>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">{api.category}</span>
              </div>

              <h3 className="text-base font-bold text-white mb-1.5">{api.name}</h3>
              <p className="font-mono text-xs text-emerald-400 mb-3">{api.endpoint}</p>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                {api.description}
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-800/80">
              <span className="text-[10px] font-mono text-zinc-500 block mb-1.5">RETURNING ATTRIBUTES</span>
              <div className="flex flex-wrap gap-1.5">
                {api.fields.map((f) => (
                  <span key={f} className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-300">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
