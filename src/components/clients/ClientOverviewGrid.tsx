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
  referrals: ReferralApi[]; // kept for other UI bits
  bonusEarned?: number; // <-- NEW: explicit single field passed in
}

/** safe numeric parser: accepts string | number | undefined */
const toNumber = (v?: string | number | null) => {
  if (v === undefined || v === null) return 0;
  if (typeof v === "number") return isFinite(v) ? v : 0;
  const n = parseFloat(String(v).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

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

export const ClientOverviewGrid = ({
  client,
  investments,
  deposits,
  withdrawals,
  referrals,
  bonusEarned = 0, // default zero when not provided
}: ClientOverviewGridProps) => {
  const totalDeposited = toNumber(client.totalDeposits ?? 0);
  const currentBalance = toNumber(client.fundsAvailable ?? 0);
  const totalInvested = toNumber(client.totalInvested ?? 0);
  const referralEarnings = toNumber(client.Referral?.earningsBalance ?? 0);
  const totalWithdrawn = toNumber(client.totalWithdrawals ?? 0);

  const totalReturnEarned = (investments || []).reduce(
    (sum, inv) => sum + toNumber(inv.returnsBalance),
    0
  );

  const activeInvestments = (investments || []).filter((inv) => {
    const s = (inv.investmentStatus ?? "").toString().toLowerCase();
    return s === "active";
  }).length;

  const completedInvestments = (investments || []).filter((inv) => {
    const s = (inv.investmentStatus ?? "").toString().toLowerCase();
    return s === "completed";
  }).length;

  const approvedDeposits = (deposits || []).filter(
    (d) => (d.status ?? "").toString().toLowerCase() === "approved"
  ).length;
  const completedWithdrawals = (withdrawals || []).filter(
    (w) => (w.status ?? "").toString().toLowerCase() === "completed"
  ).length;

  const paidReferrals = (referrals || []).reduce((count, r) => {
    const hasEarnings = toNumber((r as any).earningsBalance ?? 0) > 0;
    return count + (hasEarnings ? 1 : 0);
  }, 0);

  const roiPercent =
    totalInvested > 0 ? (totalReturnEarned / totalInvested) * 100 : 0;

  const proratedForInvestment = (inv: UserInvestmentApi) => {
    const amount = toNumber(inv.amount);
    if (amount <= 0) return 0;

    const monthlyRoi = 0.05;
    const now = new Date();
    const created = inv.createdAt ? new Date(inv.createdAt) : now;

    const firstPayoutDate = firstOfNextMonth(created);
    const startMonthDays = daysInMonth(created);
    const remainingDaysAtStart = Math.max(
      0,
      diffCalendarDays(firstPayoutDate, created)
    );
    const firstMonthFactor =
      startMonthDays > 0 ? remainingDaysAtStart / startMonthDays : 0;

    if (isSameYearMonth(now, created) && now < firstPayoutDate) {
      return amount * monthlyRoi * firstMonthFactor;
    }

    return amount * monthlyRoi;
  };

  const thisMonthProRated = (investments || []).reduce(
    (s, inv) => s + proratedForInvestment(inv),
    0
  );

  const totalOutflow = thisMonthProRated + toNumber(bonusEarned);

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

      {/* Total Outflow (replaces ROI Performance) */}
      <DashboardCard
        title="Total Outflow"
        icon={<ArrowUpCircle className="h-4 w-4" />}
        valueColor={totalOutflow > 0 ? "warning" : "default"}
      >
        <div className="space-y-1">
          <div className="text-2xl font-bold">
            {formatCurrency(totalOutflow)}
          </div>
          <div className="text-xs text-muted-foreground">
            <div>Investments Earnings: {formatCurrency(thisMonthProRated)}</div>
            <div>
              Referral Earnings: {formatCurrency(toNumber(bonusEarned))}
            </div>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
};

export default ClientOverviewGrid;
