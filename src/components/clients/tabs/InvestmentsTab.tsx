// src/components/clients/tabs/InvestmentsTab.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
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
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, formatPercentage } from "@/lib/formatters";
import { Pause, Play, Eye } from "lucide-react";
import { InvestmentDetailModal } from "@/components/clients/InvestmentDetailModal";
import type { UserInvestmentApi } from "@/types/users/userDetail.types";

import { useToast } from "@/hooks/use-toast";
import {
  usePauseInvestmentMutation,
  useResumeInvestmentMutation,
  useGetClientReturnsHistoryQuery,
} from "@/API/users.api";

/* ---------- helpers (kept from your original) ---------- */
const toNumber = (v?: string | number | null) => {
  if (v === undefined || v === null) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = parseFloat(String(v).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};
const norm = (v?: unknown) =>
  v === null || v === undefined ? "" : String(v).toLowerCase();
const capitalize = (s?: string) =>
  !s ? "" : String(s).charAt(0).toUpperCase() + String(s).slice(1);
const firstOfNextMonth = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth() + 1, 1);
const daysInMonth = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
const isSameYearMonth = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
const diffCalendarDays = (end: Date, start: Date) => {
  const MS = 24 * 60 * 60 * 1000;
  const a = new Date(
    end.getFullYear(),
    end.getMonth(),
    end.getDate()
  ).getTime();
  const b = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  ).getTime();
  return Math.round((a - b) / MS);
};
/* -------------------------------------------------------- */

interface InvestmentsTabProps {
  investments: UserInvestmentApi[];
  onChangeStatus?: (investmentId: number | string, status: string) => void;
}

export function InvestmentsTab({
  investments = [],
  onChangeStatus,
}: InvestmentsTabProps) {
  // derive `id` from route params (keeps ClientProfile unchanged)
  const { id } = useParams<{ id?: string }>();
  const parsedId = useMemo(() => {
    if (!id) return NaN;
    const n = Number(id);
    return Number.isFinite(n) ? n : NaN;
  }, [id]);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [openId, setOpenId] = useState<number | null>(null);
  const { toast } = useToast();

  // NEW filter controls: month, year and investment selection (from returns-history)
  // Select uses strings, so store as strings
  const [selectedMonth, setSelectedMonth] = useState<string>("all"); // "1".."12" or "all"
  const [selectedYear, setSelectedYear] = useState<string>("all"); // "2025" or "all"
  const [selectedInvestmentId, setSelectedInvestmentId] =
    useState<string>("all"); // "all" or "123"

  // RTK mutations
  const [pauseInvestment] = usePauseInvestmentMutation();
  const [resumeInvestment] = useResumeInvestmentMutation();

  // pending + local status map (same as your original)
  const [pendingForId, setPendingForId] = useState<number | string | null>(
    null
  );
  const [statusById, setStatusById] = useState<Record<string, string>>({});

  useEffect(() => {
    const map: Record<string, string> = {};
    for (const inv of investments || []) {
      if (inv?.id != null) map[String(inv.id)] = inv.investmentStatus ?? "";
    }
    setStatusById((prev) => {
      const keys = Object.keys(map);
      const prevKeys = Object.keys(prev);
      if (
        prevKeys.length === keys.length &&
        keys.every((k) => prev[k] === map[k])
      ) {
        return prev;
      }
      return map;
    });
  }, [investments]);

  // CALL THE NEW HOOK USING `id` (number). Skip if route id invalid
  const {
    data: returnsHistory,
    isLoading: returnsHistoryLoading,
    isError: returnsHistoryError,
  } = useGetClientReturnsHistoryQuery(parsedId, {
    skip: Number.isNaN(parsedId),
  });

  // Build investment id options from returnsHistory (unique, sorted by id)
  const investmentOptions = useMemo(() => {
    if (!returnsHistory) return [{ label: "All", value: "all" }];
    const opts = returnsHistory
      .map((r) => ({
        label: `${r.investmentId} — ${r.name}`,
        value: String(r.investmentId),
      }))
      // dedupe just in case
      .filter((v, i, arr) => arr.findIndex((x) => x.value === v.value) === i);
    return [{ label: "All", value: "all" }, ...opts];
  }, [returnsHistory]);

  // helper: find a returns-history record for an investment
  const findReturnsEntry = (investmentId: number | string) =>
    returnsHistory?.find(
      (r) => Number(r.investmentId) === Number(investmentId)
    );

  // helper: look up history item for a given investment & month/year (numbers expected)
  const lookupHistoryAmount = (
    investmentId: number | string,
    monthStr?: string,
    yearStr?: string
  ) => {
    if (!returnsHistory) return undefined;
    if (!monthStr || !yearStr) return undefined;
    if (monthStr === "all" || yearStr === "all") return undefined;
    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10);
    if (Number.isNaN(month) || Number.isNaN(year)) return undefined;
    const entry = findReturnsEntry(investmentId);
    if (!entry || !entry.history) return undefined;
    const found = entry.history.find(
      (h) => h.month === month && h.year === year
    );
    return found ? found.amount : undefined;
  };

  // Received last month map (still useful)
  const receivedLastMonthByInvestmentId = useMemo(() => {
    const map: Record<number, boolean> = {};
    if (!returnsHistory) return map;

    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lmMonth = lastMonth.getMonth() + 1;
    const lmYear = lastMonth.getFullYear();

    for (const item of returnsHistory) {
      const found = (item.history || []).some(
        (h) => h.month === lmMonth && h.year === lmYear
      );
      map[item.investmentId] = found;
    }
    return map;
  }, [returnsHistory]);

  // Compute monthly totals when month+year are selected
  const { monthlyTotalAll, monthlyTotalFiltered } = useMemo(() => {
    let totalAll = 0;
    let totalFiltered = 0;

    if (!returnsHistory || selectedMonth === "all" || selectedYear === "all") {
      return { monthlyTotalAll: 0, monthlyTotalFiltered: 0 };
    }

    const month = parseInt(selectedMonth, 10);
    const year = parseInt(selectedYear, 10);
    if (Number.isNaN(month) || Number.isNaN(year)) {
      return { monthlyTotalAll: 0, monthlyTotalFiltered: 0 };
    }

    // total across all investments in returnsHistory
    for (const r of returnsHistory) {
      const sumForR = (r.history ?? [])
        .filter((h) => h.month === month && h.year === year)
        .reduce((s, h) => s + toNumber(h.amount), 0);
      totalAll += sumForR;
    }

    // total across filtered investments (respecting selectedInvestmentId if set)
    const invsToInclude = new Set<number>();
    const q = norm(query).trim();
    for (const i of investments || []) {
      // status filter with archived mapping
      const statusOk =
        status === "all"
          ? true
          : status === "archived"
          ? ["archived", "completed"].includes(norm(i.investmentStatus))
          : norm(i.investmentStatus) === status;
      if (!statusOk) continue;

      // search filter
      if (
        !(
          norm(i.id).includes(q) ||
          norm(i.name).includes(q) ||
          norm(i.investmentStatus).includes(q)
        )
      )
        continue;

      // investment selector filter
      if (selectedInvestmentId && selectedInvestmentId !== "all") {
        if (String(i.id) !== selectedInvestmentId) continue;
      }

      // month/year requirement (we only include if returns-history has entry)
      const entry = findReturnsEntry(i.id);
      if (!entry) continue;
      const hasForMonth = (entry.history ?? []).some(
        (h) => h.month === month && h.year === year
      );
      if (!hasForMonth) continue;

      invsToInclude.add(Number(i.id));
    }

    for (const r of returnsHistory) {
      if (!invsToInclude.has(Number(r.investmentId))) continue;
      const sumForR = (r.history ?? [])
        .filter((h) => h.month === month && h.year === year)
        .reduce((s, h) => s + toNumber(h.amount), 0);
      totalFiltered += sumForR;
    }

    return { monthlyTotalAll: totalAll, monthlyTotalFiltered: totalFiltered };
  }, [
    returnsHistory,
    selectedMonth,
    selectedYear,
    investments,
    query,
    status,
    selectedInvestmentId,
  ]);

  // Main filtered dataset: applies search, status (with archived mapping), month/year and investment id filters
  const data = useMemo(() => {
    const q = norm(query).trim();
    const invFilter = selectedInvestmentId.trim();

    const filtered = (investments || [])
      .filter((i) =>
        status === "all"
          ? true
          : // "archived" UI value should match backend 'archived' or 'completed'
          status === "archived"
          ? ["archived", "completed"].includes(norm(i.investmentStatus))
          : norm(i.investmentStatus) === status
      )
      .filter((i) => {
        // search by numeric id, name and status (safe coercions)
        return (
          norm(i.id).includes(q) ||
          norm(i.name).includes(q) ||
          norm(i.investmentStatus).includes(q)
        );
      })
      .filter((i) => {
        // if an investment is selected from returnsHistory select, restrict to it
        if (invFilter && invFilter !== "all") {
          if (String(i.id) !== invFilter) return false;
        }

        // if both month & year specified -> require returns-history entry for that month/year
        if (selectedMonth !== "all" && selectedYear !== "all") {
          const amt = lookupHistoryAmount(i.id, selectedMonth, selectedYear);
          return amt !== undefined; // show only if a record exists for that month/year
        }

        // otherwise no month/year restriction
        return true;
      });

    return filtered;
  }, [
    investments,
    status,
    query,
    selectedMonth,
    selectedYear,
    selectedInvestmentId,
    returnsHistory,
  ]);

  // stats + helpers (same as original)
  const total = (investments || []).reduce((s, i) => s + toNumber(i.amount), 0);
  const active = (investments || []).filter(
    (i) => norm(i.investmentStatus) === "active"
  ).length;
  // "archived" refers to completed or archived
  const archivedCount = (investments || []).filter((i) =>
    ["completed", "archived"].includes(norm(i.investmentStatus))
  ).length;
  const avgRoi =
    investments && investments.length
      ? investments.reduce((s, i) => {
          const amt = toNumber(i.amount);
          const returns = toNumber(i.returnsBalance);
          return s + (amt > 0 ? (returns / amt) * 100 : 0);
        }, 0) / investments.length
      : 0;

  const daysActiveThisMonth = (startIso?: string) => {
    const now = new Date();
    // fallback to createdAt if start not provided
    const s = startIso ? new Date(startIso) : new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const effectiveStart = s > monthStart ? s : monthStart;
    const diff = Math.max(0, now.getTime() - effectiveStart.getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const proratedReturn = (i: UserInvestmentApi) => {
    const amount = toNumber(i.amount);
    if (amount <= 0) return 0;

    const monthlyRoi = 0.05; // 5% monthly
    const now = new Date();
    const created = i.createdAt ? new Date(i.createdAt) : now;

    // If investment started in a previous month -> full 5% for the month
    if (!isSameYearMonth(created, now)) {
      return amount * monthlyRoi;
    }

    // Started this month -> pay only remaining days
    const monthEndNext = firstOfNextMonth(now); // 1st of next month
    const remainingDays = Math.max(0, diffCalendarDays(monthEndNext, created)); // remaining days in this month
    const dim = daysInMonth(now);
    const factor = dim > 0 ? remainingDays / dim : 0;

    return amount * monthlyRoi * factor;
  };

  // Toggle pause/resume using the appropriate API (optimistic UI)
  const handleTogglePauseResume = async (
    investmentId: number | string,
    currentStatus?: string
  ) => {
    const key = String(investmentId);
    const isPaused = norm(currentStatus) === "paused";
    const newStatus = isPaused ? "active" : "paused"; // optimistic target
    const action = isPaused ? "resume" : "pause";

    // remember previous status for rollback if needed
    const prevStatus = statusById[key] ?? currentStatus ?? "";
    // optimistic update
    setStatusById((s) => ({ ...s, [key]: newStatus }));
    setPendingForId(investmentId);

    try {
      if (action === "pause") {
        await pauseInvestment({ id: investmentId }).unwrap();
        toast({
          title: "Investment paused",
          description: `Investment ${investmentId} was paused.`,
        });
        onChangeStatus?.(investmentId, "paused");
      } else {
        await resumeInvestment({ id: investmentId }).unwrap();
        toast({
          title: "Investment resumed",
          description: `Investment ${investmentId} was resumed.`,
        });
        onChangeStatus?.(investmentId, "active");
      }
    } catch (err: any) {
      setStatusById((s) => ({ ...s, [key]: prevStatus }));
      toast({
        title: `${action === "pause" ? "Pause" : "Resume"} failed`,
        description: err?.data?.message || err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setPendingForId(null);
    }
  };

  // Prepare month and year options for selects (string values)
  const monthOptions = useMemo(
    () => [
      { label: "All", value: "all" },
      { label: "Jan", value: "1" },
      { label: "Feb", value: "2" },
      { label: "Mar", value: "3" },
      { label: "Apr", value: "4" },
      { label: "May", value: "5" },
      { label: "Jun", value: "6" },
      { label: "Jul", value: "7" },
      { label: "Aug", value: "8" },
      { label: "Sep", value: "9" },
      { label: "Oct", value: "10" },
      { label: "Nov", value: "11" },
      { label: "Dec", value: "12" },
    ],
    []
  );

  const yearOptions = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const years: { label: string; value: string }[] = [
      { label: "All", value: "all" },
    ];
    // show last 5 years by default (including current)
    for (let y = currentYear; y >= currentYear - 4; y--) {
      years.push({ label: String(y), value: String(y) });
    }
    return years;
  }, []);

  const monthYearSelected = selectedMonth !== "all" && selectedYear !== "all";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">
              Total Investments
            </div>
            <div className="text-sm font-medium">{formatCurrency(total)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Active</div>
            <div className="text-sm font-medium">{active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Archived</div>
            <div className="text-sm font-medium">{archivedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Avg ROI</div>
            <div className="text-sm font-medium">
              {formatPercentage(avgRoi)}
            </div>
          </CardContent>
        </Card>

        {/* This Month Pro-Rated */}
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">
              This Month Pro-Rated
            </div>
            <div className="text-sm font-medium">
              {formatCurrency(data.reduce((s, i) => s + proratedReturn(i), 0))}
            </div>
          </CardContent>
        </Card>

        {/* NEW: Total received for selected month — placed beside This Month Pro-Rated */}
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">
              Total Received (Selected Mo)
            </div>
            <div className="text-sm font-medium">
              {monthYearSelected ? formatCurrency(monthlyTotalAll) : "—"}
            </div>
            {monthYearSelected && selectedInvestmentId !== "all" && (
              <div className="text-xs text-muted-foreground mt-1">
                Selected Inv: {formatCurrency(monthlyTotalFiltered)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle>Investments</CardTitle>

          <div className="flex gap-2 flex-wrap items-center">
            <Input
              placeholder="Search ID or name..."
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
                <SelectItem value="active">Active</SelectItem>
                {/* Archived (UI) maps to backend 'archived' or 'completed' */}
                <SelectItem value="archived">Archived</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>

            {/* Month/Year filters */}
            <Select
              value={selectedMonth}
              onValueChange={(v) => setSelectedMonth(String(v))}
            >
              <SelectTrigger className="h-8 w-[120px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((m) => (
                  <SelectItem key={String(m.value)} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedYear}
              onValueChange={(v) => setSelectedYear(String(v))}
            >
              <SelectTrigger className="h-8 w-[100px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((y) => (
                  <SelectItem key={String(y.value)} value={y.value}>
                    {y.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Investment selector populated from returns-history response */}
            <Select
              value={selectedInvestmentId}
              onValueChange={(v) => setSelectedInvestmentId(String(v))}
            >
              <SelectTrigger className="h-8 w-[220px]">
                <SelectValue placeholder="Investment" />
              </SelectTrigger>
              <SelectContent>
                {investmentOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-full table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[110px]">Investment ID</TableHead>
                  <TableHead className="w-[260px]">Name</TableHead>
                  <TableHead className="w-[140px] text-right">Amount</TableHead>
                  <TableHead className="w-[150px]">Start Date</TableHead>
                  <TableHead className="w-[110px]">Status</TableHead>
                  <TableHead className="w-[140px] text-right">
                    Days Active (Mo)
                  </TableHead>
                  <TableHead className="w-[160px] text-right">
                    Pro-rated Due (Mo)
                  </TableHead>
                  <TableHead className="w-[140px] text-right">
                    Lifetime Return
                  </TableHead>

                  {/* show this column only when a month+year is selected */}
                  {monthYearSelected && (
                    <TableHead className="w-[140px]">
                      Return (Selected Mo)
                    </TableHead>
                  )}

                  <TableHead className="w-[120px] text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {data.map((i) => {
                  const idNum = i.id;
                  const isPending =
                    pendingForId !== null &&
                    String(pendingForId) === String(idNum);
                  const currentStatus =
                    statusById[String(idNum)] ?? i.investmentStatus;
                  const isPaused = norm(currentStatus) === "paused";

                  // selected month/year lookup
                  const selectedReturnAmount = monthYearSelected
                    ? lookupHistoryAmount(idNum, selectedMonth, selectedYear)
                    : undefined;

                  return (
                    <TableRow key={idNum}>
                      <TableCell className="font-mono text-xs whitespace-nowrap">
                        {idNum}
                      </TableCell>

                      <TableCell className="max-w-[250px] truncate">
                        <div className="truncate">{i.name ?? "-"}</div>
                      </TableCell>

                      <TableCell className="text-right whitespace-nowrap">
                        {formatCurrency(toNumber(i.amount))}
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        {formatDate(i.createdAt ?? "")}
                      </TableCell>

                      <TableCell className="capitalize whitespace-nowrap">
                        {capitalize(norm(currentStatus))}
                      </TableCell>

                      <TableCell className="text-right whitespace-nowrap">
                        {daysActiveThisMonth(i.createdAt)}
                      </TableCell>

                      <TableCell className="text-right whitespace-nowrap">
                        {formatCurrency(proratedReturn(i))}
                      </TableCell>

                      <TableCell className="text-right whitespace-nowrap">
                        {formatCurrency(toNumber(i.returnsBalance))}
                      </TableCell>

                      {monthYearSelected && (
                        <TableCell className="text-right whitespace-nowrap">
                          {selectedReturnAmount !== undefined
                            ? formatCurrency(toNumber(selectedReturnAmount))
                            : "-"}
                        </TableCell>
                      )}

                      <TableCell className="text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setOpenId(Number(i.id))}
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleTogglePauseResume(i.id, currentStatus)
                            }
                            disabled={isPending}
                            title={
                              isPaused
                                ? "Resume investment"
                                : "Pause investment"
                            }
                          >
                            {isPending ? (
                              <span className="opacity-60">
                                {isPaused ? (
                                  <Play className="h-4 w-4" />
                                ) : (
                                  <Pause className="h-4 w-4" />
                                )}
                              </span>
                            ) : isPaused ? (
                              <Play className="h-4 w-4" />
                            ) : (
                              <Pause className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {data.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={monthYearSelected ? 11 : 10}
                      className="text-center py-6"
                    >
                      No investments match the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <InvestmentDetailModal
        open={
          openId !== null &&
          !!investments.find((inv) => Number(inv.id) === openId)
        }
        onOpenChange={(v) => {
          if (!v) setOpenId(null);
        }}
        investment={
          investments.find((inv) => Number(inv.id) === openId) ?? null
        }
        returnsHistory={returnsHistory ?? undefined}
      />
    </div>
  );
}
