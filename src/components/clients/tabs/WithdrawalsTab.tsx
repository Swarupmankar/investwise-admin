// src/components/clients/tabs/WithdrawalsTab.tsx
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { WithdrawRequestApi } from "@/types/users/userDetail.types";

const toNumber = (v?: string | number | null) => {
  if (v === undefined || v === null) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const cleaned = String(v).replace(/[^0-9.-]+/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
};

const norm = (v?: unknown) =>
  v === null || v === undefined ? "" : String(v).toLowerCase().trim();

const canonicalWithdrawFrom = (raw?: string) => {
  const s = (raw ?? "").toString().trim();

  if (s === "INVESTMENT_RETURNS") return "return";
  if (s === "REFERRAL_EARNING") return "referral";
  if (s === "FUNDS_AVAILABLE") return "principal";

  const lower = norm(s);
  if (!lower) return "other";
  if (lower.includes("return")) return "return";
  if (lower.includes("referr")) return "referral";
  if (lower.includes("principal") || lower.includes("funds"))
    return "principal";
  if (lower.includes("payout")) return "return";
  return "other";
};

const canonicalStatus = (raw?: string) => {
  const s = norm(raw);
  if (!s) return "unknown";
  if (s.includes("pend")) return "pending";
  if (s.includes("reject")) return "rejected";
  if (
    s.includes("complete") ||
    s.includes("approve") ||
    s.includes("paid") ||
    s.includes("success")
  )
    return "completed";
  return s;
};

interface WithdrawalsTabProps {
  withdrawals: WithdrawRequestApi[];
}

export function WithdrawalsTab({ withdrawals = [] }: WithdrawalsTabProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [subtab, setSubtab] = useState<"return" | "referral" | "principal">(
    "return"
  );

  useEffect(() => {
    console.debug(
      "[WithdrawalsTab] incoming withdrawals:",
      withdrawals?.length ?? 0,
      withdrawals?.slice?.(0, 5)
    );
  }, [withdrawals]);

  const filteredByType = useMemo(() => {
    const arr = (withdrawals || []).filter(
      (w) => canonicalWithdrawFrom(w.withdrawFrom) === subtab
    );
    console.debug(
      `[WithdrawalsTab] filteredByType (${subtab}) count:`,
      arr.length,
      arr.slice(0, 5)
    );
    return arr;
  }, [withdrawals, subtab]);

  const data = useMemo(() => {
    const q = norm(query);

    const res = filteredByType
      .filter((w) =>
        status === "all" ? true : canonicalStatus(w.status) === status
      )
      .filter((w) => {
        if (!q) return true;
        const idStr = norm(w.id);
        const txid = norm(w.txId ?? "");
        const wallet = norm(w.userWallet ?? "");
        const amount = norm(w.amount);
        const created = norm(w.createdAt ?? "");
        return (
          idStr.includes(q) ||
          txid.includes(q) ||
          wallet.includes(q) ||
          amount.includes(q) ||
          created.includes(q)
        );
      });

    console.debug(
      "[WithdrawalsTab] data after status/query filters:",
      res.length,
      res.slice(0, 5)
    );
    return res;
  }, [filteredByType, status, query]);

  const totals = useMemo(() => {
    const sums: Record<string, number> = {
      return: 0,
      referral: 0,
      principal: 0,
      other: 0,
    };
    (withdrawals || []).forEach((w) => {
      const key = canonicalWithdrawFrom(w.withdrawFrom);
      const amt = toNumber(w.amount);
      sums[key] = (sums[key] || 0) + amt;
    });
    console.debug("[WithdrawalsTab] totals:", sums);
    return sums as {
      return: number;
      referral: number;
      principal: number;
      other: number;
    };
  }, [withdrawals]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 justify-end text-sm">
        <div className="text-muted-foreground">This user total paid</div>
        <div className="font-medium">
          Returns: {formatCurrency(totals.return)}
        </div>
        <div className="font-medium">
          Referrals: {formatCurrency(totals.referral)}
        </div>
        <div className="font-medium">
          Principal: {formatCurrency(totals.principal)}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <CardTitle>Withdrawals (Log)</CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs value={subtab} onValueChange={(v) => setSubtab(v as any)}>
            <div className="sticky top-0 z-30 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 -mx-6 px-6">
              <div className="mt-4">
                <TabsList>
                  <TabsTrigger value="return">Returns</TabsTrigger>
                  <TabsTrigger value="referral">Referrals</TabsTrigger>
                  <TabsTrigger value="principal">Principal</TabsTrigger>
                </TabsList>
              </div>
            </div>

            <div className="flex justify-end gap-2 my-3">
              <Input
                placeholder="Search ID, TXID, wallet or amount..."
                className="h-8 w-[220px]"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-8 w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <TabsContent value="return">
              <WithdrawalsTable data={data} />
            </TabsContent>
            <TabsContent value="referral">
              <WithdrawalsTable data={data} />
            </TabsContent>
            <TabsContent value="principal">
              <WithdrawalsTable data={data} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function WithdrawalsTable({ data }: { data: WithdrawRequestApi[] }) {
  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Request ID</TableHead>
            <TableHead className="w-[140px] text-right">Amount</TableHead>
            <TableHead className="w-[240px]">Wallet / TXID</TableHead>
            <TableHead className="w-[160px]">Requested At</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((w) => {
            const id = w.id ?? "";
            const amt = toNumber(w.amount);
            const wallet = w.userWallet ?? "—";
            const txid = w.txId ?? null;
            const requestedAt = w.createdAt ?? null;
            const statusVal = canonicalStatus(w.status);

            return (
              <TableRow key={String(id)}>
                <TableCell className="font-mono text-xs whitespace-nowrap">
                  {String(id)}
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  {formatCurrency(amt)}
                </TableCell>

                <TableCell className="max-w-[220px] truncate">
                  <div className="text-sm">
                    <div className="truncate">{wallet}</div>
                    {txid ? (
                      <div className="text-xs text-muted-foreground truncate">
                        TX: {String(txid)}
                      </div>
                    ) : null}
                  </div>
                </TableCell>

                <TableCell className="whitespace-nowrap">
                  {requestedAt ? formatDate(String(requestedAt)) : "—"}
                </TableCell>
                <TableCell className="capitalize whitespace-nowrap">
                  {statusVal}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
