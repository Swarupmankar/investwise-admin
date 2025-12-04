import React from "react";
import {
  Vault,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowRight,
} from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import type { AdminAccount } from "@/types/adminTransaction";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BalanceOverviewCardsProps {
  account: AdminAccount;
  onWithdrawClick: (type: "net_profit" | "principal") => void;
  onReplenishClick?: () => void;

  // optional override for current PnL
  currentPnL?: number;
  onMovePnLClick?: () => void;
}

export const BalanceOverviewCards = ({
  account,
  onWithdrawClick,
  onReplenishClick,
  currentPnL,
  onMovePnLClick,
}: BalanceOverviewCardsProps) => {
  const current = account.currentPrincipalWithdrawn ?? 0;

  // Show "-$X" when negative, otherwise show "$X"
  const currentDisplay =
    current < 0
      ? "-" + formatCurrency(Math.abs(current))
      : formatCurrency(current);

  // PnL helpers – prefer prop, fall back to account.currentPnl
  const pnl =
    typeof currentPnL === "number" ? currentPnL : account.currentPnl ?? 0;

  const isPnLPositive = pnl > 0;
  const pnlLabel = isPnLPositive
    ? "Surplus"
    : pnl < 0
    ? "Deficit"
    : "Break-even";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Net Profit Available */}
      <DashboardCard
        title="Net Profit Available"
        icon={<TrendingUp className="w-5 h-5" />}
        valueColor="success"
        className="relative overflow-hidden"
      >
        <div className="space-y-3">
          <div className="text-3xl font-bold text-success">
            {formatCurrency(account.netProfitAvailable)}
          </div>
          <div className="text-sm text-muted-foreground">
            Total Withdrawn: {formatCurrency(account.totalWithdrawnNetProfit)}
          </div>

          {/* Current PnL + Move to Net Profit block */}
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Current PnL
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isPnLPositive
                    ? "bg-success/20 text-success"
                    : pnl < 0
                    ? "bg-destructive/20 text-destructive"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {pnlLabel}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isPnLPositive ? (
                <TrendingUp className="w-5 h-5 text-success" />
              ) : pnl < 0 ? (
                <TrendingDown className="w-5 h-5 text-destructive" />
              ) : null}
              <span
                className={`text-xl font-bold ${
                  isPnLPositive
                    ? "text-success"
                    : pnl < 0
                    ? "text-destructive"
                    : "text-foreground"
                }`}
              >
                {formatCurrency(Math.abs(pnl))}
              </span>
            </div>

            {/* Move to Net Profit Button with Confirmation */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="w-full mt-2"
                  size="sm"
                  variant={isPnLPositive ? "default" : "secondary"}
                  // allow negative PnL, only block when 0 or no handler
                  disabled={pnl === 0 || !onMovePnLClick}
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Move to Net Profit
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Move PnL to Net Profit</AlertDialogTitle>

                  {/* ✅ IMPORTANT: use asChild to avoid wrapping <p> */}
                  <AlertDialogDescription asChild>
                    <div className="space-y-2">
                      <div>
                        Are you sure you want to move the current PnL to Net
                        Profit Available?
                      </div>

                      <div className="bg-muted rounded-lg p-3 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Amount to move:</span>
                          <span className="font-medium text-success">
                            {formatCurrency(pnl)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>New Net Profit Balance:</span>
                          <span className="font-medium">
                            {formatCurrency(account.netProfitAvailable + pnl)}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        This action will be logged in the transaction history.
                      </div>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onMovePnLClick}>
                    Confirm Move
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <Button
            onClick={() => onWithdrawClick("net_profit")}
            className="w-full bg-success hover:bg-success/90"
            size="sm"
          >
            <ArrowUpCircle className="w-4 h-4 mr-2" />
            Withdraw from Profit
          </Button>
        </div>
      </DashboardCard>

      {/* Principal Balance */}
      <DashboardCard
        title="Principal Balance"
        icon={<Vault className="w-5 h-5" />}
        valueColor="default"
        className="relative overflow-hidden"
      >
        <div className="space-y-3">
          <div className="text-3xl font-bold text-primary">
            {formatCurrency(account.principalBalance)}
          </div>

          <div className="text-sm text-muted-foreground">
            Current Withdrawn: {currentDisplay}
          </div>

          <Button
            onClick={() => onWithdrawClick("principal")}
            variant="outline"
            className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            size="sm"
          >
            <ArrowUpCircle className="w-4 h-4 mr-2" />
            Withdraw from Principal
          </Button>

          <Button
            onClick={onReplenishClick}
            className="w-full"
            size="sm"
            variant="secondary"
          >
            <ArrowDownCircle className="w-4 h-4 mr-2" />
            Replenish Principal
          </Button>
        </div>
      </DashboardCard>

      {/* Summary Cards */}
      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardCard
          title="Total Platform Balance"
          icon={<DollarSign className="w-4 h-4" />}
        >
          <div className="text-xl font-semibold">
            {formatCurrency(
              account.netProfitAvailable + account.principalBalance
            )}
          </div>
        </DashboardCard>

        <DashboardCard
          title="Total Profit Withdrawals"
          icon={<TrendingUp className="w-4 h-4" />}
          valueColor="success"
        >
          <div className="text-xl font-semibold text-success">
            {formatCurrency(account.totalWithdrawnNetProfit)}
          </div>
        </DashboardCard>

        <DashboardCard
          title="Total Principal Withdrawals"
          icon={<Vault className="w-4 h-4" />}
        >
          <div className="text-xl font-semibold">
            {formatCurrency(account.totalWithdrawnPrincipal)}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};
