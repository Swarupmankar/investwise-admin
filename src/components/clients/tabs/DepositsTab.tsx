// src/components/clients/tabs/DepositsTab.tsx
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { ScreenshotPreview } from "@/components/deposits/ScreenshotPreview";
import { TXIDCopy } from "@/components/deposits/TXIDCopy";
import type { DepositRequestApi } from "@/types/users/userDetail.types";

/** safe numeric parser */
const toNumber = (v?: string | number | null) => {
  if (v === undefined || v === null) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const cleaned = String(v).replace(/[^0-9.-]+/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
};

/** safe string normalizer */
const norm = (v?: unknown) =>
  v === null || v === undefined ? "" : String(v).toLowerCase().trim();

interface DepositsTabProps {
  deposits: DepositRequestApi[];
}

export function DepositsTab({ deposits = [] }: DepositsTabProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");

  const data = useMemo(() => {
    const q = norm(query);

    return (deposits || [])
      .filter((d) => (status === "all" ? true : norm(d.status) === status))
      .filter((d) => {
        // pick commonly used fields safely
        const idStr = norm(d.id);
        const txid = norm(
          (d as any).txId ?? (d as any).txid ?? (d as any).tx ?? ""
        );
        const amountStr = norm(d.amount);
        const created = norm((d as any).createdAt ?? (d as any).date ?? "");
        const emailOrNote = norm((d as any).note ?? (d as any).email ?? "");

        // if query empty, include
        if (!q) return true;

        return (
          idStr.includes(q) ||
          txid.includes(q) ||
          amountStr.includes(q) ||
          created.includes(q) ||
          emailOrNote.includes(q)
        );
      });
  }, [deposits, status, query]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle>Deposits (Log)</CardTitle>

          <div className="flex gap-2">
            <Input
              placeholder="Search ID, TXID or amount..."
              className="h-8 w-[220px]"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-8 w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-full table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Request ID</TableHead>
                  <TableHead className="w-[140px] text-right">Amount</TableHead>
                  <TableHead className="w-[220px]">TXID</TableHead>
                  <TableHead className="w-[120px]">Screenshot</TableHead>
                  <TableHead className="w-[160px]">Submitted</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {data.map((d) => {
                  const id = (d as any).id ?? "";
                  const amount = toNumber(d.amount);
                  const txid =
                    (d as any).txId ?? (d as any).txid ?? (d as any).tx ?? null;
                  const screenshot =
                    (d as any).screenshot ?? (d as any).proofUrl ?? null;
                  const submittedIso =
                    (d as any).createdAt ??
                    (d as any).date ??
                    (d as any).submittedAt ??
                    null;
                  const statusVal = (d as any).status ?? "";

                  return (
                    <TableRow key={String(id)}>
                      <TableCell className="font-mono text-xs whitespace-nowrap">
                        {String(id)}
                      </TableCell>

                      <TableCell className="text-right whitespace-nowrap">
                        {formatCurrency(amount)}
                      </TableCell>

                      <TableCell className="max-w-[200px] truncate">
                        {txid ? <TXIDCopy txid={String(txid)} /> : "—"}
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        <ScreenshotPreview imageUrl={screenshot} />
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        {submittedIso ? formatDate(String(submittedIso)) : "—"}
                      </TableCell>

                      <TableCell className="capitalize whitespace-nowrap">
                        {String(statusVal)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
