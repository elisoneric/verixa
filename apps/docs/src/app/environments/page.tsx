import { Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@verixa/ui"

export default function EnvironmentsDocsPage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="mono">ARCHITECTURE</Badge>
          <span className="text-xs font-mono text-slate-500">SANDBOX VS LIVE</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Environments & Testing
        </h1>
        <p className="mt-2 text-base text-slate-600 leading-relaxed">
          Verixa ID provides complete environment isolation between Sandbox (development/testing) and Live (production).
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Feature</TableHead>
            <TableHead>Sandbox (vrx_test_*)</TableHead>
            <TableHead>Live (vrx_live_*)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-semibold text-slate-900">Identity Data Source</TableCell>
            <TableCell className="text-slate-700">Mock Nigerian Data Generator</TableCell>
            <TableCell className="text-emerald-700 font-semibold">Live Upstream Registries</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-semibold text-slate-900">Billing Deductions</TableCell>
            <TableCell className="text-slate-700">Free Test Credits (100,000 NGX)</TableCell>
            <TableCell className="text-slate-700">Prepaid Metered NGX Wallet</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-semibold text-slate-900">Cost per BVN / NIN</TableCell>
            <TableCell className="text-slate-700">50 Test NGX (free)</TableCell>
            <TableCell className="text-slate-700">50 NGX (₦50.00)</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-semibold text-slate-900">Cost per NUBAN</TableCell>
            <TableCell className="text-slate-700">10 Test NGX (free)</TableCell>
            <TableCell className="text-slate-700">10 NGX (₦10.00)</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
