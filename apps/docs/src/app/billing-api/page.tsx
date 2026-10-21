import type { Metadata } from "next"
import { Badge, CodeBlock } from "@verixa/ui"

export const metadata: Metadata = {
  title: "Client Payment & Wallet Top-Up API | Verixa ID Docs",
  description:
    "Integrate payment checkouts, Paystack popup modals, and dedicated Nigerian virtual accounts directly into your applications to fund Verixa NGX credits automatically.",
  keywords: [
    "Verixa payment API",
    "wallet top up API",
    "dedicated virtual account API Nigeria",
    "Paystack modal integration",
  ],
  alternates: {
    canonical: "https://docs.verixaid.com/billing-api",
  },
}

export default function BillingApiDocsPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Verixa ID",
        "item": "https://verixaid.com",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Documentation",
        "item": "https://docs.verixaid.com",
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Billing & Payments API",
        "item": "https://docs.verixaid.com/billing-api",
      },
    ],
  }

  return (
    <div className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="verified">PAYMENT &amp; BILLING API</Badge>
          <span className="font-mono text-xs text-slate-500">Dual-Auth · API Keys &amp; JWT</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Client Website Payment Integration
        </h1>
        <p className="mt-2 text-base text-slate-600 leading-relaxed">
          Collect payments and fund your Verixa NGX balance directly from your own website or application. You can initiate checkouts, trigger in-page Paystack popup modals with zero redirects, or display dedicated bank transfer accounts on your own domain.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-xs font-mono text-emerald-700 font-bold block mb-1">01. ZERO REDIRECT</span>
          <h4 className="text-sm font-bold text-slate-900 mb-1">In-Page Modal</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Use the returned <code className="text-emerald-700">accessCode</code> with Paystack Inline to open a secure payment popup on your site.
          </p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-xs font-mono text-sky-700 font-bold block mb-1">02. HOSTED CHECKOUT</span>
          <h4 className="text-sm font-bold text-slate-900 mb-1">Direct Redirect</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Redirect payers to <code className="text-sky-700">checkoutUrl</code> and receive them back at your custom <code className="text-sky-700">callbackUrl</code>.
          </p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-xs font-mono text-amber-700 font-bold block mb-1">03. DIRECT TRANSFER</span>
          <h4 className="text-sm font-bold text-slate-900 mb-1">Dedicated Account</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Display your organization's Titan Trust Bank virtual account for instant credit via direct bank transfer.
          </p>
        </div>
      </div>

      {/* Step 1: Initialize Checkout */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">POST</span>
          <code className="text-sm font-mono text-slate-800">/v1/billing/checkout</code>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Call this endpoint from your backend server using your Verixa Live API key (<code className="text-slate-800">Authorization: Bearer vrx_live_...</code>).
        </p>

        <CodeBlock
          language="bash"
          title="cURL: Initialize Payment Checkout"
          code={`curl -X POST https://api.verixa.io/v1/billing/checkout \\
  -H "Authorization: Bearer vrx_live_YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 25000,
    "customerEmail": "finance@yourcompany.com",
    "callbackUrl": "https://yourcompany.com/billing/callback",
    "metadata": {
      "orderId": "ORD-8821",
      "purpose": "wallet_funding"
    }
  }'`}
        />

        <CodeBlock
          language="json"
          title="Response (200 OK)"
          code={`{
  "status": "success",
  "data": {
    "reference": "vrx_tx_8a92bfae",
    "checkoutUrl": "https://checkout.paystack.com/0peioxfhpn",
    "accessCode": "0peioxfhpn",
    "amount": 25000,
    "currency": "NGN",
    "customerEmail": "finance@yourcompany.com",
    "callbackUrl": "https://yourcompany.com/billing/callback",
    "dedicatedVirtualAccount": {
      "bankName": "Titan Trust Bank",
      "accountNumber": "9940182741",
      "accountName": "Verixa ID / Settlement",
      "status": "active"
    }
  }
}`}
        />
      </div>

      {/* Step 2: Client Frontend Integration */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Frontend Implementation Options</h2>
        
        {/* Option A: Paystack Inline */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-emerald-700">Option A: Seamless In-Page Popup (Zero Redirect)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Load Paystack Inline JS on your website. Once your backend returns the <code className="text-emerald-700">accessCode</code>, trigger the popup modal directly:
          </p>

          <CodeBlock
            language="html"
            title="Frontend JavaScript (Embedded Modal)"
            code={`<!-- Include Paystack Inline Script -->
<script src="https://js.paystack.co/v1/inline.js"></script>

<script>
async function handlePayFromMyWebsite() {
  // 1. Call your own backend API which calls Verixa /v1/billing/checkout
  const res = await fetch('/api/create-payment', {
    method: 'POST',
    body: JSON.stringify({ amount: 25000 })
  });
  const { data } = await res.json();

  // 2. Open Paystack popup directly on your website using accessCode
  const popup = PaystackPop.setup({
    access_code: data.accessCode,
    onClose: function() {
      console.log('Customer dismissed payment popup');
    },
    callback: function(response) {
      console.log('Payment successful! Reference:', response.reference);
      // Verify payment status with your backend
      window.location.reload();
    }
  });

  popup.openIframe();
}
</script>`}
          />
        </div>

        {/* Option B: Standard Redirect */}
        <div className="space-y-3 pt-3">
          <h3 className="text-sm font-bold text-sky-700">Option B: Standard Hosted Redirect</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Simply direct your user to the hosted checkout page:
          </p>
          <CodeBlock
            language="javascript"
            title="Redirect Flow"
            code={`// Redirect payer to checkoutUrl
window.location.href = data.checkoutUrl;`}
          />
        </div>
      </div>

      {/* Step 3: Verify Payment Status */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-sky-500/10 text-sky-700 border border-sky-500/20">GET</span>
          <code className="text-sm font-mono text-slate-800">/v1/billing/payments/:reference</code>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Verify real-time completion status of any payment reference. If the payment was completed on Paystack, calling this endpoint automatically verifies and credits your Live balance immediately.
        </p>

        <CodeBlock
          language="bash"
          title="cURL: Query Payment Reference"
          code={`curl -X GET https://api.verixa.io/v1/billing/payments/vrx_tx_8a92bfae \\
  -H "Authorization: Bearer vrx_live_YOUR_API_KEY"`}
        />

        <CodeBlock
          language="json"
          title="Response (200 OK)"
          code={`{
  "status": "success",
  "data": {
    "reference": "vrx_tx_8a92bfae",
    "paymentStatus": "COMPLETED",
    "amount": 25000,
    "currency": "NGN",
    "description": "Paystack Verified Checkout",
    "paidAt": "2026-10-06T08:14:22.000Z"
  }
}`}
        />
      </div>

      {/* Step 4: Webhook Event */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Real-time Webhook Notification</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Whenever a payment is settled via card checkout or direct DVA bank transfer, Verixa dispatches a signed <code className="text-emerald-700">payment.completed</code> event to your configured webhook URL.
        </p>

        <CodeBlock
          language="json"
          title="Webhook Payload (payment.completed)"
          code={`{
  "event": "payment.completed",
  "timestamp": "2026-10-06T08:14:23.102Z",
  "data": {
    "reference": "vrx_tx_8a92bfae",
    "amount": 25000,
    "currency": "NGN",
    "balance": 175000
  }
}`}
        />
      </div>
    </div>
  )
}
