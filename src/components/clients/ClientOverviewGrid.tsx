// ClientOverviewGrid.tsx
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { formatCurrency } from "@/lib/formatters";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  TrendingUp,
  Award,
  PiggyBank,
  UserPlus,
  Target,
} from "lucide-react";
import type {
  UserDetailApi,
  UserInvestmentApi,
  DepositRequestApi,
  WithdrawRequestApi,
  ReferralApi,
} from "@/types/users/userDetail.types";

interface ClientOverviewGridProps {
  client: UserDetailApi;
  investments: UserInvestmentApi[];
  deposits: DepositRequestApi[];
  withdrawals: WithdrawRequestApi[];
  referrals: ReferralApi[];
}

/** safe numeric parser: accepts string | number | undefined */
const toNumber = (v?: string | number) => {
  if (v === undefined || v === null) return 0;
  if (typeof v === "number") return isFinite(v) ? v : 0;
  const n = parseFloat(v.replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

export const ClientOverviewGrid = ({
  client,
  investments,
  deposits,
  withdrawals,
  referrals,
}: ClientOverviewGridProps) => {
  // derive numeric values safely
  const totalDeposited = toNumber(client.totalDeposits ?? 0);

  const currentBalance = toNumber(client.fundsAvailable ?? 0);

  const totalInvested = toNumber(client.totalInvested ?? 0);

  const referralEarnings = toNumber(client.Referral?.earningsBalance ?? 0);

  const totalWithdrawn = toNumber(client.totalWithdrawals ?? 0);

  const totalReturnEarned = investments.reduce(
    (sum, inv) =>
      sum + toNumber(inv.returnsBalance) + toNumber(inv.thisMonthsReturns),
    0
  );

  // counts
  const activeInvestments = investments.filter((inv) => {
    const s = (inv.investmentStatus ?? "").toString().toLowerCase();
    return s === "active";
  }).length;

  const completedInvestments = investments.filter((inv) => {
    const s = (inv.investmentStatus ?? "").toString().toLowerCase();
    return s === "completed";
  }).length;

  const approvedDeposits = deposits.filter(
    (d) => (d.status ?? "").toString().toLowerCase() === "approved"
  ).length;
  const completedWithdrawals = withdrawals.filter(
    (w) => (w.status ?? "").toString().toLowerCase() === "completed"
  ).length;
  const paidReferrals = referrals.filter((r: ReferralApi) => {
    return (
      toNumber((r as any).status ?? 0) > 0 ||
      toNumber((r as any).earningsBalance ?? 0) > 0
    );
  }).length;

  const roiPercent =
    totalInvested > 0 ? (totalReturnEarned / totalInvested) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {/* Total Deposited */}
      <DashboardCard
        title="Total Deposited"
        icon={<ArrowDownCircle className="h-4 w-4" />}
        valueColor="default"
      >
        <div className="space-y-1">
          <div className="text-2xl font-bold">
            {formatCurrency(totalDeposited)}
          </div>
          <div className="text-xs text-muted-foreground">
            {approvedDeposits} approved deposits
          </div>
        </div>
      </DashboardCard>

      {/* Current Balance */}
      <DashboardCard
        title="Current Balance"
        icon={<Wallet className="h-4 w-4" />}
        valueColor="default"
      >
        <div className="space-y-1">
          <div className="text-2xl font-bold">
            {formatCurrency(currentBalance)}
          </div>
          <div className="text-xs text-muted-foreground">Available funds</div>
        </div>
      </DashboardCard>

      {/* Total Invested */}
      <DashboardCard
        title="Total Invested"
        icon={<TrendingUp className="h-4 w-4" />}
        valueColor="success"
      >
        <div className="space-y-1">
          <div className="text-2xl font-bold">
            {formatCurrency(totalInvested)}
          </div>
          <div className="text-xs text-muted-foreground">
            {activeInvestments} active investments
          </div>
        </div>
      </DashboardCard>

      {/* Total Withdrawn */}
      <DashboardCard
        title="Total Withdrawn"
        icon={<ArrowUpCircle className="h-4 w-4" />}
        valueColor="warning"
      >
        <div className="space-y-1">
          <div className="text-2xl font-bold">
            {formatCurrency(totalWithdrawn)}
          </div>
          <div className="text-xs text-muted-foreground">
            {completedWithdrawals} completed withdrawals
          </div>
        </div>
      </DashboardCard>

      {/* Returns Earned */}
      <DashboardCard
        title="Returns Earned"
        icon={<Award className="h-4 w-4" />}
        valueColor="success"
      >
        <div className="space-y-1">
          <div className="text-2xl font-bold">
            {formatCurrency(totalReturnEarned)}
          </div>
          <div className="text-xs text-muted-foreground">
            From {completedInvestments} completed investments
          </div>
        </div>
      </DashboardCard>

      {/* Principal Held */}
      <DashboardCard
        title="Principal Held"
        icon={<PiggyBank className="h-4 w-4" />}
        valueColor="default"
      >
        <div className="space-y-1">
          <div className="text-2xl font-bold">
            {formatCurrency(totalInvested)}
          </div>
          <div className="text-xs text-muted-foreground">
            Investment capital
          </div>
        </div>
      </DashboardCard>

      {/* Referral Earnings */}
      <DashboardCard
        title="Referral Earnings"
        icon={<UserPlus className="h-4 w-4" />}
        valueColor="success"
      >
        <div className="space-y-1">
          <div className="text-2xl font-bold">
            {formatCurrency(referralEarnings)}
          </div>
          <div className="text-xs text-muted-foreground">
            {paidReferrals} successful referrals
          </div>
        </div>
      </DashboardCard>

      {/* ROI Performance */}
      <DashboardCard
        title="ROI Performance"
        icon={<Target className="h-4 w-4" />}
        valueColor={roiPercent > 0 ? "success" : "default"}
      >
        <div className="space-y-1">
          <div className="text-2xl font-bold">
            {totalInvested > 0 ? `${roiPercent.toFixed(1)}%` : "0%"}
          </div>
          <div className="text-xs text-muted-foreground">Total return rate</div>
        </div>
      </DashboardCard>
    </div>
  );
};
