import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Referral } from "@/types/client";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { UnderWhomTree } from "@/components/clients/UnderWhomTree";

interface ReferralsTabProps {
  referrals: Referral[];
  clientName: string;
}

export function ReferralsTab({ referrals, clientName }: ReferralsTabProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");

  const data = useMemo(() => {
    return referrals
      .filter((r) => (status === "all" ? true : r.status === status))
      .filter((r) => r.referredClientName.toLowerCase().includes(query.toLowerCase()));
  }, [referrals, status, query]);

  const total = referrals.length;
  const earned = referrals.reduce((s, r) => s + r.bonusReceived, 0);
  const paid = referrals.filter((r) => r.status === "paid").reduce((s, r) => s + r.bonusReceived, 0);
  const pending = earned - paid;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">Total Referrals</div><div className="text-sm font-medium">{total}</div></CardContent></Card>
          <Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">Bonus Earned</div><div className="text-sm font-medium">{formatCurrency(earned)}</div></CardContent></Card>
          <Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">Paid Out</div><div className="text-sm font-medium">{formatCurrency(paid)}</div></CardContent></Card>
          <Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">Pending</div><div className="text-sm font-medium">{formatCurrency(pending)}</div></CardContent></Card>
        </div>

        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle>Referrals</CardTitle>
            <div className="flex gap-2">
              <Input placeholder="Search user..." className="h-8 w-[180px]" value={query} onChange={(e) => setQuery(e.target.value)} />
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-8 w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referred User</TableHead>
                  <TableHead className="text-right">Account Balance</TableHead>
                  <TableHead className="text-right">Total Invested</TableHead>
                  <TableHead>Referred Investment</TableHead>
                  <TableHead className="text-right">Eligible Bonus (1%)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Credited On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.referredClientName}</TableCell>
                    <TableCell className="text-right">{formatCurrency(r.referredClientBalance ?? 0)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(r.referredClientTotalInvested ?? 0)}</TableCell>
                    <TableCell>
                      {r.referredInvestmentId ? (
                        <div className="text-sm">
                          <div className="font-medium">{r.referredInvestmentId}</div>
                          <div className="text-muted-foreground">{formatCurrency(r.referredInvestmentAmount ?? 0)} • {r.referredInvestmentStatus}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(r.bonusReceived)}</TableCell>
                    <TableCell className="capitalize">{r.status}</TableCell>
                    <TableCell>{formatDate(r.date)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="xl:col-span-1">
        <UnderWhomTree clientName={clientName} referrals={referrals} />
      </div>
    </div>
  );
}
