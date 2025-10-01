// src/components/clients/tabs/ReferralsTab.tsx
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
import { formatCurrency, formatDate } from "@/lib/formatters";
import { UnderWhomTree } from "@/components/clients/UnderWhomTree";

import { useGetReferralByUserIdQuery } from "@/API/referral.api";
import type {
  ReferralListItem,
  ReferralOverviewResponse,
} from "@/types/users/referral.types";

interface ReferralsTabProps {
  userId: number;
  clientName: string;
}

export function ReferralsTab({ userId, clientName }: ReferralsTabProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");

  const { data, isLoading, error } = useGetReferralByUserIdQuery(userId, {
    skip: !userId,
  });

  const normalized: {
    stats: {
      totalReferrals: number;
      bonusEarned: number;
      paidOut: number;
      pending: number;
      totalActiveInvestments: number;
    };
    referralsList: ReferralListItem[];
    underWhom: any;
  } = useMemo(() => {
    if (!data) {
      return {
        stats: {
          totalReferrals: 0,
          bonusEarned: 0,
          paidOut: 0,
          pending: 0,
          totalActiveInvestments: 0,
        },
        referralsList: [],
        underWhom: { referrer: null, referrerChildren: [] },
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
      ? data.referralsList
      : [];

    const underWhom = data.underWhom ?? {
      referrer: null,
      referrerChildren: [],
    };

    return { stats, referralsList, underWhom };
  }, [data]);

  // Derived filtered list (only depends on stable refs above)
  const filtered: ReferralListItem[] = useMemo(() => {
    const list = normalized.referralsList ?? [];
    return list
      .filter((r) => {
        if (status === "all") return true;
        const invStatus = (r.referredInvestment?.status ?? "").toLowerCase();
        return status === "paid"
          ? invStatus === "paid"
          : status === "unpaid"
          ? invStatus !== "paid"
          : true;
      })
      .filter((r) =>
        (r.referredUserName ?? "").toLowerCase().includes(query.toLowerCase())
      );
  }, [normalized.referralsList, status, query]);

  // --- UI render early returns (safe because hooks are already called above) ---
  if (!userId) {
    return <div>No user selected</div>;
  }

  if (isLoading) {
    return <div>Loading referrals…</div>;
  }

  if (error) {
    console.error("ReferralsTab API error:", error);
    return <div>Error loading referral data</div>;
  }

  if (!data) {
    return <div>No referral data</div>;
  }

  // Finally use normalized data for rendering
  const { stats, underWhom } = normalized;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        {/* Stats cards */}
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

        {/* Referrals table */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle>Referrals</CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="Search user..."
                className="h-8 w-[180px]"
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
                  <TableHead className="text-right">Account Balance</TableHead>
                  <TableHead className="text-right">Total Invested</TableHead>
                  <TableHead>Referred Investment</TableHead>
                  <TableHead className="text-right">
                    Eligible Bonus (1%)
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Credited On</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.referredUserId}>
                    <TableCell>{r.referredUserName ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(r.accountBalance ?? "0"))}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(r.totalInvested ?? "0"))}
                    </TableCell>
                    <TableCell>
                      {r.referredInvestment ? (
                        <div className="text-sm">
                          <div className="font-medium">
                            {r.referredInvestment.name}
                          </div>
                          <div className="text-muted-foreground">
                            {formatCurrency(
                              Number(r.referredInvestment.amount ?? "0")
                            )}{" "}
                            • {r.referredInvestment.status}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(
                        Number(r.referredInvestment?.eligibleBonus1Pct ?? "0")
                      )}
                    </TableCell>
                    <TableCell className="capitalize">
                      {r.referredInvestment?.activeLabel ?? "—"}
                    </TableCell>
                    <TableCell>
                      {r.referredInvestment?.creditedOn
                        ? formatDate(r.referredInvestment.creditedOn)
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
