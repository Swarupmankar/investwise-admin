import React, { useState, useMemo } from "react";
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
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/formatters";
import { UnderWhomTree } from "@/components/clients/UnderWhomTree";
import { useGetReferralByUserIdQuery } from "@/API/referral.api";
import type { ReferralListItem } from "@/types/users/referral.types";

interface ReferralsTabProps {
  userId: number;
  clientName: string;
}

type FlatRow = {
  user: ReferralListItem;
  investment: NonNullable<ReferralListItem["referredInvestments"][0]>;
};

export function ReferralsTab({ userId, clientName }: ReferralsTabProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");

  const { data, isLoading, error } = useGetReferralByUserIdQuery(userId, {
    skip: !userId,
  });

  const normalized = useMemo(() => {
    if (!data) {
      return {
        stats: {
          totalReferrals: 0,
          bonusEarned: 0,
          paidOut: 0,
          pending: 0,
          totalActiveInvestments: 0,
        },
        referralsList: [] as ReferralListItem[],
        underWhom: { referrer: null, referrerChildren: [] as any[] },
      };
    }

    const statsRaw = data.stats ?? ({} as any);
    const stats = {
      totalReferrals: Number(statsRaw.totalReferrals ?? 0),
      bonusEarned: Number(statsRaw.bonusEarned ?? 0),
      paidOut: Number(statsRaw.paidOut ?? 0),
      pending: Number(statsRaw.pending ?? 0),
      totalActiveInvestments: Number(statsRaw.totalActiveInvestments ?? 0),
    };

    const referralsList = Array.isArray(data.referralsList)
      ? data.referralsList.map((r: any) => ({
          ...r,
          referredInvestments: Array.isArray(r.referredInvestments)
            ? r.referredInvestments
            : r.referredInvestment
            ? [r.referredInvestment]
            : [],
        }))
      : [];

    const underWhom = data.underWhom ?? {
      referrer: null,
      referrerChildren: [],
    };

    return { stats, referralsList, underWhom };
  }, [data]);

  const flatRows: FlatRow[] = useMemo(() => {
    const rows: FlatRow[] = [];
    for (const user of normalized.referralsList) {
      const investments = user.referredInvestments ?? [];
      for (const inv of investments) {
        rows.push({ user, investment: inv });
      }
    }
    return rows;
  }, [normalized.referralsList]);

  const filtered = useMemo(() => {
    return flatRows.filter((row) => {
      const invStatus = (row.investment.status ?? "").toLowerCase();
      if (status === "paid" && invStatus !== "paid") return false;
      if (status === "unpaid" && invStatus === "paid") return false;

      const q = query.trim().toLowerCase();
      if (!q) return true;
      const userName = (row.user.referredUserName ?? "").toLowerCase();
      const userEmail = (row.user.referredUserEmail ?? "").toLowerCase();
      const invName = (row.investment.name ?? "").toLowerCase();
      return (
        userName.includes(q) || userEmail.includes(q) || invName.includes(q)
      );
    });
  }, [flatRows, status, query]);

  if (!userId) return <div>No user selected</div>;
  if (isLoading) return <div>Loading referrals…</div>;
  if (error) {
    console.error("ReferralsTab API error:", error);
    return <div>Error loading referral data</div>;
  }
  if (!data) return <div>No referral data</div>;

  const { stats, underWhom } = normalized;

  const computePercentAmount = (amountStr: string | undefined, pct: number) => {
    const amt = Number(amountStr ?? "0");
    if (!Number.isFinite(amt) || amt === 0) return 0;
    return +(amt * pct);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Card>
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground">
                Total Referrals
              </div>
              <div className="text-sm font-medium">{stats.totalReferrals}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground">Bonus Earned</div>
              <div className="text-sm font-medium">
                {formatCurrency(stats.bonusEarned)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground">Paid Out</div>
              <div className="text-sm font-medium">
                {formatCurrency(stats.paidOut)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground">Pending</div>
              <div className="text-sm font-medium">
                {formatCurrency(stats.pending)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle>Referrals</CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="Search user or investment..."
                className="h-8 w-[240px]"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-8 w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
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
                  {/* Changed header label: Invested Amount (shows investment.amount) */}
                  <TableHead className="text-right">Invested Amount</TableHead>
                  <TableHead className="text-right">Total Invested</TableHead>
                  <TableHead>Investment</TableHead>
                  <TableHead className="text-right">Eligible (1%)</TableHead>
                  <TableHead className="text-right">Eligible (5%)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Referral Earned</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.map((row) => {
                  const u = row.user;
                  const inv = row.investment;
                  const key = `${u.referredUserId}-${inv.investmentId}`;

                  const onePct = computePercentAmount(inv.amount, 0.01);
                  const fivePct = computePercentAmount(inv.amount, 0.05);

                  const type = inv.referralInvestmentType ?? "";
                  const showOne = type === "ReferralOnePercent";
                  const showFive = type === "ReferralThreeMonths";

                  return (
                    <TableRow key={key}>
                      <TableCell>
                        <div className="font-medium">
                          {u.referredUserName ?? "—"}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {u.referredUserEmail ?? ""}
                        </div>
                      </TableCell>

                      {/* Invested Amount (per investment.amount) */}
                      <TableCell className="text-right">
                        {formatCurrency(Number(inv.amount ?? "0"))}
                      </TableCell>

                      <TableCell className="text-right">
                        {formatCurrency(Number(u.totalInvested ?? "0"))}
                      </TableCell>

                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{inv.name}</div>
                          <div className="text-muted-foreground">
                            {inv.status}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        {showOne && onePct > 0 ? formatCurrency(onePct) : "—"}
                      </TableCell>

                      <TableCell className="text-right">
                        {showFive && fivePct > 0
                          ? formatCurrency(fivePct)
                          : "—"}
                      </TableCell>

                      <TableCell className="capitalize">
                        {inv.activeLabel ?? inv.status ?? "—"}
                      </TableCell>

                      <TableCell className="text-right">
                        {inv.referralEarningAmount
                          ? formatCurrency(Number(inv.referralEarningAmount))
                          : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {filtered.length === 0 && (
              <div className="mt-4 text-center text-muted-foreground">
                No referrals found
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="xl:col-span-1">
        <UnderWhomTree clientName={clientName} underWhom={underWhom} />
      </div>
    </div>
  );
}

export default ReferralsTab;
