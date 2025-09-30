// src/components/adminAccounting/BalanceOverviewCards.tsx
import React from "react";
import {
  Vault,
  TrendingUp,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import type { AdminAccount } from "@/types/adminTransaction";

interface BalanceOverviewCardsProps {
  account: AdminAccount;
  onWithdrawClick: (type: "net_profit" | "principal") => void;
  onReplenishClick?: () => void;
}

export const BalanceOverviewCards = ({
  account,
  onWithdrawClick,
  onReplenishClick,
}: BalanceOverviewCardsProps) => {
  const current = account.currentPrincipalWithdrawn ?? 0;
  const totalPrincipal = account.totalWithdrawnPrincipal ?? 0;

  // Show "-$X" when negative, otherwise show "$X"
  const currentDisplay =
    current < 0
      ? "-" + formatCurrency(Math.abs(current))
      : formatCurrency(current);

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
