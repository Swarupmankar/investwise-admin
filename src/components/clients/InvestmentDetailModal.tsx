// src/components/clients/InvestmentDetailModal.tsx
import { useState } from "react";
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

interface InvestmentDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  investment?: UserInvestmentApi | null;
}

/** Safe numeric parser for strings/numbers */
const toNumber = (v?: string | number | null) => {
  if (v === undefined || v === null) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const cleaned = String(v).replace(/[^0-9.-]+/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
};

function daysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function nextMonthFirst(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

export function InvestmentDetailModal({
  open,
  onOpenChange,
  investment,
}: InvestmentDetailModalProps) {
  const [monthlyRoi] = useState(0.05); // 5% monthly placeholder

  if (!investment) return null;

  // Use createdAt as the investment start date (API field)
  const createdAtIso =
    investment.createdAt ?? investment.updatedAt ?? new Date().toISOString();

  // NOW and basic numeric values
  const now = new Date();
  const principal = toNumber(investment.amount);
  const lifetimeReturn = toNumber(investment.returnsBalance); // use returnsBalance as lifetime return
  const nextReturnAmount = principal * monthlyRoi;
  const totalValue = principal + lifetimeReturn;

  // ---- Progress calculation (CHANGED) ----
  // We show progress across the current month period (1st -> next month's 1st).
  // Example: if today is Sept 27 => elapsedDays = 27, totalDays = 30, daysRemaining = 3.
  const totalDays = daysInMonth(now);
  // elapsedDays = day-of-month (1..totalDays)
  const elapsedDays = now.getDate();
  const daysRemaining = Math.max(0, totalDays - elapsedDays);
  // percentComplete is fraction of the month elapsed
  const percentComplete = Math.min(
    100,
    Math.max(0, (elapsedDays / totalDays) * 100)
  );
  const percentRemaining = Math.max(0, 100 - percentComplete);
  // ----------------------------------------

  const nextReturnDate = nextMonthFirst(now);
  const displayLabel = investment.name
    ? `${investment.name} (${investment.id})`
    : String(investment.id);
  const status = (investment.investmentStatus ?? "").toString().toLowerCase();

  const totalRoiPct = principal > 0 ? (lifetimeReturn / principal) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full h-[100dvh] max-w-[100vw] rounded-none overflow-y-auto overflow-x-hidden box-border p-4 sm:h-auto sm:max-w-4xl sm:max-h-[85vh] sm:rounded-lg sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-3">
            <span className="font-mono">Investment {displayLabel}</span>
            <Badge className="capitalize">{status}</Badge>
          </DialogTitle>
          <DialogDescription>
            Detailed investment metrics, monthly progress, and next return
            schedule.
          </DialogDescription>
        </DialogHeader>

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
              Next return on {formatDate(nextReturnDate.toISOString())} for{" "}
              {formatCurrency(nextReturnAmount)}.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground">
                Monthly ROI (est.)
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
                Next Return Amount
              </div>
              <div className="text-xl font-semibold">
                {formatCurrency(nextReturnAmount)}
              </div>
              <div className="text-xs text-muted-foreground">
                Scheduled on {formatDate(nextReturnDate.toISOString())}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground">
                Progress this month
              </div>

              <div className="flex items-center justify-between text-xs mt-1">
                <span>{elapsedDays} days elapsed</span>
                <span>{daysRemaining} days left</span>
              </div>

              <Progress value={Math.round(percentComplete)} className="mt-2" />

              <div className="text-xs text-muted-foreground mt-1">
                {Math.round(percentComplete)}% complete
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
              <div className="font-medium">{formatDate(createdAtIso)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground">
                Next Return Date
              </div>
              <div className="font-medium">
                {formatDate(nextReturnDate.toISOString())}
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
              <div className="font-medium">{formatCurrency(totalValue)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground">Total ROI</div>
              <div className="font-medium">{totalRoiPct.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
