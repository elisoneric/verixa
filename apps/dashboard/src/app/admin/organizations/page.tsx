"use client"

import * as React from "react"
import { Badge, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyState, Modal, Input, Card } from "@verixa/ui"
import { ApiClient } from "../../../lib/api"

export default function AdminOrganizationsPage() {
  const [orgs, setOrgs] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [selectedOrg, setSelectedOrg] = React.useState<any | null>(null)
  
  // Modals
  const [modalOpen, setModalOpen] = React.useState(false)
  const [complianceModalOpen, setComplianceModalOpen] = React.useState(false)
  const [balanceModalOpen, setBalanceModalOpen] = React.useState(false)
  const [usersModalOpen, setUsersModalOpen] = React.useState(false)
  
  // Users state
  const [orgUsers, setOrgUsers] = React.useState<any[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = React.useState(false)

  // Upgrade form state
  const [tier, setTier] = React.useState("ENTERPRISE")
  const [customBvn, setCustomBvn] = React.useState("")
  const [customNin, setCustomNin] = React.useState("")
  const [customNuban, setCustomNuban] = React.useState("")
  const [notifyEmail, setNotifyEmail] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveSuccess, setSaveSuccess] = React.useState<string | null>(null)

  // Balance adjustment state
  const [adjAmount, setAdjAmount] = React.useState("10000")
  const [adjEnv, setAdjEnv] = React.useState<"live" | "sandbox">("live")
  const [adjReason, setAdjReason] = React.useState("Manual Administrator Balance Grant")
  const [adjNotify, setAdjNotify] = React.useState(true)
  const [isAdjusting, setIsAdjusting] = React.useState(false)

  // Search & Filter
  const [searchQuery, setSearchQuery] = React.useState("")
  const [tierFilter, setTierFilter] = React.useState("ALL")

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

  const handleOpenBalance = (org: any) => {
    setSelectedOrg(org)
    setAdjAmount("5000")
    setAdjEnv("live")
    setAdjReason("Operator Manual Credit")
    setBalanceModalOpen(true)
  }

  const handleOpenUsers = async (org: any) => {
    setSelectedOrg(org)
    setUsersModalOpen(true)
    setIsLoadingUsers(true)
    try {
      const users = await ApiClient.getAdminOrgUsers(org.id)
      setOrgUsers(users || [])
    } catch {
      setOrgUsers([])
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const handleToggleStatus = async (org: any) => {
    const newStatus = org.status === "suspended" ? "active" : "suspended"
    const confirmMsg = newStatus === "suspended"
      ? `Are you sure you want to SUSPEND ${org.name}? Their API keys will be rejected.`
      : `Reactivate ${org.name}?`
    if (!confirm(confirmMsg)) return

    try {
      await ApiClient.updateAdminOrgStatus(org.id, newStatus)
      fetchOrgs()
    } catch (err: any) {
      alert(err.message || "Failed to update status")
    }
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

  const handleSaveBalance = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrg) return
    const num = parseInt(adjAmount, 10)
    if (!num || isNaN(num)) {
      alert("Please provide a valid integer amount")
      return
    }

    setIsAdjusting(true)
    try {
      await ApiClient.adjustAdminOrgBalance(selectedOrg.id, num, adjEnv, adjReason, adjNotify)
      alert(`Successfully processed adjustment of ${num > 0 ? "+" : ""}${num.toLocaleString()} NGX on ${selectedOrg.name}`)
      setBalanceModalOpen(false)
      fetchOrgs()
    } catch (err: any) {
      alert(err.message || "Failed to adjust balance")
    } finally {
      setIsAdjusting(false)
    }
  }

  const filteredOrgs = orgs.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTier = tierFilter === "ALL" || org.tier === tierFilter
    return matchesSearch && matchesTier
  })

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
            Manage customer subscription tiers, direct wallet balance adjustments, user rosters, and access control.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchOrgs}
          isLoading={isLoading}
        >
          <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Directory
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-mono font-medium text-slate-500 dark:text-zinc-400 uppercase block mb-1">
              Search by Tenant Name or UUID
            </label>
            <input
              type="text"
              placeholder="Search organizations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-slate-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono font-medium text-slate-500 dark:text-zinc-400 uppercase block mb-1">
              Filter by Subscription Tier
            </label>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-slate-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
            >
              <option value="ALL">All Subscription Tiers</option>
              <option value="STARTER">Starter Plan</option>
              <option value="GROWTH">Growth Plan</option>
              <option value="ENTERPRISE">Enterprise Plan</option>
              <option value="CUSTOM">Custom Plan</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Organizations Table */}
      {filteredOrgs.length === 0 && !isLoading ? (
        <EmptyState
          title="No organizations matching filters"
          description="Try clearing your search query or tier filter."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organization Name</TableHead>
              <TableHead>Tier & Pricing</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Live Balance</TableHead>
              <TableHead>Sandbox</TableHead>
              <TableHead>Members</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrgs.map((org) => {
              const isSuspended = org.status === "suspended"
              return (
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
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                          (Custom: BVN ₦{org.customRates.bvn || 50})
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={isSuspended ? "failed" : "verified"}
                      size="sm"
                    >
                      {isSuspended ? "SUSPENDED" : "ACTIVE"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    ₦{Number(org.liveBalance).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-amber-600 dark:text-amber-400">
                    {Number(org.sandboxBalance).toLocaleString()} NGX
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleOpenUsers(org)}
                      className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                    >
                      <span>{org.usersCount} users</span>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => handleOpenBalance(org)}
                        className="text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                      >
                        ± Balance
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => handleOpenUpgrade(org)}
                      >
                        Tier / Rates
                      </Button>
                      <Button
                        size="xs"
                        variant={isSuspended ? "emerald" : "outline"}
                        onClick={() => handleToggleStatus(org)}
                        className={isSuspended ? "" : "text-rose-600 dark:text-rose-400"}
                      >
                        {isSuspended ? "Reactivate" : "Suspend"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}

      {/* Balance Adjustment Modal */}
      <Modal
        isOpen={balanceModalOpen}
        onClose={() => setBalanceModalOpen(false)}
        title={`Adjust Organization Balance: ${selectedOrg?.name}`}
        description="Manual credit or debit adjustment. Creates an immutable transaction in the platform ledger."
        size="md"
      >
        <form onSubmit={handleSaveBalance} className="space-y-4 pt-2">
          <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 flex justify-between items-center text-xs">
            <span className="text-slate-500 dark:text-zinc-400 font-mono">Current Live Balance:</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              ₦{Number(selectedOrg?.liveBalance || 0).toLocaleString()}.00
            </span>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block mb-1">Target Environment</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdjEnv("live")}
                className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                  adjEnv === "live"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-600"
                    : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800"
                }`}
              >
                Live Production Wallet
              </button>
              <button
                type="button"
                onClick={() => setAdjEnv("sandbox")}
                className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                  adjEnv === "sandbox"
                    ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-600"
                    : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800"
                }`}
              >
                Sandbox Test Wallet
              </button>
            </div>
          </div>

          <Input
            label="Adjustment Amount (NGX)"
            type="number"
            value={adjAmount}
            onChange={(e) => setAdjAmount(e.target.value)}
            hint="Positive to credit (e.g. 5000), negative to debit (e.g. -2000)"
            required
          />

          <Input
            label="Audit Reason / Note"
            type="text"
            value={adjReason}
            onChange={(e) => setAdjReason(e.target.value)}
            hint="Required audit memorandum for financial compliance."
            required
          />

          <label className="flex items-center gap-2 pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={adjNotify}
              onChange={(e) => setAdjNotify(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 dark:border-zinc-700 text-emerald-500 focus:ring-emerald-500"
            />
            <span className="text-xs text-slate-700 dark:text-zinc-300">
              Send balance adjustment confirmation email to organization members
            </span>
          </label>

          <div className="flex gap-3 justify-end pt-3 border-t border-slate-200 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setBalanceModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="emerald"
              size="md"
              isLoading={isAdjusting}
            >
              Post Balance Adjustment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Organization Members Modal */}
      <Modal
        isOpen={usersModalOpen}
        onClose={() => setUsersModalOpen(false)}
        title={`Members of ${selectedOrg?.name}`}
        description="Registered user accounts authorized for this organization."
        size="md"
      >
        <div className="space-y-3 pt-2">
          {isLoadingUsers ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
              Loading organization users...
            </div>
          ) : orgUsers.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 dark:text-zinc-400">
              No registered user accounts found for this organization.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-zinc-800 max-h-80 overflow-y-auto">
              {orgUsers.map((u) => (
                <div key={u.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">{u.email}</span>
                    <span className="font-mono text-[10px] text-slate-400 dark:text-zinc-500">
                      Joined {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Badge variant={u.role === "SuperAdmin" ? "failed" : "mono"} size="sm">
                    {u.role.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-zinc-800">
            <Button size="sm" variant="outline" onClick={() => setUsersModalOpen(false)}>
              Close Roster
            </Button>
          </div>
        </div>
      </Modal>

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
              className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-hidden"
            >
              <option value="STARTER">Starter Plan (Standard volume rates: ₦50 BVN/NIN, ₦0 NUBAN)</option>
              <option value="GROWTH">Growth Plan (10% volume discount: ₦45 BVN/NIN, ₦0 NUBAN)</option>
              <option value="ENTERPRISE">Enterprise Plan (30% volume discount: ₦35 BVN/NIN, ₦0 NUBAN)</option>
              <option value="CUSTOM">Custom Negotiated Rates (Custom values entered below)</option>
            </select>
          </div>

          <div className="border-t border-slate-200 dark:border-zinc-800 pt-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">Custom Override Rates (Leave blank to use Tier default)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="BVN Rate (NGX / ₦)"
                type="number"
                placeholder="e.g. 35"
                value={customBvn}
                onChange={(e) => setCustomBvn(e.target.value)}
              />
              <Input
                label="NIN Rate (NGX / ₦)"
                type="number"
                placeholder="e.g. 35"
                value={customNin}
                onChange={(e) => setCustomNin(e.target.value)}
              />
              <Input
                label="NUBAN Rate (NGX / ₦)"
                type="number"
                placeholder="e.g. 0"
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
              className="h-4 w-4 rounded border-slate-300 dark:border-zinc-700 text-emerald-500 focus:ring-emerald-500"
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
    </div>
  )
}
