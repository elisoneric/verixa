"use client"

import * as React from "react"
import { Button, Input, Badge, Card, Modal, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@verixa/ui"
import { useAuth } from "../../../lib/auth-context"

export default function TeamPage() {
  const { user } = useAuth()
  const [isInviteOpen, setIsInviteOpen] = React.useState(false)
  const [inviteEmail, setInviteEmail] = React.useState("")
  const [inviteRole, setInviteRole] = React.useState("DEVELOPER")

  const members = [
    {
      id: user?.id || "usr_1",
      email: user?.email || "admin@organization.com",
      role: user?.is_super_admin ? "SUPER ADMIN" : "ADMIN",
      status: "Active",
      joinedAt: "Owner",
    },
  ]

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Invitation sent to ${inviteEmail} as ${inviteRole}!`)
    setIsInviteOpen(false)
    setInviteEmail("")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-heading">
              Team Members
            </h1>
            <Badge variant="neutral" size="sm">
              {members.length} USERS
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage team access, role-based permissions, and invitations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsInviteOpen(true)}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer shadow-xs self-start sm:self-center flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Invite Member</span>
        </button>
      </div>

      {/* Role Explanation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-slate-200 bg-white text-xs space-y-1 shadow-2xs">
          <span className="font-bold text-slate-900 block">Administrator</span>
          <p className="text-slate-500">Full access to billing, team invitations, and API key generation.</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white text-xs space-y-1 shadow-2xs">
          <span className="font-bold text-slate-900 block">Developer</span>
          <p className="text-slate-500">Access to API keys, Explorer, Webhooks, and Verification Logs.</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white text-xs space-y-1 shadow-2xs">
          <span className="font-bold text-slate-900 block">Viewer / Operations</span>
          <p className="text-slate-500">Read-only verification logs, manual workspace, and transaction reports.</p>
        </div>
      </div>

      {/* Members Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-200 bg-slate-50/70 text-slate-600">
                <TableHead>User Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="font-medium text-slate-900 text-xs">{m.email}</TableCell>
                  <TableCell>
                    <Badge variant={m.role === "ADMIN" ? "verified" : "neutral"} size="sm">
                      {m.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {m.status}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">{m.joinedAt}</TableCell>
                  <TableCell className="text-right">
                    {m.joinedAt !== "Owner" && (
                      <button
                        type="button"
                        className="text-xs text-rose-600 hover:text-rose-800 font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invite Team Member"
        description="Send an email invitation to join your Verixa organization workspace."
      >
        <form onSubmit={handleInvite} className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Member Email Address
            </label>
            <Input
              type="email"
              placeholder="colleague@yourcompany.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">Workspace Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:border-slate-900 focus:outline-none shadow-2xs cursor-pointer"
            >
              <option value="DEVELOPER">Developer (API Keys & Logs)</option>
              <option value="ADMIN">Administrator (Full Access)</option>
              <option value="VIEWER">Viewer (Read-Only Access)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsInviteOpen(false)}
              className="px-3.5 py-2 text-xs font-medium rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer shadow-xs"
            >
              Send Invitation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
