"use client"

import * as React from "react"
import { Badge, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyState, Modal, Input } from "@verixa/ui"
import { ApiClient } from "../../../lib/api"

export default function AdminOrganizationsPage() {
  const [orgs, setOrgs] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [selectedOrg, setSelectedOrg] = React.useState<any | null>(null)
  const [modalOpen, setModalOpen] = React.useState(false)
  const [complianceModalOpen, setComplianceModalOpen] = React.useState(false)

  // Upgrade form state
  const [tier, setTier] = React.useState("ENTERPRISE")
  const [customBvn, setCustomBvn] = React.useState("")
  const [customNin, setCustomNin] = React.useState("")
  const [customNuban, setCustomNuban] = React.useState("")
  const [notifyEmail, setNotifyEmail] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveSuccess, setSaveSuccess] = React.useState<string | null>(null)

  const fetchOrgs = () => {
    ApiClient.getAdminOrganizations()
      .then((data) => setOrgs(data || []))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }

  React.useEffect(() => {
    fetchOrgs()
  }, [])

  const handleOpenUpgrade = (org: any) => {
    setSelectedOrg(org)
    setTier(org.tier || "ENTERPRISE")
    setCustomBvn(org.customRates?.bvn != null ? String(org.customRates.bvn) : "")
    setCustomNin(org.customRates?.nin != null ? String(org.customRates.nin) : "")
    setCustomNuban(org.customRates?.nuban != null ? String(org.customRates.nuban) : "")
    setSaveSuccess(null)
    setModalOpen(true)
  }

  const handleSaveUpgrade = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrg) return
    setIsSaving(true)
    setSaveSuccess(null)

    try {
      const customRates = {
        bvn: customBvn ? parseInt(customBvn, 10) : undefined,
        nin: customNin ? parseInt(customNin, 10) : undefined,
        nuban: customNuban ? parseInt(customNuban, 10) : undefined,
      }

      await ApiClient.upgradeAdminOrgTier(selectedOrg.id, tier, customRates, notifyEmail)
      setSaveSuccess(`Successfully upgraded ${selectedOrg.name} to ${tier} plan! Notification sent.`)
      fetchOrgs()
      setTimeout(() => {
        setModalOpen(false)
        setSaveSuccess(null)
      }, 1500)
    } catch (err: any) {
      alert(err.message || "Failed to upgrade organization")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Tenant Organizations</h1>
            <Badge variant="failed" size="sm">
              {orgs.length} TENANTS
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Manage customer subscription tiers, custom enterprise rates, KYC data, and balances.
          </p>
        </div>
      </div>

      {/* Organizations Table */}
      {orgs.length === 0 ? (
        <EmptyState
          title="No registered organizations yet"
          description="Organizations will appear here once new developers sign up."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organization Name</TableHead>
              <TableHead>Tier & Pricing</TableHead>
              <TableHead>Live Balance</TableHead>
              <TableHead>Sandbox Balance</TableHead>
              <TableHead>Compliance (NDPA)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orgs.map((org) => (
              <TableRow key={org.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/60">
                <TableCell className="font-semibold text-slate-900 dark:text-white">
                  <div>{org.name}</div>
                  <div className="font-mono text-[10px] text-slate-400 dark:text-zinc-500">{org.id.slice(0, 13)}...</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge
                      variant={org.tier === "ENTERPRISE" ? "verified" : org.tier === "GROWTH" ? "info" : "mono"}
                      size="sm"
                    >
                      {org.tier || "STARTER"}
                    </Badge>
                    {(org.customRates?.bvn || org.customRates?.nin) && (
                      <span className="text-[10px] text-emerald-400 font-mono">
                        (Custom: BVN ₦{org.customRates.bvn || 50})
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs font-bold text-emerald-400">
                  ₦{Number(org.liveBalance).toLocaleString()}
                </TableCell>
                <TableCell className="font-mono text-xs text-amber-400">
                  {Number(org.sandboxBalance).toLocaleString()} NGX
                </TableCell>
                <TableCell>
                  {org.complianceData ? (
                    <button
                      onClick={() => {
                        setSelectedOrg(org)
                        setComplianceModalOpen(true)
                      }}
                      className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Verified Rep</span>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">({org.complianceData.directorNin ? `${org.complianceData.directorNin.slice(0, 4)}•••` : "KYC"})</span>
                    </button>
                  ) : (
                    <span className="text-xs text-zinc-500">Standard</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenUpgrade(org)}
                  >
                    Upgrade / Set Rates
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Plan Upgrade & Custom Rates Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Upgrade Account & Set Custom Rates: ${selectedOrg?.name}`}
        description="Set custom verification fees based on transaction volume. Automatic email notification will be dispatched."
        size="lg"
      >
        <form onSubmit={handleSaveUpgrade} className="space-y-4 pt-2">
          {saveSuccess && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium">
              {saveSuccess}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">Account Subscription Tier</label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none shadow-2xs"
            >
              <option value="STARTER">Starter Plan (Default standard rates: ₦50 BVN/NIN, ₦10 NUBAN)</option>
              <option value="GROWTH">Growth Plan (10% volume discount: ₦45 BVN/NIN, ₦9 NUBAN)</option>
              <option value="ENTERPRISE">Enterprise Plan (30% volume discount: ₦35 BVN/NIN, ₦7 NUBAN)</option>
              <option value="CUSTOM">Custom Enterprise Plan (Fully tailored rates below)</option>
            </select>
          </div>

          <div className="border-t border-slate-200 dark:border-zinc-800/80 pt-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">Custom Override Rates (Leave blank to use Tier default)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="BVN Rate (NGX / ₦)"
                type="number"
                placeholder="e.g. 30"
                value={customBvn}
                onChange={(e) => setCustomBvn(e.target.value)}
              />
              <Input
                label="NIN Rate (NGX / ₦)"
                type="number"
                placeholder="e.g. 30"
                value={customNin}
                onChange={(e) => setCustomNin(e.target.value)}
              />
              <Input
                label="NUBAN Rate (NGX / ₦)"
                type="number"
                placeholder="e.g. 5"
                value={customNuban}
                onChange={(e) => setCustomNuban(e.target.value)}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 pt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-emerald-500 focus:ring-emerald-500"
            />
            <span className="text-xs text-slate-700 dark:text-zinc-300">
              Send automated transactional email notification with new rate schedule to customer
            </span>
          </label>

          <div className="flex gap-3 justify-end pt-3 border-t border-slate-200 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="emerald"
              size="md"
              isLoading={isSaving}
            >
              Save & Apply New Plan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Compliance Data Inspection Modal */}
      <Modal
        isOpen={complianceModalOpen}
        onClose={() => setComplianceModalOpen(false)}
        title={`NDPR Compliance Record: ${selectedOrg?.name}`}
        description="Statutory KYC record captured during developer onboarding."
        size="md"
      >
        {selectedOrg?.complianceData && (
          <div className="space-y-3 pt-2 text-xs text-slate-700 dark:text-zinc-300">
            <div className="p-3 bg-slate-50 dark:bg-zinc-900/80 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-2 shadow-2xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-zinc-500">Business Entity:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedOrg.complianceData.businessType || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-zinc-500">CAC Registration:</span>
                <span className="font-mono text-slate-900 dark:text-white">{selectedOrg.complianceData.rcNumber || "Unincorporated / Dev"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-zinc-500">Authorized Representative:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedOrg.complianceData.directorName || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-zinc-500">Representative NIN:</span>
                <span className="font-mono text-slate-900 dark:text-white">{selectedOrg.complianceData.directorNin || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-zinc-500">Primary Use Case:</span>
                <span className="text-slate-800 dark:text-zinc-200">{selectedOrg.complianceData.useCase || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-zinc-500">Lawful Basis Acknowledged:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{selectedOrg.complianceData.lawfulBasisAgreed ? "YES (Section 25 NDPA)" : "NO"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-zinc-500">Registration Timestamp:</span>
                <span className="font-mono text-slate-500 dark:text-zinc-400">{selectedOrg.complianceData.verifiedAt ? new Date(selectedOrg.complianceData.verifiedAt).toLocaleString() : "N/A"}</span>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button size="sm" variant="outline" onClick={() => setComplianceModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
