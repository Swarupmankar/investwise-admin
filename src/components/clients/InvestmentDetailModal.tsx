// src/components/clients/InvestmentDetailModal.tsx
import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

import { formatCurrency, formatDate } from "@/lib/formatters";
import type { UserInvestmentApi } from "@/types/users/userDetail.types";

/** ---------- Helpers (robust number + monthly cycle) ---------- */
const parseAmountRobust = (v: unknown): number => {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const cleaned = v.replace(/[^\d.-]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  }
  try {
    const cleaned = String(v ?? "").replace(/[^\d.-]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
};

const toDateOnly = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());
const firstOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const firstOfNextMonth = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth() + 1, 1);
const lastOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
const differenceInCalendarDays = (a: Date, b: Date) => {
  const a0 = toDateOnly(a).getTime();
  const b0 = toDateOnly(b).getTime();
  const MS = 24 * 60 * 60 * 1000;
  return Math.round((a0 - b0) / MS);
};

const computeMonthlyCycle = (referenceDate?: string | Date) => {
  const now = new Date();
  const startOfThisMonth = firstOfMonth(now);
  const firstOfNext = firstOfNextMonth(now);

  let parsedStart: Date | null = null;
  if (referenceDate) {
    const parsed = new Date(referenceDate);
    if (!Number.isNaN(parsed.getTime())) parsedStart = toDateOnly(parsed);
  }

  let startOfCycle: Date;
  let maturityDate: Date;

  if (
    parsedStart &&
    parsedStart.getFullYear() === now.getFullYear() &&
    parsedStart.getMonth() === now.getMonth()
  ) {
    startOfCycle = parsedStart;
    maturityDate = firstOfNextMonth(startOfCycle);
  } else {
    startOfCycle = startOfThisMonth;
    maturityDate = firstOfNext;
  }

  const daysInThisMonth = lastOfMonth(now).getDate();

  let totalDays = differenceInCalendarDays(maturityDate, startOfCycle);
  if (totalDays <= 0) totalDays = 1;

  let daysCompleted = differenceInCalendarDays(
    now < maturityDate ? now : maturityDate,
    startOfCycle
  );
  if (daysCompleted < 0) daysCompleted = 0;
  if (daysCompleted > totalDays) daysCompleted = totalDays;

  let daysRemaining = differenceInCalendarDays(maturityDate, now);
  if (daysRemaining < 0) daysRemaining = 0;

  const progressPct = (daysCompleted / totalDays) * 100;

  return {
    startDate: startOfCycle,
    maturityDate,
    daysInThisMonth,
    daysCompleted,
    daysRemaining,
    totalDays,
    progress: Math.round(Math.max(0, Math.min(100, progressPct))),
  };
};
/** ------------------------------------------------------------ */

interface InvestmentDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  investment?: UserInvestmentApi | null;
}

export function InvestmentDetailModal({
  open,
  onOpenChange,
  investment,
}: InvestmentDetailModalProps) {
  // Always call hooks in the same order on every render
  const [monthlyRoi] = useState(0.05); // 5% monthly

  // Use safe fallbacks so hooks can run even if `investment` is null
  const startIso =
    (investment as any)?.startDate ??
    investment?.createdAt ??
    investment?.updatedAt ??
    new Date().toISOString();

  const principal = parseAmountRobust(investment?.amount);
  const lifetimeReturn = parseAmountRobust(investment?.returnsBalance);

  const cycle = useMemo(() => computeMonthlyCycle(startIso), [startIso]);

  const monthlyReturn = principal * monthlyRoi;
  const dailyReturn =
    cycle.daysInThisMonth > 0 ? monthlyReturn / cycle.daysInThisMonth : 0;
  const proRatedThisMonth =
    cycle.totalDays > 0
      ? monthlyReturn * (cycle.daysCompleted / cycle.totalDays)
      : 0;

  const totalValue = principal + lifetimeReturn;
  const totalRoiPct = principal > 0 ? (lifetimeReturn / principal) * 100 : 0;

  const displayLabel = investment?.name
    ? `${investment.name} (${investment.id})`
    : investment?.id
    ? String(investment.id)
    : "—";

  const status = (investment?.investmentStatus ?? "").toString().toLowerCase();

  const hasInvestment = !!investment;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full h-[100dvh] max-w-[100vw] rounded-none overflow-y-auto overflow-x-hidden box-border p-4 sm:h-auto sm:max-w-4xl sm:max-h-[85vh] sm:rounded-lg sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-3">
            <span className="font-mono">Investment {displayLabel}</span>
            {hasInvestment && <Badge className="capitalize">{status}</Badge>}
          </DialogTitle>
          <DialogDescription>
            Detailed investment metrics, monthly progress, and next return
            schedule.
          </DialogDescription>
        </DialogHeader>

        {!hasInvestment ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              No investment selected. Close this dialog and try again.
            </CardContent>
          </Card>
        ) : (
          <>
            {status === "paused" && (
              <Alert className="mb-3">
                <AlertTitle>Investment paused</AlertTitle>
                <AlertDescription>
                  Returns are on hold until resumed.
                </AlertDescription>
              </Alert>
            )}
            {status === "completed" && (
              <Alert className="mb-3">
                <AlertTitle>Investment completed</AlertTitle>
                <AlertDescription>
                  No further returns will be generated.
                </AlertDescription>
              </Alert>
            )}
            {status === "active" && (
              <Alert className="mb-3">
                <AlertTitle>Investment active</AlertTitle>
                <AlertDescription>
                  Next maturity on{" "}
                  {formatDate(cycle.maturityDate.toISOString())}. Estimated
                  daily return {formatCurrency(dailyReturn)} (~
                  {formatCurrency(monthlyReturn)} / month).
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Card>
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">
                    Monthly ROI
                  </div>
                  <div className="text-lg font-semibold">
                    {(monthlyRoi * 100).toFixed(1)}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">Invested</div>
                  <div className="text-lg font-semibold">
                    {formatCurrency(principal)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">
                    Lifetime Return Credited
                  </div>
                  <div className="text-lg font-semibold">
                    {formatCurrency(lifetimeReturn)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">
                    Next Return (est.)
                  </div>
                  <div className="text-xl font-semibold">
                    {formatCurrency(dailyReturn)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ~ {formatCurrency(monthlyReturn)} / month
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">
                    Maturity Date
                  </div>
                  <div className="text-xl font-semibold">
                    {formatDate(cycle.maturityDate.toISOString())}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Principal available
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">
                    Progress this cycle
                  </div>

                  <div className="flex items-center justify-between text-xs mt-1">
                    <span>{cycle.daysCompleted} days elapsed</span>
                    <span>{cycle.daysRemaining} days left</span>
                  </div>

                  <Progress value={cycle.progress} className="mt-2" />
                  <div className="text-xs text-muted-foreground mt-1">
                    {cycle.progress}% complete
                  </div>

                  <div className="flex justify-between text-[11px] text-muted-foreground pt-2 border-t mt-3">
                    <span>
                      Started: {formatDate(cycle.startDate.toISOString())}
                    </span>
                    <span>
                      Ends: {formatDate(cycle.maturityDate.toISOString())}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">
                    Days in this month
                  </div>
                  <div className="text-lg font-semibold">
                    {cycle.daysInThisMonth}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Cycle: {cycle.totalDays} calendar days
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <Card>
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">
                    Investment Date
                  </div>
                  <div className="font-medium">
                    {formatDate(new Date(startIso).toISOString())}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">
                    Next Maturity
                  </div>
                  <div className="font-medium">
                    {formatDate(cycle.maturityDate.toISOString())}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <Card>
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">
                    Total Value (Principal + Credited)
                  </div>
                  <div className="font-medium">
                    {formatCurrency(totalValue)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">Total ROI</div>
                  <div className="font-medium">{totalRoiPct.toFixed(1)}%</div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default InvestmentDetailModal;
