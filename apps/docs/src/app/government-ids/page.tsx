import { Badge, CodeBlock, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@verixa/ui"

export default function GovernmentIdsDocsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="verified">DOJAH PARITY</Badge>
          <span className="font-mono text-xs text-sky-400 font-bold">FRSC / INEC / NIS</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Secondary Government IDs
        </h1>
        <p className="mt-2 text-base text-zinc-400 leading-relaxed">
          Verify official Nigerian travel, voter, and driving credentials directly against issuing statutory bodies. Built with 100% Dojah endpoint and parameter compatibility.
        </p>
      </div>

      {/* Available ID Services Overview */}
      <div className="grid sm:grid-cols-3 gap-3 text-xs font-mono">
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1.5">
          <span className="text-emerald-400 font-bold block">1. Driver's License (FRSC)</span>
          <code className="text-white block text-[11px]">GET /api/v1/kyc/dl</code>
          <p className="text-zinc-400 font-sans text-xs">Verify Federal Road Safety Corps licenses and validity dates.</p>
          <span className="text-zinc-500 block text-[11px]">Rate: 120 NGX (₦120.00)</span>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1.5">
          <span className="text-sky-400 font-bold block">2. Voter's Card (VIN / INEC)</span>
          <code className="text-white block text-[11px]">GET /api/v1/kyc/vin</code>
          <p className="text-zinc-400 font-sans text-xs">Verify voter cards against the INEC national electoral register.</p>
          <span className="text-zinc-500 block text-[11px]">Rate: 100 NGX (₦100.00)</span>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1.5">
          <span className="text-amber-400 font-bold block">3. Passport (NIS)</span>
          <code className="text-white block text-[11px]">GET /api/v1/kyc/passport</code>
          <p className="text-zinc-400 font-sans text-xs">Verify Nigerian International Passports against Immigration Service records.</p>
          <span className="text-zinc-500 block text-[11px]">Rate: 150 NGX (₦150.00)</span>
        </div>
      </div>

      {/* 1. Driver's License Details */}
      <div className="space-y-3 pt-6 border-t border-zinc-800">
        <div className="flex items-center gap-2">
          <Badge variant="verified">FRSC</Badge>
          <h2 className="text-lg font-bold text-white tracking-tight">Driver&apos;s License (GET /api/v1/kyc/dl)</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Field</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Required</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-mono text-emerald-400 font-bold">license_number</TableCell>
              <TableCell className="font-mono text-zinc-400">string</TableCell>
              <TableCell className="text-rose-400 font-bold">Required</TableCell>
              <TableCell className="text-zinc-300">FRSC license number (e.g. <code className="text-sky-300 font-mono">AAA12345AA01</code>).</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-zinc-300 font-bold">dob</TableCell>
              <TableCell className="font-mono text-zinc-400">string</TableCell>
              <TableCell className="text-zinc-500">Optional</TableCell>
              <TableCell className="text-zinc-300">Date of birth in <code className="text-sky-300 font-mono">YYYY-MM-DD</code> format.</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <CodeBlock
          language="bash"
          title="cURL Request (Driver's License)"
          code={`curl -X GET "https://api.verixaid.com/api/v1/kyc/dl?license_number=AAA12345AA01&dob=1991-03-14" \\
  -H "Authorization: vrx_live_9f83a8f1e2b4c6d8_a1b2c3d4..." \\
  -H "AppId: app_6a7b8c9d0e1f"`}
        />
      </div>

      {/* 2. Voter's Card Details */}
      <div className="space-y-3 pt-6 border-t border-zinc-800">
        <div className="flex items-center gap-2">
          <Badge variant="verified">INEC</Badge>
          <h2 className="text-lg font-bold text-white tracking-tight">Voter&apos;s Card (GET /api/v1/kyc/vin)</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Field</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Required</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-mono text-emerald-400 font-bold">vin</TableCell>
              <TableCell className="font-mono text-zinc-400">string</TableCell>
              <TableCell className="text-rose-400 font-bold">Required</TableCell>
              <TableCell className="text-zinc-300">19-digit Voter Identification Number.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-zinc-300 font-bold">state</TableCell>
              <TableCell className="font-mono text-zinc-400">string</TableCell>
              <TableCell className="text-zinc-500">Optional</TableCell>
              <TableCell className="text-zinc-300">State where voter registration was recorded.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-zinc-300 font-bold">last_name</TableCell>
              <TableCell className="font-mono text-zinc-400">string</TableCell>
              <TableCell className="text-zinc-500">Optional</TableCell>
              <TableCell className="text-zinc-300">Voter surname for fuzzy verification matching.</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <CodeBlock
          language="bash"
          title="cURL Request (Voter's Card)"
          code={`curl -X GET "https://api.verixaid.com/api/v1/kyc/vin?vin=90F5B12345678901234&state=Lagos&last_name=ADAMU" \\
  -H "Authorization: vrx_live_9f83a8f1e2b4c6d8_a1b2c3d4..." \\
  -H "AppId: app_6a7b8c9d0e1f"`}
        />
      </div>

      {/* 3. Passport Details */}
      <div className="space-y-3 pt-6 border-t border-zinc-800">
        <div className="flex items-center gap-2">
          <Badge variant="verified">NIS</Badge>
          <h2 className="text-lg font-bold text-white tracking-tight">International Passport (GET /api/v1/kyc/passport)</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Field</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Required</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-mono text-emerald-400 font-bold">passport_number</TableCell>
              <TableCell className="font-mono text-zinc-400">string</TableCell>
              <TableCell className="text-rose-400 font-bold">Required</TableCell>
              <TableCell className="text-zinc-300">Nigerian Passport booklet number (e.g. <code className="text-sky-300 font-mono">A12345678</code>).</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-zinc-300 font-bold">last_name</TableCell>
              <TableCell className="font-mono text-zinc-400">string</TableCell>
              <TableCell className="text-zinc-500">Optional</TableCell>
              <TableCell className="text-zinc-300">Passport holder surname.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-zinc-300 font-bold">dob</TableCell>
              <TableCell className="font-mono text-zinc-400">string</TableCell>
              <TableCell className="text-zinc-500">Optional</TableCell>
              <TableCell className="text-zinc-300">Date of birth in <code className="text-sky-300 font-mono">YYYY-MM-DD</code> format.</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <CodeBlock
          language="bash"
          title="cURL Request (Passport)"
          code={`curl -X GET "https://api.verixaid.com/api/v1/kyc/passport?passport_number=A12345678&last_name=MUSA&dob=1990-05-12" \\
  -H "Authorization: vrx_live_9f83a8f1e2b4c6d8_a1b2c3d4..." \\
  -H "AppId: app_6a7b8c9d0e1f"`}
        />
      </div>
    </div>
  )
}
