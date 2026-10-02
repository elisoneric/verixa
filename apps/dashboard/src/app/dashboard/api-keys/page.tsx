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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">API Keys</h1>
            <Badge variant={environment === "live" ? "verified" : "warning"} size="sm">
              {environment.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Secret API keys for authenticating server-to-server verification calls.
          </p>
        </div>

        <Button
          variant="emerald"
          size="sm"
          onClick={() => {
            setKeyEnv(environment)
            setIsGenerateOpen(true)
          }}
        >
          + Generate New Key
        </Button>
      </div>

      {/* Security Best Practices Banner */}
      <div className="p-4 rounded-xl border border-amber-200 dark:border-zinc-800 bg-amber-50/50 dark:bg-zinc-900/40 flex items-start gap-3">
        <svg className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div className="text-xs leading-relaxed text-slate-700 dark:text-zinc-300">
          <strong className="text-slate-900 dark:text-white font-semibold">Security Requirement:</strong> Never commit API keys to public repositories or client-side JavaScript bundles. Always store secret keys in environment variables on your backend.
        </div>
      </div>

      {/* Keys List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Active {environment.toUpperCase()} Keys ({filteredKeys.length})
          </h3>
        </div>

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
              <Card key={k.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{k.name}</span>
                    <Badge variant={k.isActive ? "verified" : "failed"} size="sm">
                      {k.isActive ? "ACTIVE" : "REVOKED"}
                    </Badge>
                  </div>
                  <div className="text-xs font-mono text-slate-500 dark:text-zinc-400">
                    ID: {k.id} • Created {new Date(k.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="font-mono text-xs text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-950 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800">
                    {k.displayKey}
                  </div>
                  {k.isActive && (
                    <Button
                      variant="outline"
                      size="xs"
                      className="text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 border-rose-200 dark:border-rose-500/30"
                      onClick={() => handleRevoke(k.id)}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Usage in Code snippet */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">How to use your API key</h3>
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
      >
        <form onSubmit={handleGenerate} className="space-y-4 mt-4">
          <Input
            label="Key Name / Identifier"
            placeholder="e.g. Production Backend Service"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            hint="A descriptive label to help you identify where this key is used."
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300">Environment</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setKeyEnv("sandbox")}
                className={`py-2 px-3 text-xs font-mono rounded-lg border text-left transition-all ${
                  keyEnv === "sandbox"
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-400 font-bold"
                    : "bg-slate-50 dark:bg-zinc-950 border-slate-300 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 shadow-2xs"
                }`}
              >
                <div>Sandbox (Test)</div>
                <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-sans">Mock verification data</div>
              </button>
              <button
                type="button"
                onClick={() => setKeyEnv("live")}
                className={`py-2 px-3 text-xs font-mono rounded-lg border text-left transition-all ${
                  keyEnv === "live"
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-400 font-bold"
                    : "bg-slate-50 dark:bg-zinc-950 border-slate-300 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 shadow-2xs"
                }`}
              >
                <div>Live (Production)</div>
                <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-sans">Live identity checks</div>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-zinc-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsGenerateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="emerald"
              size="sm"
              isLoading={isSubmitting}
            >
              Create API Key
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reveal Key Once Modal */}
      {newKeyResult && (
        <Modal
          isOpen={true}
          onClose={() => setNewKeyResult(null)}
          title="Save Your Secret API Key"
          description="Make sure to copy your API key now. For your security, you will not be able to see this secret again."
        >
          <div className="space-y-4 mt-4">
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
              API key successfully generated for {newKeyResult.name}!
            </div>

            <Input
              label="Secret API Key Token"
              readOnly
              copyable
              value={newKeyResult.rawKey}
              className="font-mono text-xs bg-slate-50 dark:bg-zinc-950 text-emerald-600 dark:text-emerald-300"
            />

            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-zinc-800">
              <Button
                variant="default"
                size="sm"
                onClick={() => setNewKeyResult(null)}
              >
                I have saved my secret key
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
