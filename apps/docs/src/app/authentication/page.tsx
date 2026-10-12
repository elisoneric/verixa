import { Badge, CodeBlock } from "@verixa/ui"

export default function AuthenticationDocsPage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="verified">SECURITY & HEADERS</Badge>
          <span className="text-xs font-mono text-zinc-500">DOJAH COMPATIBLE</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          API Authentication & Headers
        </h1>
        <p className="mt-2 text-base text-zinc-400 leading-relaxed">
          The Verixa ID API supports 100% Dojah-compatible header authentication. Every API request must pass your secret credentials in the request headers.
        </p>
      </div>

      {/* Header Specifications */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight">Required HTTP Headers</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-1.5">
            <div className="flex items-center gap-2">
              <code className="text-emerald-400 font-bold font-mono text-xs">Authorization</code>
              <Badge variant="failed" size="sm">REQUIRED</Badge>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your secret key. In Dojah fashion, send the raw key string directly or use the <code className="text-zinc-200 font-mono">Bearer</code> prefix.
            </p>
            <code className="text-[11px] text-zinc-500 block font-mono">Example: vrx_live_9f83a8f1...</code>
          </div>

          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-1.5">
            <div className="flex items-center gap-2">
              <code className="text-sky-400 font-bold font-mono text-xs">AppId</code>
              <Badge variant="mono" size="sm">RECOMMENDED</Badge>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your application identifier from the Verixa Console (Developers &rarr; API Keys). Used to route telemetry and tenant partitioning.
            </p>
            <code className="text-[11px] text-zinc-500 block font-mono">Example: app_8b2e1f4a9c</code>
          </div>
        </div>
      </div>

      {/* API Key Token Structure */}
      <div className="space-y-4 pt-4 border-t border-zinc-800">
        <h2 className="text-lg font-bold text-white tracking-tight">API Key Token Structure</h2>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          Verixa API keys follow an O(1) indexed token format containing an environment prefix, database UUID, and 32-character high-entropy secret.
        </p>

        <div className="space-y-2 font-mono text-xs">
          <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/50">
            <span className="text-amber-400 font-bold block mb-1">Sandbox Key Format (Mock Upstream & Free Credits)</span>
            <code>vrx_test_&#123;key_uuid&#125;_&#123;32_hex_secret&#125;</code>
          </div>
          <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/50">
            <span className="text-emerald-400 font-bold block mb-1">Production Live Key Format (Real Gateways & Wallet Metering)</span>
            <code>vrx_live_&#123;key_uuid&#125;_&#123;32_hex_secret&#125;</code>
          </div>
        </div>
      </div>

      {/* Multi-Language Code Snippets */}
      <div className="space-y-4 pt-4 border-t border-zinc-800">
        <h2 className="text-lg font-bold text-white tracking-tight">Authentication Examples</h2>

        <div className="space-y-3">
          <CodeBlock
            language="bash"
            title="cURL (Raw Key Header - Dojah Parity)"
            code={`curl -X GET "https://api.verixaid.com/api/v1/kyc/bvn?bvn=22123456789" \\
  -H "Authorization: vrx_live_9f83a8f1e2b4c6d8_a1b2c3d4e5f6..." \\
  -H "AppId: app_8b2e1f4a9c" \\
  -H "Content-Type: application/json"`}
          />

          <CodeBlock
            language="typescript"
            title="Node.js (Axios)"
            code={`import axios from "axios";

const verixaClient = axios.create({
  baseURL: "https://api.verixaid.com",
  headers: {
    Authorization: process.env.VERIXA_SECRET_KEY, // Raw key or Bearer
    AppId: process.env.VERIXA_APP_ID,
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

async function verifyBVN(bvn: string) {
  const { data } = await verixaClient.get("/api/v1/kyc/bvn", {
    params: { bvn },
  });
  console.log("Verified Identity:", data.entity);
  return data.entity;
}`}
          />

          <CodeBlock
            language="python"
            title="Python (Requests)"
            code={`import os
import requests

HEADERS = {
    "Authorization": os.getenv("VERIXA_SECRET_KEY"),
    "AppId": os.getenv("VERIXA_APP_ID"),
    "Content-Type": "application/json"
}

def verify_bvn(bvn: str):
    response = requests.get(
        "https://api.verixaid.com/api/v1/kyc/bvn",
        params={"bvn": bvn},
        headers=HEADERS,
        timeout=15
    )
    response.raise_for_status()
    payload = response.json()
    return payload.get("entity")`}
          />
        </div>
      </div>
    </div>
  )
}
