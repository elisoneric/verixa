import { Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@verixa/ui"

export default function EnvironmentsDocsPage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="mono">ARCHITECTURE</Badge>
          <span className="text-xs font-mono text-zinc-500">SANDBOX VS LIVE</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Environments & Testing
        </h1>
        <p className="mt-2 text-base text-zinc-400 leading-relaxed">
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
            <TableCell className="font-semibold text-white">Identity Data Source</TableCell>
            <TableCell className="text-zinc-300">Mock Nigerian Data Generator</TableCell>
            <TableCell className="text-emerald-400 font-semibold">Authorised Official Registries</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-semibold text-white">Billing Deductions</TableCell>
            <TableCell className="text-zinc-300">Free Test Credits (100,000 NGX)</TableCell>
            <TableCell className="text-zinc-300">Prepaid Metered NGX Wallet</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-semibold text-white">Cost per BVN / NIN</TableCell>
            <TableCell className="text-zinc-300">50 Test NGX (free)</TableCell>
            <TableCell className="text-zinc-300">50 NGX (₦50.00)</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-semibold text-white">Cost per NUBAN</TableCell>
            <TableCell className="text-zinc-300">10 Test NGX (free)</TableCell>
            <TableCell className="text-zinc-300">10 NGX (₦10.00)</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
