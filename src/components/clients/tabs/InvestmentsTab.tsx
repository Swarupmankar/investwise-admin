import { useEffect, useMemo, useState } from "react";
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
} from "@/API/users.api";

/**
 * Helper: safely convert string|number|undefined to a number
 */
const toNumber = (v?: string | number | null) => {
  if (v === undefined || v === null) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = parseFloat(String(v).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

/**
 * Helper: safe lowercase string for searching
 */
const norm = (v?: unknown) =>
  v === null || v === undefined ? "" : String(v).toLowerCase();

const capitalize = (s?: string) =>
  !s ? "" : String(s).charAt(0).toUpperCase() + String(s).slice(1);

const firstOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const firstOfNextMonth = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth() + 1, 1);
const daysInMonth = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

const isSameYearMonth = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

/** exclusive of the end date (25th → 1st next = remaining days in month) */
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

interface InvestmentsTabProps {
  investments: UserInvestmentApi[];
  onChangeStatus?: (investmentId: number | string, status: string) => void;
}

export function InvestmentsTab({
  investments = [],
  onChangeStatus,
}: InvestmentsTabProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [openId, setOpenId] = useState<number | null>(null);
  const { toast } = useToast();

  // RTK mutations
  const [pauseInvestment] = usePauseInvestmentMutation();
  const [resumeInvestment] = useResumeInvestmentMutation();

  // track pending action per id
  const [pendingForId, setPendingForId] = useState<number | string | null>(
    null
  );

  // local map of statuses so UI can update immediately (optimistic)
  const [statusById, setStatusById] = useState<Record<string, string>>({});

  // Sync local status map whenever investments prop changes
  useEffect(() => {
    const map: Record<string, string> = {};
    for (const inv of investments || []) {
      if (inv?.id != null) map[String(inv.id)] = inv.investmentStatus ?? "";
    }
    setStatusById((prev) => {
      // avoid unnecessary resets if identical
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

  const data = useMemo(() => {
    const q = norm(query).trim();

    return (investments || [])
      .filter((i) =>
        status === "all" ? true : norm(i.investmentStatus) === status
      )
      .filter((i) => {
        // search by numeric id, name and status (safe coercions)
        return (
          norm(i.id).includes(q) ||
          norm(i.name).includes(q) ||
          norm(i.investmentStatus).includes(q)
        );
      });
  }, [investments, status, query]);

  // totals and stats (use safe number parsing)
  const total = (investments || []).reduce((s, i) => s + toNumber(i.amount), 0);
  const active = (investments || []).filter(
    (i) => norm(i.investmentStatus) === "active"
  ).length;
  const completed = (investments || []).filter(
    (i) => norm(i.investmentStatus) === "completed"
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
      // rollback on error
      setStatusById((s) => ({ ...s, [key]: prevStatus }));
      console.error("Pause/Resume failed:", err);
      toast({
        title: `${action === "pause" ? "Pause" : "Resume"} failed`,
        description: err?.data?.message || err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setPendingForId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
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
            <div className="text-xs text-muted-foreground">Completed</div>
            <div className="text-sm font-medium">{completed}</div>
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
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle>Investments</CardTitle>

          <div className="flex gap-2">
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
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* horizontal scroll on small screens + fixed table layout for stable columns */}
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
                  <TableHead className="w-[120px] text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {data.map((i) => {
                  const id = i.id;
                  const isPending =
                    pendingForId !== null &&
                    String(pendingForId) === String(id);
                  // prefer local status if present, otherwise use prop
                  const currentStatus =
                    statusById[String(id)] ?? i.investmentStatus;
                  const isPaused = norm(currentStatus) === "paused";

                  return (
                    <TableRow key={id}>
                      <TableCell className="font-mono text-xs whitespace-nowrap">
                        {id}
                      </TableCell>

                      {/* Name: allow truncation */}
                      <TableCell className="max-w-[250px] truncate">
                        <div className="truncate">{i.name ?? "-"}</div>
                      </TableCell>

                      {/* Numeric: right aligned, no wrapping */}
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
      />
    </div>
  );
}
