import { Badge, CodeBlock } from "@verixa/ui"

export default function AuthenticationDocsPage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="verified">SECURITY</Badge>
          <span className="text-xs font-mono text-zinc-500">BEARER AUTH</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          API Authentication
        </h1>
        <p className="mt-2 text-base text-zinc-400 leading-relaxed">
          The Verixa ID API uses secret API keys to authenticate requests. You can generate, rotate, and revoke keys via your customer dashboard.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight">API Key Token Structure</h2>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          Verixa API keys follow an O(1) indexed token format containing an environment prefix, database UUID, and 32-character high-entropy secret.
        </p>

        <div className="space-y-2 font-mono text-xs">
          <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/50">
            <span className="text-amber-400 font-bold block mb-1">Sandbox Key Format</span>
            <code>vrx_test_&#123;key_uuid&#125;_&#123;32_hex_secret&#125;</code>
          </div>
          <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/50">
            <span className="text-emerald-400 font-bold block mb-1">Production Live Key Format</span>
            <code>vrx_live_&#123;key_uuid&#125;_&#123;32_hex_secret&#125;</code>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-zinc-800">
        <h2 className="text-lg font-bold text-white tracking-tight">Passing Your Key in Request Headers</h2>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          Authenticate your API requests by including your secret key in the <code className="text-emerald-400">Authorization</code> header with the <code className="text-zinc-200">Bearer</code> scheme.
        </p>

        <CodeBlock
          language="bash"
          title="HTTP Header Example"
          code={`Authorization: Bearer vrx_live_9f83a8f1e2b4c6d8_a1b2c3d4e5f6...`}
        />
      </div>
    </div>
  )
}
