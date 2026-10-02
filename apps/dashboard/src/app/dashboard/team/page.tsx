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
      email: user?.email || "developer@verixaid.com",
      role: "ADMIN",
      status: "Active",
      joinedAt: "Owner",
    },
    {
      id: "usr_2",
      email: "security-lead@acmefintech.com",
      role: "DEVELOPER",
      status: "Active",
      joinedAt: "Aug 18, 2026",
    },
    {
      id: "usr_3",
      email: "finance-ops@acmefintech.com",
      role: "VIEWER",
      status: "Active",
      joinedAt: "Aug 22, 2026",
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Team Members</h1>
            <Badge variant="mono" size="sm">
              {members.length} USERS
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Manage organization team access, role-based permissions, and invitations.
          </p>
        </div>

        <Button variant="emerald" size="sm" onClick={() => setIsInviteOpen(true)}>
          + Invite Member
        </Button>
      </div>

      {/* Role Explanation Card */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 text-xs space-y-1 shadow-xs">
          <span className="font-bold text-slate-900 dark:text-white block">Administrator</span>
          <p className="text-slate-500 dark:text-zinc-400">Full access to billing, team invitations, and API key generation.</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 text-xs space-y-1 shadow-xs">
          <span className="font-bold text-slate-900 dark:text-white block">Developer</span>
          <p className="text-slate-500 dark:text-zinc-400">Access to API keys, Explorer, Webhooks, and Verification Logs.</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 text-xs space-y-1 shadow-xs">
          <span className="font-bold text-slate-900 dark:text-white block">Viewer / Operations</span>
          <p className="text-slate-500 dark:text-zinc-400">Read-only verification logs, manual workspace, and transaction reports.</p>
        </div>
      </div>

      {/* Members Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="font-medium text-slate-900 dark:text-white">{m.email}</TableCell>
              <TableCell>
                <Badge variant={m.role === "ADMIN" ? "verified" : "neutral"} size="sm">
                  {m.role}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {m.status}
                </span>
              </TableCell>
              <TableCell className="font-mono text-xs text-slate-500 dark:text-zinc-400">{m.joinedAt}</TableCell>
              <TableCell className="text-right">
                {m.joinedAt !== "Owner" && (
                  <Button variant="ghost" size="xs" className="text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300">
                    Remove
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invite Team Member"
        description="Send an invitation email to collaborate on this organization."
      >
        <form onSubmit={handleInvite} className="space-y-4 mt-4">
          <Input
            label="Work Email Address"
            type="email"
            placeholder="colleague@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300">Organization Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full h-10 rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-xs text-slate-900 dark:text-zinc-200 focus:border-emerald-500 focus:outline-none shadow-2xs"
            >
              <option value="DEVELOPER">Developer (API keys & logs)</option>
              <option value="ADMIN">Admin (Full billing & team control)</option>
              <option value="VIEWER">Viewer (Read-only operations)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-zinc-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsInviteOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="emerald" size="sm">
              Send Invite
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
