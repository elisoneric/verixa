"use client"

import * as React from "react"
import { Button, Input, Badge, Card, Modal, CodeBlock, EmptyState } from "@verixa/ui"
import { useAuth } from "../../../lib/auth-context"
import { ApiClient, ApiKeyItem } from "../../../lib/api"

export default function ApiKeysPage() {
  const { environment } = useAuth()
  const [keys, setKeys] = React.useState<ApiKeyItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isGenerateOpen, setIsGenerateOpen] = React.useState(false)
  const [keyName, setKeyName] = React.useState("")
  const [keyEnv, setKeyEnv] = React.useState<"sandbox" | "live">(environment)
  const [newKeyResult, setNewKeyResult] = React.useState<{ rawKey: string; name: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const fetchKeys = React.useCallback(async () => {
    try {
      const data = await ApiClient.listApiKeys()
      setKeys(data)
    } catch {
      // Fallback
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchKeys()
  }, [fetchKeys])

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await ApiClient.generateApiKey(keyEnv, keyName || undefined)
      setNewKeyResult({ rawKey: res.rawKey, name: keyName || "API Key" })
      setIsGenerateOpen(false)
      setKeyName("")
      fetchKeys()
    } catch (e: any) {
      alert(e.message || "Failed to generate key")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRevoke = async (id: string) => {
    if (confirm("Are you sure you want to revoke this API key? Applications using it will be rejected immediately.")) {
      try {
        await ApiClient.revokeApiKey(id)
        fetchKeys()
      } catch (e: any) {
        alert(e.message || "Failed to revoke key")
      }
    }
  }

  const filteredKeys = keys.filter((k) => k.environment === environment)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-heading">
              API Keys
            </h1>
            <Badge variant={environment === "live" ? "verified" : "warning"} size="sm">
              {environment.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Secret API credentials for server-to-server identity verification requests.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setKeyEnv(environment)
            setIsGenerateOpen(true)
          }}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer shadow-xs self-start sm:self-center flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Generate New Key</span>
        </button>
      </div>

      {/* Security Best Practices Notice */}
      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 flex items-start gap-3">
        <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div className="text-xs leading-relaxed text-amber-900">
          <strong className="font-semibold">Security Requirement:</strong> Keep secret keys safe. Never expose them in client-side code, mobile binaries, or public GitHub repositories.
        </div>
      </div>

      {/* Keys List */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Active {environment.toUpperCase()} Keys ({filteredKeys.length})
        </h2>

        {filteredKeys.length === 0 ? (
          <EmptyState
            title={`No ${environment} API keys found`}
            description={`Generate a ${environment} API key to authenticate requests against our verification endpoints.`}
            actionLabel="Generate Key"
            onAction={() => {
              setKeyEnv(environment)
              setIsGenerateOpen(true)
            }}
          />
        ) : (
          <div className="space-y-3">
            {filteredKeys.map((k) => (
              <div
                key={k.id}
                className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">{k.name}</span>
                    <Badge variant={k.isActive ? "verified" : "failed"} size="sm">
                      {k.isActive ? "ACTIVE" : "REVOKED"}
                    </Badge>
                  </div>
                  <div className="text-xs font-mono text-slate-500">
                    ID: {k.id} • Created {new Date(k.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="font-mono text-xs text-slate-800 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                    {k.displayKey}
                  </div>
                  {k.isActive && (
                    <button
                      type="button"
                      onClick={() => handleRevoke(k.id)}
                      className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 transition-colors cursor-pointer"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Usage in Code snippet */}
      <div className="space-y-2 pt-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Authentication Header Example
        </h2>
        <CodeBlock
          language="bash"
          title="cURL Request Example"
          code={`curl -X POST https://api.verixaid.com/v1/verify/bvn \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Idempotency-Key: UNIQUE_UUID" \\
  -H "Content-Type: application/json" \\
  -d '{"bvn": "22123456789"}'`}
        />
      </div>

      {/* Generate Key Modal */}
      <Modal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        title="Generate New API Key"
        description="Create a new secret key for server-side verification requests."
        size="md"
      >
        <form onSubmit={handleGenerate} className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Key Name / Identifier
            </label>
            <Input
              placeholder="e.g. Production Backend"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Environment</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setKeyEnv("sandbox")}
                className={`py-2 px-3 text-xs font-mono rounded-lg border text-left transition-all cursor-pointer ${
                  keyEnv === "sandbox"
                    ? "bg-amber-50 border-amber-300 text-amber-900 font-bold"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <div>Sandbox</div>
                <div className="text-[10px] text-slate-500 font-sans">Mock test data</div>
              </button>
              <button
                type="button"
                onClick={() => setKeyEnv("live")}
                className={`py-2 px-3 text-xs font-mono rounded-lg border text-left transition-all cursor-pointer ${
                  keyEnv === "live"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <div>Live</div>
                <div className="text-[10px] text-slate-500 font-sans">Live identity data</div>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsGenerateOpen(false)}
              className="px-3.5 py-2 text-xs font-medium rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer shadow-xs"
            >
              {isSubmitting ? "Creating..." : "Create API Key"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reveal Key Once Modal */}
      {newKeyResult && (
        <Modal
          isOpen={true}
          onClose={() => setNewKeyResult(null)}
          title="Save Secret API Key"
          description="Copy your API key now. For security purposes, this secret key will not be shown again."
          size="md"
        >
          <div className="space-y-4 mt-2">
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
              API key successfully generated for {newKeyResult.name}!
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Secret API Key Token
              </label>
              <Input
                readOnly
                copyable
                value={newKeyResult.rawKey}
                className="font-mono text-xs"
              />
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setNewKeyResult(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer shadow-xs"
              >
                I have saved my secret key
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
